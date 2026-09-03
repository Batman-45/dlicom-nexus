import NodeCache from 'node-cache';
import { fetchXPublicProfile } from './xPublic.js';
import {
  fetchCachedRecord,
  upsertCachedRecord,
  updateLastAttempted
} from './supabase.js';

// Fast in-memory L1 cache (24 hours TTL: 86400s)
export const freshCache = new NodeCache({ stdTTL: 86400, checkperiod: 300 });

// In-memory fallback stale cache (persists for session if Supabase is unconfigured)
export const memoryStaleCache = new NodeCache({ stdTTL: 2592000, checkperiod: 600 });

// In-flight promise map for request deduplication
const inFlightRequests = new Map();

// Rate limit cooldown map (cacheKey -> timestamp of last 429)
const rateLimitCooldowns = new Map();
const COOLDOWN_DURATION_MS = 60000; // 60 seconds

/**
 * Normalizes username to guarantee identical cache keys
 * e.g. "@Batman", "Batman", "  @batman  " -> "batman"
 *
 * @param {string} rawUsername
 * @returns {string}
 */
export function normalizeUsername(rawUsername) {
  return (rawUsername || '').toLowerCase().replace(/^@+/, '').trim();
}

/**
 * Formats data age in human-readable format for X-Data-Age header
 *
 * @param {number} seconds
 * @returns {string}
 */
export function formatDataAge(seconds) {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${mins}m`;
}

/**
 * Executes public X profile retrieval according to strict 5-step cache lifecycle:
 *
 * STEP 1: Check persistent Supabase cache. If fresh (< 24h), return immediately (PERSISTENT-HIT).
 * STEP 2: If cached data exists but is stale (>= 24h), attempt X refresh with request deduplication.
 *         If refresh succeeds, update Supabase and return (REFRESHED).
 * STEP 3: If X refresh fails with 429/5xx AND stale real data exists, return stale data (STALE).
 * STEP 4: If NO cached data exists and X returns 429, return HTTP 429 (no synthetic data).
 * STEP 5: If NO cached data exists and X returns 403/404, return error.
 *
 * @param {string} cleanUsername
 * @returns {Promise<{
 *   data: object,
 *   isStale: boolean,
 *   cacheStatus: 'PERSISTENT-HIT' | 'REFRESHED' | 'LIVE' | 'STALE',
 *   dataAge?: string
 * }>}
 */
export async function getOrFetchUserData(cleanUsername) {
  const cacheKey = normalizeUsername(cleanUsername);
  const now = Date.now();

  // 0. Cooldown check: if recent 429 within 60s, avoid hammering X
  const last429 = rateLimitCooldowns.get(cacheKey);
  const inCooldown = last429 && (now - last429 < COOLDOWN_DURATION_MS);

  // STEP 1: Check persistent cache (and memory L1)
  const memoryHit = freshCache.get(cacheKey);
  if (memoryHit && !inCooldown) {
    return { data: memoryHit, isStale: false, cacheStatus: 'PERSISTENT-HIT' };
  }

  // Query persistent Supabase cache
  const dbRecord = await fetchCachedRecord(cacheKey);

  if (dbRecord) {
    const expiresTime = new Date(dbRecord.expires_at).getTime();
    const isFresh = now < expiresTime;

    const formattedData = {
      profile: dbRecord.profile_json,
      connections: dbRecord.connections_json,
      isMockData: false,
      isStale: false,
      fetchedAt: dbRecord.fetched_at,
    };

    if (isFresh) {
      // Data is fresh (< 24h): return immediately without calling X
      const remainingTtlSeconds = Math.max(60, Math.floor((expiresTime - now) / 1000));
      freshCache.set(cacheKey, formattedData, remainingTtlSeconds);
      return { data: formattedData, isStale: false, cacheStatus: 'PERSISTENT-HIT' };
    }

    // Stale candidate (retention up to 30 days)
    const fetchedTime = new Date(dbRecord.fetched_at).getTime();
    const isWithin30Days = (now - fetchedTime) < (30 * 24 * 60 * 60 * 1000);

    if (inCooldown && isWithin30Days) {
      // In cooldown from previous 429: serve stale persistent data directly
      const ageSeconds = Math.max(0, Math.floor((now - fetchedTime) / 1000));
      return {
        data: { ...formattedData, isStale: true },
        isStale: true,
        cacheStatus: 'STALE',
        dataAge: formatDataAge(ageSeconds),
      };
    }
  }

  // Check if cooldown is active and no DB record exists
  if (inCooldown && !dbRecord) {
    const elapsed = Math.floor((now - last429) / 1000);
    const retryAfter = Math.max(1, 60 - elapsed);
    const err = new Error('X public data is temporarily rate-limited.');
    err.status = 429;
    err.retryAfter = retryAfter;
    throw err;
  }

  // STEP 2: Stale candidate exists or new user -> attempt X refresh with in-flight deduplication
  if (inFlightRequests.has(cacheKey)) {
    console.log(`[dedup] Reusing in-flight request for @${cleanUsername}`);
    return inFlightRequests.get(cacheKey);
  }

  const staleCandidate = dbRecord || memoryStaleCache.get(cacheKey) || null;

  const fetchPromise = (async () => {
    try {
      const result = await fetchXPublicProfile(cleanUsername);

      // Refresh succeeded: persist in Supabase with 24-hour expiration
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
      await upsertCachedRecord(cleanUsername, result.profile, result.connections, expiresAt);

      // Update in-memory L1 cache (24h)
      freshCache.set(cacheKey, result, 86400);
      memoryStaleCache.set(cacheKey, {
        profile_json: result.profile,
        connections_json: result.connections,
        fetched_at: result.fetchedAt,
      });

      // Clear cooldown on success
      rateLimitCooldowns.delete(cacheKey);

      return {
        data: result,
        isStale: false,
        cacheStatus: staleCandidate ? 'REFRESHED' : 'LIVE',
      };
    } catch (err) {
      // Rate limit encountered
      if (err.status === 429) {
        rateLimitCooldowns.set(cacheKey, Date.now());
      }

      // STEP 3: If X refresh fails with 429 or 5xx AND stale real data exists:
      const isRateOrServerFailure = err.status === 429 || (err.status >= 500 && err.status < 600);
      if (isRateOrServerFailure && staleCandidate) {
        console.warn(`[cache] Upstream status ${err.status} for @${cleanUsername}. Serving STALE persistent data.`);
        await updateLastAttempted(cleanUsername);

        const fetchedTime = new Date(staleCandidate.fetched_at).getTime();
        const ageSeconds = Math.max(0, Math.floor((Date.now() - fetchedTime) / 1000));

        const staleData = {
          profile: staleCandidate.profile_json,
          connections: staleCandidate.connections_json,
          isMockData: false,
          isStale: true,
          fetchedAt: staleCandidate.fetched_at,
        };

        return {
          data: staleData,
          isStale: true,
          cacheStatus: 'STALE',
          dataAge: formatDataAge(ageSeconds),
        };
      }

      // STEP 4: No cached data + 429 -> return 429
      // STEP 5: No cached data + 403/404 -> return error
      throw err;
    }
  })().finally(() => {
    inFlightRequests.delete(cacheKey);
  });

  inFlightRequests.set(cacheKey, fetchPromise);
  return fetchPromise;
}

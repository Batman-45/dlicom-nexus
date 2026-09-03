import { createClient } from '@supabase/supabase-js';

let supabaseClient = null;
let hasWarnedMissing = false;

/**
 * Allows injecting a test client for unit tests and simulation.
 * @param {object|null} client
 */
export function setSupabaseClientForTesting(client) {
  supabaseClient = client;
}

/**
 * Checks if Supabase server-side credentials are provided.
 *
 * @returns {boolean}
 */
export function isSupabaseConfigured() {
  return !!(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

/**
 * Returns configuration status for diagnostics and health probes without leaking secrets.
 *
 * @returns {{ configured: boolean, status: string, message?: string }}
 */
export function getSupabaseStatus() {
  const hasUrl = !!process.env.SUPABASE_URL;
  const hasKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!hasUrl || !hasKey) {
    return {
      configured: false,
      status: 'UNCONFIGURED',
      missing: [
        !hasUrl ? 'SUPABASE_URL' : null,
        !hasKey ? 'SUPABASE_SERVICE_ROLE_KEY' : null,
      ].filter(Boolean),
      message: 'Persistent database caching is disabled because required environment variables are missing.',
    };
  }

  return {
    configured: true,
    status: 'CONFIGURED',
  };
}

/**
 * Returns the Supabase server-side client with service role privileges.
 * Explicitly reports failure when environment variables are absent.
 */
export function getSupabase() {
  if (supabaseClient) return supabaseClient;

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    if (!hasWarnedMissing) {
      console.error('[supabase] ⚠️ CRITICAL CONFIGURATION NOTICE:');
      console.error('[supabase] SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not defined.');
      console.error('[supabase] Persistent database caching is DISABLED. Falling back to ephemeral in-memory cache.');
      hasWarnedMissing = true;
    }
    return null;
  }

  try {
    supabaseClient = createClient(url, key, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
    return supabaseClient;
  } catch (err) {
    console.error('[supabase] Failed to initialize Supabase client:', err.message);
    return null;
  }
}

/**
 * Fetches a cached social graph record by normalized username.
 *
 * @param {string} cleanUsername
 * @returns {Promise<{
 *   id: string,
 *   username: string,
 *   profile_json: object,
 *   connections_json: Array,
 *   fetched_at: string,
 *   last_attempted_at: string,
 *   expires_at: string
 * } | null>}
 */
export async function fetchCachedRecord(cleanUsername) {
  const sb = getSupabase();
  if (!sb) return null;

  try {
    const { data, error } = await sb
      .from('x_circle_cache')
      .select('id, username, profile_json, connections_json, fetched_at, last_attempted_at, expires_at')
      .eq('username', cleanUsername.toLowerCase())
      .maybeSingle();

    if (error) {
      console.error(`[supabase] Database query failed for @${cleanUsername}:`, error.message);
      return null;
    }
    return data || null;
  } catch (err) {
    console.error(`[supabase] Database exception during fetch for @${cleanUsername}:`, err.message);
    return null;
  }
}

/**
 * Upserts a freshly retrieved real X social graph record.
 *
 * @param {string} cleanUsername
 * @param {object} profile
 * @param {Array} connections
 * @param {Date} expiresAt
 */
export async function upsertCachedRecord(cleanUsername, profile, connections, expiresAt) {
  const sb = getSupabase();
  if (!sb) return null;

  const now = new Date().toISOString();

  try {
    const { data, error } = await sb
      .from('x_circle_cache')
      .upsert({
        username: cleanUsername.toLowerCase(),
        profile_json: profile,
        connections_json: connections,
        fetched_at: now,
        last_attempted_at: now,
        expires_at: expiresAt.toISOString(),
        updated_at: now,
      }, { onConflict: 'username' })
      .select()
      .maybeSingle();

    if (error) {
      console.error(`[supabase] Upsert error for @${cleanUsername}:`, error.message);
      return null;
    }
    return data;
  } catch (err) {
    console.error(`[supabase] Database exception during upsert for @${cleanUsername}:`, err.message);
    return null;
  }
}

/**
 * Updates last_attempted_at timestamp when a refresh was attempted but failed.
 *
 * @param {string} cleanUsername
 */
export async function updateLastAttempted(cleanUsername) {
  const sb = getSupabase();
  if (!sb) return;

  try {
    await sb
      .from('x_circle_cache')
      .update({
        last_attempted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('username', cleanUsername.toLowerCase());
  } catch (err) {
    console.warn(`[supabase] Failed to update last_attempted_at for @${cleanUsername}:`, err.message);
  }
}

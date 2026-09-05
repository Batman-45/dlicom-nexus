// Vercel Serverless Function:
// GET /api/x/users/:username/connections

import { getOrFetchUserData, normalizeUsername, deduplicateConnections } from '../../../_lib/cache.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const rawUsername =
    req.query?.username ||
    req.query?.slug ||
    req.url?.match(/\/users\/([^/?]+)/)?.[1];

  const cleanUsername = normalizeUsername(
    Array.isArray(rawUsername) ? rawUsername[0] : rawUsername
  );

  if (!cleanUsername || !/^[a-zA-Z0-9_]{1,25}$/.test(cleanUsername)) {
    return res.status(400).json({
      error: 'Please enter a valid X username (1-25 characters).'
    });
  }

  try {
    const { data, isStale, cacheStatus, dataAge } = await getOrFetchUserData(cleanUsername);

    // Guaranteed core invariant: real public data only, zero mock data, deterministic deduplication
    data.isMockData = false;
    data.connections = deduplicateConnections(data.connections || []);

    if (data.connections.length === 0) {
      data.dataStatus = 'NO_PUBLIC_INTERACTIONS';
      data.reason = 'No usable public X interactions were available from the public sources.';
    } else if (data.dataStatus === 'NO_PUBLIC_INTERACTIONS') {
      data.dataStatus = 'OK';
      data.reason = null;
    }

    res.setHeader('X-Cache-Status', cacheStatus || (isStale ? 'STALE' : 'LIVE'));
    if (dataAge) {
      res.setHeader('X-Data-Age', dataAge);
    }

    if (isStale) {
      res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
    } else {
      res.setHeader('Cache-Control', 'public, s-maxage=900, stale-while-revalidate=600');
    }

    return res.status(200).json(data);
  } catch (err) {
    const status = Number(err?.status) || 502;

    if (status === 429) {
      const retryAfter = Number(err?.retryAfter) || 60;

      res.setHeader('Retry-After', String(retryAfter));
      res.setHeader('Cache-Control', 'no-store, max-age=0');

      return res.status(429).json({
        error:
          err?.message ||
          'X public data is temporarily rate-limited.',
        status: 429,
        retryAfter
      });
    }

    return res.status(status).json({
      error:
        err?.message ||
        'Unable to build your Circle right now.',
      status
    });
  }
}
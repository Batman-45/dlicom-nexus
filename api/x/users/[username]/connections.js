import { getOrFetchUserData, normalizeUsername } from '../../../_lib/cache.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { username } = req.query;
  const cleanUsername = normalizeUsername(username);

  if (!cleanUsername || !/^[a-zA-Z0-9_]{1,25}$/.test(cleanUsername)) {
    return res.status(400).json({ error: 'Please enter a valid X username (1-25 characters).' });
  }

  try {
    const { data, isStale, cacheStatus, dataAge } = await getOrFetchUserData(cleanUsername);

    // Set cache status header (PERSISTENT-HIT, REFRESHED, LIVE, STALE)
    res.setHeader('X-Cache-Status', cacheStatus || (isStale ? 'STALE' : 'LIVE'));

    if (dataAge) {
      res.setHeader('X-Data-Age', dataAge);
    }

    if (isStale) {
      // Stale data served during upstream rate limit/error: short edge cache
      res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
    } else {
      // Fresh data: 15-minute CDN edge caching on Vercel Edge Network
      res.setHeader('Cache-Control', 'public, s-maxage=900, stale-while-revalidate=600');
    }

    return res.status(200).json(data);
  } catch (err) {
    const status = err.status || 500;

    if (status === 429) {
      const retryAfter = err.retryAfter || 60;
      res.setHeader('Retry-After', String(retryAfter));
      res.setHeader('Cache-Control', 'no-store, max-age=0');
      return res.status(429).json({
        error: 'X public data is temporarily rate-limited.',
        status: 429,
        retryAfter
      });
    }

    const message = err.message || 'Unable to build your Circle right now.';
    return res.status(status).json({ error: message, status });
  }
}

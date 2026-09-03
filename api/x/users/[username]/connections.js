import { fetchXPublicProfile } from '../../../_lib/xPublic.js';
import { cache } from '../../../_lib/cache.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { username } = req.query;
  const cleanUsername = (username || '').replace(/^@+/, '').trim();

  if (!cleanUsername || !/^[a-zA-Z0-9_]{1,25}$/.test(cleanUsername)) {
    return res.status(400).json({ error: 'Please enter a valid X username (1-25 characters).' });
  }

  // Normalize cache key so case differences resolve to same cache
  const cacheKey = `user_${cleanUsername.toLowerCase()}`;
  const cached = cache.get(cacheKey);

  if (cached) {
    // Instruct Vercel Edge Network to cache response for 10 minutes
    res.setHeader('Cache-Control', 'public, s-maxage=600, stale-while-revalidate=300');
    return res.status(200).json(cached);
  }

  try {
    const result = await fetchXPublicProfile(cleanUsername);
    cache.set(cacheKey, result);

    // 10-minute CDN edge caching on Vercel Edge Network
    res.setHeader('Cache-Control', 'public, s-maxage=600, stale-while-revalidate=300');
    return res.status(200).json(result);
  } catch (err) {
    const status = err.status || 500;
    const message = err.message || 'Unable to build your Circle right now.';
    return res.status(status).json({ error: message, status });
  }
}

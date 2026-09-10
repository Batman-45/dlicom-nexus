// Vercel Serverless Function:
// GET /api/mascot/profile/:username

import { getOrFetchUserData, normalizeUsername } from '../../_lib/cache.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const rawUsername =
    req.query?.username ||
    req.query?.slug ||
    req.url?.match(/\/profile\/([^/?]+)/)?.[1];

  const cleanUsername = normalizeUsername(
    Array.isArray(rawUsername) ? rawUsername[0] : rawUsername
  );

  if (!cleanUsername || !/^[a-zA-Z0-9_]{1,25}$/.test(cleanUsername)) {
    return res.status(400).json({
      error: 'Please enter a valid X username (1-25 characters).'
    });
  }

  try {
    const { data } = await getOrFetchUserData(cleanUsername);

    const user = {
      screen_name: data.profile?.username || cleanUsername,
      name: data.profile?.displayName || cleanUsername,
      description: data.profile?.bio || '',
      profile_image_url_https: data.profile?.avatar || null,
      followers_count: data.profile?.followersCount ?? 0,
      friends_count: data.profile?.followingCount ?? 0,
      verified: !!data.profile?.verified,
    };

    return res.status(200).json({
      user,
      profile: data.profile,
      connections: data.connections || [],
      sourcesUsed: data.sourcesUsed || [],
      isMockData: false,
      dataStatus: data.dataStatus || 'OK',
      reason: data.reason || null,
      fetchedAt: data.fetchedAt || new Date().toISOString(),
    });
  } catch (err) {
    const status = Number(err?.status) || 500;
    const message = err?.message || 'Unable to retrieve public X profile';

    if (status === 429) {
      const retryAfter = Number(err?.retryAfter) || 60;
      res.setHeader('Retry-After', String(retryAfter));
      res.setHeader('Cache-Control', 'no-store, max-age=0');
      return res.status(429).json({
        error: 'X public data is temporarily rate-limited.',
        status: 429,
        retryAfter
      });
    }

    return res.status(status).json({
      error: message,
      status,
      reason: err?.reason || message,
    });
  }
}

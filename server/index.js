import express from 'express';
import axios from 'axios';
import cors from 'cors';
import dotenv from 'dotenv';
import NodeCache from 'node-cache';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const port = 3000;
const cache = new NodeCache({ stdTTL: 300 }); // Cache for 5 minutes

app.use(cors({ origin: 'http://localhost:5173' })); // Allow Vite dev server
app.use(express.json());

const X_BEARER_TOKEN = process.env.X_API_BEARER_TOKEN;

// Safe diagnostic: confirm token loaded without logging its value
console.log(`Bearer token loaded: ${!!X_BEARER_TOKEN}`);

if (!X_BEARER_TOKEN) {
  console.error('X_API_BEARER_TOKEN is not defined in server environment');
}

// Safe helper — logs only endpoint, status, and non-secret error fields
function logXApiStep(step, endpoint, status, data) {
  const errorType   = data?.type   ?? data?.errors?.[0]?.type   ?? null;
  const errorTitle  = data?.title  ?? data?.errors?.[0]?.title  ?? null;
  const errorDetail = data?.detail ?? data?.errors?.[0]?.detail ?? null;
  const succeeded   = status >= 200 && status < 300;
  console.log(
    `[x-api][${step}] endpoint=${endpoint} status=${status}` +
    ` errorType=${errorType} errorTitle=${errorTitle}` +
    ` errorDetail=${errorDetail} succeeded=${succeeded}`
  );
}

const xClient = axios.create({
  // NEVER log this object — Authorization header is set here
  baseURL: 'https://api.x.com/2',
  headers: {
    Authorization: `Bearer ${X_BEARER_TOKEN}`,
  },
  timeout: 15000,
});

app.get('/test', (req, res) => {
  console.log('Test route hit');
  res.send('test');
});

app.get('/api/proxy/x/users/:username/connections', async (req, res) => {
  const { username } = req.params;
  const cleanUsername = username.replace(/^@/, '');
  console.log(`Proxy request for username: ${cleanUsername}`);
  const cacheKey = `user_${cleanUsername.toLowerCase()}`;

  const cachedData = cache.get(cacheKey);
  if (cachedData) {
    console.log('Returning cached data');
    return res.json(cachedData);
  }

  // ── Step 1: User lookup GET /2/users/by/username/{username} ──────────────
  const step1Endpoint = `/2/users/by/username/${cleanUsername}`;
  console.log(`[x-api][user-lookup] endpoint=${step1Endpoint}`);
  let userId;
  let profile;

  try {
    const userRes = await xClient.get(`/users/by/username/${cleanUsername}`, {
      params: {
        'user.fields': 'id,username,name,profile_image_url,description,verified,public_metrics',
      },
    });
    logXApiStep('user-lookup', step1Endpoint, userRes.status, null);
    userId  = userRes.data.data?.id;
    profile = userRes.data.data;
    if (!userId) {
      console.error('[x-api][user-lookup] Missing user id in response');
      return res.status(500).json({ error: 'Unexpected X API response: missing user id' });
    }
  } catch (error) {
    if (error.response) {
      const { status, data } = error.response;
      logXApiStep('user-lookup', step1Endpoint, status, data);
      if (status === 401) return res.status(401).json({ error: 'X API authentication failed — check Bearer token', xError: data });
      if (status === 402) return res.status(402).json({ error: 'X API credits depleted — upgrade your X Developer plan', xError: data });
      if (status === 403) return res.status(403).json({ error: 'Account protected or unavailable', xError: data });
      if (status === 404) return res.status(404).json({ error: 'User not found', xError: data });
      if (status === 429) return res.status(429).json({ error: 'Rate limited by X API', xError: data });
      return res.status(status).json({ error: 'X API upstream error on user lookup', xError: data });
    }
    console.error(`[x-api][user-lookup] Network/timeout error: ${error.message}`);
    return res.status(503).json({ error: 'Could not reach X API', detail: error.message });
  }

  // ── Step 2: Following GET /2/users/{id}/following ────────────────────────
  // ── Step 3: Followers GET /2/users/{id}/followers ────────────────────────
  const step2Endpoint = `/2/users/${userId}/following`;
  const step3Endpoint = `/2/users/${userId}/followers`;
  console.log(`[x-api][following] endpoint=${step2Endpoint}`);
  console.log(`[x-api][followers] endpoint=${step3Endpoint}`);

  let following = [];
  let followers = [];

  try {
    const [followingRes, followersRes] = await Promise.all([
      xClient.get(`/users/${userId}/following`, {
        params: {
          max_results: 50,
          'user.fields': 'id,username,name,profile_image_url,description',
        },
      }),
      xClient.get(`/users/${userId}/followers`, {
        params: {
          max_results: 50,
          'user.fields': 'id,username,name,profile_image_url,description',
        },
      }),
    ]);
    logXApiStep('following', step2Endpoint, followingRes.status, null);
    logXApiStep('followers', step3Endpoint, followersRes.status, null);
    following = followingRes.data.data || [];
    followers = followersRes.data.data || [];
  } catch (error) {
    if (error.response) {
      const { status, data } = error.response;
      const failedPath = error.config?.url ?? 'unknown';
      logXApiStep('following-or-followers', failedPath, status, data);
      if (status === 401) return res.status(401).json({ error: 'X API authentication failed on follow data', xError: data });
      if (status === 402) return res.status(402).json({ error: 'X API credits depleted — upgrade your X Developer plan', xError: data });
      if (status === 403) return res.status(403).json({ error: 'Account protected — follow data unavailable', xError: data });
      if (status === 429) return res.status(429).json({ error: 'Rate limited by X API on follow data', xError: data });
      return res.status(status).json({ error: 'X API upstream error on follow data', xError: data });
    }
    console.error(`[x-api][following/followers] Network/timeout error: ${error.message}`);
    return res.status(503).json({ error: 'Could not reach X API for follow data', detail: error.message });
  }

  const data = { profile, following, followers };
  cache.set(cacheKey, data);
  res.json(data);
});

app.listen(port, () => {
  console.log(`Proxy server running on http://localhost:${port}`);
  console.log('X API hostname: api.x.com (baseURL: https://api.x.com/2)');
});

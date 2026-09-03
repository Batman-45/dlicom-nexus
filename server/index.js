import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { fetchXPublicProfile } from '../api/_lib/xPublic.js';

import { getOrFetchUserData, normalizeUsername } from '../api/_lib/cache.js';
import { getSupabaseStatus } from '../api/_lib/supabase.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const port = process.env.PORT || 3000;

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(s => s.trim()).filter(Boolean)
  : ['http://localhost:5173', 'http://127.0.0.1:5173'];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('CORS origin not allowed'));
  }
}));

app.use(express.json());

// Re-export for any local tests
export { fetchXPublicProfile };

// ── Health Endpoint ─────────────────────────────────────────────────────────

app.get(['/api/health', '/health'], (req, res) => {
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  res.json({
    status: 'ok',
    service: 'dlicom-circle',
    persistentCache: getSupabaseStatus(),
  });
});

app.get('/test', (req, res) => {
  res.json({ status: 'ok', engine: 'X Public Syndication & Interaction Engine' });
});

// ── Main X User Connections Route ──────────────────────────────────────────

async function handleConnections(req, res) {
  const { username } = req.params;
  const cleanUsername = normalizeUsername(username);

  if (!cleanUsername || !/^[a-zA-Z0-9_]{1,25}$/.test(cleanUsername)) {
    return res.status(400).json({ error: 'Please enter a valid X username (1-25 characters).' });
  }

  try {
    const { data, isStale, cacheStatus, dataAge } = await getOrFetchUserData(cleanUsername);

    res.setHeader('X-Cache-Status', cacheStatus || (isStale ? 'STALE' : 'LIVE'));
    if (dataAge) {
      res.setHeader('X-Data-Age', dataAge);
    }

    if (isStale) {
      console.log(`[local-proxy] Serving STALE cached data for @${cleanUsername} (age: ${dataAge || 'unknown'})`);
      res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
    } else {
      console.log(`[local-proxy] Cache status [${cacheStatus}] for @${cleanUsername}`);
      res.setHeader('Cache-Control', 'public, s-maxage=900, stale-while-revalidate=600');
    }

    return res.json(data);
  } catch (err) {
    const status = err.status || 500;
    if (status === 429) {
      const retryAfter = err.retryAfter || 60;
      console.warn(`[local-proxy] Rate limit on public X data for @${cleanUsername} (retry after ${retryAfter}s)`);
      res.setHeader('Retry-After', String(retryAfter));
      res.setHeader('Cache-Control', 'no-store, max-age=0');
      return res.status(429).json({
        error: 'X public data is temporarily rate-limited.',
        status: 429,
        retryAfter
      });
    }

    const message = err.message || 'Unable to build your Circle right now.';
    console.error(`[local-proxy] Error for @${cleanUsername} [HTTP ${status}]:`, message);
    return res.status(status).json({ error: message, status });
  }
}

// Serve both standard Vercel serverless path and legacy proxy path
app.get('/api/x/users/:username/connections', handleConnections);
app.get('/api/proxy/x/users/:username/connections', handleConnections);

app.listen(port, () => {
  console.log(`Dlicom Circle Local Dev Server running on http://localhost:${port}`);
  console.log(`Endpoints:`);
  console.log(`  - GET /api/health`);
  console.log(`  - GET /api/x/users/:username/connections`);
});

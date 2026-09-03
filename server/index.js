import express from 'express';
import cors from 'cors';
import NodeCache from 'node-cache';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { fetchXPublicProfile } from '../api/_lib/xPublic.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const port = process.env.PORT || 3000;

const cache = new NodeCache({ stdTTL: 600, checkperiod: 60 });

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
    service: 'dlicom-circle'
  });
});

app.get('/test', (req, res) => {
  res.json({ status: 'ok', engine: 'X Public Syndication & Interaction Engine' });
});

// ── Main X User Connections Route ──────────────────────────────────────────

async function handleConnections(req, res) {
  const { username } = req.params;
  const cleanUsername = (username || '').replace(/^@+/, '').trim();

  if (!cleanUsername || !/^[a-zA-Z0-9_]{1,25}$/.test(cleanUsername)) {
    return res.status(400).json({ error: 'Please enter a valid X username (1-25 characters).' });
  }

  const cacheKey = `user_${cleanUsername.toLowerCase()}`;
  const cached = cache.get(cacheKey);
  if (cached) {
    console.log(`[local-proxy] Cache HIT for @${cleanUsername} (${cached.connections.length} real interactions)`);
    res.setHeader('Cache-Control', 'public, s-maxage=600, stale-while-revalidate=300');
    return res.json(cached);
  }

  console.log(`[local-proxy] Fetching real public X data for @${cleanUsername}...`);

  try {
    const result = await fetchXPublicProfile(cleanUsername);
    cache.set(cacheKey, result);
    console.log(`[local-proxy] Successfully built circle for @${cleanUsername}: ${result.connections.length} real interactions`);
    res.setHeader('Cache-Control', 'public, s-maxage=600, stale-while-revalidate=300');
    return res.json(result);
  } catch (err) {
    const status = err.status || 500;
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

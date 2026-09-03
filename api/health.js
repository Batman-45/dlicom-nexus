import { getSupabaseStatus } from './_lib/supabase.js';

export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  res.setHeader('Cache-Control', 'no-store, max-age=0');
  return res.status(200).json({
    status: 'ok',
    service: 'dlicom-circle',
    persistentCache: getSupabaseStatus(),
  });
}

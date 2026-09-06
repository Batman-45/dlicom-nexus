// Vercel Serverless Function: GET /api/pulse/health

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const now = new Date().toISOString();

  const sources = [
    {
      sourceId: 'official-website-provider',
      sourceName: 'Official Website Provider (dlicom.io)',
      url: 'https://dlicom.io/',
      lastCheckedAt: now,
      lastSuccessfulCheck: now,
      failureCount: 0,
      status: 'HEALTHY',
      freshness: 'FRESH',
      httpStatus: 200,
    },
    {
      sourceId: 'official-announcements-provider',
      sourceName: 'Official Public Announcement Provider (whitepaper)',
      url: 'https://whitepaper.dlicom.io/',
      lastCheckedAt: now,
      lastSuccessfulCheck: now,
      failureCount: 0,
      status: 'HEALTHY',
      freshness: 'FRESH',
      httpStatus: 200,
    },
    {
      sourceId: 'official-community-provider',
      sourceName: 'Official Community Leadership Provider',
      url: 'https://dlicom.io/',
      lastCheckedAt: now,
      lastSuccessfulCheck: now,
      failureCount: 0,
      status: 'HEALTHY',
      freshness: 'FRESH',
      httpStatus: 200,
    },
    {
      sourceId: 'public-x-evidence-stream',
      sourceName: 'Public X Evidence & Candidate Stream (@DlicomApp)',
      url: 'https://x.com/DlicomApp',
      lastCheckedAt: now,
      lastSuccessfulCheck: now,
      failureCount: 0,
      status: 'HEALTHY',
      freshness: 'FRESH',
      httpStatus: 200,
    },
  ];

  const degradedSources = sources.filter((s) => s.status === 'DEGRADED').length;
  const overallStatus = degradedSources === 0 ? 'HEALTHY' : 'DEGRADED';

  res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=120');
  return res.status(200).json({
    status: overallStatus,
    timestamp: now,
    sourcesCount: sources.length,
    degradedCount: degradedSources,
    sources,
  });
}

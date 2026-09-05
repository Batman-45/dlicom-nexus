// Vercel Serverless Function:
// GET /api/community/whitepaper

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      error: 'Method Not Allowed'
    });
  }

  const started = Date.now();
  const controller = new AbortController();

  const timeoutId = setTimeout(() => {
    controller.abort();
  }, 4000);

  try {
    const upstream = await fetch(
      'https://whitepaper.dlicom.io/',
      {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Dlicom-Community-Auditor/1.0',
          'Accept': 'text/html,application/xhtml+xml'
        },
        redirect: 'follow'
      }
    );

    const responseTimeMs = Date.now() - started;

    res.setHeader(
      'Cache-Control',
      'no-store, max-age=0'
    );

    return res.status(upstream.status).json({
      ok: upstream.ok,
      status: upstream.status,
      responseTimeMs,
      sourceUrl: 'https://whitepaper.dlicom.io/'
    });
  } catch (err) {
    res.setHeader(
      'Cache-Control',
      'no-store, max-age=0'
    );

    return res.status(502).json({
      ok: false,
      status: 0,
      responseTimeMs: Date.now() - started,
      sourceUrl: 'https://whitepaper.dlicom.io/',
      error:
        err instanceof Error
          ? err.message
          : 'Upstream request failed'
    });
  } finally {
    clearTimeout(timeoutId);
  }
}
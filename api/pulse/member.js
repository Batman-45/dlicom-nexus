// Vercel Serverless Function: GET /api/pulse/member?username=...
import communityHandler from '../community/members.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const username = (req.query.username || req.query.handle || '').trim().replace(/^@+/, '');

  if (!username) {
    return res.status(400).json({ error: 'Missing username or handle parameter.' });
  }

  // Use the community handler to fetch all members then find the target
  const mockReq = {
    method: 'GET',
    query: {},
  };

  let membersData = null;
  const mockRes = {
    setHeader: () => {},
    status: () => ({
      json: (data) => {
        membersData = data;
      },
    }),
    json: (data) => {
      membersData = data;
    },
  };

  try {
    await communityHandler(mockReq, mockRes);
  } catch (err) {
    console.error('Failed to resolve community registry', err);
  }

  const allMembers = membersData?.members || [];
  const member = allMembers.find(
    (m) =>
      m.normalizedHandle.toLowerCase() === username.toLowerCase() ||
      m.dliId.toLowerCase() === username.toLowerCase()
  );

  if (!member) {
    return res.status(404).json({ error: `Member @${username} not found in verified community registry.` });
  }

  res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
  return res.status(200).json({
    status: 'ok',
    member,
  });
}

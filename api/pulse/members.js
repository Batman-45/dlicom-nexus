// Vercel Serverless Function: GET /api/pulse/members
import communityHandler from '../community/members.js';

export default async function handler(req, res) {
  return communityHandler(req, res);
}

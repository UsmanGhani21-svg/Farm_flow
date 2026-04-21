const { getUser } = require('../../../lib/auth');

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const user = await getUser(req);
    if (!user) return res.status(401).json({ error: 'Not authenticated' });
    return res.json({ user });
  }
  if (req.method === 'DELETE') {
    res.setHeader('Set-Cookie', 'token=; Path=/; HttpOnly; Max-Age=0');
    return res.json({ success: true });
  }
  return res.status(405).end();
}

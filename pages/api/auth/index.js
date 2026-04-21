const bcrypt = require('bcryptjs');
const { query, initDB } = require('../../../lib/db');
const { signToken } = require('../../../lib/auth');

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  try {
    await initDB();
    const { username, password, action } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Username and password required' });

    if (action === 'register') {
      const exists = await query('SELECT id FROM users WHERE username=$1', [username]);
      if (exists.rows.length > 0) return res.status(400).json({ error: 'Username already exists' });
      const hash = await bcrypt.hash(password, 12);
      const result = await query('INSERT INTO users (username, password_hash) VALUES ($1, $2) RETURNING id, username', [username, hash]);
      const user = result.rows[0];
      await query('INSERT INTO budget (user_id) VALUES ($1) ON CONFLICT DO NOTHING', [user.id]);
      const token = await signToken({ userId: user.id, username: user.username });
      res.setHeader('Set-Cookie', `token=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800`);
      return res.json({ success: true, user: { id: user.id, username: user.username } });
    }

    if (action === 'login') {
      const result = await query('SELECT * FROM users WHERE username=$1', [username]);
      if (result.rows.length === 0) return res.status(401).json({ error: 'Invalid credentials' });
      const user = result.rows[0];
      const valid = await bcrypt.compare(password, user.password_hash);
      if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
      const token = await signToken({ userId: user.id, username: user.username });
      res.setHeader('Set-Cookie', `token=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800`);
      return res.json({ success: true, user: { id: user.id, username: user.username } });
    }

    return res.status(400).json({ error: 'Invalid action' });
  } catch (err) {
    console.error('Auth error:', err);
    return res.status(500).json({ error: err.message });
  }
}

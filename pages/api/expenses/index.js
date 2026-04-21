const { query, initDB } = require('../../../lib/db');
const { getUser } = require('../../../lib/auth');

export default async function handler(req, res) {
  await initDB();
  const user = await getUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  const uid = user.userId;

  if (req.method === 'GET') {
    const r = await query('SELECT * FROM expenses WHERE user_id=$1 ORDER BY date DESC', [uid]);
    return res.json(r.rows);
  }
  if (req.method === 'POST') {
    const { description, amount, category, date } = req.body;
    const r = await query('INSERT INTO expenses (user_id,description,amount,category,date) VALUES ($1,$2,$3,$4,$5) RETURNING *', [uid, description, amount, category, date || new Date().toISOString().split('T')[0]]);
    return res.json(r.rows[0]);
  }
  if (req.method === 'PUT') {
    const { id, description, amount, category, date } = req.body;
    const r = await query('UPDATE expenses SET description=$1,amount=$2,category=$3,date=$4 WHERE id=$5 AND user_id=$6 RETURNING *', [description, amount, category, date, id, uid]);
    return res.json(r.rows[0]);
  }
  if (req.method === 'DELETE') {
    await query('DELETE FROM expenses WHERE id=$1 AND user_id=$2', [req.body.id, uid]);
    return res.json({ success: true });
  }
  return res.status(405).end();
}

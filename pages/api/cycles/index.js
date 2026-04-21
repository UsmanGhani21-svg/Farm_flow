const { query, initDB } = require('../../../lib/db');
const { getUser } = require('../../../lib/auth');

export default async function handler(req, res) {
  await initDB();
  const user = await getUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  const uid = user.userId;

  if (req.method === 'GET') {
    const r = await query('SELECT * FROM cycles WHERE user_id=$1 ORDER BY year DESC, month DESC', [uid]);
    return res.json(r.rows);
  }
  if (req.method === 'POST') {
    const { name, month, year, status, revenue, expenses, notes, start_date, end_date } = req.body;
    const profit = (parseFloat(revenue) || 0) - (parseFloat(expenses) || 0);
    const r = await query('INSERT INTO cycles (user_id,name,month,year,status,revenue,expenses,profit,notes,start_date,end_date) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *', [uid, name, month, year, status || 'active', revenue || 0, expenses || 0, profit, notes, start_date || null, end_date || null]);
    return res.json(r.rows[0]);
  }
  if (req.method === 'PUT') {
    const { id, name, month, year, status, revenue, expenses, notes, start_date, end_date } = req.body;
    const profit = (parseFloat(revenue) || 0) - (parseFloat(expenses) || 0);
    const r = await query('UPDATE cycles SET name=$1,month=$2,year=$3,status=$4,revenue=$5,expenses=$6,profit=$7,notes=$8,start_date=$9,end_date=$10,updated_at=NOW() WHERE id=$11 AND user_id=$12 RETURNING *', [name, month, year, status, revenue, expenses, profit, notes, start_date || null, end_date || null, id, uid]);
    return res.json(r.rows[0]);
  }
  if (req.method === 'DELETE') {
    await query('DELETE FROM cycles WHERE id=$1 AND user_id=$2', [req.body.id, uid]);
    return res.json({ success: true });
  }
  return res.status(405).end();
}

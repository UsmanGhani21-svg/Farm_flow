const { query, initDB } = require('../../../lib/db');
const { getUser } = require('../../../lib/auth');

export default async function handler(req, res) {
  await initDB();
  const user = await getUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  const uid = user.userId;

  if (req.method === 'GET') {
    const b = await query('SELECT * FROM budget WHERE user_id=$1', [uid]);
    if (b.rows.length === 0) {
      await query('INSERT INTO budget (user_id) VALUES ($1)', [uid]);
      return res.json({ total_investment: 0, total_profit: 0 });
    }
    return res.json(b.rows[0]);
  }
  if (req.method === 'PUT') {
    const { total_investment, total_profit } = req.body;
    const exists = await query('SELECT id FROM budget WHERE user_id=$1', [uid]);
    if (exists.rows.length === 0) {
      await query('INSERT INTO budget (user_id,total_investment,total_profit) VALUES ($1,$2,$3)', [uid, total_investment, total_profit]);
    } else {
      await query('UPDATE budget SET total_investment=$1,total_profit=$2,updated_at=NOW() WHERE user_id=$3', [total_investment, total_profit, uid]);
    }
    return res.json({ success: true });
  }
  return res.status(405).end();
}

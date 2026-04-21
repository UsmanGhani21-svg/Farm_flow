const { query, initDB } = require('../../../lib/db');
const { getUser } = require('../../../lib/auth');

export default async function handler(req, res) {
  await initDB();
  const user = await getUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  const uid = user.userId;

  if (req.method === 'GET') {
    const r = await query('SELECT * FROM feed WHERE user_id=$1 ORDER BY created_at DESC', [uid]);
    return res.json(r.rows);
  }
  if (req.method === 'POST') {
    const { name, quantity, unit, price, animal_type } = req.body;
    const r = await query('INSERT INTO feed (user_id,name,quantity,unit,price,animal_type) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *', [uid, name, quantity, unit || 'kg', price, animal_type]);
    return res.json(r.rows[0]);
  }
  if (req.method === 'PUT') {
    const { id, name, quantity, unit, price, animal_type } = req.body;
    const r = await query('UPDATE feed SET name=$1,quantity=$2,unit=$3,price=$4,animal_type=$5,updated_at=NOW() WHERE id=$6 AND user_id=$7 RETURNING *', [name, quantity, unit, price, animal_type, id, uid]);
    return res.json(r.rows[0]);
  }
  if (req.method === 'DELETE') {
    await query('DELETE FROM feed WHERE id=$1 AND user_id=$2', [req.body.id, uid]);
    return res.json({ success: true });
  }
  return res.status(405).end();
}

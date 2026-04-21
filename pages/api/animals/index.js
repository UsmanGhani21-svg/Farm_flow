const { query, initDB } = require('../../../lib/db');
const { getUser } = require('../../../lib/auth');

export const config = { api: { bodyParser: { sizeLimit: '10mb' } } };

export default async function handler(req, res) {
  await initDB();
  const user = await getUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  const uid = user.userId;

  if (req.method === 'GET') {
    const r = await query('SELECT * FROM animals WHERE user_id=$1 ORDER BY created_at DESC', [uid]);
    return res.json(r.rows);
  }
  if (req.method === 'POST') {
    const { name, type, weight, color, price, photo_url } = req.body;
    const r = await query('INSERT INTO animals (user_id,name,type,weight,color,price,photo_url) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *', [uid, name, type, weight, color, price, photo_url]);
    return res.json(r.rows[0]);
  }
  if (req.method === 'PUT') {
    const { id, name, type, weight, color, price, photo_url } = req.body;
    const r = await query('UPDATE animals SET name=$1,type=$2,weight=$3,color=$4,price=$5,photo_url=$6,updated_at=NOW() WHERE id=$7 AND user_id=$8 RETURNING *', [name, type, weight, color, price, photo_url, id, uid]);
    return res.json(r.rows[0]);
  }
  if (req.method === 'DELETE') {
    await query('DELETE FROM animals WHERE id=$1 AND user_id=$2', [req.body.id, uid]);
    return res.json({ success: true });
  }
  return res.status(405).end();
}

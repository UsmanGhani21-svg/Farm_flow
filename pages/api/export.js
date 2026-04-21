const { query, initDB } = require('../../lib/db');
const { getUser } = require('../../lib/auth');
const XLSX = require('xlsx');

export default async function handler(req, res) {
  await initDB();
  const user = await getUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  const uid = user.userId;

  const [animals, feed, expenses, cycles, budget] = await Promise.all([
    query('SELECT name,type,weight,color,price,created_at FROM animals WHERE user_id=$1 ORDER BY type', [uid]),
    query('SELECT name,quantity,unit,price,animal_type FROM feed WHERE user_id=$1', [uid]),
    query('SELECT description,amount,category,date FROM expenses WHERE user_id=$1 ORDER BY date DESC', [uid]),
    query('SELECT name,month,year,status,revenue,expenses,profit,notes FROM cycles WHERE user_id=$1 ORDER BY year DESC,month DESC', [uid]),
    query('SELECT total_investment,total_profit FROM budget WHERE user_id=$1', [uid]),
  ]);

  const wb = XLSX.utils.book_new();
  const totalExpenses = expenses.rows.reduce((s, e) => s + parseFloat(e.amount || 0), 0);
  const b = budget.rows[0] || {};
  const netProfit = parseFloat(b.total_profit || 0) - totalExpenses;

  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([
    ['ANIMAL INVENTORY'], ['Name','Type','Weight (kg)','Color','Price ($)','Date Added'],
    ...animals.rows.map(a => [a.name||'-',a.type,a.weight,a.color,a.price,new Date(a.created_at).toLocaleDateString()]),
    [],['TOTAL',animals.rows.length,'','','$'+animals.rows.reduce((s,a)=>s+parseFloat(a.price||0),0).toFixed(2)]
  ]), 'Animals');

  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([
    ['FEED INVENTORY'], ['Feed Name','Quantity','Unit','Price ($)','For Animals'],
    ...feed.rows.map(f => [f.name,f.quantity,f.unit,f.price,f.animal_type||'All'])
  ]), 'Feed');

  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([
    ['EXPENSES'], ['Description','Amount ($)','Category','Date'],
    ...expenses.rows.map(e => [e.description,parseFloat(e.amount).toFixed(2),e.category||'General',new Date(e.date).toLocaleDateString()]),
    [],['TOTAL EXPENSES','$'+totalExpenses.toFixed(2)]
  ]), 'Expenses');

  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([
    ['BUDGET SUMMARY'], ['Metric','Amount'],
    ['Total Investment','$'+parseFloat(b.total_investment||0).toFixed(2)],
    ['Revenue','$'+parseFloat(b.total_profit||0).toFixed(2)],
    ['Total Expenses','$'+totalExpenses.toFixed(2)],
    ['NET PROFIT/LOSS','$'+netProfit.toFixed(2)],
  ]), 'Budget');

  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([
    ['BUSINESS CYCLES'], ['Name','Month','Year','Status','Revenue','Expenses','Profit','Notes'],
    ...cycles.rows.map(c => [c.name,c.month,c.year,c.status,c.revenue,c.expenses,c.profit,c.notes||''])
  ]), 'Cycles');

  const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
  res.setHeader('Content-Disposition', `attachment; filename="FarmDashboard_${new Date().toISOString().split('T')[0]}.xlsx"`);
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  return res.send(buf);
}

import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';

const CATEGORIES = ['Feed', 'Veterinary', 'Labor', 'Equipment', 'Transport', 'Utilities', 'Medication', 'Housing', 'Other'];
const emptyExpense = { description: '', amount: '', category: 'Feed', date: new Date().toISOString().split('T')[0] };

export default function Budget() {
  const [expenses, setExpenses] = useState([]);
  const [budget, setBudget] = useState({ total_investment: 0, total_profit: 0 });
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(emptyExpense);
  const [saving, setSaving] = useState(false);
  const [budgetForm, setBudgetForm] = useState({ total_investment: '', total_profit: '' });
  const [savingBudget, setSavingBudget] = useState(false);
  const [filterCat, setFilterCat] = useState('All');

  const loadAll = async () => {
    const [exp, bud] = await Promise.all([
      fetch('/api/expenses').then(r => r.json()),
      fetch('/api/budget').then(r => r.json()),
    ]);
    setExpenses(exp);
    setBudget(bud);
    setBudgetForm({ total_investment: bud.total_investment || '', total_profit: bud.total_profit || '' });
    setLoading(false);
  };
  useEffect(() => { loadAll(); }, []);

  const openAdd = () => { setForm(emptyExpense); setModal('add'); };
  const openEdit = (e) => { setForm({ id: e.id, description: e.description, amount: e.amount, category: e.category || 'Feed', date: e.date?.split('T')[0] || '' }); setModal('edit'); };
  const closeModal = () => { setModal(null); setForm(emptyExpense); };

  const handleSave = async () => {
    if (!form.description || !form.amount) return alert('Description and amount are required');
    setSaving(true);
    try {
      const method = modal === 'add' ? 'POST' : 'PUT';
      await fetch('/api/expenses', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      await loadAll();
      closeModal();
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this expense?')) return;
    await fetch('/api/expenses', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
    loadAll();
  };

  const handleSaveBudget = async () => {
    setSavingBudget(true);
    await fetch('/api/budget', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(budgetForm) });
    await loadAll();
    setSavingBudget(false);
  };

  const totalExpenses = expenses.reduce((s, e) => s + parseFloat(e.amount || 0), 0);
  const netProfit = parseFloat(budget.total_profit || 0) - totalExpenses;
  const roi = budget.total_investment > 0 ? (netProfit / parseFloat(budget.total_investment)) * 100 : 0;

  const catTotals = expenses.reduce((acc, e) => { acc[e.category || 'Other'] = (acc[e.category || 'Other'] || 0) + parseFloat(e.amount || 0); return acc; }, {});
  const cats = ['All', ...Object.keys(catTotals)];
  const filtered = filterCat === 'All' ? expenses : expenses.filter(e => (e.category || 'Other') === filterCat);

  return (
    <Layout title="💰 Budget & Expenses" subtitle="Track your financial performance">
      {loading ? (
        <div style={{ textAlign: 'center', padding: 60 }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="stats-grid">
            <div className="stat-card gold">
              <div className="stat-label">Total Investment</div>
              <div className="stat-value gold">${parseFloat(budget.total_investment || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
              <div className="stat-sub">Capital deployed</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Revenue / Profit</div>
              <div className="stat-value green">${parseFloat(budget.total_profit || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
              <div className="stat-sub">From animal sales</div>
            </div>
            <div className="stat-card red">
              <div className="stat-label">Total Expenses</div>
              <div className="stat-value red">${totalExpenses.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
              <div className="stat-sub">{expenses.length} records</div>
            </div>
            <div className={`stat-card ${netProfit >= 0 ? '' : 'red'}`}>
              <div className="stat-label">Net Profit / Loss</div>
              <div className={`stat-value ${netProfit >= 0 ? 'green' : 'red'}`}>
                {netProfit >= 0 ? '+' : ''}${netProfit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
              <div className="stat-sub">ROI: {roi.toFixed(1)}%</div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: 24 }}>
            {/* Left column */}
            <div>
              {/* Budget Settings */}
              <div className="card">
                <div className="card-title">⚙️ Financial Settings</div>
                <div className="form-group" style={{ marginBottom: 12 }}>
                  <label>Total Investment ($)</label>
                  <input type="number" placeholder="0.00" value={budgetForm.total_investment} onChange={e => setBudgetForm(f => ({ ...f, total_investment: e.target.value }))} />
                </div>
                <div className="form-group" style={{ marginBottom: 16 }}>
                  <label>Total Revenue / Profit ($)</label>
                  <input type="number" placeholder="0.00" value={budgetForm.total_profit} onChange={e => setBudgetForm(f => ({ ...f, total_profit: e.target.value }))} />
                  <span style={{ fontSize: 11, color: 'var(--text3)', marginTop: 4 }}>Enter profit earned from selling animals</span>
                </div>
                <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleSaveBudget} disabled={savingBudget}>
                  {savingBudget ? <span className="spinner" /> : '💾 Save Budget'}
                </button>
              </div>

              {/* Profit/Loss Summary */}
              <div className="card">
                <div className="card-title">📊 P&L Summary</div>
                {[
                  { label: 'Total Investment', value: parseFloat(budget.total_investment || 0), color: 'var(--gold)' },
                  { label: 'Revenue', value: parseFloat(budget.total_profit || 0), color: 'var(--green2)' },
                  { label: 'Total Expenses', value: -totalExpenses, color: 'var(--red)' },
                ].map(item => (
                  <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                    <span style={{ fontSize: 13, color: 'var(--text2)' }}>{item.label}</span>
                    <span style={{ fontSize: 14, fontWeight: 600, color: item.color }}>{item.value >= 0 ? '+' : ''}${Math.abs(item.value).toFixed(2)}</span>
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0 0', marginTop: 4 }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>Net Profit/Loss</span>
                  <span style={{ fontSize: 16, fontWeight: 700, color: netProfit >= 0 ? 'var(--green2)' : 'var(--red)' }}>
                    {netProfit >= 0 ? '+' : ''}${netProfit.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Expenses by Category */}
              {Object.keys(catTotals).length > 0 && (
                <div className="card">
                  <div className="card-title">🏷️ By Category</div>
                  {Object.entries(catTotals).sort((a, b) => b[1] - a[1]).map(([cat, total]) => (
                    <div key={cat} style={{ marginBottom: 10 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontSize: 12, color: 'var(--text2)' }}>{cat}</span>
                        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--red)' }}>${total.toFixed(2)}</span>
                      </div>
                      <div style={{ height: 5, background: 'var(--surface)', borderRadius: 3 }}>
                        <div style={{ height: '100%', background: 'var(--red)', borderRadius: 3, width: `${(total / totalExpenses) * 100}%`, opacity: 0.7 }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right - Expenses Table */}
            <div>
              <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
                  <div className="card-title" style={{ margin: 0 }}>📋 All Expenses</div>
                  <button className="btn btn-primary" onClick={openAdd}>+ Add Expense</button>
                </div>

                {/* Category filter */}
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
                  {cats.map(c => (
                    <button key={c} className={`btn btn-sm ${filterCat === c ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFilterCat(c)}>{c}</button>
                  ))}
                </div>

                {filtered.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-icon">💰</div>
                    <p>No expenses recorded. Start tracking your costs.</p>
                    <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={openAdd}>+ Add Expense</button>
                  </div>
                ) : (
                  <div className="table-wrap">
                    <table>
                      <thead>
                        <tr>
                          <th>Description</th>
                          <th>Category</th>
                          <th>Amount</th>
                          <th>Date</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filtered.map(e => (
                          <tr key={e.id}>
                            <td style={{ fontWeight: 500, color: 'var(--text)' }}>{e.description}</td>
                            <td><span className="badge badge-blue">{e.category || 'General'}</span></td>
                            <td style={{ fontWeight: 600, color: 'var(--red)' }}>-${parseFloat(e.amount).toFixed(2)}</td>
                            <td style={{ fontSize: 12 }}>{new Date(e.date).toLocaleDateString()}</td>
                            <td>
                              <div className="actions-cell">
                                <button className="btn btn-secondary btn-sm" onClick={() => openEdit(e)}>✏️</button>
                                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(e.id)}>🗑️</button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>

          {modal && (
            <div className="modal-overlay" onClick={e => e.target === e.currentTarget && closeModal()}>
              <div className="modal">
                <h2>{modal === 'add' ? '➕ Add Expense' : '✏️ Edit Expense'}</h2>
                <div className="form-grid">
                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label>Description *</label>
                    <input placeholder="e.g. Purchased hay bales" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label>Amount ($) *</label>
                    <input type="number" placeholder="0.00" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label>Category</label>
                    <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                      {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Date</label>
                    <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
                  </div>
                </div>
                <div className="modal-footer">
                  <button className="btn btn-secondary" onClick={closeModal}>Cancel</button>
                  <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                    {saving ? <span className="spinner" /> : modal === 'add' ? 'Add Expense' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </Layout>
  );
}

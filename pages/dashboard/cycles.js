import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);
const emptyForm = {
  name: '', month: new Date().getMonth() + 1, year: currentYear,
  status: 'active', revenue: '', expenses: '', notes: '',
  start_date: '', end_date: ''
};

export default function Cycles() {
  const [cycles, setCycles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [view, setView] = useState('cards');

  const load = () => fetch('/api/cycles').then(r => r.json()).then(setCycles).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const openAdd = () => { setForm(emptyForm); setModal('add'); };
  const openEdit = (c) => {
    setForm({
      id: c.id, name: c.name, month: c.month, year: c.year, status: c.status,
      revenue: c.revenue || '', expenses: c.expenses || '', notes: c.notes || '',
      start_date: c.start_date?.split('T')[0] || '', end_date: c.end_date?.split('T')[0] || ''
    });
    setModal('edit');
  };
  const closeModal = () => { setModal(null); setForm(emptyForm); };

  const handleSave = async () => {
    if (!form.name) return alert('Cycle name is required');
    setSaving(true);
    try {
      const method = modal === 'add' ? 'POST' : 'PUT';
      await fetch('/api/cycles', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      await load();
      closeModal();
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this cycle?')) return;
    await fetch('/api/cycles', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
    load();
  };

  const quickComplete = async (c) => {
    await fetch('/api/cycles', {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...c, status: 'completed', end_date: new Date().toISOString().split('T')[0] })
    });
    load();
  };

  const totalRevenue = cycles.reduce((s, c) => s + parseFloat(c.revenue || 0), 0);
  const totalExpenses = cycles.reduce((s, c) => s + parseFloat(c.expenses || 0), 0);
  const totalProfit = cycles.reduce((s, c) => s + parseFloat(c.profit || 0), 0);
  const activeCycles = cycles.filter(c => c.status === 'active').length;
  const completedCycles = cycles.filter(c => c.status === 'completed').length;

  return (
    <Layout title="🔄 Business Cycles" subtitle="Manage and track your farming cycles by month">
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Total Cycles</div>
          <div className="stat-value">{cycles.length}</div>
          <div className="stat-sub">{activeCycles} active, {completedCycles} completed</div>
        </div>
        <div className="stat-card gold">
          <div className="stat-label">Total Revenue</div>
          <div className="stat-value gold">${totalRevenue.toFixed(2)}</div>
        </div>
        <div className="stat-card red">
          <div className="stat-label">Total Expenses</div>
          <div className="stat-value red">${totalExpenses.toFixed(2)}</div>
        </div>
        <div className={`stat-card ${totalProfit >= 0 ? '' : 'red'}`}>
          <div className="stat-label">Net Profit</div>
          <div className={`stat-value ${totalProfit >= 0 ? 'green' : 'red'}`}>
            {totalProfit >= 0 ? '+' : ''}${totalProfit.toFixed(2)}
          </div>
        </div>
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className={`btn btn-sm ${view === 'cards' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setView('cards')}>⊞ Cards</button>
            <button className={`btn btn-sm ${view === 'table' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setView('table')}>☰ Table</button>
          </div>
          <button className="btn btn-primary" onClick={openAdd}>+ New Cycle</button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 40 }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
        ) : cycles.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🔄</div>
            <p>No business cycles yet. Create your first cycle to track performance.</p>
            <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={openAdd}>+ New Cycle</button>
          </div>
        ) : view === 'cards' ? (
          <div className="cycle-grid">
            {cycles.map(c => {
              const profit = parseFloat(c.profit || 0);
              return (
                <div key={c.id} className={`cycle-card ${c.status}`}>
                  <div className="cycle-top">
                    <div>
                      <div className="cycle-name">{c.name}</div>
                      <div className="cycle-period">{MONTHS[c.month - 1]} {c.year}</div>
                    </div>
                    <span className={`badge ${c.status === 'completed' ? 'badge-green' : 'badge-gold'}`}>
                      {c.status === 'completed' ? '✅ Done' : '🟡 Active'}
                    </span>
                  </div>

                  <div className="cycle-financials">
                    <div className="cycle-fin-item">
                      <div className="cycle-fin-label">Revenue</div>
                      <div className="cycle-fin-value" style={{ color: 'var(--green2)' }}>${parseFloat(c.revenue || 0).toFixed(0)}</div>
                    </div>
                    <div className="cycle-fin-item">
                      <div className="cycle-fin-label">Expenses</div>
                      <div className="cycle-fin-value" style={{ color: 'var(--red)' }}>${parseFloat(c.expenses || 0).toFixed(0)}</div>
                    </div>
                    <div className="cycle-fin-item">
                      <div className="cycle-fin-label">Profit</div>
                      <div className="cycle-fin-value" style={{ color: profit >= 0 ? 'var(--green2)' : 'var(--red)' }}>
                        {profit >= 0 ? '+' : ''}${profit.toFixed(0)}
                      </div>
                    </div>
                  </div>

                  {c.notes && (
                    <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 10, fontStyle: 'italic', background: 'var(--surface)', padding: '6px 10px', borderRadius: 6 }}>
                      "{c.notes}"
                    </div>
                  )}

                  {c.start_date && (
                    <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 10 }}>
                      {new Date(c.start_date).toLocaleDateString()} {c.end_date ? `→ ${new Date(c.end_date).toLocaleDateString()}` : '→ ongoing'}
                    </div>
                  )}

                  <div className="cycle-actions">
                    <button className="btn btn-secondary btn-sm" style={{ flex: 1 }} onClick={() => openEdit(c)}>✏️ Edit</button>
                    {c.status === 'active' && (
                      <button className="btn btn-primary btn-sm" onClick={() => quickComplete(c)}>✅ Complete</button>
                    )}
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(c.id)}>🗑️</button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Cycle Name</th>
                  <th>Period</th>
                  <th>Status</th>
                  <th>Revenue</th>
                  <th>Expenses</th>
                  <th>Profit</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {cycles.map(c => {
                  const profit = parseFloat(c.profit || 0);
                  return (
                    <tr key={c.id}>
                      <td style={{ fontWeight: 500, color: 'var(--text)' }}>{c.name}</td>
                      <td style={{ fontSize: 12 }}>{MONTHS[c.month - 1]} {c.year}</td>
                      <td><span className={`badge ${c.status === 'completed' ? 'badge-green' : 'badge-gold'}`}>{c.status}</span></td>
                      <td style={{ color: 'var(--green2)', fontWeight: 600 }}>${parseFloat(c.revenue || 0).toFixed(2)}</td>
                      <td style={{ color: 'var(--red)', fontWeight: 600 }}>${parseFloat(c.expenses || 0).toFixed(2)}</td>
                      <td style={{ fontWeight: 700, color: profit >= 0 ? 'var(--green2)' : 'var(--red)' }}>
                        {profit >= 0 ? '+' : ''}${profit.toFixed(2)}
                      </td>
                      <td>
                        <div className="actions-cell">
                          <button className="btn btn-secondary btn-sm" onClick={() => openEdit(c)}>✏️</button>
                          {c.status === 'active' && <button className="btn btn-primary btn-sm" onClick={() => quickComplete(c)}>✅</button>}
                          <button className="btn btn-danger btn-sm" onClick={() => handleDelete(c.id)}>🗑️</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && closeModal()}>
          <div className="modal">
            <h2>{modal === 'add' ? '➕ New Business Cycle' : '✏️ Edit Cycle'}</h2>
            <div className="form-grid">
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label>Cycle Name *</label>
                <input placeholder="e.g. Summer Cattle Cycle 2025" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div className="form-group">
                <label>Month</label>
                <select value={form.month} onChange={e => setForm(f => ({ ...f, month: parseInt(e.target.value) }))}>
                  {MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Year</label>
                <select value={form.year} onChange={e => setForm(f => ({ ...f, year: parseInt(e.target.value) }))}>
                  {YEARS.map(y => <option key={y}>{y}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Status</label>
                <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="paused">Paused</option>
                </select>
              </div>
              <div className="form-group">
                <label>Revenue ($)</label>
                <input type="number" placeholder="0.00" value={form.revenue} onChange={e => setForm(f => ({ ...f, revenue: e.target.value }))} />
              </div>
              <div className="form-group">
                <label>Expenses ($)</label>
                <input type="number" placeholder="0.00" value={form.expenses} onChange={e => setForm(f => ({ ...f, expenses: e.target.value }))} />
              </div>
              {(form.revenue || form.expenses) && (
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label>Calculated Profit</label>
                  <div style={{
                    padding: '10px 12px', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8,
                    fontWeight: 700, fontSize: 16,
                    color: (parseFloat(form.revenue || 0) - parseFloat(form.expenses || 0)) >= 0 ? 'var(--green2)' : 'var(--red)'
                  }}>
                    {(parseFloat(form.revenue || 0) - parseFloat(form.expenses || 0)) >= 0 ? '+' : ''}
                    ${(parseFloat(form.revenue || 0) - parseFloat(form.expenses || 0)).toFixed(2)}
                  </div>
                </div>
              )}
              <div className="form-group">
                <label>Start Date</label>
                <input type="date" value={form.start_date} onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))} />
              </div>
              <div className="form-group">
                <label>End Date</label>
                <input type="date" value={form.end_date} onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))} />
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label>Notes</label>
                <textarea rows={2} placeholder="Add notes about this cycle..." value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} style={{ resize: 'vertical' }} />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={closeModal}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? <span className="spinner" /> : modal === 'add' ? 'Create Cycle' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';

const ANIMAL_TYPES = ['All Animals', 'Cattle', 'Goat', 'Sheep', 'Poultry', 'Pig', 'Horse', 'Camel', 'Buffalo', 'Rabbit', 'Fish', 'Other'];
const UNITS = ['kg', 'lbs', 'tons', 'bags', 'liters', 'bales'];
const emptyForm = { name: '', quantity: '', unit: 'kg', price: '', animal_type: 'All Animals' };

export default function Feed() {
  const [feed, setFeed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = () => fetch('/api/feed').then(r => r.json()).then(setFeed).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const openAdd = () => { setForm(emptyForm); setModal('add'); };
  const openEdit = (f) => {
    setForm({ id: f.id, name: f.name, quantity: f.quantity || '', unit: f.unit || 'kg', price: f.price || '', animal_type: f.animal_type || 'All Animals' });
    setModal('edit');
  };
  const closeModal = () => { setModal(null); setForm(emptyForm); };

  const handleSave = async () => {
    if (!form.name) return alert('Feed name is required');
    setSaving(true);
    try {
      const method = modal === 'add' ? 'POST' : 'PUT';
      await fetch('/api/feed', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      await load();
      closeModal();
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this feed type?')) return;
    await fetch('/api/feed', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
    load();
  };

  const totalValue = feed.reduce((s, f) => s + parseFloat(f.price || 0), 0);
  const totalQty = feed.reduce((s, f) => s + parseFloat(f.quantity || 0), 0);

  const feedIcons = { kg: '⚖️', lbs: '⚖️', tons: '🚛', bags: '👜', liters: '💧', bales: '🌾' };

  return (
    <Layout title="🌾 Feed Management" subtitle="Track all feed types, quantities and pricing">
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Feed Types</div>
          <div className="stat-value green">{feed.length}</div>
        </div>
        <div className="stat-card gold">
          <div className="stat-label">Total Feed Value</div>
          <div className="stat-value gold">${totalValue.toFixed(2)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Quantity</div>
          <div className="stat-value">{totalQty.toLocaleString()}</div>
          <div className="stat-sub">units combined</div>
        </div>
        <div className="stat-card blue">
          <div className="stat-label">Avg Price/Type</div>
          <div className="stat-value" style={{ color: 'var(--blue)' }}>
            ${feed.length ? (totalValue / feed.length).toFixed(2) : '0.00'}
          </div>
        </div>
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div className="card-title" style={{ margin: 0 }}>🌾 Feed Inventory</div>
          <button className="btn btn-primary" onClick={openAdd}>+ Add Feed Type</button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 40 }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
        ) : feed.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🌾</div>
            <p>No feed types added yet. Add your first feed type.</p>
            <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={openAdd}>+ Add Feed Type</button>
          </div>
        ) : (
          <>
            {/* Card view */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14, marginBottom: 24 }}>
              {feed.map(f => (
                <div key={f.id} style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 10, padding: 16, position: 'relative' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)', marginBottom: 3 }}>
                        {feedIcons[f.unit] || '🌾'} {f.name}
                      </div>
                      {f.animal_type && f.animal_type !== 'All Animals' && (
                        <span className="badge badge-blue" style={{ fontSize: 10 }}>For {f.animal_type}</span>
                      )}
                    </div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--gold)' }}>${parseFloat(f.price || 0).toFixed(2)}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                    <div style={{ flex: 1, background: 'var(--surface)', borderRadius: 6, padding: '6px 10px' }}>
                      <div style={{ fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Quantity</div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginTop: 2 }}>{f.quantity} {f.unit}</div>
                    </div>
                    <div style={{ flex: 1, background: 'var(--surface)', borderRadius: 6, padding: '6px 10px' }}>
                      <div style={{ fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Per Unit</div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginTop: 2 }}>
                        ${f.quantity > 0 ? (parseFloat(f.price) / parseFloat(f.quantity)).toFixed(2) : '—'}/{f.unit}
                      </div>
                    </div>
                  </div>
                  <div className="actions-cell">
                    <button className="btn btn-secondary btn-sm" style={{ flex: 1 }} onClick={() => openEdit(f)}>✏️ Edit</button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(f.id)}>🗑️</button>
                  </div>
                </div>
              ))}
            </div>

            {/* Table view */}
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Feed Name</th>
                    <th>Quantity</th>
                    <th>Unit</th>
                    <th>Price ($)</th>
                    <th>For Animals</th>
                    <th>Added</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {feed.map(f => (
                    <tr key={f.id}>
                      <td style={{ fontWeight: 500, color: 'var(--text)' }}>{f.name}</td>
                      <td>{f.quantity}</td>
                      <td><span className="badge badge-blue">{f.unit}</span></td>
                      <td style={{ fontWeight: 600, color: 'var(--gold)' }}>${parseFloat(f.price || 0).toFixed(2)}</td>
                      <td>{f.animal_type || 'All'}</td>
                      <td style={{ fontSize: 12 }}>{new Date(f.created_at).toLocaleDateString()}</td>
                      <td>
                        <div className="actions-cell">
                          <button className="btn btn-secondary btn-sm" onClick={() => openEdit(f)}>✏️ Edit</button>
                          <button className="btn btn-danger btn-sm" onClick={() => handleDelete(f.id)}>🗑️</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && closeModal()}>
          <div className="modal">
            <h2>{modal === 'add' ? '➕ Add Feed Type' : '✏️ Edit Feed Type'}</h2>
            <div className="form-grid">
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label>Feed Name *</label>
                <input placeholder="e.g. Premium Hay, Corn Silage" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div className="form-group">
                <label>Quantity *</label>
                <input type="number" placeholder="0" value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))} />
              </div>
              <div className="form-group">
                <label>Unit</label>
                <select value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))}>
                  {UNITS.map(u => <option key={u}>{u}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Total Price ($) *</label>
                <input type="number" placeholder="0.00" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} />
              </div>
              <div className="form-group">
                <label>For Animal Type</label>
                <select value={form.animal_type} onChange={e => setForm(f => ({ ...f, animal_type: e.target.value }))}>
                  {ANIMAL_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={closeModal}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? <span className="spinner" /> : modal === 'add' ? 'Add Feed' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

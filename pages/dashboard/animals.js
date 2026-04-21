import { useEffect, useState, useRef } from 'react';
import Layout from '../../components/Layout';

const ANIMAL_TYPES = ['Cattle', 'Goat', 'Sheep', 'Poultry', 'Pig', 'Horse', 'Camel', 'Buffalo', 'Rabbit', 'Fish', 'Other'];
const COLORS = ['Black', 'White', 'Brown', 'Grey', 'Mixed', 'Spotted', 'Golden', 'Red', 'Other'];

const emptyForm = { name: '', type: 'Cattle', weight: '', color: 'Brown', price: '', photo_url: '' };

function AnimalPhoto({ photo_url, type }) {
  const emojis = { Cattle: '🐄', Goat: '🐐', Sheep: '🐑', Poultry: '🐔', Pig: '🐷', Horse: '🐴', Camel: '🐪', Buffalo: '🦬', Rabbit: '🐰', Fish: '🐟', Other: '🐾' };
  return (
    <div className="animal-photo">
      {photo_url ? <img src={photo_url} alt={type} /> : <span>{emojis[type] || '🐾'}</span>}
    </div>
  );
}

export default function Animals() {
  const [animals, setAnimals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | 'add' | 'edit'
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState('All');
  const fileRef = useRef();

  const load = () => fetch('/api/animals').then(r => r.json()).then(setAnimals).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const openAdd = () => { setForm(emptyForm); setModal('add'); };
  const openEdit = (a) => { setForm({ id: a.id, name: a.name || '', type: a.type, weight: a.weight || '', color: a.color || '', price: a.price || '', photo_url: a.photo_url || '' }); setModal('edit'); };
  const closeModal = () => { setModal(null); setForm(emptyForm); };

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setForm(f => ({ ...f, photo_url: ev.target.result }));
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const method = modal === 'add' ? 'POST' : 'PUT';
      await fetch('/api/animals', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      await load();
      closeModal();
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this animal?')) return;
    await fetch('/api/animals', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
    await load();
  };

  const types = ['All', ...Array.from(new Set(animals.map(a => a.type)))];
  const filtered = filter === 'All' ? animals : animals.filter(a => a.type === filter);

  const byType = animals.reduce((acc, a) => { acc[a.type] = (acc[a.type] || 0) + 1; return acc; }, {});
  const totalValue = animals.reduce((s, a) => s + parseFloat(a.price || 0), 0);

  return (
    <Layout title="🐾 Animals" subtitle="Manage your livestock inventory">
      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Total Animals</div>
          <div className="stat-value green">{animals.length}</div>
        </div>
        <div className="stat-card gold">
          <div className="stat-label">Total Value</div>
          <div className="stat-value gold">${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Animal Types</div>
          <div className="stat-value">{Object.keys(byType).length}</div>
        </div>
        <div className="stat-card blue">
          <div className="stat-label">Avg Price</div>
          <div className="stat-value" style={{ color: 'var(--blue)' }}>
            ${animals.length ? (totalValue / animals.length).toFixed(0) : '0'}
          </div>
        </div>
      </div>

      {/* Type breakdown */}
      {Object.keys(byType).length > 0 && (
        <div className="card">
          <div className="card-title">📊 By Type</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {Object.entries(byType).map(([type, count]) => (
              <div key={type} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 14px', display: 'flex', gap: 8, alignItems: 'center' }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{type}</span>
                <span className="badge badge-green">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Table */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {types.map(t => (
              <button key={t} className={`btn ${filter === t ? 'btn-primary' : 'btn-secondary'} btn-sm`} onClick={() => setFilter(t)}>{t}</button>
            ))}
          </div>
          <button className="btn btn-primary" onClick={openAdd}>+ Add Animal</button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 40 }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🐾</div>
            <p>No animals found. Add your first animal to get started.</p>
            <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={openAdd}>+ Add Animal</button>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Photo</th>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Weight</th>
                  <th>Color</th>
                  <th>Price</th>
                  <th>Added</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(a => (
                  <tr key={a.id}>
                    <td><AnimalPhoto photo_url={a.photo_url} type={a.type} /></td>
                    <td style={{ fontWeight: 500, color: 'var(--text)' }}>{a.name || '—'}</td>
                    <td><span className="badge badge-green">{a.type}</span></td>
                    <td>{a.weight ? `${a.weight} kg` : '—'}</td>
                    <td>{a.color || '—'}</td>
                    <td style={{ fontWeight: 600, color: 'var(--gold)' }}>${parseFloat(a.price || 0).toFixed(2)}</td>
                    <td style={{ fontSize: 12 }}>{new Date(a.created_at).toLocaleDateString()}</td>
                    <td>
                      <div className="actions-cell">
                        <button className="btn btn-secondary btn-sm" onClick={() => openEdit(a)}>✏️ Edit</button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(a.id)}>🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && closeModal()}>
          <div className="modal">
            <h2>{modal === 'add' ? '➕ Add New Animal' : '✏️ Edit Animal'}</h2>

            {/* Photo upload */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 6 }}>Photo</label>
              {form.photo_url ? (
                <div style={{ textAlign: 'center' }}>
                  <img src={form.photo_url} alt="preview" className="photo-preview" />
                  <button className="btn btn-secondary btn-sm" style={{ marginTop: 8 }} onClick={() => setForm(f => ({ ...f, photo_url: '' }))}>Remove</button>
                </div>
              ) : (
                <div className="photo-upload">
                  <input type="file" accept="image/*" ref={fileRef} onChange={handlePhoto} />
                  <div className="upload-icon">📷</div>
                  <p>Click to upload photo</p>
                </div>
              )}
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label>Name (optional)</label>
                <input placeholder="e.g. Bessie" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div className="form-group">
                <label>Type *</label>
                <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                  {ANIMAL_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Weight (kg)</label>
                <input type="number" placeholder="0" value={form.weight} onChange={e => setForm(f => ({ ...f, weight: e.target.value }))} />
              </div>
              <div className="form-group">
                <label>Color</label>
                <select value={form.color} onChange={e => setForm(f => ({ ...f, color: e.target.value }))}>
                  {COLORS.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Price ($) *</label>
                <input type="number" placeholder="0.00" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} />
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={closeModal}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? <span className="spinner" /> : modal === 'add' ? 'Add Animal' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

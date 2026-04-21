import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';

export default function Dashboard() {
  const [data, setData] = useState({ animals: [], feed: [], expenses: [], cycles: [], budget: {} });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/animals').then(r => r.json()),
      fetch('/api/feed').then(r => r.json()),
      fetch('/api/expenses').then(r => r.json()),
      fetch('/api/cycles').then(r => r.json()),
      fetch('/api/budget').then(r => r.json()),
    ]).then(([animals, feed, expenses, cycles, budget]) => {
      setData({ animals, feed, expenses, cycles, budget });
    }).finally(() => setLoading(false));
  }, []);

  const totalExpenses = data.expenses.reduce((s, e) => s + parseFloat(e.amount || 0), 0);
  const netProfit = parseFloat(data.budget.total_profit || 0) - totalExpenses;
  const animalsByType = data.animals.reduce((acc, a) => { acc[a.type] = (acc[a.type] || 0) + 1; return acc; }, {});
  const activeCycles = data.cycles.filter(c => c.status === 'active').length;

  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  return (
    <Layout title="🏠 Overview" subtitle="Welcome back — here's your farm at a glance">
      {loading ? (
        <div style={{ textAlign: 'center', padding: 60 }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
      ) : (
        <>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-label">Total Animals</div>
              <div className="stat-value green">{data.animals.length}</div>
              <div className="stat-sub">{Object.keys(animalsByType).length} type{Object.keys(animalsByType).length !== 1 ? 's' : ''}</div>
            </div>
            <div className="stat-card gold">
              <div className="stat-label">Total Investment</div>
              <div className="stat-value gold">${parseFloat(data.budget.total_investment || 0).toLocaleString()}</div>
              <div className="stat-sub">Capital deployed</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Net Profit / Loss</div>
              <div className={`stat-value ${netProfit >= 0 ? 'green' : 'red'}`}>
                {netProfit >= 0 ? '+' : ''}${netProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="stat-sub">Revenue minus expenses</div>
            </div>
            <div className="stat-card blue">
              <div className="stat-label">Active Cycles</div>
              <div className="stat-value" style={{ color: 'var(--blue)' }}>{activeCycles}</div>
              <div className="stat-sub">{data.cycles.length} total cycles</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Feed Types</div>
              <div className="stat-value">{data.feed.length}</div>
              <div className="stat-sub">In inventory</div>
            </div>
            <div className="stat-card red">
              <div className="stat-label">Total Expenses</div>
              <div className="stat-value red">${totalExpenses.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
              <div className="stat-sub">{data.expenses.length} records</div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            {/* Animals by Type */}
            <div className="card">
              <div className="card-title">🐾 Animals by Type</div>
              {Object.keys(animalsByType).length === 0 ? (
                <div className="empty-state"><div className="empty-icon">🐾</div><p>No animals added yet</p></div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {Object.entries(animalsByType).map(([type, count]) => (
                    <div key={type} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                          <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>{type}</span>
                          <span style={{ fontSize: 13, color: 'var(--green2)' }}>{count}</span>
                        </div>
                        <div style={{ height: 6, background: 'var(--surface)', borderRadius: 3, overflow: 'hidden' }}>
                          <div style={{ height: '100%', background: 'var(--green)', borderRadius: 3, width: `${(count / data.animals.length) * 100}%` }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Expenses */}
            <div className="card">
              <div className="card-title">💰 Recent Expenses</div>
              {data.expenses.length === 0 ? (
                <div className="empty-state"><div className="empty-icon">💰</div><p>No expenses recorded yet</p></div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {data.expenses.slice(0, 5).map(exp => (
                    <div key={exp.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                      <div>
                        <div style={{ fontSize: 13, color: 'var(--text)' }}>{exp.description}</div>
                        <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>{exp.category || 'General'} · {new Date(exp.date).toLocaleDateString()}</div>
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--red)' }}>-${parseFloat(exp.amount).toFixed(2)}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Cycles summary */}
            <div className="card">
              <div className="card-title">🔄 Business Cycles</div>
              {data.cycles.length === 0 ? (
                <div className="empty-state"><div className="empty-icon">🔄</div><p>No cycles created yet</p></div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {data.cycles.slice(0, 4).map(c => (
                    <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'var(--bg3)', borderRadius: 8 }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>{c.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--text3)' }}>{months[c.month - 1]} {c.year}</div>
                      </div>
                      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                        <span className={`badge ${c.status === 'completed' ? 'badge-green' : 'badge-gold'}`}>{c.status}</span>
                        <span style={{ fontSize: 13, fontWeight: 600, color: parseFloat(c.profit) >= 0 ? 'var(--green2)' : 'var(--red)' }}>
                          {parseFloat(c.profit) >= 0 ? '+' : ''}${parseFloat(c.profit).toFixed(0)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="card">
              <div className="card-title">⚡ Quick Actions</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { icon: '🐾', label: 'Add New Animal', href: '/dashboard/animals' },
                  { icon: '🌾', label: 'Manage Feed', href: '/dashboard/feed' },
                  { icon: '💰', label: 'Record Expense', href: '/dashboard/budget' },
                  { icon: '🔄', label: 'New Business Cycle', href: '/dashboard/cycles' },
                  { icon: '🤖', label: 'Get AI Recommendations', href: '/dashboard/ai' },
                ].map(action => (
                  <a key={action.href} href={action.href}
                    style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: 'var(--bg3)', borderRadius: 8, color: 'var(--text2)', fontSize: 13, fontWeight: 500, textDecoration: 'none', border: '1px solid var(--border)', transition: 'all 0.15s' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--green)'; e.currentTarget.style.color = 'var(--text)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text2)'; }}
                  >
                    <span style={{ fontSize: 18 }}>{action.icon}</span> {action.label}
                    <span style={{ marginLeft: 'auto', color: 'var(--text3)' }}>→</span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </Layout>
  );
}

import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';

export default function AI() {
  const [recs, setRecs] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [farmStats, setFarmStats] = useState(null);

  useEffect(() => {
    Promise.all([
      fetch('/api/animals').then(r => r.json()),
      fetch('/api/feed').then(r => r.json()),
      fetch('/api/expenses').then(r => r.json()),
      fetch('/api/cycles').then(r => r.json()),
      fetch('/api/budget').then(r => r.json()),
    ]).then(([animals, feed, expenses, cycles, budget]) => {
      setFarmStats({ animals, feed, expenses, cycles, budget });
    });
  }, []);

  const fetchRecs = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/ai/recommendations', { method: 'POST' });
      if (!res.ok) throw new Error('Failed to get recommendations');
      const data = await res.json();
      setRecs(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const priorityColor = { high: 'var(--red)', medium: 'var(--gold)', low: 'var(--green2)' };
  const priorityBg = { high: 'rgba(224,82,82,0.1)', medium: 'rgba(212,168,83,0.1)', low: 'rgba(74,160,90,0.1)' };

  return (
    <Layout title="🤖 AI Recommendations" subtitle="Intelligent insights powered by Claude AI">
      {/* Hero CTA */}
      <div style={{
        background: 'linear-gradient(135deg, var(--bg2) 0%, rgba(45,106,63,0.2) 100%)',
        border: '1px solid var(--border2)',
        borderRadius: 16,
        padding: 32,
        marginBottom: 24,
        textAlign: 'center'
      }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🤖</div>
        <h2 style={{ fontSize: 24, color: 'var(--text)', marginBottom: 8 }}>AI Farm Advisor</h2>
        <p style={{ color: 'var(--text3)', fontSize: 14, maxWidth: 480, margin: '0 auto 20px' }}>
          Our AI analyzes your animal inventory, feed costs, expenses, and business cycles to deliver personalized recommendations for maximizing your farm's profitability.
        </p>

        {farmStats && (
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 24 }}>
            {[
              { label: 'Animals', value: farmStats.animals.length, icon: '🐾' },
              { label: 'Feed Types', value: farmStats.feed.length, icon: '🌾' },
              { label: 'Expenses', value: farmStats.expenses.length, icon: '💰' },
              { label: 'Cycles', value: farmStats.cycles.length, icon: '🔄' },
            ].map(s => (
              <div key={s.label} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 18px', minWidth: 90 }}>
                <div style={{ fontSize: 18, marginBottom: 4 }}>{s.icon}</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)' }}>{s.value}</div>
                <div style={{ fontSize: 11, color: 'var(--text3)' }}>{s.label}</div>
              </div>
            ))}
          </div>
        )}

        <button
          className="btn btn-gold"
          style={{ padding: '12px 32px', fontSize: 15 }}
          onClick={fetchRecs}
          disabled={loading}
        >
          {loading ? (
            <><span className="spinner" style={{ borderTopColor: '#1a1000' }} /> Analyzing your farm data...</>
          ) : '✨ Get AI Recommendations'}
        </button>

        {error && <div className="error-msg" style={{ marginTop: 16, textAlign: 'left', maxWidth: 400, margin: '16px auto 0' }}>{error}</div>}
      </div>

      {recs && (
        <>
          {/* Summary */}
          {recs.summary && (
            <div style={{
              background: 'var(--bg2)', border: '1px solid var(--border2)', borderRadius: 12,
              padding: 20, marginBottom: 24,
              borderLeft: '3px solid var(--green)'
            }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <span style={{ fontSize: 20 }}>💡</span>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--green2)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 6 }}>AI Summary</div>
                  <p style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.6 }}>{recs.summary}</p>
                </div>
              </div>
            </div>
          )}

          {/* Animal Purchases */}
          {recs.animal_purchases?.length > 0 && (
            <div className="card" style={{ marginBottom: 24 }}>
              <div className="card-title">🐾 Animal Purchase Recommendations</div>
              <div className="rec-grid">
                {recs.animal_purchases.map((r, i) => (
                  <div key={i} className="rec-card">
                    <h4>🐄 {r.animal_type}</h4>
                    <p>{r.reason}</p>
                    <div className="rec-meta">
                      {r.optimal_month && <span>📅 {r.optimal_month}</span>}
                      {r.estimated_roi && <span>📈 ROI: {r.estimated_roi}</span>}
                      {r.quantity_suggestion && <span>📊 {r.quantity_suggestion}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Feed Recommendations */}
          {recs.feed_recommendations?.length > 0 && (
            <div className="card" style={{ marginBottom: 24 }}>
              <div className="card-title">🌾 Feed Recommendations</div>
              <div className="rec-grid">
                {recs.feed_recommendations.map((r, i) => (
                  <div key={i} className="rec-card">
                    <h4>🌱 {r.feed_type}</h4>
                    <p>{r.benefit}</p>
                    <div className="rec-meta">
                      {r.for_animals && <span>🐾 For: {r.for_animals}</span>}
                      {r.cost_efficiency && <span>💰 Efficiency: {r.cost_efficiency}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Cycle Optimization */}
          {recs.cycle_optimization?.length > 0 && (
            <div className="card" style={{ marginBottom: 24 }}>
              <div className="card-title">🔄 Cycle Optimization</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {recs.cycle_optimization.map((r, i) => (
                  <div key={i} style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 10, padding: 16, display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                    <span style={{ fontSize: 22 }}>🔄</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text)', marginBottom: 4 }}>{r.suggestion}</div>
                      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                        {r.impact && <span style={{ fontSize: 12, color: 'var(--green2)', background: 'rgba(74,160,90,0.1)', padding: '2px 8px', borderRadius: 4 }}>📈 {r.impact}</span>}
                        {r.timeline && <span style={{ fontSize: 12, color: 'var(--text3)', background: 'var(--surface)', padding: '2px 8px', borderRadius: 4 }}>⏱ {r.timeline}</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Financial Insights */}
          {recs.financial_insights?.length > 0 && (
            <div className="card">
              <div className="card-title">💰 Financial Insights</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {recs.financial_insights.map((r, i) => (
                  <div key={i} style={{
                    background: priorityBg[r.priority] || 'var(--bg3)',
                    border: `1px solid ${priorityColor[r.priority] || 'var(--border)'}30`,
                    borderRadius: 10, padding: 16, display: 'flex', gap: 14, alignItems: 'flex-start'
                  }}>
                    <span style={{ fontSize: 20, marginTop: 2 }}>
                      {r.priority === 'high' ? '🔴' : r.priority === 'medium' ? '🟡' : '🟢'}
                    </span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text)', marginBottom: 4 }}>{r.insight}</div>
                      {r.action && <div style={{ fontSize: 13, color: 'var(--text3)' }}>→ {r.action}</div>}
                    </div>
                    <span style={{
                      fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px',
                      color: priorityColor[r.priority] || 'var(--text3)',
                      background: priorityBg[r.priority] || 'var(--surface)',
                      padding: '3px 8px', borderRadius: 4, flexShrink: 0
                    }}>
                      {r.priority}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ textAlign: 'center', marginTop: 24, padding: 16 }}>
            <button className="btn btn-secondary" onClick={fetchRecs} disabled={loading}>
              {loading ? <span className="spinner" /> : '🔄 Refresh Recommendations'}
            </button>
            <p style={{ fontSize: 12, color: 'var(--text3)', marginTop: 10 }}>
              Recommendations update based on your latest farm data
            </p>
          </div>
        </>
      )}

      {!recs && !loading && (
        <div className="card">
          <div className="card-title">❓ How It Works</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
            {[
              { step: '1', icon: '📊', title: 'Data Analysis', desc: 'AI reviews your animals, feed, expenses, and business cycles' },
              { step: '2', icon: '🧠', title: 'Pattern Recognition', desc: 'Identifies trends and opportunities in your farming operation' },
              { step: '3', icon: '💡', title: 'Smart Suggestions', desc: 'Delivers actionable recommendations tailored to your farm' },
              { step: '4', icon: '📈', title: 'Profit Optimization', desc: 'Helps maximize ROI and minimize unnecessary costs' },
            ].map(s => (
              <div key={s.step} style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 10, padding: 16, textAlign: 'center' }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>{s.icon}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--green2)', marginBottom: 6 }}>Step {s.step}: {s.title}</div>
                <div style={{ fontSize: 12, color: 'var(--text3)', lineHeight: 1.5 }}>{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </Layout>
  );
}

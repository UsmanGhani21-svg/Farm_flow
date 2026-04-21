import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Sidebar from './Sidebar';

export default function Layout({ children, title, subtitle }) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(d => {
        if (d.user) setUser(d.user);
        else router.push('/');
      })
      .catch(() => router.push('/'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--bg)' }}>
        <div>
          <div style={{ fontSize: 40, textAlign: 'center', marginBottom: 16 }}>🌿</div>
          <div className="spinner" style={{ margin: '0 auto' }} />
        </div>
      </div>
    );
  }

  return (
    <div className="app-layout">
      <button className="mobile-nav-toggle" onClick={() => setSidebarOpen(true)}>☰</button>
      <Sidebar user={user} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="main-content">
        <div className="page-header">
          <div>
            <div className="page-title"><span>{title}</span></div>
            {subtitle && <div className="page-subtitle">{subtitle}</div>}
          </div>
        </div>
        <div className="page-body">{children}</div>
      </div>
    </div>
  );
}

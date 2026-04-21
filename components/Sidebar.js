import { useRouter } from 'next/router';
import { useState } from 'react';

const navItems = [
  { icon: '🏠', label: 'Overview', href: '/dashboard' },
  { icon: '🐾', label: 'Animals', href: '/dashboard/animals' },
  { icon: '🌾', label: 'Feed', href: '/dashboard/feed' },
  { icon: '💰', label: 'Budget & Expenses', href: '/dashboard/budget' },
  { icon: '🔄', label: 'Business Cycles', href: '/dashboard/cycles' },
  { icon: '🤖', label: 'AI Recommendations', href: '/dashboard/ai' },
];

export default function Sidebar({ user, isOpen, onClose }) {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/auth/me', { method: 'DELETE' });
    router.push('/');
  };

  return (
    <>
      {isOpen && <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 99 }} onClick={onClose} />}
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <h1>🌿 FarmFlow</h1>
          <p>Business Management</p>
        </div>
        <nav className="sidebar-nav">
          <div className="nav-section">
            <div className="nav-label">Navigation</div>
            {navItems.map(item => (
              <a
                key={item.href}
                className={`nav-item ${router.pathname === item.href ? 'active' : ''}`}
                href={item.href}
                onClick={e => { e.preventDefault(); router.push(item.href); if (onClose) onClose(); }}
              >
                <span className="nav-icon">{item.icon}</span>
                {item.label}
              </a>
            ))}
          </div>
          <div className="nav-section" style={{ marginTop: 16 }}>
            <div className="nav-label">Actions</div>
            <a
              className="nav-item"
              href="/api/export"
              target="_blank"
              rel="noreferrer"
            >
              <span className="nav-icon">📊</span>
              Export to Excel
            </a>
          </div>
        </nav>
        <div className="sidebar-footer">
          {user && (
            <div className="user-info">
              <div className="user-avatar">{user.username?.[0]?.toUpperCase()}</div>
              <div className="user-name">{user.username}</div>
            </div>
          )}
          <button className="logout-btn" onClick={handleLogout}>→ Sign Out</button>
        </div>
      </aside>
    </>
  );
}

import React from 'react';
import { Home, LayoutDashboard, Bookmark, Scale, BarChart2, Settings } from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'valuations', label: 'My Valuations', icon: Bookmark },
    { id: 'comparables', label: 'Comparables', icon: Scale },
    { id: 'analytics', label: 'Analytics', icon: BarChart2 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside style={{
      width: '240px',
      height: '100vh',
      position: 'sticky',
      top: 0,
      background: 'var(--sidebar-bg)',
      borderRight: '1px solid var(--border-color)',
      padding: '24px 16px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      zIndex: 100
    }}>
      <div>
        {/* Brand & Logo matching Screenshot 1 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '0 8px', marginBottom: '32px' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFF',
            boxShadow: '0 4px 14px rgba(37, 99, 235, 0.4)'
          }}>
            <Home size={22} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-main)', lineHeight: 1.1 }}>
              AI Estate
            </h2>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600' }}>Valuation Suite</span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  border: 'none',
                  background: isActive ? 'rgba(37, 99, 235, 0.12)' : 'transparent',
                  color: isActive ? 'var(--accent-primary)' : 'var(--text-muted)',
                  fontSize: '14px',
                  fontWeight: isActive ? '700' : '600',
                  cursor: 'pointer',
                  width: '100%',
                  textAlign: 'left',
                  transition: 'all 0.2s ease'
                }}
              >
                <Icon size={18} color={isActive ? 'var(--accent-primary)' : 'var(--text-muted)'} />
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer info */}
      <div style={{ padding: '12px 16px', borderRadius: '12px', background: 'var(--input-bg)', border: '1px solid var(--border-color)' }}>
        <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-main)' }}>California AI v2.0</div>
        <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>Quantum LightGBM & SHAP</div>
      </div>
    </aside>
  );
}

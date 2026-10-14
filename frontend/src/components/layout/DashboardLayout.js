import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const DashboardLayout = ({ children, navItems, role, roleLabel, roleColor }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully');
  };

  const roleColors = {
    superadmin: { bg: '#7c3aed', light: '#ede9fe', text: '#5b21b6' },
    admin: { bg: '#2563eb', light: '#dbeafe', text: '#1e40af' },
    voter: { bg: '#059669', light: '#d1fae5', text: '#065f46' },
    observer: { bg: '#d97706', light: '#fef3c7', text: '#92400e' },
  };
  const colors = roleColors[role] || roleColors.voter;

  const initials = user ? `${user.firstName?.[0]}${user.lastName?.[0]}`.toUpperCase() : 'U';

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className="sidebar" style={{ width: collapsed ? 72 : 260, transition: 'width 0.3s' }}>
        {/* Logo */}
        <div className="sidebar-logo" style={{ padding: collapsed ? '20px 16px' : '20px', justifyContent: collapsed ? 'center' : 'flex-start' }}>
          <div className="sidebar-logo-icon">🗳️</div>
          {!collapsed && (
            <div>
              <div className="sidebar-logo-text">VoteSecure</div>
              <div className="sidebar-logo-sub">Pro Platform</div>
            </div>
          )}
          <button onClick={() => setCollapsed(!collapsed)}
            style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: 18, display: collapsed ? 'none' : 'block' }}>
            ☰
          </button>
        </div>

        {/* Role badge */}
        {!collapsed && (
          <div style={{ margin: '0 16px 8px', padding: '8px 12px', background: `${colors.bg}20`, border: `1px solid ${colors.bg}40`, borderRadius: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: colors.bg, animation: 'pulse 2s infinite' }}></div>
            <span style={{ color: colors.bg, fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{roleLabel}</span>
          </div>
        )}

        {/* Nav */}
        <nav className="sidebar-nav">
          {navItems.map((section, si) => (
            <div className="sidebar-section" key={si}>
              {!collapsed && section.label && <div className="sidebar-section-label">{section.label}</div>}
              {section.items.map((item, ii) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link key={ii} to={item.path} className={`sidebar-link ${isActive ? 'active' : ''}`}
                    style={{ paddingLeft: collapsed ? 26 : 20, justifyContent: collapsed ? 'center' : 'flex-start' }}
                    title={collapsed ? item.label : ''}>
                    <span style={{ fontSize: 18 }}>{item.icon}</span>
                    {!collapsed && <span>{item.label}</span>}
                    {!collapsed && item.badge && <span className="sidebar-link-badge">{item.badge}</span>}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* User footer */}
        <div className="sidebar-footer">
          <div className="sidebar-user" onClick={() => navigate(`/${role}/profile`)} style={{ justifyContent: collapsed ? 'center' : 'flex-start' }}>
            <div className="sidebar-avatar" style={{ background: colors.bg, flexShrink: 0 }}>{initials}</div>
            {!collapsed && (
              <div className="sidebar-user-info">
                <div className="sidebar-user-name">{user?.firstName} {user?.lastName}</div>
                <div className="sidebar-user-role">{user?.role}</div>
              </div>
            )}
          </div>
          {!collapsed && (
            <button onClick={handleLogout}
              style={{ width: '100%', marginTop: 8, padding: '8px 12px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, color: '#ef4444', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
              🚪 Sign Out
            </button>
          )}
        </div>
      </aside>

      {/* Main */}
      <main className="main-content" style={{ marginLeft: collapsed ? 72 : 260, transition: 'margin-left 0.3s' }}>
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;

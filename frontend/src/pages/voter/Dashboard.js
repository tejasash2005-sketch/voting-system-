import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { voterNav } from '../../utils/navConfig';
import { voterAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function VoterDashboard() {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    voterAPI.getDashboard()
      .then(r => setDashboard(r.data.dashboard))
      .catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  const statusColor = { active: '#10b981', upcoming: '#3b82f6', completed: '#6b7280' };

  return (
    <DashboardLayout navItems={voterNav} role="voter" roleLabel="Voter">
      <div className="page-header">
        <div>
          <h1 className="page-title">Welcome, {user?.firstName}! 👋</h1>
          <p className="page-subtitle">Your Voter ID: <strong style={{ fontFamily: 'monospace', color: '#2563eb' }}>{user?.voterId || 'Not assigned'}</strong></p>
        </div>
        <Link to="/voter/elections" className="btn btn-primary">🗳️ View Elections</Link>
      </div>

      <div className="page-content fade-in">
        {loading ? (
          <div style={{ textAlign: 'center', padding: 60 }}><div className="spinner" style={{ margin: '0 auto', borderTopColor: '#059669' }}></div></div>
        ) : (
          <>
            {/* Stats */}
            <div className="stats-grid">
              {[
                { icon: '🗳️', label: 'Active Elections', value: dashboard?.activeElections ?? 0, color: '#10b981', bg: '#d1fae5', link: '/voter/elections', linkText: 'Vote Now' },
                { icon: '📅', label: 'Upcoming Elections', value: dashboard?.upcomingElections ?? 0, color: '#3b82f6', bg: '#dbeafe', link: '/voter/elections', linkText: 'Preview' },
                { icon: '✅', label: 'Votes Cast', value: dashboard?.totalVotesCast ?? 0, color: '#8b5cf6', bg: '#ede9fe', link: '/voter/history', linkText: 'View History' },
                { icon: '🔔', label: 'Notifications', value: dashboard?.unreadNotifications ?? 0, color: '#f59e0b', bg: '#fef3c7', link: '/voter/notifications', linkText: 'Read All' },
              ].map((s, i) => (
                <div className="stat-card" key={i} style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 0, padding: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, width: '100%', marginBottom: 12 }}>
                    <div className="stat-icon" style={{ background: s.color, width: 44, height: 44 }}><span style={{ fontSize: 20 }}>{s.icon}</span></div>
                    <div>
                      <div className="stat-value">{s.value}</div>
                      <div className="stat-label">{s.label}</div>
                    </div>
                  </div>
                  <Link to={s.link} style={{ fontSize: 13, color: s.color, fontWeight: 700, textDecoration: 'none' }}>{s.linkText} →</Link>
                </div>
              ))}
            </div>

            {/* Voter Status Card */}
            <div className="card" style={{ marginBottom: 24, background: 'linear-gradient(135deg, #0f2147, #1a3a6b)', color: 'white', border: 'none' }}>
              <div className="card-body">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <h3 style={{ color: 'white', fontSize: 20, marginBottom: 8 }}>🗳️ Your Voting Status</h3>
                    <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14 }}>Account verified and ready to vote in eligible elections</p>
                    <div style={{ display: 'flex', gap: 20, marginTop: 16 }}>
                      <div>
                        <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>ACCOUNT STATUS</div>
                        <div style={{ color: '#10b981', fontWeight: 700, marginTop: 2 }}>✅ {user?.isActive ? 'Active' : 'Inactive'}</div>
                      </div>
                      <div>
                        <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>VERIFICATION</div>
                        <div style={{ color: user?.isVerified ? '#10b981' : '#f59e0b', fontWeight: 700, marginTop: 2 }}>{user?.isVerified ? '✅ Verified' : '⏳ Pending'}</div>
                      </div>
                      <div>
                        <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>VOTER ID</div>
                        <div style={{ color: '#f59e0b', fontWeight: 700, fontFamily: 'monospace', marginTop: 2 }}>{user?.voterId || '—'}</div>
                      </div>
                    </div>
                  </div>
                  <div style={{ fontSize: 80 }}>🏛️</div>
                </div>
              </div>
            </div>

            <div className="grid-2">
              {/* Active Elections */}
              <div className="card">
                <div className="card-header">
                  <span className="card-title">🔴 Active Elections</span>
                  <Link to="/voter/elections" style={{ fontSize: 13, color: '#2563eb', fontWeight: 600, textDecoration: 'none' }}>View All →</Link>
                </div>
                <div className="card-body" style={{ padding: 0 }}>
                  {(dashboard?.recentElections || []).length > 0 ? dashboard.recentElections.map(e => (
                    <div key={e._id} style={{ padding: '14px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>{e.title}</div>
                        <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>📍 {e.region} · Ends {new Date(e.endDate).toLocaleDateString()}</div>
                      </div>
                      <Link to={`/voter/vote/${e._id}`} className="btn btn-success btn-sm">Vote Now</Link>
                    </div>
                  )) : (
                    <div className="empty-state" style={{ padding: 40 }}>
                      <div className="empty-state-icon">🗳️</div>
                      <h3>No active elections</h3>
                      <p>Check back soon for upcoming elections.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Upcoming Elections */}
              <div className="card">
                <div className="card-header">
                  <span className="card-title">📅 Upcoming Elections</span>
                </div>
                <div className="card-body" style={{ padding: 0 }}>
                  {(dashboard?.upcomingList || []).length > 0 ? dashboard.upcomingList.map(e => (
                    <div key={e._id} style={{ padding: '14px 20px', borderBottom: '1px solid #f1f5f9' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 14 }}>{e.title}</div>
                          <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>📅 Starts {new Date(e.startDate).toLocaleDateString()}</div>
                        </div>
                        <span className="badge badge-upcoming">Upcoming</span>
                      </div>
                    </div>
                  )) : (
                    <div className="empty-state" style={{ padding: 40 }}>
                      <div className="empty-state-icon">📅</div>
                      <h3>No upcoming elections</h3>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="card" style={{ marginTop: 24 }}>
              <div className="card-header"><span className="card-title">⚡ Quick Access</span></div>
              <div className="card-body">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16 }}>
                  {[
                    { icon: '🗳️', label: 'Vote Now', path: '/voter/elections', color: '#059669' },
                    { icon: '📜', label: 'Vote History', path: '/voter/history', color: '#2563eb' },
                    { icon: '🧾', label: 'Verify Receipt', path: '/voter/receipt', color: '#8b5cf6' },
                    { icon: '🏆', label: 'Candidates', path: '/voter/candidates', color: '#f59e0b' },
                    { icon: '👤', label: 'My Profile', path: '/voter/profile', color: '#ef4444' },
                  ].map((a, i) => (
                    <Link key={i} to={a.path} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, padding: 20, background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0', textDecoration: 'none', transition: 'all 0.2s' }}
                      onMouseEnter={e => { e.currentTarget.style.background = `${a.color}10`; e.currentTarget.style.borderColor = a.color; }}
                      onMouseLeave={e => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.borderColor = '#e2e8f0'; }}>
                      <span style={{ fontSize: 28 }}>{a.icon}</span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#475569' }}>{a.label}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

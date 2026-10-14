import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { superAdminAPI } from '../../services/api';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const navItems = [
  { label: 'OVERVIEW', items: [
    { icon: '📊', label: 'Dashboard', path: '/superadmin/dashboard' },
  ]},
  { label: 'MANAGEMENT', items: [
    { icon: '👥', label: 'User Management', path: '/superadmin/users' },
    { icon: '🗳️', label: 'Elections', path: '/superadmin/elections' },
    { icon: '🛡️', label: 'Roles & Permissions', path: '/superadmin/roles' },
  ]},
  { label: 'MONITORING', items: [
    { icon: '📋', label: 'Audit Logs', path: '/superadmin/audit-logs' },
    { icon: '🔒', label: 'Security', path: '/superadmin/security' },
    { icon: '❤️', label: 'System Health', path: '/superadmin/health' },
  ]},
  { label: 'COMMUNICATION', items: [
    { icon: '🔔', label: 'Notifications', path: '/superadmin/notifications' },
  ]},
  { label: 'ANALYTICS', items: [
    { icon: '📈', label: 'Reports', path: '/superadmin/reports' },
    { icon: '⚙️', label: 'Settings', path: '/superadmin/settings' },
  ]},
];

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function SuperAdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    superAdminAPI.getDashboard().then(r => { setData(r.data.dashboard); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const statCards = data ? [
    { label: 'Total Users', value: data.totalUsers?.toLocaleString(), icon: '👥', color: '#2563eb', bg: '#dbeafe', change: '+12% this month' },
    { label: 'Total Elections', value: data.totalElections?.toLocaleString(), icon: '🗳️', color: '#10b981', bg: '#d1fae5', change: `${data.activeElections} active now` },
    { label: 'Votes Cast', value: data.totalVotes?.toLocaleString(), icon: '✅', color: '#f59e0b', bg: '#fef3c7', change: 'All time' },
    { label: 'Active Elections', value: data.activeElections?.toLocaleString(), icon: '🔴', color: '#ef4444', bg: '#fee2e2', change: 'Live right now' },
  ] : [];

  const roleData = data?.usersByRole?.map(r => ({ name: r._id, value: r.count })) || [];
  const statusData = data?.electionsByStatus?.map(s => ({ name: s._id, value: s.count })) || [];
  const trendData = (data?.votingTrend || []).slice().reverse().map(t => ({ date: t._id?.slice(5), votes: t.count }));

  return (
    <DashboardLayout navItems={navItems} role="superadmin" roleLabel="Super Admin" roleColor="#7c3aed">
      <div className="page-header">
        <div>
          <h1 className="page-title">System Dashboard</h1>
          <p className="page-subtitle">Complete overview of the VoteSecure platform</p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <Link to="/superadmin/users" className="btn btn-outline btn-sm">👥 Manage Users</Link>
          <Link to="/superadmin/elections" className="btn btn-primary btn-sm">🗳️ Elections</Link>
        </div>
      </div>

      <div className="page-content fade-in">
        {loading ? (
          <div style={{ textAlign: 'center', padding: 60 }}><div className="spinner" style={{ margin: '0 auto', borderTopColor: '#2563eb' }}></div></div>
        ) : (
          <>
            {/* Stats */}
            <div className="stats-grid">
              {statCards.map((s, i) => (
                <div className="stat-card" key={i}>
                  <div className="stat-icon" style={{ background: s.color }}><span style={{ fontSize: 22 }}>{s.icon}</span></div>
                  <div>
                    <div className="stat-value">{s.value || '0'}</div>
                    <div className="stat-label">{s.label}</div>
                    <div className="stat-change up">{s.change}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid-2" style={{ marginBottom: 24 }}>
              {/* Voting Trend */}
              <div className="card">
                <div className="card-header"><span className="card-title">📈 Voting Trend (Last 30 Days)</span></div>
                <div className="card-body">
                  {trendData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={220}>
                      <LineChart data={trendData}>
                        <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} />
                        <Tooltip />
                        <Line type="monotone" dataKey="votes" stroke="#2563eb" strokeWidth={2} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : <div className="empty-state"><p>No voting data yet</p></div>}
                </div>
              </div>

              {/* Users by role */}
              <div className="card">
                <div className="card-header"><span className="card-title">👥 Users by Role</span></div>
                <div className="card-body" style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                  {roleData.length > 0 ? (
                    <>
                      <ResponsiveContainer width="50%" height={200}>
                        <PieChart>
                          <Pie data={roleData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value">
                            {roleData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                      <div style={{ flex: 1 }}>
                        {roleData.map((r, i) => (
                          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <div style={{ width: 10, height: 10, borderRadius: '50%', background: COLORS[i % COLORS.length] }}></div>
                              <span style={{ fontSize: 13, textTransform: 'capitalize', fontWeight: 500 }}>{r.name}</span>
                            </div>
                            <span style={{ fontSize: 14, fontWeight: 700 }}>{r.value}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : <div className="empty-state"><p>No user data</p></div>}
                </div>
              </div>
            </div>

            <div className="grid-2">
              {/* Elections by status */}
              <div className="card">
                <div className="card-header"><span className="card-title">🗳️ Elections by Status</span></div>
                <div className="card-body">
                  {statusData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={statusData}>
                        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip />
                        <Bar dataKey="value" fill="#2563eb" radius={[4, 4, 0, 0]}>
                          {statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : <div className="empty-state"><p>No election data</p></div>}
                </div>
              </div>

              {/* Recent activity */}
              <div className="card">
                <div className="card-header">
                  <span className="card-title">🕐 Recent Activity</span>
                  <Link to="/superadmin/audit-logs" style={{ fontSize: 13, color: '#2563eb', textDecoration: 'none', fontWeight: 600 }}>View All →</Link>
                </div>
                <div className="card-body" style={{ padding: 0 }}>
                  {(data?.recentActivity || []).slice(0, 6).map((log, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 20px', borderBottom: '1px solid #f1f5f9' }}>
                      <div style={{ width: 36, height: 36, borderRadius: '50%', background: log.status === 'success' ? '#d1fae5' : '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>
                        {log.status === 'success' ? '✅' : '❌'}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', marginBottom: 2 }}>{log.action?.replace(/_/g, ' ')}</p>
                        <p style={{ fontSize: 12, color: '#94a3b8' }}>
                          {log.performedBy ? `${log.performedBy.firstName} ${log.performedBy.lastName}` : 'System'} · {log.performedByRole}
                        </p>
                      </div>
                      <span style={{ fontSize: 11, color: '#94a3b8', flexShrink: 0 }}>{new Date(log.timestamp).toLocaleTimeString()}</span>
                    </div>
                  ))}
                  {(!data?.recentActivity || data.recentActivity.length === 0) && (
                    <div className="empty-state"><p>No recent activity</p></div>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="card" style={{ marginTop: 24 }}>
              <div className="card-header"><span className="card-title">⚡ Quick Actions</span></div>
              <div className="card-body">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16 }}>
                  {[
                    { icon: '👤', label: 'Add User', path: '/superadmin/users', color: '#2563eb' },
                    { icon: '🗳️', label: 'New Election', path: '/superadmin/elections', color: '#10b981' },
                    { icon: '📋', label: 'Audit Logs', path: '/superadmin/audit-logs', color: '#f59e0b' },
                    { icon: '🔒', label: 'Security', path: '/superadmin/security', color: '#ef4444' },
                    { icon: '📊', label: 'Reports', path: '/superadmin/reports', color: '#8b5cf6' },
                  ].map((a, i) => (
                    <Link key={i} to={a.path} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, padding: 20, background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0', textDecoration: 'none', transition: 'all 0.2s', cursor: 'pointer' }}
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

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { adminNav } from '../../utils/navConfig';
import { adminAPI, electionAPI } from '../../services/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.getElections().then(r => setElections(r.data.elections || [])).catch(() => toast.error('Failed to load')).finally(() => setLoading(false));
  }, []);

  const active = elections.filter(e => e.status === 'active').length;
  const upcoming = elections.filter(e => e.status === 'upcoming').length;
  const completed = elections.filter(e => e.status === 'completed').length;

  const chartData = elections.slice(0, 6).map(e => ({
    name: e.title.slice(0, 15) + '...',
    votes: e.totalVotesCast,
    eligible: e.totalEligibleVoters,
  }));

  return (
    <DashboardLayout navItems={adminNav} role="admin" roleLabel="Admin">
      <div className="page-header">
        <div><h1 className="page-title">Admin Dashboard</h1><p className="page-subtitle">Manage your elections and voters</p></div>
        <div style={{ display: 'flex', gap: 12 }}>
          <Link to="/admin/voters" className="btn btn-outline btn-sm">👥 Manage Voters</Link>
          <Link to="/admin/elections" className="btn btn-primary btn-sm">🗳️ My Elections</Link>
        </div>
      </div>
      <div className="page-content fade-in">
        <div className="stats-grid">
          {[
            { icon: '🗳️', label: 'Total Elections', value: elections.length, color: '#2563eb', bg: '#dbeafe' },
            { icon: '🔴', label: 'Active Elections', value: active, color: '#10b981', bg: '#d1fae5', change: 'Running now' },
            { icon: '📅', label: 'Upcoming', value: upcoming, color: '#f59e0b', bg: '#fef3c7' },
            { icon: '✅', label: 'Completed', value: completed, color: '#6b7280', bg: '#f1f5f9' },
          ].map((s, i) => (
            <div className="stat-card" key={i}><div className="stat-icon" style={{ background: s.color }}><span style={{ fontSize: 22 }}>{s.icon}</span></div><div><div className="stat-value">{s.value}</div><div className="stat-label">{s.label}</div>{s.change && <div className="stat-change up">{s.change}</div>}</div></div>
          ))}
        </div>

        <div className="grid-2" style={{ marginBottom: 24 }}>
          <div className="card">
            <div className="card-header"><span className="card-title">📊 Votes vs Eligible Voters</span></div>
            <div className="card-body">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={chartData}>
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="eligible" fill="#dbeafe" name="Eligible" radius={[4,4,0,0]} />
                    <Bar dataKey="votes" fill="#2563eb" name="Votes Cast" radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : <div className="empty-state"><p>No election data</p></div>}
            </div>
          </div>
          <div className="card">
            <div className="card-header"><span className="card-title">⚡ Quick Actions</span></div>
            <div className="card-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {[
                  { icon: '👥', label: 'Register Voter', path: '/admin/voters', color: '#2563eb' },
                  { icon: '🏆', label: 'Add Candidate', path: '/admin/candidates', color: '#10b981' },
                  { icon: '🗂️', label: 'Configure Ballot', path: '/admin/ballot', color: '#f59e0b' },
                  { icon: '📺', label: 'Live Monitor', path: '/admin/live-monitor', color: '#ef4444' },
                  { icon: '📊', label: 'View Results', path: '/admin/results', color: '#8b5cf6' },
                  { icon: '📈', label: 'Reports', path: '/admin/reports', color: '#059669' },
                ].map((a, i) => (
                  <Link key={i} to={a.path} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px', background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0', textDecoration: 'none', transition: 'all 0.2s' }}
                    onMouseEnter={e => { e.currentTarget.style.background = `${a.color}10`; e.currentTarget.style.borderColor = a.color; }}
                    onMouseLeave={e => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.borderColor = '#e2e8f0'; }}>
                    <span style={{ fontSize: 22 }}>{a.icon}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#475569' }}>{a.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><span className="card-title">🗳️ My Elections</span><Link to="/admin/elections" style={{ fontSize: 13, color: '#2563eb', textDecoration: 'none', fontWeight: 600 }}>View All →</Link></div>
          <div className="table-container">
            {loading ? <div style={{ padding: 30, textAlign: 'center' }}>Loading...</div> : (
              <table>
                <thead><tr><th>Election</th><th>Type</th><th>Status</th><th>Turnout</th><th>End Date</th><th>Actions</th></tr></thead>
                <tbody>
                  {elections.slice(0, 5).map(e => {
                    const turnout = e.totalEligibleVoters > 0 ? ((e.totalVotesCast / e.totalEligibleVoters) * 100).toFixed(1) : 0;
                    return (
                      <tr key={e._id}>
                        <td><div style={{ fontWeight: 600, fontSize: 14 }}>{e.title}</div><div style={{ fontSize: 12, color: '#94a3b8' }}>{e.region}</div></td>
                        <td><span className="badge badge-info">{e.type}</span></td>
                        <td><span className={`badge badge-${e.status}`}>{e.status}</span></td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div className="progress" style={{ width: 80 }}><div className="progress-bar" style={{ width: `${Math.min(turnout, 100)}%`, background: '#2563eb' }}></div></div>
                            <span style={{ fontSize: 12, fontWeight: 600 }}>{turnout}%</span>
                          </div>
                        </td>
                        <td style={{ fontSize: 13, color: '#64748b' }}>{new Date(e.endDate).toLocaleDateString()}</td>
                        <td>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <Link to="/admin/live-monitor" className="btn btn-outline btn-sm" style={{ fontSize: 11 }}>📺 Monitor</Link>
                            <Link to="/admin/results" className="btn btn-sm btn-primary" style={{ fontSize: 11 }}>📊 Results</Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

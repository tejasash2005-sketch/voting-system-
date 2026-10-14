import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { observerNav } from '../../utils/navConfig';
import { observerAPI } from '../../services/api';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import toast from 'react-hot-toast';

const COLORS = ['#1a3a6b', '#e02424', '#057a55', '#d97706', '#7c3aed', '#0891b2'];

// ── Observer Dashboard ─────────────────────────────────────────────────────────
export function ObserverDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => { observerAPI.getDashboard().then(r => setData(r.data.dashboard)).catch(() => {}).finally(() => setLoading(false)); }, []);

  return (
    <DashboardLayout navItems={observerNav} role="observer" roleLabel="Observer">
      <div className="page-header">
        <div><h1 className="page-title">Observer Dashboard</h1><p className="page-subtitle">Monitor election integrity and transparency</p></div>
        <Link to="/observer/elections" className="btn btn-primary">👁️ View Elections</Link>
      </div>
      <div className="page-content fade-in">
        {loading ? <div style={{ textAlign: 'center', padding: 60 }}><div className="spinner" style={{ margin: '0 auto', borderTopColor: '#d97706' }}></div></div> : data && (
          <>
            <div className="stats-grid">
              {[
                { icon: '📋', label: 'Assigned Elections', value: data.totalAssigned, color: '#d97706', bg: '#fef3c7' },
                { icon: '🔴', label: 'Active Monitoring', value: data.activeMonitored, color: '#ef4444', bg: '#fee2e2', change: 'Live now' },
                { icon: '✅', label: 'Completed', value: data.completedElections, color: '#10b981', bg: '#d1fae5' },
                { icon: '📊', label: 'Reports Filed', value: '—', color: '#8b5cf6', bg: '#ede9fe' },
              ].map((s, i) => (
                <div className="stat-card" key={i}><div className="stat-icon" style={{ background: s.color }}><span style={{ fontSize: 22 }}>{s.icon}</span></div><div><div className="stat-value">{s.value}</div><div className="stat-label">{s.label}</div>{s.change && <div className="stat-change up">{s.change}</div>}</div></div>
              ))}
            </div>
            <div className="card">
              <div className="card-header"><span className="card-title">🗳️ Assigned Elections</span><Link to="/observer/elections" style={{ fontSize: 13, color: '#2563eb', fontWeight: 600, textDecoration: 'none' }}>View All →</Link></div>
              <div className="table-container">
                <table>
                  <thead><tr><th>Election</th><th>Type</th><th>Status</th><th>Turnout</th><th>Actions</th></tr></thead>
                  <tbody>
                    {(data.elections || []).map(e => {
                      const turnout = e.totalEligibleVoters > 0 ? ((e.totalVotesCast / e.totalEligibleVoters) * 100).toFixed(1) : 0;
                      return (
                        <tr key={e._id}>
                          <td><div style={{ fontWeight: 600 }}>{e.title}</div><div style={{ fontSize: 12, color: '#94a3b8' }}>{e.region}</div></td>
                          <td><span className="badge badge-info">{e.type}</span></td>
                          <td><span className={`badge badge-${e.status}`}>{e.status}</span></td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <div className="progress" style={{ width: 80 }}><div className="progress-bar" style={{ width: `${Math.min(turnout, 100)}%`, background: '#d97706' }}></div></div>
                              <span style={{ fontSize: 13, fontWeight: 600 }}>{turnout}%</span>
                            </div>
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: 6 }}>
                              <Link to={`/observer/realtime/${e._id}`} className="btn btn-sm btn-primary" style={{ fontSize: 11 }}>📡 Monitor</Link>
                              <Link to={`/observer/integrity/${e._id}`} className="btn btn-sm btn-outline" style={{ fontSize: 11 }}>🔍 Integrity</Link>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {(!data.elections || data.elections.length === 0) && <tr><td colSpan={5} style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>No elections assigned yet</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="card" style={{ marginTop: 24 }}>
              <div className="card-header"><span className="card-title">⚡ Observer Actions</span></div>
              <div className="card-body">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
                  {[
                    { icon: '📡', label: 'Real-time Stats', path: '/observer/elections', color: '#d97706' },
                    { icon: '🔍', label: 'Integrity Check', path: '/observer/elections', color: '#2563eb' },
                    { icon: '📝', label: 'Submit Report', path: '/observer/elections', color: '#10b981' },
                    { icon: '📉', label: 'Analysis', path: '/observer/analysis', color: '#8b5cf6' },
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

// ── Observer Elections ─────────────────────────────────────────────────────────
export function ObserverElections() {
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { observerAPI.getElections().then(r => setElections(r.data.elections || [])).catch(() => {}).finally(() => setLoading(false)); }, []);

  return (
    <DashboardLayout navItems={observerNav} role="observer" roleLabel="Observer">
      <div className="page-header"><div><h1 className="page-title">My Elections</h1><p className="page-subtitle">Elections assigned for observation</p></div></div>
      <div className="page-content fade-in">
        {loading ? <div style={{ textAlign: 'center', padding: 60 }}><div className="spinner" style={{ margin: '0 auto', borderTopColor: '#d97706' }}></div></div>
        : elections.length === 0 ? <div className="empty-state card" style={{ padding: 60 }}><div className="empty-state-icon">👁️</div><h3>No elections assigned</h3><p>Contact an admin to be assigned to elections.</p></div>
        : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 24 }}>
            {elections.map(e => {
              const turnout = e.totalEligibleVoters > 0 ? ((e.totalVotesCast / e.totalEligibleVoters) * 100).toFixed(1) : 0;
              return (
                <div className="card" key={e._id} style={{ borderTop: `4px solid ${e.status === 'active' ? '#10b981' : e.status === 'upcoming' ? '#3b82f6' : '#6b7280'}` }}>
                  <div className="card-body">
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                      <div><div style={{ fontWeight: 800, fontSize: 16, marginBottom: 4 }}>{e.title}</div><div style={{ fontSize: 13, color: '#94a3b8' }}>📍 {e.region}</div></div>
                      <span className={`badge badge-${e.status}`}>{e.status}</span>
                    </div>
                    <div style={{ background: '#f8fafc', borderRadius: 8, padding: '10px 12px', marginBottom: 14 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 6 }}><span style={{ color: '#94a3b8' }}>Turnout</span><span style={{ fontWeight: 700, color: '#d97706' }}>{turnout}%</span></div>
                      <div className="progress"><div className="progress-bar" style={{ width: `${Math.min(turnout, 100)}%`, background: '#d97706' }}></div></div>
                      <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>{e.totalVotesCast?.toLocaleString()} / {e.totalEligibleVoters?.toLocaleString()}</div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                      <Link to={`/observer/realtime/${e._id}`} className="btn btn-sm btn-primary" style={{ justifyContent: 'center', fontSize: 12 }}>📡 Real-time</Link>
                      <Link to={`/observer/candidates/${e._id}`} className="btn btn-sm btn-outline" style={{ justifyContent: 'center', fontSize: 12 }}>🏆 Candidates</Link>
                      <Link to={`/observer/turnout/${e._id}`} className="btn btn-sm btn-outline" style={{ justifyContent: 'center', fontSize: 12 }}>📊 Turnout</Link>
                      <Link to={`/observer/integrity/${e._id}`} className="btn btn-sm btn-outline" style={{ justifyContent: 'center', fontSize: 12 }}>🔍 Integrity</Link>
                      <Link to={`/observer/audit/${e._id}`} className="btn btn-sm btn-outline" style={{ justifyContent: 'center', fontSize: 12 }}>📋 Audit</Link>
                      <Link to={`/observer/report/${e._id}`} className="btn btn-sm btn-outline" style={{ justifyContent: 'center', fontSize: 12 }}>📝 Report</Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

// ── Realtime Stats ─────────────────────────────────────────────────────────────
export function ObserverRealtime() {
  const { electionId } = useParams();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = () => { observerAPI.getRealTimeStats(electionId).then(r => setStats(r.data.stats)).catch(() => {}).finally(() => setLoading(false)); };
  useEffect(() => { fetchStats(); const t = setInterval(fetchStats, 20000); return () => clearInterval(t); }, [electionId]);

  const hourlyData = (stats?.hourlyVotes || []).map(v => ({ hour: v._id?.slice(11, 16) || v._id, votes: v.count }));
  const positionData = (stats?.votesByPosition || []).map(v => ({ name: v._id, votes: v.count }));

  return (
    <DashboardLayout navItems={observerNav} role="observer" roleLabel="Observer">
      <div className="page-header">
        <div><h1 className="page-title">Real-time Statistics</h1><p className="page-subtitle">Live vote tracking</p></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#d1fae5', padding: '8px 16px', borderRadius: 20 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', animation: 'pulse 1.5s infinite' }}></div>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#065f46' }}>LIVE</span>
        </div>
      </div>
      <div className="page-content fade-in">
        {loading ? <div style={{ textAlign: 'center', padding: 60 }}><div className="spinner" style={{ margin: '0 auto', borderTopColor: '#d97706' }}></div></div> : stats && (
          <>
            <div className="stats-grid">
              {[
                { icon: '✅', label: 'Total Votes', value: stats.totalVotes?.toLocaleString(), color: '#d97706', bg: '#fef3c7' },
                { icon: '👥', label: 'Eligible Voters', value: stats.totalEligible?.toLocaleString(), color: '#2563eb', bg: '#dbeafe' },
                { icon: '📊', label: 'Turnout', value: `${stats.turnoutPercentage}%`, color: '#10b981', bg: '#d1fae5' },
                { icon: '⚡', label: 'Status', value: stats.status?.toUpperCase(), color: '#8b5cf6', bg: '#ede9fe' },
              ].map((s, i) => (
                <div className="stat-card" key={i}><div className="stat-icon" style={{ background: s.color }}><span style={{ fontSize: 22 }}>{s.icon}</span></div><div><div className="stat-value" style={{ fontSize: 20 }}>{s.value}</div><div className="stat-label">{s.label}</div></div></div>
              ))}
            </div>
            <div className="grid-2">
              <div className="card">
                <div className="card-header"><span className="card-title">📈 Hourly Voting Activity</span></div>
                <div className="card-body">
                  {hourlyData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={240}>
                      <LineChart data={hourlyData}><XAxis dataKey="hour" tick={{ fontSize: 10 }} /><YAxis tick={{ fontSize: 11 }} /><Tooltip /><Line type="monotone" dataKey="votes" stroke="#d97706" strokeWidth={3} dot={false} /></LineChart>
                    </ResponsiveContainer>
                  ) : <div className="empty-state"><p>No hourly data yet</p></div>}
                </div>
              </div>
              <div className="card">
                <div className="card-header"><span className="card-title">🏛️ Votes by Position</span></div>
                <div className="card-body">
                  {positionData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={240}>
                      <BarChart data={positionData} layout="vertical"><XAxis type="number" tick={{ fontSize: 11 }} /><YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={100} /><Tooltip /><Bar dataKey="votes" fill="#d97706" radius={[0, 4, 4, 0]} /></BarChart>
                    </ResponsiveContainer>
                  ) : <div className="empty-state"><p>No position data yet</p></div>}
                </div>
              </div>
            </div>
            <div className="card" style={{ marginTop: 20 }}>
              <div className="card-header"><span className="card-title">📊 Overall Turnout Progress</span></div>
              <div className="card-body">
                <div style={{ marginBottom: 10, display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 600 }}>Voter Participation</span>
                  <span style={{ fontWeight: 700, color: '#d97706' }}>{stats.totalVotes?.toLocaleString()} / {stats.totalEligible?.toLocaleString()} ({stats.turnoutPercentage}%)</span>
                </div>
                <div className="progress" style={{ height: 16 }}><div className="progress-bar" style={{ width: `${Math.min(stats.turnoutPercentage, 100)}%`, background: 'linear-gradient(90deg, #d97706, #f59e0b)' }}></div></div>
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

// ── Candidate Monitoring ───────────────────────────────────────────────────────
export function ObserverCandidates() {
  const { electionId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => { observerAPI.getCandidateMonitoring(electionId).then(r => setData(r.data)).catch(() => {}).finally(() => setLoading(false)); }, [electionId]);

  return (
    <DashboardLayout navItems={observerNav} role="observer" roleLabel="Observer">
      <div className="page-header"><div><h1 className="page-title">Candidate Monitoring</h1><p className="page-subtitle">Live vote distribution</p></div></div>
      <div className="page-content fade-in">
        {loading ? <div style={{ textAlign: 'center', padding: 60 }}><div className="spinner" style={{ margin: '0 auto', borderTopColor: '#d97706' }}></div></div>
        : data && Object.entries(data.positionSummary || {}).map(([position, posData]) => {
          const chartData = posData.candidates?.map(c => ({ name: c.name.split(' ')[0], votes: c.votes, partyColor: c.partyColor }));
          return (
            <div className="card" key={position} style={{ marginBottom: 24 }}>
              <div className="card-header"><span className="card-title">🏛️ {position}</span><span style={{ fontWeight: 700, color: '#64748b' }}>{posData.totalVotes} total votes</span></div>
              <div className="card-body">
                <div className="grid-2">
                  <div>
                    {posData.candidates?.sort((a, b) => b.votes - a.votes).map((c, i) => {
                      const pct = posData.totalVotes > 0 ? ((c.votes / posData.totalVotes) * 100).toFixed(1) : 0;
                      return (
                        <div key={i} style={{ marginBottom: 14 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>{i === 0 && <span>🏆</span>}<div style={{ width: 10, height: 10, borderRadius: '50%', background: c.partyColor || COLORS[i] }}></div><span style={{ fontWeight: 600, fontSize: 14 }}>{c.name}</span><span style={{ fontSize: 12, color: '#94a3b8' }}>{c.party}</span></div>
                            <span style={{ fontWeight: 700 }}>{c.votes} ({pct}%)</span>
                          </div>
                          <div className="progress" style={{ height: 10 }}><div className="progress-bar" style={{ width: `${pct}%`, background: c.partyColor || COLORS[i] }}></div></div>
                        </div>
                      );
                    })}
                  </div>
                  {chartData?.length > 0 && (
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart><Pie data={chartData} cx="50%" cy="50%" outerRadius={80} dataKey="votes">{chartData.map((c, i) => <Cell key={i} fill={c.partyColor || COLORS[i % COLORS.length]} />)}</Pie><Tooltip /></PieChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </DashboardLayout>
  );
}

// ── Turnout Analysis ───────────────────────────────────────────────────────────
export function ObserverTurnout() {
  const { electionId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => { observerAPI.getTurnoutAnalysis(electionId).then(r => setData(r.data.analysis)).catch(() => {}).finally(() => setLoading(false)); }, [electionId]);

  const hourlyData = (data?.votesByHour || []).map(v => ({ label: `Day ${v._id?.day} ${v._id?.hour}:00`, votes: v.count }));

  return (
    <DashboardLayout navItems={observerNav} role="observer" roleLabel="Observer">
      <div className="page-header"><div><h1 className="page-title">Turnout Analysis</h1><p className="page-subtitle">Detailed voter participation metrics</p></div></div>
      <div className="page-content fade-in">
        {loading ? <div style={{ textAlign: 'center', padding: 60 }}><div className="spinner" style={{ margin: '0 auto', borderTopColor: '#d97706' }}></div></div> : data && (
          <>
            <div className="stats-grid">
              {[['✅', 'Total Votes', data.totalVotes?.toLocaleString(), '#2563eb'], ['👥', 'Eligible', data.totalEligible?.toLocaleString(), '#10b981'], ['📊', 'Turnout %', `${data.turnoutPercentage}%`, '#d97706'], ['⏰', 'Peak Hour', data.peakVotingHour ? `${data.peakVotingHour._id?.hour || '—'}:00` : '—', '#8b5cf6']].map(([icon, label, val, color], i) => (
                <div className="stat-card" key={i}><div className="stat-icon" style={{ background: color }}><span style={{ fontSize: 22 }}>{icon}</span></div><div><div className="stat-value" style={{ fontSize: 20 }}>{val}</div><div className="stat-label">{label}</div></div></div>
              ))}
            </div>
            <div className="card">
              <div className="card-header"><span className="card-title">📈 Voting Activity by Hour</span></div>
              <div className="card-body">
                {hourlyData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={hourlyData}><XAxis dataKey="label" tick={{ fontSize: 10 }} /><YAxis tick={{ fontSize: 11 }} /><Tooltip /><Bar dataKey="votes" fill="#d97706" radius={[4, 4, 0, 0]} /></BarChart>
                  </ResponsiveContainer>
                ) : <div className="empty-state"><p>No hourly data available</p></div>}
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

// ── Audit Trail ────────────────────────────────────────────────────────────────
export function ObserverAudit() {
  const { electionId } = useParams();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { observerAPI.getAuditLog(electionId).then(r => setLogs(r.data.logs || [])).catch(() => {}).finally(() => setLoading(false)); }, [electionId]);

  return (
    <DashboardLayout navItems={observerNav} role="observer" roleLabel="Observer">
      <div className="page-header"><div><h1 className="page-title">Audit Trail</h1><p className="page-subtitle">Complete election activity log</p></div></div>
      <div className="page-content fade-in">
        <div className="card">
          <div className="card-header"><span className="card-title">📋 {logs.length} Events</span></div>
          <div className="table-container">
            {loading ? <div style={{ padding: 40, textAlign: 'center' }}>Loading...</div> : (
              <table>
                <thead><tr><th>Event</th><th>Performed By</th><th>Role</th><th>Status</th><th>Severity</th><th>Time</th></tr></thead>
                <tbody>
                  {logs.map((log, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 600, fontSize: 13 }}>{log.action?.replace(/_/g, ' ')}</td>
                      <td style={{ fontSize: 13 }}>{log.performedBy ? `${log.performedBy.firstName} ${log.performedBy.lastName}` : 'System'}</td>
                      <td><span className={`badge badge-${log.performedBy?.role || 'secondary'}`}>{log.performedBy?.role || 'system'}</span></td>
                      <td><span className={`badge ${log.status === 'success' ? 'badge-success' : 'badge-danger'}`}>{log.status}</span></td>
                      <td><span style={{ fontSize: 12, fontWeight: 700, color: { low: '#10b981', medium: '#f59e0b', high: '#ef4444', critical: '#7c3aed' }[log.severity] }}>{log.severity?.toUpperCase()}</span></td>
                      <td style={{ fontSize: 12, color: '#64748b' }}>{new Date(log.timestamp).toLocaleString()}</td>
                    </tr>
                  ))}
                  {logs.length === 0 && <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>No audit events yet</td></tr>}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

// ── Submit Report ──────────────────────────────────────────────────────────────
export function ObserverReport() {
  const { electionId } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ reportType: 'regular', observations: '', anomalies: '', recommendations: '', severity: 'low' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try { await observerAPI.submitReport(electionId, form); toast.success('Report submitted!'); setSubmitted(true); }
    catch { toast.error('Failed to submit report'); }
  };

  return (
    <DashboardLayout navItems={observerNav} role="observer" roleLabel="Observer">
      <div className="page-header"><div><h1 className="page-title">Submit Observer Report</h1><p className="page-subtitle">Document your election observations</p></div></div>
      <div className="page-content fade-in">
        {submitted ? (
          <div className="card" style={{ maxWidth: 560, margin: '0 auto', textAlign: 'center', padding: 60 }}>
            <div style={{ fontSize: 60, marginBottom: 16 }}>📋</div>
            <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 12 }}>Report Submitted!</h2>
            <p style={{ color: '#64748b', marginBottom: 24 }}>Your observer report has been recorded in the audit trail.</p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button className="btn btn-primary" onClick={() => setSubmitted(false)}>Submit Another</button>
              <button className="btn btn-outline" onClick={() => navigate('/observer/elections')}>Back to Elections</button>
            </div>
          </div>
        ) : (
          <div style={{ maxWidth: 700, margin: '0 auto' }}>
            <div className="card">
              <div className="card-header"><span className="card-title">📝 Observer Report Form</span></div>
              <div className="card-body">
                <form onSubmit={handleSubmit}>
                  <div className="form-grid">
                    <div className="form-group"><label className="form-label">Report Type</label><select className="form-control form-select" value={form.reportType} onChange={e => setForm({ ...form, reportType: e.target.value })}><option value="regular">Regular Report</option><option value="incident">Incident Report</option><option value="final">Final Summary</option><option value="urgent">Urgent Alert</option></select></div>
                    <div className="form-group"><label className="form-label">Severity Level</label><select className="form-control form-select" value={form.severity} onChange={e => setForm({ ...form, severity: e.target.value })}><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="critical">Critical</option></select></div>
                  </div>
                  <div className="form-group"><label className="form-label">Observations *</label><textarea className="form-control" rows={4} value={form.observations} onChange={e => setForm({ ...form, observations: e.target.value })} required placeholder="Describe what you observed during the election process..." /></div>
                  <div className="form-group"><label className="form-label">Anomalies / Issues Found</label><textarea className="form-control" rows={4} value={form.anomalies} onChange={e => setForm({ ...form, anomalies: e.target.value })} placeholder="Document any irregularities, technical issues, or concerns..." /></div>
                  <div className="form-group"><label className="form-label">Recommendations</label><textarea className="form-control" rows={4} value={form.recommendations} onChange={e => setForm({ ...form, recommendations: e.target.value })} placeholder="Suggest improvements or actions based on your observations..." /></div>
                  {form.severity === 'critical' && <div className="alert alert-danger">⚠️ Critical reports are escalated immediately to the super admin for review.</div>}
                  <button type="submit" className={`btn ${form.severity === 'critical' ? 'btn-danger' : 'btn-primary'}`} style={{ width: '100%' }}>📋 Submit Observer Report</button>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

// ── Integrity Check ────────────────────────────────────────────────────────────
export function ObserverIntegrity() {
  const { electionId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => { observerAPI.getIntegrityReport(electionId).then(r => setData(r.data.integrity)).catch(() => {}).finally(() => setLoading(false)); }, [electionId]);

  return (
    <DashboardLayout navItems={observerNav} role="observer" roleLabel="Observer">
      <div className="page-header"><div><h1 className="page-title">Integrity Check</h1><p className="page-subtitle">Verify election data integrity</p></div><button className="btn btn-outline btn-sm" onClick={() => window.location.reload()}>🔄 Re-run Checks</button></div>
      <div className="page-content fade-in">
        {loading ? <div style={{ textAlign: 'center', padding: 60 }}><div className="spinner" style={{ margin: '0 auto', borderTopColor: '#d97706' }}></div></div> : data && (
          <>
            <div className="card" style={{ marginBottom: 24, borderTop: `4px solid ${data.overallStatus === 'PASSED' ? '#10b981' : '#ef4444'}` }}>
              <div className="card-body" style={{ textAlign: 'center', padding: 40 }}>
                <div style={{ fontSize: 60, marginBottom: 16 }}>{data.overallStatus === 'PASSED' ? '✅' : '⚠️'}</div>
                <h2 style={{ fontSize: 28, fontWeight: 900, color: data.overallStatus === 'PASSED' ? '#065f46' : '#991b1b', marginBottom: 8 }}>Integrity {data.overallStatus}</h2>
                <p style={{ color: '#64748b', fontSize: 16 }}>All cryptographic and data integrity checks {data.overallStatus === 'PASSED' ? 'passed' : 'found issues'}.</p>
                <div style={{ display: 'flex', gap: 24, justifyContent: 'center', marginTop: 20 }}>
                  {[['Total Votes', data.totalVotes], ['Duplicates', data.duplicatesFound], ['Hashes Valid', data.hashesValid ? 'Yes' : 'No']].map(([l, v]) => (
                    <div key={l} style={{ textAlign: 'center' }}><div style={{ fontSize: 24, fontWeight: 800 }}>{String(v)}</div><div style={{ fontSize: 12, color: '#94a3b8' }}>{l}</div></div>
                  ))}
                </div>
              </div>
            </div>
            <div className="card">
              <div className="card-header"><span className="card-title">🔍 Detailed Check Results</span></div>
              <div className="card-body" style={{ padding: 0 }}>
                {data.checks?.map((check, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 24px', borderBottom: '1px solid #f1f5f9' }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: check.status === 'passed' ? '#d1fae5' : '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>{check.status === 'passed' ? '✅' : '❌'}</div>
                    <div style={{ flex: 1 }}><div style={{ fontWeight: 700, fontSize: 15 }}>{check.name}</div><div style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>{check.details}</div></div>
                    <span className={`badge ${check.status === 'passed' ? 'badge-success' : 'badge-danger'}`}>{check.status.toUpperCase()}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

// ── Comparative Analysis ───────────────────────────────────────────────────────
export function ObserverAnalysis() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { observerAPI.getComparativeAnalysis().then(r => setData(r.data.analysis || [])).catch(() => {}).finally(() => setLoading(false)); }, []);

  const chartData = data.map(e => ({ name: e.title.slice(0, 20), turnout: parseFloat(e.turnout), votes: e.totalVotes }));

  return (
    <DashboardLayout navItems={observerNav} role="observer" roleLabel="Observer">
      <div className="page-header"><div><h1 className="page-title">Comparative Analysis</h1><p className="page-subtitle">Compare turnout across monitored elections</p></div></div>
      <div className="page-content fade-in">
        <div className="card" style={{ marginBottom: 24 }}>
          <div className="card-header"><span className="card-title">📉 Turnout Comparison</span></div>
          <div className="card-body">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}><XAxis dataKey="name" tick={{ fontSize: 10 }} /><YAxis tick={{ fontSize: 11 }} unit="%" /><Tooltip formatter={v => [`${v}%`, 'Turnout']} /><Bar dataKey="turnout" fill="#d97706" radius={[4, 4, 0, 0]} /></BarChart>
              </ResponsiveContainer>
            ) : <div className="empty-state"><p>No comparative data yet</p></div>}
          </div>
        </div>
        <div className="card">
          <div className="card-header"><span className="card-title">📊 Election Summary</span></div>
          <div className="table-container">
            {loading ? <div style={{ padding: 40, textAlign: 'center' }}>Loading...</div> : (
              <table>
                <thead><tr><th>Election</th><th>Type</th><th>Total Votes</th><th>Turnout</th><th>Status</th></tr></thead>
                <tbody>
                  {data.map((e, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 600 }}>{e.title}</td>
                      <td><span className="badge badge-info">{e.type}</span></td>
                      <td>{e.totalVotes?.toLocaleString()}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div className="progress" style={{ width: 80 }}><div className="progress-bar" style={{ width: `${Math.min(e.turnout, 100)}%`, background: '#d97706' }}></div></div>
                          <span style={{ fontWeight: 700, color: parseFloat(e.turnout) > 50 ? '#10b981' : '#f59e0b' }}>{e.turnout}%</span>
                        </div>
                      </td>
                      <td><span className={`badge badge-${e.status}`}>{e.status}</span></td>
                    </tr>
                  ))}
                  {data.length === 0 && <tr><td colSpan={5} style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>No elections to compare</td></tr>}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

// ── Observer Profile ───────────────────────────────────────────────────────────
export function ObserverProfile() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => { observerAPI.getProfile().then(r => setData(r.data)).catch(() => {}).finally(() => setLoading(false)); }, []);

  return (
    <DashboardLayout navItems={observerNav} role="observer" roleLabel="Observer">
      <div className="page-header"><div><h1 className="page-title">Observer Profile</h1><p className="page-subtitle">Your observer credentials and activity</p></div></div>
      <div className="page-content fade-in">
        {loading ? <div style={{ textAlign: 'center', padding: 60 }}><div className="spinner" style={{ margin: '0 auto', borderTopColor: '#d97706' }}></div></div> : data && (
          <div className="grid-2">
            <div className="card">
              <div className="card-header"><span className="card-title">👁️ Observer Information</span></div>
              <div className="card-body">
                <div style={{ textAlign: 'center', marginBottom: 24 }}>
                  <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: 28, margin: '0 auto 12px' }}>{data.profile?.firstName?.[0]}{data.profile?.lastName?.[0]}</div>
                  <h3 style={{ fontWeight: 800, fontSize: 20 }}>{data.profile?.firstName} {data.profile?.lastName}</h3>
                  <span className="badge badge-observer" style={{ marginTop: 6 }}>Observer</span>
                </div>
                {[['📧 Email', data.profile?.email], ['📱 Phone', data.profile?.phone || '—'], ['✅ Verified', data.profile?.isVerified ? 'Yes' : 'No'], ['📅 Member Since', new Date(data.profile?.createdAt).toLocaleDateString()]].map(([l, v]) => (
                  <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f1f5f9' }}>
                    <span style={{ fontSize: 13, color: '#64748b' }}>{l}</span>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="card">
              <div className="card-header"><span className="card-title">📊 Activity Summary</span></div>
              <div className="card-body">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
                  {[['📋', 'Assigned Elections', data.stats?.assignedElections], ['📝', 'Reports Submitted', data.stats?.reportsSubmitted]].map(([icon, label, val]) => (
                    <div key={label} style={{ textAlign: 'center', padding: 20, background: '#fef3c7', borderRadius: 12 }}>
                      <div style={{ fontSize: 28, marginBottom: 8 }}>{icon}</div>
                      <div style={{ fontSize: 28, fontWeight: 900, color: '#92400e' }}>{val}</div>
                      <div style={{ fontSize: 12, color: '#92400e', marginTop: 4 }}>{label}</div>
                    </div>
                  ))}
                </div>
                <h4 style={{ fontWeight: 700, marginBottom: 12 }}>Assigned Elections</h4>
                {(data.elections || []).map(e => (
                  <div key={e._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f1f5f9' }}>
                    <span style={{ fontSize: 14, fontWeight: 600 }}>{e.title}</span>
                    <span className={`badge badge-${e.status}`}>{e.status}</span>
                  </div>
                ))}
                {(!data.elections || data.elections.length === 0) && <p style={{ color: '#94a3b8', fontSize: 14 }}>No elections assigned</p>}
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

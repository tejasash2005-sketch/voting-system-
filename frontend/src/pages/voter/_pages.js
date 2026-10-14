import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { voterNav } from '../../utils/navConfig';
import { voterAPI, voteAPI } from '../../services/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

// ── Vote History ───────────────────────────────────────────────────────────────
export function VoteHistory() {
  const [votes, setVotes] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { voterAPI.getVoteHistory().then(r => setVotes(r.data.votes || [])).catch(() => toast.error('Failed')).finally(() => setLoading(false)); }, []);

  return (
    <DashboardLayout navItems={voterNav} role="voter" roleLabel="Voter">
      <div className="page-header"><div><h1 className="page-title">Vote History</h1><p className="page-subtitle">{votes.length} votes cast</p></div><Link to="/voter/receipt" className="btn btn-outline btn-sm">🧾 Verify Receipt</Link></div>
      <div className="page-content fade-in">
        {loading ? <div style={{ textAlign: 'center', padding: 60 }}><div className="spinner" style={{ margin: '0 auto', borderTopColor: '#059669' }}></div></div>
        : votes.length === 0 ? (
          <div className="empty-state card" style={{ padding: 60 }}><div className="empty-state-icon">📜</div><h3>No votes yet</h3><p>Your voting history will appear here.</p><Link to="/voter/elections" className="btn btn-primary" style={{ marginTop: 16 }}>Browse Elections</Link></div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {votes.map((v, i) => (
              <div className="card" key={i}>
                <div className="card-body" style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                  <div style={{ width: 52, height: 52, borderRadius: '50%', background: '#d1fae5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>✅</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>{v.election?.title || 'Unknown Election'}</div>
                    <div style={{ display: 'flex', gap: 16, fontSize: 13, color: '#64748b' }}>
                      <span>Position: <strong>{v.position}</strong></span>
                      {!v.isAbstain && v.candidate && <span>Voted for: <strong>{v.candidate.firstName} {v.candidate.lastName}</strong></span>}
                      {v.isAbstain && <span style={{ color: '#64748b' }}>Abstained</span>}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 12, color: '#94a3b8' }}>{new Date(v.timestamp).toLocaleString()}</div>
                    <div style={{ fontSize: 11, fontFamily: 'monospace', color: '#2563eb', marginTop: 4 }}>{v.receiptCode}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

// ── Receipt Verifier ───────────────────────────────────────────────────────────
export function Receipt() {
  const [code, setCode] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const verify = async (e) => {
    e.preventDefault();
    setLoading(true); setError(''); setResult(null);
    try {
      const r = await voteAPI.verifyReceipt(code.trim());
      setResult(r.data);
      toast.success('Vote verified!');
    } catch { setError('Receipt not found. Please check the code and try again.'); }
    finally { setLoading(false); }
  };

  return (
    <DashboardLayout navItems={voterNav} role="voter" roleLabel="Voter">
      <div className="page-header"><div><h1 className="page-title">Verify Vote Receipt</h1><p className="page-subtitle">Confirm your vote was counted correctly</p></div></div>
      <div className="page-content fade-in">
        <div style={{ maxWidth: 560, margin: '0 auto' }}>
          <div className="card">
            <div className="card-header"><span className="card-title">🧾 Enter Receipt Code</span></div>
            <div className="card-body">
              <form onSubmit={verify}>
                <div className="form-group">
                  <label className="form-label">Receipt Code</label>
                  <input className="form-control" value={code} onChange={e => setCode(e.target.value)} placeholder="RCP-XXXXXXXXXXXXXXXX" required style={{ fontFamily: 'monospace', fontSize: 16, letterSpacing: 2 }} />
                  <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 6 }}>Your receipt code was provided after casting your vote.</p>
                </div>
                {error && <div className="alert alert-danger">{error}</div>}
                <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                  {loading ? '⏳ Verifying...' : '🔍 Verify Receipt'}
                </button>
              </form>
            </div>
          </div>

          {result?.vote && (
            <div className="card" style={{ marginTop: 20 }}>
              <div className="card-header"><span className="card-title" style={{ color: '#10b981' }}>✅ Vote Verified Successfully</span></div>
              <div className="card-body">
                <div style={{ display: 'grid', gap: 12 }}>
                  {[['Election', result.vote.election?.title], ['Position', result.vote.position], ['Status', result.vote.isAbstain ? 'Abstained' : 'Voted'], ['Vote Hash', result.vote.voteHash?.slice(0, 48) + '...'], ['Timestamp', new Date(result.vote.timestamp).toLocaleString()]].map(([label, val]) => (
                    <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f1f5f9' }}>
                      <span style={{ fontSize: 13, color: '#94a3b8', fontWeight: 600 }}>{label}</span>
                      <span style={{ fontSize: 13, fontWeight: 600, textAlign: 'right', fontFamily: label === 'Vote Hash' ? 'monospace' : 'inherit', maxWidth: '60%', wordBreak: 'break-all' }}>{val}</span>
                    </div>
                  ))}
                </div>
                <div className="alert alert-success" style={{ marginTop: 16 }}>🔒 Your vote is cryptographically secured and has been counted.</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

// ── Results ────────────────────────────────────────────────────────────────────
export function VoterResults() {
  const { electionId } = useParams();
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const COLORS = ['#1a3a6b', '#e02424', '#057a55', '#d97706', '#7c3aed'];

  useEffect(() => {
    voterAPI.getResults(electionId)
      .then(r => setResults(r.data))
      .catch(err => toast.error(err.response?.data?.message || 'Failed to load results'))
      .finally(() => setLoading(false));
  }, [electionId]);

  return (
    <DashboardLayout navItems={voterNav} role="voter" roleLabel="Voter">
      <div className="page-header"><div><h1 className="page-title">Election Results</h1><p className="page-subtitle">{results?.election?.title}</p></div></div>
      <div className="page-content fade-in">
        {loading ? <div style={{ textAlign: 'center', padding: 60 }}><div className="spinner" style={{ margin: '0 auto', borderTopColor: '#059669' }}></div></div>
        : !results ? <div className="empty-state card" style={{ padding: 60 }}><div className="empty-state-icon">📊</div><h3>Results not available</h3></div>
        : (
          <>
            <div className="stats-grid" style={{ marginBottom: 24 }}>
              {[['✅', 'Total Votes', results.election?.totalVotes?.toLocaleString(), '#2563eb', '#dbeafe'],
                ['📊', 'Voter Turnout', `${results.election?.turnout}%`, '#10b981', '#d1fae5'],
                ['📋', 'Status', results.election?.status?.toUpperCase(), '#f59e0b', '#fef3c7'],
                ['📢', 'Published', results.election?.publishResults ? 'Yes' : 'Pending', '#8b5cf6', '#ede9fe']
              ].map(([icon, label, val, color, bg], i) => (
                <div className="stat-card" key={i}><div className="stat-icon" style={{ background: color }}><span style={{ fontSize: 20 }}>{icon}</span></div><div><div className="stat-value" style={{ fontSize: 20 }}>{val}</div><div className="stat-label">{label}</div></div></div>
              ))}
            </div>
            {Object.entries(results.results || {}).map(([position, data]) => {
              const chartData = data.candidates?.map(c => ({ name: `${c.name.split(' ')[0]}`, votes: c.votes, percentage: c.percentage, party: c.party, partyColor: c.partyColor }));
              const winner = data.candidates?.sort((a, b) => b.votes - a.votes)[0];
              return (
                <div className="card" key={position} style={{ marginBottom: 24 }}>
                  <div className="card-header">
                    <span className="card-title">🏛️ {position}</span>
                    {winner && <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fef3c7', padding: '6px 14px', borderRadius: 20 }}><span>🏆</span><span style={{ fontSize: 13, fontWeight: 700, color: '#92400e' }}>Leading: {winner.name} ({winner.percentage}%)</span></div>}
                  </div>
                  <div className="card-body">
                    <div className="grid-2">
                      <div>
                        {data.candidates?.sort((a, b) => b.votes - a.votes).map((c, i) => (
                          <div key={i} style={{ marginBottom: 16 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                {i === 0 && <span style={{ fontSize: 16 }}>🏆</span>}
                                <div style={{ width: 12, height: 12, borderRadius: '50%', background: c.partyColor || COLORS[i] }}></div>
                                <span style={{ fontWeight: 600, fontSize: 14 }}>{c.name}</span>
                                <span style={{ fontSize: 12, color: '#94a3b8' }}>{c.party}</span>
                              </div>
                              <span style={{ fontWeight: 700, fontSize: 14 }}>{c.votes?.toLocaleString()} ({c.percentage}%)</span>
                            </div>
                            <div className="progress" style={{ height: 10 }}><div className="progress-bar" style={{ width: `${c.percentage}%`, background: c.partyColor || COLORS[i] }}></div></div>
                          </div>
                        ))}
                      </div>
                      {chartData?.length > 0 && (
                        <ResponsiveContainer width="100%" height={200}>
                          <BarChart data={chartData} layout="vertical">
                            <XAxis type="number" tick={{ fontSize: 11 }} />
                            <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={70} />
                            <Tooltip formatter={(v, n, p) => [`${v} votes (${p.payload.percentage}%)`, 'Votes']} />
                            <Bar dataKey="votes" radius={[0, 4, 4, 0]}>
                              {chartData.map((c, i) => <Cell key={i} fill={c.partyColor || COLORS[i % COLORS.length]} />)}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

// ── Candidates ─────────────────────────────────────────────────────────────────
export function VoterCandidates() {
  const [elections, setElections] = useState([]);
  const [electionId, setElectionId] = useState('');
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => { voterAPI.getElections().then(r => { const el = r.data.elections || []; setElections(el); if (el.length > 0) setElectionId(el[0]._id); }).catch(() => {}); }, []);
  useEffect(() => {
    if (electionId) {
      setLoading(true);
      import('../../services/api').then(({ candidateAPI }) => {
        candidateAPI.getByElection(electionId, { status: 'approved' }).then(r => setCandidates(r.data.candidates || [])).catch(() => {}).finally(() => setLoading(false));
      });
    }
  }, [electionId]);

  const byPosition = candidates.reduce((acc, c) => { (acc[c.position] = acc[c.position] || []).push(c); return acc; }, {});

  return (
    <DashboardLayout navItems={voterNav} role="voter" roleLabel="Voter">
      <div className="page-header">
        <div><h1 className="page-title">Candidates</h1><p className="page-subtitle">Learn about election candidates</p></div>
        <select className="form-control form-select" style={{ width: 300 }} value={electionId} onChange={e => setElectionId(e.target.value)}>
          {elections.map(e => <option key={e._id} value={e._id}>{e.title}</option>)}
        </select>
      </div>
      <div className="page-content fade-in">
        {loading ? <div style={{ textAlign: 'center', padding: 60 }}><div className="spinner" style={{ margin: '0 auto', borderTopColor: '#059669' }}></div></div>
        : Object.entries(byPosition).map(([position, cands]) => (
          <div key={position} style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 16, paddingBottom: 10, borderBottom: '2px solid #e2e8f0' }}>🏛️ {position}</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
              {cands.map(c => (
                <div className="card" key={c._id} style={{ borderTop: `4px solid ${c.partyColor || '#1a3a6b'}` }}>
                  <div className="card-body">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
                      <div style={{ width: 60, height: 60, borderRadius: '50%', background: c.partyColor || '#1a3a6b', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: 22, flexShrink: 0 }}>{c.firstName?.[0]}{c.lastName?.[0]}</div>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: 17 }}>#{c.ballotNumber} {c.firstName} {c.lastName}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}><div style={{ width: 10, height: 10, borderRadius: '50%', background: c.partyColor || '#1a3a6b' }}></div><span style={{ fontSize: 13, fontWeight: 600, color: '#64748b' }}>{c.party || 'Independent'}</span></div>
                        {c.isIncumbent && <span style={{ background: '#fef3c7', color: '#92400e', fontSize: 10, padding: '2px 6px', borderRadius: 4, fontWeight: 700, display: 'inline-block', marginTop: 4 }}>INCUMBENT</span>}
                      </div>
                    </div>
                    {c.bio && <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.6, marginBottom: 12 }}>{c.bio}</p>}
                    <div style={{ display: 'flex', gap: 16, fontSize: 13, color: '#94a3b8', marginBottom: 12 }}>
                      {c.age && <span>Age {c.age}</span>}
                      {c.education && <span>📚 {c.education}</span>}
                    </div>
                    {c.manifesto && <div style={{ background: '#f8fafc', borderRadius: 8, padding: '10px 12px', fontSize: 13, color: '#475569', borderLeft: `3px solid ${c.partyColor || '#1a3a6b'}` }}><strong>Manifesto:</strong> {c.manifesto}</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
        {!loading && candidates.length === 0 && <div className="empty-state card" style={{ padding: 60 }}><div className="empty-state-icon">🏆</div><h3>No candidates yet</h3></div>}
      </div>
    </DashboardLayout>
  );
}

// ── Profile ────────────────────────────────────────────────────────────────────
export function VoterProfile() {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ firstName: '', lastName: '', phone: '' });

  useEffect(() => {
    voterAPI.getProfile().then(r => { setProfile(r.data); setForm({ firstName: r.data.profile?.firstName, lastName: r.data.profile?.lastName, phone: r.data.profile?.phone || '' }); }).catch(() => {});
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const { authAPI } = await import('../../services/api');
      await authAPI.updateProfile(form);
      toast.success('Profile updated!');
      setEditing(false);
    } catch { toast.error('Update failed'); }
  };

  return (
    <DashboardLayout navItems={voterNav} role="voter" roleLabel="Voter">
      <div className="page-header"><div><h1 className="page-title">My Profile</h1><p className="page-subtitle">Manage your voter account</p></div>{!editing && <button className="btn btn-primary btn-sm" onClick={() => setEditing(true)}>✏️ Edit Profile</button>}</div>
      <div className="page-content fade-in">
        <div className="grid-2">
          <div className="card">
            <div className="card-header"><span className="card-title">👤 Personal Information</span></div>
            <div className="card-body">
              {editing ? (
                <form onSubmit={handleSave}>
                  <div className="form-grid">
                    <div className="form-group"><label className="form-label">First Name</label><input className="form-control" value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} /></div>
                    <div className="form-group"><label className="form-label">Last Name</label><input className="form-control" value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} /></div>
                  </div>
                  <div className="form-group"><label className="form-label">Phone</label><input className="form-control" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
                  <div style={{ display: 'flex', gap: 12 }}><button type="submit" className="btn btn-primary">Save Changes</button><button type="button" className="btn btn-outline" onClick={() => setEditing(false)}>Cancel</button></div>
                </form>
              ) : profile?.profile && (
                <div>
                  <div style={{ textAlign: 'center', marginBottom: 24 }}>
                    <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: 28, margin: '0 auto 12px' }}>{profile.profile.firstName?.[0]}{profile.profile.lastName?.[0]}</div>
                    <h3 style={{ fontWeight: 800, fontSize: 20 }}>{profile.profile.firstName} {profile.profile.lastName}</h3>
                    <span className="badge badge-voter" style={{ marginTop: 6 }}>Voter</span>
                  </div>
                  {[['📧 Email', profile.profile.email], ['📱 Phone', profile.profile.phone || '—'], ['🆔 Voter ID', profile.profile.voterId || '—'], ['🗓️ National ID', profile.profile.nationalId || '—'], ['✅ Verified', profile.profile.isVerified ? 'Yes' : 'Pending'], ['📅 Member Since', new Date(profile.profile.createdAt).toLocaleDateString()]].map(([label, val]) => (
                    <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f1f5f9' }}>
                      <span style={{ fontSize: 13, color: '#64748b' }}>{label}</span>
                      <span style={{ fontSize: 13, fontWeight: 600 }}>{val}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="card">
            <div className="card-header"><span className="card-title">📊 Voting Statistics</span></div>
            <div className="card-body">
              {profile?.stats && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  {[['🗳️', 'Total Votes Cast', profile.stats.totalVotes], ['📋', 'Elections Participated', profile.stats.electionsParticipated]].map(([icon, label, val]) => (
                    <div key={label} style={{ textAlign: 'center', padding: 24, background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0' }}>
                      <div style={{ fontSize: 32, marginBottom: 8 }}>{icon}</div>
                      <div style={{ fontSize: 28, fontWeight: 900, color: '#1a3a6b' }}>{val}</div>
                      <div style={{ fontSize: 13, color: '#94a3b8', marginTop: 4 }}>{label}</div>
                    </div>
                  ))}
                </div>
              )}
              <div style={{ marginTop: 20, padding: 16, background: '#f0fdf4', borderRadius: 10, border: '1px solid #bbf7d0' }}>
                <p style={{ fontSize: 13, color: '#065f46', fontWeight: 600 }}>🏅 Active Voter</p>
                <p style={{ fontSize: 13, color: '#065f46', marginTop: 4 }}>Thank you for participating in democracy!</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

// ── Notifications ──────────────────────────────────────────────────────────────
export function VoterNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchNotifs = () => {
    voterAPI.getNotifications().then(r => { setNotifications(r.data.notifications || []); setUnreadCount(r.data.unreadCount || 0); }).catch(() => {}).finally(() => setLoading(false));
  };
  useEffect(() => { fetchNotifs(); }, []);

  const markRead = async (id) => {
    try { await voterAPI.markNotificationRead(id); fetchNotifs(); }
    catch { toast.error('Failed'); }
  };

  const typeIcon = { info: 'ℹ️', warning: '⚠️', success: '✅', error: '❌', reminder: '🔔' };
  const typeColor = { info: '#dbeafe', warning: '#fef3c7', success: '#d1fae5', error: '#fee2e2', reminder: '#ede9fe' };

  return (
    <DashboardLayout navItems={voterNav} role="voter" roleLabel="Voter">
      <div className="page-header"><div><h1 className="page-title">Notifications</h1><p className="page-subtitle">{unreadCount} unread</p></div></div>
      <div className="page-content fade-in">
        {loading ? <div style={{ textAlign: 'center', padding: 40 }}>Loading...</div>
        : notifications.length === 0 ? <div className="empty-state card" style={{ padding: 60 }}><div className="empty-state-icon">🔔</div><h3>No notifications</h3></div>
        : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {notifications.map(n => (
              <div key={n._id} className="card" style={{ opacity: n.isRead ? 0.7 : 1, borderLeft: `4px solid ${n.isRead ? '#e2e8f0' : '#2563eb'}` }} onClick={() => !n.isRead && markRead(n._id)}>
                <div className="card-body" style={{ display: 'flex', gap: 14, cursor: n.isRead ? 'default' : 'pointer', padding: '16px 20px' }}>
                  <div style={{ width: 44, height: 44, borderRadius: '50%', background: typeColor[n.type] || '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>{typeIcon[n.type] || '🔔'}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontWeight: 700, fontSize: 15 }}>{n.title}</span>
                      {!n.isRead && <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#2563eb', display: 'block', marginTop: 6, flexShrink: 0 }}></span>}
                    </div>
                    <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.5 }}>{n.message}</p>
                    <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 6 }}>{new Date(n.createdAt).toLocaleString()}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

// ── Search ─────────────────────────────────────────────────────────────────────
export function VoterSearch() {
  const [query, setQuery] = useState('');
  const [type, setType] = useState('');
  const [results, setResults] = useState([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true); setSearched(true);
    try { const r = await voterAPI.searchElections({ q: query, type }); setResults(r.data.elections || []); }
    catch { toast.error('Search failed'); }
    finally { setLoading(false); }
  };

  return (
    <DashboardLayout navItems={voterNav} role="voter" roleLabel="Voter">
      <div className="page-header"><div><h1 className="page-title">Search Elections</h1><p className="page-subtitle">Find elections by name, type, or region</p></div></div>
      <div className="page-content fade-in">
        <div className="card" style={{ marginBottom: 24 }}>
          <div className="card-body">
            <form onSubmit={handleSearch} style={{ display: 'flex', gap: 12 }}>
              <input className="form-control" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search elections..." style={{ flex: 1 }} />
              <select className="form-control form-select" style={{ width: 160 }} value={type} onChange={e => setType(e.target.value)}>
                <option value="">All Types</option>
                {['general', 'primary', 'local', 'referendum', 'special'].map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <button type="submit" className="btn btn-primary" disabled={loading}>🔍 Search</button>
            </form>
          </div>
        </div>
        {loading ? <div style={{ textAlign: 'center', padding: 40 }}>Searching...</div>
        : searched && results.length === 0 ? <div className="empty-state card" style={{ padding: 60 }}><div className="empty-state-icon">🔍</div><h3>No elections found</h3><p>Try different search terms.</p></div>
        : results.map(e => (
          <div className="card" key={e._id} style={{ marginBottom: 16 }}>
            <div className="card-body" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>{e.title}</div>
                <div style={{ display: 'flex', gap: 16, fontSize: 13, color: '#64748b' }}><span className="badge badge-info">{e.type}</span><span>📍 {e.region}</span><span>📅 {new Date(e.startDate).toLocaleDateString()} – {new Date(e.endDate).toLocaleDateString()}</span></div>
              </div>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <span className={`badge badge-${e.status}`}>{e.status}</span>
                {e.status === 'active' && <Link to={`/voter/vote/${e._id}`} className="btn btn-success btn-sm">Vote Now</Link>}
              </div>
            </div>
          </div>
        ))}
        {!searched && <div className="empty-state" style={{ padding: 60, textAlign: 'center', color: '#94a3b8' }}><div style={{ fontSize: 48 }}>🔍</div><p style={{ marginTop: 12 }}>Enter a search term to find elections</p></div>}
      </div>
    </DashboardLayout>
  );
}

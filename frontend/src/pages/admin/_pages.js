import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { adminNav } from '../../utils/navConfig';
import { adminAPI, electionAPI, candidateAPI } from '../../services/api';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import toast from 'react-hot-toast';

// ── Elections ─────────────────────────────────────────────────────────────────
export function Elections() {
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { adminAPI.getElections().then(r => setElections(r.data.elections || [])).catch(() => {}).finally(() => setLoading(false)); }, []);

  return (
    <DashboardLayout navItems={adminNav} role="admin" roleLabel="Admin">
      <div className="page-header"><div><h1 className="page-title">My Elections</h1><p className="page-subtitle">Elections you manage</p></div></div>
      <div className="page-content fade-in">
        <div className="card">
          <div className="table-container">
            {loading ? <div style={{ padding: 40, textAlign: 'center' }}>Loading...</div> : (
              <table>
                <thead><tr><th>Election</th><th>Type</th><th>Status</th><th>Voters</th><th>Votes</th><th>Start</th><th>End</th><th>Actions</th></tr></thead>
                <tbody>
                  {elections.map(e => (
                    <tr key={e._id}>
                      <td><div style={{ fontWeight: 600 }}>{e.title}</div><div style={{ fontSize: 12, color: '#94a3b8' }}>{e.region}</div></td>
                      <td><span className="badge badge-info">{e.type}</span></td>
                      <td><span className={`badge badge-${e.status}`}>{e.status}</span></td>
                      <td>{e.totalEligibleVoters?.toLocaleString()}</td>
                      <td>{e.totalVotesCast?.toLocaleString()}</td>
                      <td style={{ fontSize: 13, color: '#64748b' }}>{new Date(e.startDate).toLocaleDateString()}</td>
                      <td style={{ fontSize: 13, color: '#64748b' }}>{new Date(e.endDate).toLocaleDateString()}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <Link to="/admin/ballot" className="btn btn-outline btn-sm" style={{ fontSize: 11 }}>🗂️ Ballot</Link>
                          <Link to="/admin/live-monitor" className="btn btn-sm btn-primary" style={{ fontSize: 11 }}>📺 Monitor</Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

// ── Voters ─────────────────────────────────────────────────────────────────────
export function Voters() {
  const [voters, setVoters] = useState([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: 'Voter@123', phone: '', nationalId: '' });

  const fetchVoters = () => {
    setLoading(true);
    adminAPI.getVoters({ search, limit: 20 }).then(r => { setVoters(r.data.voters || []); setTotal(r.data.total || 0); }).catch(() => {}).finally(() => setLoading(false));
  };
  useEffect(() => { fetchVoters(); }, [search]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try { await adminAPI.registerVoter(form); toast.success('Voter registered!'); setShowModal(false); fetchVoters(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const verifyVoter = async (id) => {
    try { await adminAPI.verifyVoter(id); toast.success('Voter verified!'); fetchVoters(); }
    catch { toast.error('Verification failed'); }
  };

  return (
    <DashboardLayout navItems={adminNav} role="admin" roleLabel="Admin">
      <div className="page-header">
        <div><h1 className="page-title">Voter Management</h1><p className="page-subtitle">{total} registered voters</p></div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Register Voter</button>
      </div>
      <div className="page-content fade-in">
        <div className="card">
          <div className="card-header">
            <div className="search-input" style={{ width: 300 }}>
              <span className="search-icon">🔍</span>
              <input className="form-control" placeholder="Search voters..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 36 }} />
            </div>
          </div>
          <div className="table-container">
            {loading ? <div style={{ padding: 40, textAlign: 'center' }}>Loading...</div> : (
              <table>
                <thead><tr><th>Voter</th><th>Voter ID</th><th>National ID</th><th>Phone</th><th>Verified</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>
                  {voters.map(v => (
                    <tr key={v._id}>
                      <td><div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><div style={{ width: 36, height: 36, borderRadius: '50%', background: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 13, flexShrink: 0 }}>{v.firstName?.[0]}{v.lastName?.[0]}</div><div><div style={{ fontWeight: 600, fontSize: 14 }}>{v.firstName} {v.lastName}</div><div style={{ fontSize: 12, color: '#94a3b8' }}>{v.email}</div></div></div></td>
                      <td><span style={{ fontSize: 12, fontFamily: 'monospace', color: '#64748b' }}>{v.voterId || '—'}</span></td>
                      <td style={{ fontSize: 13 }}>{v.nationalId || '—'}</td>
                      <td style={{ fontSize: 13 }}>{v.phone || '—'}</td>
                      <td><span className={`badge ${v.isVerified ? 'badge-success' : 'badge-warning'}`}>{v.isVerified ? 'Verified' : 'Pending'}</span></td>
                      <td><span className={`badge ${v.isActive ? 'badge-success' : 'badge-danger'}`}>{v.isActive ? 'Active' : 'Inactive'}</span></td>
                      <td>{!v.isVerified && <button className="btn btn-success btn-sm" onClick={() => verifyVoter(v._id)}>✅ Verify</button>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h3 className="modal-title">Register New Voter</h3><button className="modal-close" onClick={() => setShowModal(false)}>×</button></div>
            <form onSubmit={handleCreate}>
              <div className="modal-body">
                <div className="form-grid">
                  <div className="form-group"><label className="form-label">First Name *</label><input className="form-control" value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} required /></div>
                  <div className="form-group"><label className="form-label">Last Name *</label><input className="form-control" value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} required /></div>
                </div>
                <div className="form-group"><label className="form-label">Email *</label><input className="form-control" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required /></div>
                <div className="form-grid">
                  <div className="form-group"><label className="form-label">Phone</label><input className="form-control" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
                  <div className="form-group"><label className="form-label">National ID</label><input className="form-control" value={form.nationalId} onChange={e => setForm({ ...form, nationalId: e.target.value })} /></div>
                </div>
              </div>
              <div className="modal-footer"><button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button><button type="submit" className="btn btn-primary">Register Voter</button></div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

// ── Candidates ─────────────────────────────────────────────────────────────────
export function Candidates() {
  const [candidates, setCandidates] = useState([]);
  const [elections, setElections] = useState([]);
  const [electionId, setElectionId] = useState('');
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ election: '', position: '', firstName: '', lastName: '', party: '', partyColor: '#1a56db', bio: '', ballotNumber: 1, age: '', education: '', manifesto: '' });

  useEffect(() => { adminAPI.getElections().then(r => setElections(r.data.elections || [])).catch(() => {}); }, []);
  useEffect(() => { if (electionId) { setLoading(true); adminAPI.getCandidates({ electionId }).then(r => setCandidates(r.data.candidates || [])).catch(() => {}).finally(() => setLoading(false)); } }, [electionId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) { await candidateAPI.update(editId, form); toast.success('Candidate updated!'); }
      else { await candidateAPI.create(form); toast.success('Candidate added!'); }
      setShowModal(false);
      if (electionId) { const r = await adminAPI.getCandidates({ electionId }); setCandidates(r.data.candidates || []); }
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const approveCandidate = async (id) => {
    try { await candidateAPI.approve(id); toast.success('Approved!'); const r = await adminAPI.getCandidates({ electionId }); setCandidates(r.data.candidates || []); }
    catch { toast.error('Failed'); }
  };

  const openAdd = () => { setEditId(null); setForm({ ...form, election: electionId }); setShowModal(true); };

  return (
    <DashboardLayout navItems={adminNav} role="admin" roleLabel="Admin">
      <div className="page-header">
        <div><h1 className="page-title">Candidate Management</h1><p className="page-subtitle">Manage election candidates</p></div>
        <div style={{ display: 'flex', gap: 12 }}>
          <select className="form-control form-select" style={{ width: 280 }} value={electionId} onChange={e => setElectionId(e.target.value)}>
            <option value="">Select Election</option>
            {elections.map(e => <option key={e._id} value={e._id}>{e.title}</option>)}
          </select>
          <button className="btn btn-primary" onClick={openAdd} disabled={!electionId}>+ Add Candidate</button>
        </div>
      </div>
      <div className="page-content fade-in">
        {!electionId ? (
          <div className="empty-state card" style={{ padding: 60 }}><div className="empty-state-icon">🏆</div><h3>Select an Election</h3><p>Choose an election from the dropdown to manage its candidates.</p></div>
        ) : (
          <div className="card">
            <div className="table-container">
              {loading ? <div style={{ padding: 40, textAlign: 'center' }}>Loading...</div> : (
                <table>
                  <thead><tr><th>#</th><th>Candidate</th><th>Position</th><th>Party</th><th>Status</th><th>Votes</th><th>Actions</th></tr></thead>
                  <tbody>
                    {candidates.map(c => (
                      <tr key={c._id}>
                        <td style={{ fontWeight: 700, color: '#94a3b8' }}>{c.ballotNumber}</td>
                        <td><div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><div style={{ width: 36, height: 36, borderRadius: '50%', background: c.partyColor || '#1a3a6b', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 13 }}>{c.firstName?.[0]}{c.lastName?.[0]}</div><div><div style={{ fontWeight: 600, fontSize: 14 }}>{c.firstName} {c.lastName}</div><div style={{ fontSize: 12, color: '#94a3b8' }}>{c.age ? `Age ${c.age}` : ''}</div></div></div></td>
                        <td style={{ fontSize: 13, fontWeight: 600 }}>{c.position}</td>
                        <td><div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><div style={{ width: 10, height: 10, borderRadius: '50%', background: c.partyColor || '#1a3a6b' }}></div><span style={{ fontSize: 13 }}>{c.party || '—'}</span></div></td>
                        <td><span className={`badge badge-${c.status}`}>{c.status}</span></td>
                        <td style={{ fontWeight: 700 }}>{c.totalVotes}</td>
                        <td>
                          <div style={{ display: 'flex', gap: 6 }}>
                            {c.status === 'pending' && <button className="btn btn-success btn-sm" onClick={() => approveCandidate(c._id)}>✅ Approve</button>}
                            {c.status === 'pending' && <button className="btn btn-danger btn-sm" onClick={async () => { await candidateAPI.reject(c._id, { reason: 'Does not meet requirements' }); toast.success('Rejected'); const r = await adminAPI.getCandidates({ electionId }); setCandidates(r.data.candidates || []); }}>❌ Reject</button>}
                            <button className="btn btn-outline btn-sm" onClick={() => { setEditId(c._id); setForm({ election: electionId, position: c.position, firstName: c.firstName, lastName: c.lastName, party: c.party || '', partyColor: c.partyColor || '#1a56db', bio: c.bio || '', ballotNumber: c.ballotNumber || 1, age: c.age || '', education: c.education || '', manifesto: c.manifesto || '' }); setShowModal(true); }}>✏️</button>
                            <button className="btn btn-danger btn-sm" onClick={async () => { if (window.confirm('Delete?')) { await candidateAPI.delete(c._id); toast.success('Deleted'); const r = await adminAPI.getCandidates({ electionId }); setCandidates(r.data.candidates || []); } }}>🗑️</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
      </div>
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" style={{ maxWidth: 640 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h3 className="modal-title">{editId ? 'Edit Candidate' : 'Add Candidate'}</h3><button className="modal-close" onClick={() => setShowModal(false)}>×</button></div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group"><label className="form-label">Position *</label>
                  <select className="form-control form-select" value={form.position} onChange={e => setForm({ ...form, position: e.target.value })} required>
                    <option value="">Select position</option>
                    {elections.find(e => e._id === electionId)?.positions?.map(p => <option key={p.name} value={p.name}>{p.name}</option>)}
                  </select>
                </div>
                <div className="form-grid">
                  <div className="form-group"><label className="form-label">First Name *</label><input className="form-control" value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} required /></div>
                  <div className="form-group"><label className="form-label">Last Name *</label><input className="form-control" value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} required /></div>
                </div>
                <div className="form-grid">
                  <div className="form-group"><label className="form-label">Party</label><input className="form-control" value={form.party} onChange={e => setForm({ ...form, party: e.target.value })} /></div>
                  <div className="form-group"><label className="form-label">Party Color</label><input className="form-control" type="color" value={form.partyColor} onChange={e => setForm({ ...form, partyColor: e.target.value })} /></div>
                </div>
                <div className="form-grid">
                  <div className="form-group"><label className="form-label">Ballot Number</label><input className="form-control" type="number" value={form.ballotNumber} onChange={e => setForm({ ...form, ballotNumber: parseInt(e.target.value) })} /></div>
                  <div className="form-group"><label className="form-label">Age</label><input className="form-control" type="number" value={form.age} onChange={e => setForm({ ...form, age: e.target.value })} /></div>
                </div>
                <div className="form-group"><label className="form-label">Education</label><input className="form-control" value={form.education} onChange={e => setForm({ ...form, education: e.target.value })} /></div>
                <div className="form-group"><label className="form-label">Biography</label><textarea className="form-control" rows={3} value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} /></div>
                <div className="form-group"><label className="form-label">Manifesto</label><textarea className="form-control" rows={3} value={form.manifesto} onChange={e => setForm({ ...form, manifesto: e.target.value })} /></div>
              </div>
              <div className="modal-footer"><button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button><button type="submit" className="btn btn-primary">{editId ? 'Update' : 'Add'} Candidate</button></div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

// ── Ballot ─────────────────────────────────────────────────────────────────────
export function Ballot() {
  const [elections, setElections] = useState([]);
  const [electionId, setElectionId] = useState('');
  const [ballot, setBallot] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => { adminAPI.getElections().then(r => setElections(r.data.elections || [])).catch(() => {}); }, []);
  useEffect(() => {
    if (electionId) { setLoading(true); adminAPI.getBallot(electionId).then(r => setBallot(r.data)).catch(() => {}).finally(() => setLoading(false)); }
  }, [electionId]);

  return (
    <DashboardLayout navItems={adminNav} role="admin" roleLabel="Admin">
      <div className="page-header">
        <div><h1 className="page-title">Ballot Configuration</h1><p className="page-subtitle">View and configure election ballots</p></div>
        <select className="form-control form-select" style={{ width: 300 }} value={electionId} onChange={e => setElectionId(e.target.value)}>
          <option value="">Select Election</option>
          {elections.map(e => <option key={e._id} value={e._id}>{e.title}</option>)}
        </select>
      </div>
      <div className="page-content fade-in">
        {!electionId ? (
          <div className="empty-state card" style={{ padding: 60 }}><div className="empty-state-icon">🗂️</div><h3>Select an Election</h3><p>Choose an election to view its ballot configuration.</p></div>
        ) : loading ? <div style={{ textAlign: 'center', padding: 40 }}>Loading...</div> : ballot && (
          <>
            <div className="alert alert-info">📋 Ballot for: <strong>{ballot.election?.title}</strong> · Status: <strong>{ballot.election?.status}</strong></div>
            {ballot.ballot?.map((pos, i) => (
              <div className="card" key={i} style={{ marginBottom: 20 }}>
                <div className="card-header">
                  <div><span className="card-title">🏛️ {pos.position}</span><p style={{ fontSize: 13, color: '#94a3b8', marginTop: 4 }}>{pos.description}</p></div>
                  <span className="badge badge-info">{pos.candidates.length} candidates</span>
                </div>
                <div className="card-body">
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                    {pos.candidates.map(c => (
                      <div key={c._id} style={{ border: '2px solid #e2e8f0', borderRadius: 12, padding: 16, borderTop: `4px solid ${c.partyColor || '#1a3a6b'}` }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                          <div style={{ width: 44, height: 44, borderRadius: '50%', background: c.partyColor || '#1a3a6b', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700 }}>#{c.ballotNumber}</div>
                          <div><div style={{ fontWeight: 700 }}>{c.firstName} {c.lastName}</div><div style={{ fontSize: 12, color: '#94a3b8' }}>{c.party}</div></div>
                        </div>
                        {c.bio && <p style={{ fontSize: 12, color: '#64748b', lineHeight: 1.5 }}>{c.bio.slice(0, 80)}...</p>}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

// ── LiveMonitor ─────────────────────────────────────────────────────────────────
export function LiveMonitor() {
  const [elections, setElections] = useState([]);
  const [electionId, setElectionId] = useState('');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => { adminAPI.getElections().then(r => { const el = r.data.elections || []; setElections(el); if (el.length > 0) setElectionId(el[0]._id); }).catch(() => {}); }, []);
  useEffect(() => {
    if (!electionId) return;
    const fetch = () => { setLoading(true); adminAPI.getLiveStats(electionId).then(r => setStats(r.data.stats)).catch(() => {}).finally(() => setLoading(false)); };
    fetch();
    const interval = setInterval(fetch, 30000);
    return () => clearInterval(interval);
  }, [electionId]);

  const trendData = (stats?.votesPerHour || []).map(v => ({ hour: v._id?.slice(11, 16), votes: v.count }));

  return (
    <DashboardLayout navItems={adminNav} role="admin" roleLabel="Admin">
      <div className="page-header">
        <div><h1 className="page-title">Live Monitor</h1><p className="page-subtitle">Real-time election monitoring</p></div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <select className="form-control form-select" style={{ width: 280 }} value={electionId} onChange={e => setElectionId(e.target.value)}>
            {elections.map(e => <option key={e._id} value={e._id}>{e.title}</option>)}
          </select>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#d1fae5', padding: '6px 12px', borderRadius: 20 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', animation: 'pulse 1.5s infinite' }}></div>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#065f46' }}>LIVE</span>
          </div>
        </div>
      </div>
      <div className="page-content fade-in">
        {stats && (
          <>
            <div className="stats-grid">
              {[
                { icon: '✅', label: 'Total Votes', value: stats.totalVotes?.toLocaleString(), color: '#2563eb', bg: '#dbeafe' },
                { icon: '👥', label: 'Eligible Voters', value: stats.totalEligible?.toLocaleString(), color: '#10b981', bg: '#d1fae5' },
                { icon: '📊', label: 'Voter Turnout', value: `${stats.turnout}%`, color: '#f59e0b', bg: '#fef3c7' },
                { icon: '⏳', label: 'Status', value: stats.status?.toUpperCase(), color: '#8b5cf6', bg: '#ede9fe' },
              ].map((s, i) => (
                <div className="stat-card" key={i}><div className="stat-icon" style={{ background: s.color }}><span style={{ fontSize: 22 }}>{s.icon}</span></div><div><div className="stat-value" style={{ fontSize: 22 }}>{s.value}</div><div className="stat-label">{s.label}</div></div></div>
              ))}
            </div>
            <div className="card">
              <div className="card-header"><span className="card-title">📈 Voting Activity by Hour</span></div>
              <div className="card-body">
                {trendData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={260}>
                    <LineChart data={trendData}><XAxis dataKey="hour" tick={{ fontSize: 11 }} /><YAxis tick={{ fontSize: 11 }} /><Tooltip /><Line type="monotone" dataKey="votes" stroke="#2563eb" strokeWidth={3} dot={false} /></LineChart>
                  </ResponsiveContainer>
                ) : <div className="empty-state"><p>No voting activity yet</p></div>}
              </div>
            </div>
            <div className="card" style={{ marginTop: 20 }}>
              <div className="card-header"><span className="card-title">📊 Turnout Progress</span></div>
              <div className="card-body">
                <div style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontWeight: 600 }}>Overall Turnout</span>
                    <span style={{ fontWeight: 700, color: '#2563eb' }}>{stats.totalVotes} / {stats.totalEligible} ({stats.turnout}%)</span>
                  </div>
                  <div className="progress" style={{ height: 16 }}><div className="progress-bar" style={{ width: `${Math.min(stats.turnout, 100)}%`, background: 'linear-gradient(90deg, #1a3a6b, #2563eb)' }}></div></div>
                </div>
              </div>
            </div>
          </>
        )}
        {!loading && !stats && electionId && <div className="empty-state card" style={{ padding: 60 }}><div className="empty-state-icon">📺</div><h3>No data available</h3></div>}
      </div>
    </DashboardLayout>
  );
}

// ── Reports ────────────────────────────────────────────────────────────────────
export function AdminReports() {
  const [elections, setElections] = useState([]);
  const [electionId, setElectionId] = useState('');
  const [report, setReport] = useState(null);

  useEffect(() => { adminAPI.getElections().then(r => setElections(r.data.elections || [])).catch(() => {}); }, []);
  useEffect(() => { if (electionId) adminAPI.getReport(electionId).then(r => setReport(r.data.report)).catch(() => {}); }, [electionId]);

  return (
    <DashboardLayout navItems={adminNav} role="admin" roleLabel="Admin">
      <div className="page-header">
        <div><h1 className="page-title">Election Reports</h1><p className="page-subtitle">Detailed election analytics</p></div>
        <select className="form-control form-select" style={{ width: 300 }} value={electionId} onChange={e => setElectionId(e.target.value)}>
          <option value="">Select Election</option>
          {elections.map(e => <option key={e._id} value={e._id}>{e.title}</option>)}
        </select>
      </div>
      <div className="page-content fade-in">
        {!electionId ? (
          <div className="empty-state card" style={{ padding: 60 }}><div className="empty-state-icon">📈</div><h3>Select an Election</h3></div>
        ) : report && (
          <>
            <div className="grid-2" style={{ marginBottom: 24 }}>
              {[['📋 Election', report.election?.title], ['📊 Status', report.election?.status], ['✅ Total Votes', report.summary?.totalVotes], ['📈 Turnout', `${report.summary?.turnout}%`]].map(([label, val], i) => (
                <div className="stat-card" key={i}><div><div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 4 }}>{label}</div><div style={{ fontSize: 20, fontWeight: 700 }}>{val}</div></div></div>
              ))}
            </div>
            <div className="card">
              <div className="card-header"><span className="card-title">🏆 Candidate Results</span></div>
              <div className="table-container">
                <table><thead><tr><th>Candidate</th><th>Party</th><th>Position</th><th>Votes</th></tr></thead>
                <tbody>{report.candidates?.map((c, i) => (<tr key={i}><td style={{ fontWeight: 600 }}>{c.name}</td><td>{c.party || '—'}</td><td>{c.position}</td><td style={{ fontWeight: 700, color: '#2563eb' }}>{c.votes?.toLocaleString()}</td></tr>))}</tbody></table>
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

// ── Notifications ──────────────────────────────────────────────────────────────
export function AdminNotifications() {
  const [elections, setElections] = useState([]);
  const [form, setForm] = useState({ title: '', message: '', type: 'info', electionId: '' });
  useEffect(() => { adminAPI.getElections().then(r => setElections(r.data.elections || [])).catch(() => {}); }, []);

  const handleSend = async (e) => {
    e.preventDefault();
    try { await adminAPI.sendNotification({ ...form, electionId: form.electionId || undefined }); toast.success('Notification sent to all voters!'); setForm({ title: '', message: '', type: 'info', electionId: '' }); }
    catch { toast.error('Failed to send'); }
  };

  return (
    <DashboardLayout navItems={adminNav} role="admin" roleLabel="Admin">
      <div className="page-header"><div><h1 className="page-title">Send Notifications</h1><p className="page-subtitle">Notify voters about elections</p></div></div>
      <div className="page-content fade-in">
        <div className="grid-2">
          <div className="card">
            <div className="card-header"><span className="card-title">📢 Send Voter Notification</span></div>
            <div className="card-body">
              <form onSubmit={handleSend}>
                <div className="form-group"><label className="form-label">Related Election (optional)</label><select className="form-control form-select" value={form.electionId} onChange={e => setForm({ ...form, electionId: e.target.value })}><option value="">All Elections</option>{elections.map(e => <option key={e._id} value={e._id}>{e.title}</option>)}</select></div>
                <div className="form-group"><label className="form-label">Type</label><select className="form-control form-select" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}><option value="info">Info</option><option value="reminder">Reminder</option><option value="warning">Warning</option><option value="success">Success</option></select></div>
                <div className="form-group"><label className="form-label">Title *</label><input className="form-control" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required /></div>
                <div className="form-group"><label className="form-label">Message *</label><textarea className="form-control" rows={5} value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} required /></div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>📢 Send to All Voters</button>
              </form>
            </div>
          </div>
          <div className="card">
            <div className="card-header"><span className="card-title">💡 Notification Best Practices</span></div>
            <div className="card-body">
              {[['⏰', 'Election Reminders', 'Send 48h and 24h before elections close'], ['📋', 'New Elections', 'Notify when new elections open for voting'], ['✅', 'Results', 'Alert voters when results are published'], ['🆘', 'Urgent Alerts', 'Use Warning type for critical updates'], ['🎯', 'Be Specific', 'Include election name and dates in message']].map(([icon, title, desc], i) => (
                <div key={i} style={{ display: 'flex', gap: 12, padding: '12px 0', borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ fontSize: 22 }}>{icon}</span>
                  <div><div style={{ fontWeight: 600, fontSize: 14 }}>{title}</div><div style={{ fontSize: 13, color: '#64748b' }}>{desc}</div></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

// ── Observers ──────────────────────────────────────────────────────────────────
export function Observers() {
  const [observers, setObservers] = useState([]);
  const [elections, setElections] = useState([]);
  const [assignForm, setAssignForm] = useState({ electionId: '', observerId: '' });

  useEffect(() => {
    adminAPI.getObservers().then(r => setObservers(r.data.observers || [])).catch(() => {});
    adminAPI.getElections().then(r => setElections(r.data.elections || [])).catch(() => {});
  }, []);

  const handleAssign = async (e) => {
    e.preventDefault();
    try { await adminAPI.assignObserver(assignForm); toast.success('Observer assigned!'); }
    catch { toast.error('Assignment failed'); }
  };

  return (
    <DashboardLayout navItems={adminNav} role="admin" roleLabel="Admin">
      <div className="page-header"><div><h1 className="page-title">Observer Management</h1><p className="page-subtitle">Assign observers to elections</p></div></div>
      <div className="page-content fade-in">
        <div className="grid-2">
          <div className="card">
            <div className="card-header"><span className="card-title">👁️ Available Observers</span></div>
            <div className="table-container">
              <table><thead><tr><th>Observer</th><th>Email</th><th>Status</th></tr></thead>
              <tbody>{observers.map(o => (<tr key={o._id}><td><div style={{ fontWeight: 600 }}>{o.firstName} {o.lastName}</div></td><td style={{ fontSize: 13 }}>{o.email}</td><td><span className={`badge ${o.isActive ? 'badge-success' : 'badge-danger'}`}>{o.isActive ? 'Active' : 'Inactive'}</span></td></tr>))}</tbody></table>
            </div>
          </div>
          <div className="card">
            <div className="card-header"><span className="card-title">🔗 Assign Observer</span></div>
            <div className="card-body">
              <form onSubmit={handleAssign}>
                <div className="form-group"><label className="form-label">Election *</label><select className="form-control form-select" value={assignForm.electionId} onChange={e => setAssignForm({ ...assignForm, electionId: e.target.value })} required><option value="">Select Election</option>{elections.map(e => <option key={e._id} value={e._id}>{e.title}</option>)}</select></div>
                <div className="form-group"><label className="form-label">Observer *</label><select className="form-control form-select" value={assignForm.observerId} onChange={e => setAssignForm({ ...assignForm, observerId: e.target.value })} required><option value="">Select Observer</option>{observers.map(o => <option key={o._id} value={o._id}>{o.firstName} {o.lastName}</option>)}</select></div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Assign Observer</button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

// ── Results ─────────────────────────────────────────────────────────────────────
export function AdminResults() {
  const [elections, setElections] = useState([]);
  const [electionId, setElectionId] = useState('');
  const [results, setResults] = useState(null);

  useEffect(() => { adminAPI.getElections().then(r => { const el = r.data.elections || []; setElections(el); }).catch(() => {}); }, []);
  useEffect(() => {
    if (electionId) {
      import('../../services/api').then(({ resultAPI }) => {
        resultAPI.get(electionId).then(r => setResults(r.data)).catch(() => toast.error('Could not load results'));
      });
    }
  }, [electionId]);

  const publishResults = async () => {
    try { await adminAPI.publishResults(electionId); toast.success('Results published!'); }
    catch { toast.error('Failed to publish'); }
  };

  return (
    <DashboardLayout navItems={adminNav} role="admin" roleLabel="Admin">
      <div className="page-header">
        <div><h1 className="page-title">Election Results</h1><p className="page-subtitle">View and publish results</p></div>
        <div style={{ display: 'flex', gap: 12 }}>
          <select className="form-control form-select" style={{ width: 280 }} value={electionId} onChange={e => setElectionId(e.target.value)}>
            <option value="">Select Election</option>
            {elections.map(e => <option key={e._id} value={e._id}>{e.title}</option>)}
          </select>
          {electionId && <button className="btn btn-success" onClick={publishResults}>📢 Publish Results</button>}
        </div>
      </div>
      <div className="page-content fade-in">
        {!electionId ? (
          <div className="empty-state card" style={{ padding: 60 }}><div className="empty-state-icon">📊</div><h3>Select an Election</h3></div>
        ) : results && (
          <>
            <div className="alert alert-info">📊 <strong>{results.election?.title}</strong> · Turnout: <strong>{results.election?.turnout}%</strong> · Total Votes: <strong>{results.election?.totalVotes?.toLocaleString()}</strong></div>
            {Object.entries(results.results || {}).map(([position, data]) => (
              <div className="card" key={position} style={{ marginBottom: 20 }}>
                <div className="card-header"><span className="card-title">🏛️ {position}</span></div>
                <div className="card-body">
                  {data.candidates?.sort((a, b) => b.votes - a.votes).map((c, i) => (
                    <div key={i} style={{ marginBottom: 16 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          {i === 0 && <span style={{ background: '#fef3c7', color: '#92400e', padding: '2px 8px', borderRadius: 4, fontSize: 12, fontWeight: 700 }}>🏆 LEADING</span>}
                          <div style={{ width: 12, height: 12, borderRadius: '50%', background: c.partyColor || '#1a3a6b' }}></div>
                          <span style={{ fontWeight: 600, fontSize: 15 }}>{c.name}</span>
                          <span style={{ fontSize: 13, color: '#94a3b8' }}>{c.party}</span>
                        </div>
                        <span style={{ fontWeight: 700, fontSize: 16 }}>{c.votes?.toLocaleString()} votes ({c.percentage}%)</span>
                      </div>
                      <div className="progress" style={{ height: 12 }}><div className="progress-bar" style={{ width: `${c.percentage}%`, background: c.partyColor || '#1a3a6b' }}></div></div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

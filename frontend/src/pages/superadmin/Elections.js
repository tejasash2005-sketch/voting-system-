// SuperAdmin Elections page
import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { superAdminNav } from '../../utils/navConfig';
import { electionAPI } from '../../services/api';
import toast from 'react-hot-toast';

const emptyElection = { title: '', description: '', type: 'general', region: '', startDate: '', endDate: '', positions: [{ name: 'President', description: '', maxWinners: 1, maxVotesPerVoter: 1 }], totalEligibleVoters: 0 };

export default function SuperAdminElections() {
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyElection);
  const [filter, setFilter] = useState('');

  const fetch = () => {
    setLoading(true);
    electionAPI.getAll({ status: filter }).then(r => setElections(r.data.elections || [])).catch(() => toast.error('Load failed')).finally(() => setLoading(false));
  };
  useEffect(() => { fetch(); }, [filter]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await electionAPI.create(form);
      toast.success('Election created!');
      setShowModal(false);
      fetch();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const updateStatus = async (id, status) => {
    try { await electionAPI.updateStatus(id, status); toast.success(`Election ${status}`); fetch(); }
    catch { toast.error('Status update failed'); }
  };

  const statusColors = { draft: '#94a3b8', upcoming: '#3b82f6', active: '#10b981', paused: '#f59e0b', completed: '#6b7280', cancelled: '#ef4444' };

  return (
    <DashboardLayout navItems={superAdminNav} role="superadmin" roleLabel="Super Admin">
      <div className="page-header">
        <div><h1 className="page-title">Election Management</h1><p className="page-subtitle">Create and manage all elections</p></div>
        <div style={{ display: 'flex', gap: 12 }}>
          <select className="form-control form-select" style={{ width: 160 }} value={filter} onChange={e => setFilter(e.target.value)}>
            <option value="">All Status</option>
            {['draft','upcoming','active','paused','completed','cancelled'].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ New Election</button>
        </div>
      </div>
      <div className="page-content fade-in">
        <div className="card">
          <div className="table-container">
            {loading ? <div style={{ padding: 40, textAlign: 'center' }}>Loading...</div> : (
              <table>
                <thead><tr><th>Election</th><th>Type</th><th>Region</th><th>Status</th><th>Start</th><th>End</th><th>Voters</th><th>Votes</th><th>Actions</th></tr></thead>
                <tbody>
                  {elections.map(e => (
                    <tr key={e._id}>
                      <td><div style={{ fontWeight: 600, fontSize: 14 }}>{e.title}</div><div style={{ fontSize: 12, color: '#94a3b8' }}>{e.positions?.length} position(s)</div></td>
                      <td><span className="badge badge-info">{e.type}</span></td>
                      <td style={{ fontSize: 13 }}>{e.region}</td>
                      <td><span className="badge" style={{ background: `${statusColors[e.status]}20`, color: statusColors[e.status] }}>{e.status}</span></td>
                      <td style={{ fontSize: 13, color: '#64748b' }}>{new Date(e.startDate).toLocaleDateString()}</td>
                      <td style={{ fontSize: 13, color: '#64748b' }}>{new Date(e.endDate).toLocaleDateString()}</td>
                      <td style={{ fontSize: 13 }}>{e.totalEligibleVoters?.toLocaleString()}</td>
                      <td style={{ fontSize: 13 }}>{e.totalVotesCast?.toLocaleString()}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          {e.status === 'draft' && <button className="btn btn-sm" style={{ background: '#3b82f6', color: 'white', fontSize: 11 }} onClick={() => updateStatus(e._id, 'upcoming')}>Publish</button>}
                          {e.status === 'upcoming' && <button className="btn btn-sm btn-success" onClick={() => updateStatus(e._id, 'active')}>Activate</button>}
                          {e.status === 'active' && <button className="btn btn-sm" style={{ background: '#f59e0b', color: 'white', fontSize: 11 }} onClick={() => updateStatus(e._id, 'paused')}>Pause</button>}
                          {e.status === 'active' && <button className="btn btn-sm btn-outline" style={{ fontSize: 11 }} onClick={() => updateStatus(e._id, 'completed')}>Complete</button>}
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
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" style={{ maxWidth: 640 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h3 className="modal-title">Create New Election</h3><button className="modal-close" onClick={() => setShowModal(false)}>×</button></div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group"><label className="form-label">Election Title *</label><input className="form-control" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required placeholder="2024 Presidential Election" /></div>
                <div className="form-group"><label className="form-label">Description *</label><textarea className="form-control" rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} required /></div>
                <div className="form-grid">
                  <div className="form-group"><label className="form-label">Type *</label><select className="form-control form-select" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}><option value="general">General</option><option value="primary">Primary</option><option value="local">Local</option><option value="referendum">Referendum</option><option value="special">Special</option></select></div>
                  <div className="form-group"><label className="form-label">Region *</label><input className="form-control" value={form.region} onChange={e => setForm({ ...form, region: e.target.value })} required placeholder="National" /></div>
                </div>
                <div className="form-grid">
                  <div className="form-group"><label className="form-label">Start Date *</label><input className="form-control" type="datetime-local" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} required /></div>
                  <div className="form-group"><label className="form-label">End Date *</label><input className="form-control" type="datetime-local" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} required /></div>
                </div>
                <div className="form-group"><label className="form-label">Eligible Voters</label><input className="form-control" type="number" value={form.totalEligibleVoters} onChange={e => setForm({ ...form, totalEligibleVoters: parseInt(e.target.value) })} /></div>
                <div className="form-group">
                  <label className="form-label">Positions</label>
                  {form.positions.map((pos, i) => (
                    <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 8 }}>
                      <input className="form-control" placeholder="Position name" value={pos.name} onChange={e => { const p = [...form.positions]; p[i] = { ...p[i], name: e.target.value }; setForm({ ...form, positions: p }); }} />
                      <button type="button" className="btn btn-danger btn-sm" onClick={() => setForm({ ...form, positions: form.positions.filter((_, j) => j !== i) })}>✕</button>
                    </div>
                  ))}
                  <button type="button" className="btn btn-outline btn-sm" onClick={() => setForm({ ...form, positions: [...form.positions, { name: '', description: '', maxWinners: 1, maxVotesPerVoter: 1 }] })}>+ Add Position</button>
                </div>
              </div>
              <div className="modal-footer"><button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button><button type="submit" className="btn btn-primary">Create Election</button></div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

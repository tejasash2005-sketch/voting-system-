import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { superAdminAPI } from '../../services/api';
import toast from 'react-hot-toast';

const navItems = [
  { label: 'OVERVIEW', items: [{ icon: '📊', label: 'Dashboard', path: '/superadmin/dashboard' }]},
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
  { label: 'COMMUNICATION', items: [{ icon: '🔔', label: 'Notifications', path: '/superadmin/notifications' }]},
  { label: 'ANALYTICS', items: [
    { icon: '📈', label: 'Reports', path: '/superadmin/reports' },
    { icon: '⚙️', label: 'Settings', path: '/superadmin/settings' },
  ]},
];

const emptyUser = { firstName: '', lastName: '', email: '', password: '', role: 'voter', phone: '', nationalId: '' };

export default function SuperAdminUsers() {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [form, setForm] = useState(emptyUser);
  const [page, setPage] = useState(1);

  const fetchUsers = () => {
    setLoading(true);
    superAdminAPI.getUsers({ search, role: roleFilter, page, limit: 15 })
      .then(r => { setUsers(r.data.users); setTotal(r.data.total); })
      .catch(() => toast.error('Failed to load users'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, [search, roleFilter, page]);

  const openCreate = () => { setEditUser(null); setForm(emptyUser); setShowModal(true); };
  const openEdit = (u) => { setEditUser(u); setForm({ ...u, password: '' }); setShowModal(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editUser) {
        await superAdminAPI.updateUser(editUser._id, form);
        toast.success('User updated');
      } else {
        await superAdminAPI.createUser(form);
        toast.success('User created');
      }
      setShowModal(false);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    }
  };

  const toggleStatus = async (id, current) => {
    try {
      await superAdminAPI.toggleUserStatus(id);
      toast.success(`User ${current ? 'deactivated' : 'activated'}`);
      fetchUsers();
    } catch { toast.error('Failed to update status'); }
  };

  const deleteUser = async (id) => {
    if (!window.confirm('Delete this user permanently?')) return;
    try {
      await superAdminAPI.deleteUser(id);
      toast.success('User deleted');
      fetchUsers();
    } catch { toast.error('Failed to delete user'); }
  };

  const roleBadge = (role) => {
    const map = { superadmin: 'badge-superadmin', admin: 'badge-admin', voter: 'badge-voter', observer: 'badge-observer' };
    return <span className={`badge ${map[role] || 'badge-secondary'}`}>{role}</span>;
  };

  return (
    <DashboardLayout navItems={navItems} role="superadmin" roleLabel="Super Admin">
      <div className="page-header">
        <div>
          <h1 className="page-title">User Management</h1>
          <p className="page-subtitle">{total} total users across all roles</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>+ Add User</button>
      </div>

      <div className="page-content fade-in">
        <div className="card">
          <div className="card-header">
            <div className="filter-bar" style={{ margin: 0, flex: 1 }}>
              <div className="search-input">
                <span className="search-icon">🔍</span>
                <input className="form-control" placeholder="Search users..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} style={{ paddingLeft: 36 }} />
              </div>
              <select className="form-control form-select" style={{ width: 160 }} value={roleFilter} onChange={e => { setRoleFilter(e.target.value); setPage(1); }}>
                <option value="">All Roles</option>
                <option value="superadmin">Super Admin</option>
                <option value="admin">Admin</option>
                <option value="voter">Voter</option>
                <option value="observer">Observer</option>
              </select>
            </div>
          </div>
          <div className="table-container">
            {loading ? (
              <div style={{ textAlign: 'center', padding: 40 }}>Loading users...</div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Role</th>
                    <th>Voter ID</th>
                    <th>Status</th>
                    <th>Verified</th>
                    <th>Last Login</th>
                    <th>Joined</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u._id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#1a3a6b', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 13, flexShrink: 0 }}>
                            {u.firstName?.[0]}{u.lastName?.[0]}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: 14 }}>{u.firstName} {u.lastName}</div>
                            <div style={{ fontSize: 12, color: '#94a3b8' }}>{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>{roleBadge(u.role)}</td>
                      <td><span style={{ fontSize: 12, color: '#64748b', fontFamily: 'monospace' }}>{u.voterId || '—'}</span></td>
                      <td>
                        <span className={`badge ${u.isActive ? 'badge-success' : 'badge-danger'}`}>
                          {u.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td><span className={`badge ${u.isVerified ? 'badge-success' : 'badge-warning'}`}>{u.isVerified ? 'Yes' : 'No'}</span></td>
                      <td style={{ fontSize: 13, color: '#64748b' }}>{u.lastLogin ? new Date(u.lastLogin).toLocaleDateString() : 'Never'}</td>
                      <td style={{ fontSize: 13, color: '#64748b' }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button className="btn btn-outline btn-sm" onClick={() => openEdit(u)}>✏️</button>
                          <button className={`btn btn-sm ${u.isActive ? 'btn-outline' : 'btn-success'}`} onClick={() => toggleStatus(u._id, u.isActive)} style={{ fontSize: 12 }}>
                            {u.isActive ? '🚫' : '✅'}
                          </button>
                          <button className="btn btn-danger btn-sm" onClick={() => deleteUser(u._id)}>🗑️</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          {/* Pagination */}
          <div style={{ padding: '16px 20px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 13, color: '#64748b' }}>Showing {users.length} of {total} users</span>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-outline btn-sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
              <span style={{ padding: '6px 12px', fontSize: 13, fontWeight: 600 }}>Page {page}</span>
              <button className="btn btn-outline btn-sm" disabled={users.length < 15} onClick={() => setPage(p => p + 1)}>Next →</button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{editUser ? 'Edit User' : 'Create New User'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">First Name *</label>
                    <input className="form-control" value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Last Name *</label>
                    <input className="form-control" value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} required />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Email *</label>
                  <input className="form-control" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
                </div>
                {!editUser && (
                  <div className="form-group">
                    <label className="form-label">Password *</label>
                    <input className="form-control" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
                  </div>
                )}
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Role *</label>
                    <select className="form-control form-select" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                      <option value="voter">Voter</option>
                      <option value="admin">Admin</option>
                      <option value="observer">Observer</option>
                      <option value="superadmin">Super Admin</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone</label>
                    <input className="form-control" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">National ID</label>
                  <input className="form-control" value={form.nationalId} onChange={e => setForm({ ...form, nationalId: e.target.value })} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editUser ? 'Update User' : 'Create User'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

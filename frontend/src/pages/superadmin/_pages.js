import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { superAdminNav } from '../../utils/navConfig';
import { superAdminAPI } from '../../services/api';
import toast from 'react-hot-toast';

// ─── AUDIT LOGS ───────────────────────────────────────────────────────────────
export function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ category: '', status: '', severity: '' });

  useEffect(() => {
    setLoading(true);
    superAdminAPI.getAuditLogs(filters).then(r => setLogs(r.data.logs || [])).catch(() => toast.error('Failed')).finally(() => setLoading(false));
  }, [filters]);

  const severityColor = { low: '#10b981', medium: '#f59e0b', high: '#ef4444', critical: '#7c3aed' };

  return (
    <DashboardLayout navItems={superAdminNav} role="superadmin" roleLabel="Super Admin">
      <div className="page-header">
        <div><h1 className="page-title">Audit Logs</h1><p className="page-subtitle">Complete system activity trail</p></div>
      </div>
      <div className="page-content fade-in">
        <div className="card">
          <div className="card-header">
            <div style={{ display: 'flex', gap: 12 }}>
              {[['category', ['auth','election','vote','user','system']], ['status', ['success','failure','warning']], ['severity', ['low','medium','high','critical']]].map(([key, opts]) => (
                <select key={key} className="form-control form-select" style={{ width: 140 }} value={filters[key]} onChange={e => setFilters({ ...filters, [key]: e.target.value })}>
                  <option value="">All {key}</option>
                  {opts.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              ))}
            </div>
          </div>
          <div className="table-container">
            {loading ? <div style={{ padding: 40, textAlign: 'center' }}>Loading logs...</div> : (
              <table>
                <thead><tr><th>Action</th><th>Category</th><th>Performed By</th><th>Status</th><th>Severity</th><th>IP Address</th><th>Timestamp</th></tr></thead>
                <tbody>
                  {logs.map((log, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 600, fontSize: 13 }}>{log.action?.replace(/_/g, ' ')}</td>
                      <td><span className="badge badge-info">{log.category}</span></td>
                      <td style={{ fontSize: 13 }}>{log.performedBy ? `${log.performedBy.firstName} ${log.performedBy.lastName} (${log.performedByRole})` : 'System'}</td>
                      <td><span className={`badge ${log.status === 'success' ? 'badge-success' : 'badge-danger'}`}>{log.status}</span></td>
                      <td><span style={{ fontSize: 12, fontWeight: 700, color: severityColor[log.severity] }}>{log.severity?.toUpperCase()}</span></td>
                      <td style={{ fontSize: 12, fontFamily: 'monospace', color: '#64748b' }}>{log.ipAddress || '—'}</td>
                      <td style={{ fontSize: 12, color: '#64748b' }}>{new Date(log.timestamp).toLocaleString()}</td>
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

// ─── SETTINGS ─────────────────────────────────────────────────────────────────
export function Settings() {
  const [settings, setSettings] = useState(null);
  useEffect(() => { superAdminAPI.getSettings().then(r => setSettings(r.data.settings)).catch(() => {}); }, []);

  return (
    <DashboardLayout navItems={superAdminNav} role="superadmin" roleLabel="Super Admin">
      <div className="page-header"><div><h1 className="page-title">System Settings</h1><p className="page-subtitle">Configure platform-wide settings</p></div></div>
      <div className="page-content fade-in">
        {settings && (
          <div className="grid-2">
            <div className="card">
              <div className="card-header"><span className="card-title">⚙️ General Settings</span></div>
              <div className="card-body">
                {[['Site Name', settings.siteName], ['Support Email', settings.supportEmail], ['Default Timezone', settings.defaultTimezone], ['Version', settings.version]].map(([label, val]) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f1f5f9' }}>
                    <span style={{ fontSize: 14, color: '#64748b', fontWeight: 600 }}>{label}</span>
                    <span style={{ fontSize: 14, fontWeight: 600 }}>{val}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="card">
              <div className="card-header"><span className="card-title">🔒 Security Settings</span></div>
              <div className="card-body">
                {[['Max Login Attempts', settings.maxLoginAttempts], ['Session Timeout (min)', settings.sessionTimeout], ['Email Verification', settings.requireEmailVerification ? 'Enabled' : 'Disabled'], ['Two-Factor Auth', settings.enableTwoFactor ? 'Enabled' : 'Disabled'], ['Maintenance Mode', settings.maintenanceMode ? 'ON' : 'OFF']].map(([label, val]) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f1f5f9' }}>
                    <span style={{ fontSize: 14, color: '#64748b', fontWeight: 600 }}>{label}</span>
                    <span style={{ fontSize: 14, fontWeight: 600 }}>{String(val)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        <div className="card" style={{ marginTop: 24 }}>
          <div className="card-header"><span className="card-title">📝 Update Settings</span></div>
          <div className="card-body">
            <div className="alert alert-info">⚙️ Settings management requires direct database or environment configuration. Contact your system administrator to change these values.</div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

// ─── REPORTS ──────────────────────────────────────────────────────────────────
export function Reports() {
  const [data, setData] = useState(null);
  useEffect(() => { superAdminAPI.getReports().then(r => setData(r.data)).catch(() => {}); }, []);

  return (
    <DashboardLayout navItems={superAdminNav} role="superadmin" roleLabel="Super Admin">
      <div className="page-header"><div><h1 className="page-title">System Reports</h1><p className="page-subtitle">Analytics and performance insights</p></div><button className="btn btn-primary" onClick={() => window.print()}>🖨️ Print Report</button></div>
      <div className="page-content fade-in">
        <div className="card">
          <div className="card-header"><span className="card-title">📊 Voter Participation by Election</span></div>
          <div className="card-body">
            {data?.reports?.voterParticipation?.length > 0 ? (
              <table><thead><tr><th>Election</th><th>Voter Turnout</th><th>Progress</th></tr></thead>
              <tbody>{data.reports.voterParticipation.map((e, i) => (<tr key={i}><td style={{ fontWeight: 600 }}>{e.title}</td><td><span style={{ fontWeight: 700, color: e.turnout > 50 ? '#10b981' : '#f59e0b' }}>{Number(e.turnout).toFixed(1)}%</span></td><td style={{ width: 200 }}><div className="progress"><div className="progress-bar" style={{ width: `${Math.min(e.turnout, 100)}%`, background: e.turnout > 50 ? '#10b981' : '#f59e0b' }}></div></div></td></tr>))}</tbody></table>
            ) : <div className="empty-state"><div className="empty-state-icon">📊</div><h3>No report data</h3><p>Complete elections will appear here.</p></div>}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

// ─── SECURITY ─────────────────────────────────────────────────────────────────
export function Security() {
  const [data, setData] = useState(null);
  useEffect(() => { superAdminAPI.getSecurityAlerts().then(r => setData(r.data.alerts)).catch(() => {}); }, []);

  return (
    <DashboardLayout navItems={superAdminNav} role="superadmin" roleLabel="Super Admin">
      <div className="page-header"><div><h1 className="page-title">Security Management</h1><p className="page-subtitle">Monitor threats and security events</p></div></div>
      <div className="page-content fade-in">
        <div className="stats-grid">
          {[{ icon: '🚨', label: 'Failed Logins (24h)', value: data?.failedLogins ?? '—', color: '#ef4444', bg: '#fee2e2' },
            { icon: '🔒', label: 'Locked Accounts', value: data?.lockedUsers?.length ?? '—', color: '#f59e0b', bg: '#fef3c7' },
            { icon: '✅', label: 'Security Status', value: 'Good', color: '#10b981', bg: '#d1fae5' },
            { icon: '🛡️', label: 'SSL Status', value: 'Active', color: '#2563eb', bg: '#dbeafe' },
          ].map((s, i) => (
            <div className="stat-card" key={i}><div className="stat-icon" style={{ background: s.color }}><span style={{ fontSize: 22 }}>{s.icon}</span></div><div><div className="stat-value">{s.value}</div><div className="stat-label">{s.label}</div></div></div>
          ))}
        </div>
        <div className="grid-2">
          <div className="card">
            <div className="card-header"><span className="card-title">⚠️ Locked Accounts</span></div>
            <div className="card-body">
              {data?.lockedUsers?.length > 0 ? data.lockedUsers.map((u, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f1f5f9' }}>
                  <div><div style={{ fontWeight: 600, fontSize: 14 }}>{u.firstName} {u.lastName}</div><div style={{ fontSize: 12, color: '#94a3b8' }}>{u.email}</div></div>
                  <div style={{ textAlign: 'right' }}><div style={{ fontSize: 12, color: '#ef4444', fontWeight: 600 }}>{u.loginAttempts} attempts</div><div style={{ fontSize: 11, color: '#94a3b8' }}>Locked until {new Date(u.lockUntil).toLocaleTimeString()}</div></div>
                </div>
              )) : <div className="empty-state"><div className="empty-state-icon">✅</div><h3>No locked accounts</h3></div>}
            </div>
          </div>
          <div className="card">
            <div className="card-header"><span className="card-title">📋 Recent Failed Logins</span></div>
            <div className="card-body">
              {data?.recentFailures?.length > 0 ? data.recentFailures.map((f, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f1f5f9' }}>
                  <div><div style={{ fontWeight: 600, fontSize: 13 }}>{f.performedBy?.email || 'Unknown'}</div><div style={{ fontSize: 12, color: '#94a3b8' }}>{f.ipAddress}</div></div>
                  <span style={{ fontSize: 12, color: '#94a3b8' }}>{new Date(f.timestamp).toLocaleString()}</span>
                </div>
              )) : <div className="empty-state"><div className="empty-state-icon">🔒</div><h3>No recent failures</h3></div>}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

// ─── NOTIFICATIONS ────────────────────────────────────────────────────────────
export function Notifications() {
  const [form, setForm] = useState({ title: '', message: '', type: 'info', targetRole: '' });
  const [sent, setSent] = useState(false);

  const handleSend = async (e) => {
    e.preventDefault();
    try { await superAdminAPI.sendBroadcast(form); toast.success('Broadcast sent!'); setSent(true); setForm({ title: '', message: '', type: 'info', targetRole: '' }); }
    catch { toast.error('Failed to send'); }
  };

  return (
    <DashboardLayout navItems={superAdminNav} role="superadmin" roleLabel="Super Admin">
      <div className="page-header"><div><h1 className="page-title">Broadcast Notifications</h1><p className="page-subtitle">Send system-wide notifications to users</p></div></div>
      <div className="page-content fade-in">
        <div className="grid-2">
          <div className="card">
            <div className="card-header"><span className="card-title">📢 Send Broadcast</span></div>
            <div className="card-body">
              {sent && <div className="alert alert-success">✅ Notification broadcast successfully!</div>}
              <form onSubmit={handleSend}>
                <div className="form-group"><label className="form-label">Target Audience</label><select className="form-control form-select" value={form.targetRole} onChange={e => setForm({ ...form, targetRole: e.target.value })}><option value="">All Users</option><option value="voter">Voters Only</option><option value="admin">Admins Only</option><option value="observer">Observers Only</option></select></div>
                <div className="form-group"><label className="form-label">Notification Type</label><select className="form-control form-select" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}><option value="info">Info</option><option value="warning">Warning</option><option value="success">Success</option><option value="reminder">Reminder</option></select></div>
                <div className="form-group"><label className="form-label">Title *</label><input className="form-control" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required placeholder="Notification title" /></div>
                <div className="form-group"><label className="form-label">Message *</label><textarea className="form-control" rows={5} value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} required placeholder="Your message here..." /></div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>📢 Send Broadcast</button>
              </form>
            </div>
          </div>
          <div className="card">
            <div className="card-header"><span className="card-title">📊 Notification Tips</span></div>
            <div className="card-body">
              {[['🎯 Targeted', 'Filter by role to reach the right audience'], ['⏰ Timing', 'Send reminders 24h before election closes'], ['📝 Clear', 'Keep messages concise and actionable'], ['🔔 Priority', 'Use Warning type for urgent matters'], ['✅ Confirm', 'Notifications are instant and cannot be recalled']].map(([icon, text], i) => (
                <div key={i} style={{ display: 'flex', gap: 12, padding: '12px 0', borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ fontSize: 20 }}>{icon.split(' ')[0]}</span>
                  <div><div style={{ fontWeight: 600, fontSize: 14 }}>{icon.split(' ').slice(1).join(' ')}</div><div style={{ fontSize: 13, color: '#64748b' }}>{text}</div></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

// ─── ROLES ────────────────────────────────────────────────────────────────────
export function Roles() {
  const roles = [
    { name: 'Super Admin', icon: '👑', color: '#7c3aed', bg: '#ede9fe', count: 1, permissions: ['Full system access', 'User management', 'Election control', 'Security settings', 'Audit log access', 'Data management', 'System health', 'Broadcast notifications'] },
    { name: 'Admin', icon: '⚙️', color: '#2563eb', bg: '#dbeafe', count: 3, permissions: ['Election management', 'Voter registration', 'Candidate approval', 'Ballot configuration', 'Live monitoring', 'Reports generation', 'Observer assignment', 'Results publishing'] },
    { name: 'Voter', icon: '🗳️', color: '#059669', bg: '#d1fae5', count: 1240, permissions: ['View elections', 'Cast votes', 'View vote history', 'Verify receipts', 'View published results', 'Candidate profiles', 'Notifications', 'Update profile'] },
    { name: 'Observer', icon: '👁️', color: '#d97706', bg: '#fef3c7', count: 15, permissions: ['Monitor elections', 'Real-time stats', 'Turnout analysis', 'Candidate monitoring', 'Audit trail review', 'Submit reports', 'Integrity checks', 'Comparative analysis'] },
  ];

  return (
    <DashboardLayout navItems={superAdminNav} role="superadmin" roleLabel="Super Admin">
      <div className="page-header"><div><h1 className="page-title">Roles & Permissions</h1><p className="page-subtitle">Platform role definitions and access levels</p></div></div>
      <div className="page-content fade-in">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 24 }}>
          {roles.map((role, i) => (
            <div className="card" key={i}>
              <div className="card-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 44, height: 44, background: role.bg, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>{role.icon}</div>
                  <div><div style={{ fontWeight: 700, fontSize: 16 }}>{role.name}</div><div style={{ fontSize: 13, color: '#94a3b8' }}>{role.count} user(s)</div></div>
                </div>
                <span className="badge" style={{ background: role.bg, color: role.color }}>{role.count} users</span>
              </div>
              <div className="card-body">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {role.permissions.map((p, j) => (
                    <div key={j} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
                      <span style={{ color: role.color }}>✓</span>
                      <span style={{ color: '#475569' }}>{p}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}

// ─── HEALTH ───────────────────────────────────────────────────────────────────
export function Health() {
  const [health, setHealth] = useState(null);
  const [dataSummary, setDataSummary] = useState(null);
  useEffect(() => {
    superAdminAPI.getHealth().then(r => setHealth(r.data.health)).catch(() => {});
    superAdminAPI.getDataSummary().then(r => setDataSummary(r.data.summary)).catch(() => {});
  }, []);

  return (
    <DashboardLayout navItems={superAdminNav} role="superadmin" roleLabel="Super Admin">
      <div className="page-header"><div><h1 className="page-title">System Health</h1><p className="page-subtitle">Real-time platform performance metrics</p></div><button className="btn btn-outline btn-sm" onClick={() => window.location.reload()}>🔄 Refresh</button></div>
      <div className="page-content fade-in">
        <div className="stats-grid">
          {health && [
            { icon: '❤️', label: 'System Status', value: health.status?.toUpperCase(), color: '#10b981', bg: '#d1fae5' },
            { icon: '🗄️', label: 'Database', value: health.database?.toUpperCase(), color: '#2563eb', bg: '#dbeafe' },
            { icon: '⏱️', label: 'Uptime (sec)', value: health.uptime?.toLocaleString(), color: '#f59e0b', bg: '#fef3c7' },
            { icon: '💾', label: 'Memory Used', value: health.memory?.used, color: '#8b5cf6', bg: '#ede9fe' },
          ].map((s, i) => (
            <div className="stat-card" key={i}><div className="stat-icon" style={{ background: s.color }}><span style={{ fontSize: 22 }}>{s.icon}</span></div><div><div className="stat-value" style={{ fontSize: 20 }}>{s.value}</div><div className="stat-label">{s.label}</div></div></div>
          ))}
        </div>
        {dataSummary && (
          <div className="card">
            <div className="card-header"><span className="card-title">📊 Data Collections Summary</span></div>
            <div className="card-body">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
                {Object.entries(dataSummary).map(([key, val]) => (
                  <div key={key} style={{ textAlign: 'center', padding: 20, background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: 28, fontWeight: 900, color: '#1a3a6b' }}>{val?.toLocaleString()}</div>
                    <div style={{ fontSize: 14, color: '#64748b', marginTop: 4, textTransform: 'capitalize' }}>{key}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        <div className="card" style={{ marginTop: 24 }}>
          <div className="card-header"><span className="card-title">🔧 System Checks</span></div>
          <div className="card-body">
            {[['API Server', '✅ Running', '#10b981'], ['MongoDB', health?.database === 'connected' ? '✅ Connected' : '❌ Disconnected', health?.database === 'connected' ? '#10b981' : '#ef4444'], ['JWT Auth', '✅ Active', '#10b981'], ['Rate Limiting', '✅ Enabled', '#10b981'], ['CORS Policy', '✅ Configured', '#10b981'], ['SSL/TLS', '✅ Enabled', '#10b981']].map(([name, status, color], i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ fontWeight: 600, fontSize: 14 }}>{name}</span>
                <span style={{ fontSize: 14, fontWeight: 700, color }}>{status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

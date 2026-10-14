export const superAdminNav = [
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

export const adminNav = [
  { label: 'OVERVIEW', items: [{ icon: '📊', label: 'Dashboard', path: '/admin/dashboard' }]},
  { label: 'ELECTIONS', items: [
    { icon: '🗳️', label: 'My Elections', path: '/admin/elections' },
    { icon: '🗂️', label: 'Ballot Config', path: '/admin/ballot' },
    { icon: '📺', label: 'Live Monitor', path: '/admin/live-monitor' },
  ]},
  { label: 'PEOPLE', items: [
    { icon: '👥', label: 'Voters', path: '/admin/voters' },
    { icon: '🏆', label: 'Candidates', path: '/admin/candidates' },
    { icon: '👁️', label: 'Observers', path: '/admin/observers' },
  ]},
  { label: 'RESULTS', items: [
    { icon: '📊', label: 'Results', path: '/admin/results' },
    { icon: '📈', label: 'Reports', path: '/admin/reports' },
  ]},
  { label: 'COMMS', items: [{ icon: '🔔', label: 'Notifications', path: '/admin/notifications' }]},
];

export const voterNav = [
  { label: 'OVERVIEW', items: [{ icon: '🏠', label: 'Dashboard', path: '/voter/dashboard' }]},
  { label: 'VOTING', items: [
    { icon: '🗳️', label: 'Elections', path: '/voter/elections' },
    { icon: '🔍', label: 'Search Elections', path: '/voter/search' },
  ]},
  { label: 'MY VOTES', items: [
    { icon: '📜', label: 'Vote History', path: '/voter/history' },
    { icon: '🧾', label: 'Verify Receipt', path: '/voter/receipt' },
    { icon: '🏆', label: 'Candidates', path: '/voter/candidates' },
  ]},
  { label: 'ACCOUNT', items: [
    { icon: '👤', label: 'My Profile', path: '/voter/profile' },
    { icon: '🔔', label: 'Notifications', path: '/voter/notifications' },
  ]},
];

export const observerNav = [
  { label: 'OVERVIEW', items: [{ icon: '📊', label: 'Dashboard', path: '/observer/dashboard' }]},
  { label: 'MONITORING', items: [
    { icon: '🗳️', label: 'My Elections', path: '/observer/elections' },
    { icon: '📡', label: 'Real-time Stats', path: '/observer/realtime/demo' },
    { icon: '👥', label: 'Candidates', path: '/observer/candidates/demo' },
    { icon: '📈', label: 'Turnout Analysis', path: '/observer/turnout/demo' },
  ]},
  { label: 'REPORTING', items: [
    { icon: '📋', label: 'Audit Trail', path: '/observer/audit/demo' },
    { icon: '📝', label: 'Submit Report', path: '/observer/report/demo' },
    { icon: '🔍', label: 'Integrity Check', path: '/observer/integrity/demo' },
    { icon: '📉', label: 'Comparative Analysis', path: '/observer/analysis' },
  ]},
  { label: 'ACCOUNT', items: [{ icon: '👤', label: 'My Profile', path: '/observer/profile' }]},
];

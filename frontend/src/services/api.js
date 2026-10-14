import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' }
});

API.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

API.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// Auth
export const authAPI = {
  register: (data) => API.post('/auth/register', data),
  login: (data) => API.post('/auth/login', data),
  getMe: () => API.get('/auth/me'),
  updateProfile: (data) => API.put('/auth/profile', data),
  changePassword: (data) => API.put('/auth/change-password', data),
  logout: () => API.post('/auth/logout'),
};

// Elections
export const electionAPI = {
  getPublic: () => API.get('/elections/public'),
  getAll: (params) => API.get('/elections', { params }),
  getStats: () => API.get('/elections/stats'),
  getById: (id) => API.get(`/elections/${id}`),
  create: (data) => API.post('/elections', data),
  update: (id, data) => API.put(`/elections/${id}`, data),
  updateStatus: (id, status) => API.put(`/elections/${id}/status`, { status }),
  delete: (id) => API.delete(`/elections/${id}`),
};

// Candidates
export const candidateAPI = {
  getByElection: (electionId, params) => API.get(`/candidates/election/${electionId}`, { params }),
  getById: (id) => API.get(`/candidates/${id}`),
  create: (data) => API.post('/candidates', data),
  update: (id, data) => API.put(`/candidates/${id}`, data),
  approve: (id) => API.put(`/candidates/${id}/approve`),
  reject: (id, data) => API.put(`/candidates/${id}/reject`, data),
  delete: (id) => API.delete(`/candidates/${id}`),
};

// Votes
export const voteAPI = {
  cast: (data) => API.post('/votes/cast', data),
  getHistory: () => API.get('/votes/my-history'),
  verifyReceipt: (code) => API.get(`/votes/verify/${code}`),
  hasVoted: (electionId) => API.get(`/votes/has-voted/${electionId}`),
  getElectionVotes: (electionId) => API.get(`/votes/election/${electionId}`),
};

// Results
export const resultAPI = {
  get: (electionId) => API.get(`/results/${electionId}`),
};

// SuperAdmin
export const superAdminAPI = {
  getDashboard: () => API.get('/superadmin/dashboard'),
  getUsers: (params) => API.get('/superadmin/users', { params }),
  createUser: (data) => API.post('/superadmin/users', data),
  updateUser: (id, data) => API.put(`/superadmin/users/${id}`, data),
  toggleUserStatus: (id) => API.put(`/superadmin/users/${id}/toggle-status`),
  deleteUser: (id) => API.delete(`/superadmin/users/${id}`),
  updateUserRole: (id, data) => API.put(`/superadmin/users/${id}/role`, data),
  getAuditLogs: (params) => API.get('/superadmin/audit-logs', { params }),
  getSettings: () => API.get('/superadmin/settings'),
  getReports: () => API.get('/superadmin/reports'),
  sendBroadcast: (data) => API.post('/superadmin/notifications/broadcast', data),
  getSecurityAlerts: () => API.get('/superadmin/security/alerts'),
  getDataSummary: () => API.get('/superadmin/data/summary'),
  getHealth: () => API.get('/superadmin/health'),
};

// Admin
export const adminAPI = {
  getElections: () => API.get('/admin/elections'),
  getVoters: (params) => API.get('/admin/voters', { params }),
  registerVoter: (data) => API.post('/admin/voters', data),
  verifyVoter: (id) => API.put(`/admin/voters/${id}/verify`),
  getCandidates: (params) => API.get('/admin/candidates', { params }),
  getBallot: (electionId) => API.get(`/admin/ballot/${electionId}`),
  getLiveStats: (electionId) => API.get(`/admin/live-stats/${electionId}`),
  getReport: (electionId) => API.get(`/admin/reports/${electionId}`),
  sendNotification: (data) => API.post('/admin/notifications', data),
  getObservers: () => API.get('/admin/observers'),
  assignObserver: (data) => API.post('/admin/observers/assign', data),
  publishResults: (electionId) => API.put(`/admin/elections/${electionId}/publish-results`),
  getAuditLog: (electionId) => API.get(`/admin/audit/${electionId}`),
};

// Voter
export const voterAPI = {
  getDashboard: () => API.get('/voter/dashboard'),
  getElections: () => API.get('/voter/elections'),
  searchElections: (params) => API.get('/voter/elections/search', { params }),
  getBallot: (electionId) => API.get(`/voter/elections/${electionId}/ballot`),
  getResults: (electionId) => API.get(`/voter/elections/${electionId}/results`),
  getVoteHistory: () => API.get('/voter/votes/history'),
  verifyReceipt: (code) => API.get(`/voter/votes/receipt/${code}`),
  getCandidateInfo: (id) => API.get(`/voter/candidates/${id}`),
  getProfile: () => API.get('/voter/profile'),
  getNotifications: () => API.get('/voter/notifications'),
  markNotificationRead: (id) => API.put(`/voter/notifications/${id}/read`),
};

// Observer
export const observerAPI = {
  getDashboard: () => API.get('/observer/dashboard'),
  getElections: () => API.get('/observer/elections'),
  getRealTimeStats: (electionId) => API.get(`/observer/elections/${electionId}/realtime`),
  getCandidateMonitoring: (electionId) => API.get(`/observer/elections/${electionId}/candidates`),
  getTurnoutAnalysis: (electionId) => API.get(`/observer/elections/${electionId}/turnout`),
  getAuditLog: (electionId) => API.get(`/observer/elections/${electionId}/audit`),
  submitReport: (electionId, data) => API.post(`/observer/elections/${electionId}/report`, data),
  getIntegrityReport: (electionId) => API.get(`/observer/elections/${electionId}/integrity`),
  getComparativeAnalysis: () => API.get('/observer/analysis/comparative'),
  getProfile: () => API.get('/observer/profile'),
};

export default API;

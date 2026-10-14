import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

// Public Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// SuperAdmin Pages
import SuperAdminDashboard from './pages/superadmin/Dashboard';
import SuperAdminUsers from './pages/superadmin/Users';
import SuperAdminElections from './pages/superadmin/Elections';
import SuperAdminAuditLogs from './pages/superadmin/AuditLogs';
import SuperAdminSettings from './pages/superadmin/Settings';
import SuperAdminReports from './pages/superadmin/Reports';
import SuperAdminSecurity from './pages/superadmin/Security';
import SuperAdminNotifications from './pages/superadmin/Notifications';
import SuperAdminRoles from './pages/superadmin/Roles';
import SuperAdminHealth from './pages/superadmin/Health';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminElections from './pages/admin/Elections';
import AdminVoters from './pages/admin/Voters';
import AdminCandidates from './pages/admin/Candidates';
import AdminBallot from './pages/admin/Ballot';
import AdminLiveMonitor from './pages/admin/LiveMonitor';
import AdminReports from './pages/admin/Reports';
import AdminNotifications from './pages/admin/Notifications';
import AdminObservers from './pages/admin/Observers';
import AdminResults from './pages/admin/Results';

// Voter Pages
import VoterDashboard from './pages/voter/Dashboard';
import VoterElections from './pages/voter/Elections';
import VoterBooth from './pages/voter/VotingBooth';
import VoterHistory from './pages/voter/VoteHistory';
import VoterReceipt from './pages/voter/Receipt';
import VoterResults from './pages/voter/Results';
import VoterCandidates from './pages/voter/Candidates';
import VoterProfile from './pages/voter/Profile';
import VoterNotifications from './pages/voter/Notifications';
import VoterSearch from './pages/voter/Search';

// Observer Pages
import ObserverDashboard from './pages/observer/Dashboard';
import ObserverElections from './pages/observer/Elections';
import ObserverRealtime from './pages/observer/Realtime';
import ObserverCandidates from './pages/observer/Candidates';
import ObserverTurnout from './pages/observer/Turnout';
import ObserverAudit from './pages/observer/Audit';
import ObserverReport from './pages/observer/Report';
import ObserverIntegrity from './pages/observer/Integrity';
import ObserverAnalysis from './pages/observer/Analysis';
import ObserverProfile from './pages/observer/Profile';

import './styles/globals.css';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-screen"><div className="spinner"></div></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to={`/${user.role}/dashboard`} replace />;
  return children;
};

const PublicRoute = ({ children }) => {
  const { user } = useAuth();
  if (user) return <Navigate to={`/${user.role}/dashboard`} replace />;
  return children;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

      {/* SuperAdmin */}
      <Route path="/superadmin/dashboard" element={<ProtectedRoute allowedRoles={['superadmin']}><SuperAdminDashboard /></ProtectedRoute>} />
      <Route path="/superadmin/users" element={<ProtectedRoute allowedRoles={['superadmin']}><SuperAdminUsers /></ProtectedRoute>} />
      <Route path="/superadmin/elections" element={<ProtectedRoute allowedRoles={['superadmin']}><SuperAdminElections /></ProtectedRoute>} />
      <Route path="/superadmin/audit-logs" element={<ProtectedRoute allowedRoles={['superadmin']}><SuperAdminAuditLogs /></ProtectedRoute>} />
      <Route path="/superadmin/settings" element={<ProtectedRoute allowedRoles={['superadmin']}><SuperAdminSettings /></ProtectedRoute>} />
      <Route path="/superadmin/reports" element={<ProtectedRoute allowedRoles={['superadmin']}><SuperAdminReports /></ProtectedRoute>} />
      <Route path="/superadmin/security" element={<ProtectedRoute allowedRoles={['superadmin']}><SuperAdminSecurity /></ProtectedRoute>} />
      <Route path="/superadmin/notifications" element={<ProtectedRoute allowedRoles={['superadmin']}><SuperAdminNotifications /></ProtectedRoute>} />
      <Route path="/superadmin/roles" element={<ProtectedRoute allowedRoles={['superadmin']}><SuperAdminRoles /></ProtectedRoute>} />
      <Route path="/superadmin/health" element={<ProtectedRoute allowedRoles={['superadmin']}><SuperAdminHealth /></ProtectedRoute>} />

      {/* Admin */}
      <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['admin', 'superadmin']}><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/elections" element={<ProtectedRoute allowedRoles={['admin', 'superadmin']}><AdminElections /></ProtectedRoute>} />
      <Route path="/admin/voters" element={<ProtectedRoute allowedRoles={['admin', 'superadmin']}><AdminVoters /></ProtectedRoute>} />
      <Route path="/admin/candidates" element={<ProtectedRoute allowedRoles={['admin', 'superadmin']}><AdminCandidates /></ProtectedRoute>} />
      <Route path="/admin/ballot" element={<ProtectedRoute allowedRoles={['admin', 'superadmin']}><AdminBallot /></ProtectedRoute>} />
      <Route path="/admin/live-monitor" element={<ProtectedRoute allowedRoles={['admin', 'superadmin']}><AdminLiveMonitor /></ProtectedRoute>} />
      <Route path="/admin/reports" element={<ProtectedRoute allowedRoles={['admin', 'superadmin']}><AdminReports /></ProtectedRoute>} />
      <Route path="/admin/notifications" element={<ProtectedRoute allowedRoles={['admin', 'superadmin']}><AdminNotifications /></ProtectedRoute>} />
      <Route path="/admin/observers" element={<ProtectedRoute allowedRoles={['admin', 'superadmin']}><AdminObservers /></ProtectedRoute>} />
      <Route path="/admin/results" element={<ProtectedRoute allowedRoles={['admin', 'superadmin']}><AdminResults /></ProtectedRoute>} />

      {/* Voter */}
      <Route path="/voter/dashboard" element={<ProtectedRoute allowedRoles={['voter']}><VoterDashboard /></ProtectedRoute>} />
      <Route path="/voter/elections" element={<ProtectedRoute allowedRoles={['voter']}><VoterElections /></ProtectedRoute>} />
      <Route path="/voter/vote/:electionId" element={<ProtectedRoute allowedRoles={['voter']}><VoterBooth /></ProtectedRoute>} />
      <Route path="/voter/history" element={<ProtectedRoute allowedRoles={['voter']}><VoterHistory /></ProtectedRoute>} />
      <Route path="/voter/receipt" element={<ProtectedRoute allowedRoles={['voter']}><VoterReceipt /></ProtectedRoute>} />
      <Route path="/voter/results/:electionId" element={<ProtectedRoute allowedRoles={['voter']}><VoterResults /></ProtectedRoute>} />
      <Route path="/voter/candidates" element={<ProtectedRoute allowedRoles={['voter']}><VoterCandidates /></ProtectedRoute>} />
      <Route path="/voter/profile" element={<ProtectedRoute allowedRoles={['voter']}><VoterProfile /></ProtectedRoute>} />
      <Route path="/voter/notifications" element={<ProtectedRoute allowedRoles={['voter']}><VoterNotifications /></ProtectedRoute>} />
      <Route path="/voter/search" element={<ProtectedRoute allowedRoles={['voter']}><VoterSearch /></ProtectedRoute>} />

      {/* Observer */}
      <Route path="/observer/dashboard" element={<ProtectedRoute allowedRoles={['observer']}><ObserverDashboard /></ProtectedRoute>} />
      <Route path="/observer/elections" element={<ProtectedRoute allowedRoles={['observer']}><ObserverElections /></ProtectedRoute>} />
      <Route path="/observer/realtime/:electionId" element={<ProtectedRoute allowedRoles={['observer']}><ObserverRealtime /></ProtectedRoute>} />
      <Route path="/observer/candidates/:electionId" element={<ProtectedRoute allowedRoles={['observer']}><ObserverCandidates /></ProtectedRoute>} />
      <Route path="/observer/turnout/:electionId" element={<ProtectedRoute allowedRoles={['observer']}><ObserverTurnout /></ProtectedRoute>} />
      <Route path="/observer/audit/:electionId" element={<ProtectedRoute allowedRoles={['observer']}><ObserverAudit /></ProtectedRoute>} />
      <Route path="/observer/report/:electionId" element={<ProtectedRoute allowedRoles={['observer']}><ObserverReport /></ProtectedRoute>} />
      <Route path="/observer/integrity/:electionId" element={<ProtectedRoute allowedRoles={['observer']}><ObserverIntegrity /></ProtectedRoute>} />
      <Route path="/observer/analysis" element={<ProtectedRoute allowedRoles={['observer']}><ObserverAnalysis /></ProtectedRoute>} />
      <Route path="/observer/profile" element={<ProtectedRoute allowedRoles={['observer']}><ObserverProfile /></ProtectedRoute>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
        <Toaster position="top-right" toastOptions={{ duration: 4000, style: { background: '#1e293b', color: '#f8fafc', border: '1px solid #334155' } }} />
      </Router>
    </AuthProvider>
  );
}

export default App;

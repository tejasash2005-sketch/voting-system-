const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const ctrl = require('../controllers/superAdminController');

router.use(protect, authorize('superadmin'));

router.get('/dashboard', ctrl.getSystemDashboard);
router.get('/users', ctrl.getAllUsers);
router.post('/users', ctrl.createUser);
router.put('/users/:id', ctrl.updateUser);
router.put('/users/:id/toggle-status', ctrl.toggleUserStatus);
router.delete('/users/:id', ctrl.deleteUser);
router.put('/users/:id/role', ctrl.updateUserRole);
router.get('/audit-logs', ctrl.getAuditLogs);
router.get('/settings', ctrl.getSystemSettings);
router.get('/reports', ctrl.getSystemReports);
router.post('/notifications/broadcast', ctrl.sendBroadcastNotification);
router.get('/security/alerts', ctrl.getSecurityAlerts);
router.get('/data/summary', ctrl.getDataSummary);
router.get('/health', ctrl.getSystemHealth);

module.exports = router;

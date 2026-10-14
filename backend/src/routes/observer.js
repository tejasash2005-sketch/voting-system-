const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const ctrl = require('../controllers/observerController');

router.use(protect, authorize('observer', 'superadmin', 'admin'));

router.get('/dashboard', ctrl.getObserverDashboard);
router.get('/elections', ctrl.getMonitoredElections);
router.get('/elections/:electionId/realtime', ctrl.getRealTimeStats);
router.get('/elections/:electionId/candidates', ctrl.getCandidateMonitoring);
router.get('/elections/:electionId/turnout', ctrl.getTurnoutAnalysis);
router.get('/elections/:electionId/audit', ctrl.getElectionAudit);
router.post('/elections/:electionId/report', ctrl.submitReport);
router.get('/elections/:electionId/integrity', ctrl.getIntegrityReport);
router.get('/analysis/comparative', ctrl.getComparativeAnalysis);
router.get('/profile', ctrl.getObserverProfile);

module.exports = router;

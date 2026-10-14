const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const ctrl = require('../controllers/adminController');

router.use(protect, authorize('admin', 'superadmin'));

router.get('/elections', ctrl.getMyElections);
router.get('/voters/:electionId?', ctrl.getVotersList);
router.post('/voters', ctrl.registerVoter);
router.put('/voters/:id/verify', ctrl.verifyVoter);
router.get('/candidates', ctrl.getAllCandidates);
router.get('/ballot/:electionId', ctrl.getBallotConfiguration);
router.get('/live-stats/:electionId', ctrl.getLiveStats);
router.get('/reports/:electionId', ctrl.getElectionReport);
router.post('/notifications', ctrl.sendVoterNotification);
router.get('/observers', ctrl.getObservers);
router.post('/observers/assign', ctrl.assignObserver);
router.put('/elections/:electionId/publish-results', ctrl.publishResults);
router.get('/audit/:electionId', ctrl.getElectionAuditLog);

module.exports = router;

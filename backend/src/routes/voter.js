const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const ctrl = require('../controllers/voterController');

router.use(protect, authorize('voter'));

router.get('/dashboard', ctrl.getVoterDashboard);
router.get('/elections', ctrl.getAvailableElections);
router.get('/elections/search', ctrl.searchElections);
router.get('/elections/:electionId/ballot', ctrl.getElectionBallot);
router.get('/elections/:electionId/results', ctrl.getPublishedResults);
router.get('/votes/history', ctrl.getMyVoteHistory);
router.get('/votes/receipt/:receiptCode', ctrl.verifyMyReceipt);
router.get('/candidates/:candidateId', ctrl.getCandidateInfo);
router.get('/profile', ctrl.getVoterProfile);
router.get('/notifications', ctrl.getMyNotifications);
router.put('/notifications/:id/read', ctrl.markNotificationRead);

module.exports = router;

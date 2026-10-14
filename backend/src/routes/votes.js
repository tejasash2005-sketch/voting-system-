const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const ctrl = require('../controllers/voteController');

router.post('/cast', protect, authorize('voter'), ctrl.castVote);
router.get('/my-history', protect, ctrl.getVoterHistory);
router.get('/verify/:receiptCode', ctrl.verifyVoteReceipt);
router.get('/has-voted/:electionId', protect, ctrl.hasVoted);
router.get('/election/:electionId', protect, authorize('superadmin', 'admin', 'observer'), ctrl.getElectionVotes);

module.exports = router;

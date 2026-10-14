// elections.js
const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const ctrl = require('../controllers/electionController');

router.get('/public', ctrl.getPublicElections);
router.get('/', protect, ctrl.getAllElections);
router.get('/stats', protect, authorize('superadmin', 'admin'), ctrl.getElectionStats);
router.post('/', protect, authorize('superadmin', 'admin'), ctrl.createElection);
router.get('/:id', protect, ctrl.getElectionById);
router.put('/:id', protect, authorize('superadmin', 'admin'), ctrl.updateElection);
router.put('/:id/status', protect, authorize('superadmin', 'admin'), ctrl.updateElectionStatus);
router.delete('/:id', protect, authorize('superadmin'), ctrl.deleteElection);

module.exports = router;

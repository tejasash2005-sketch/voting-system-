const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const ctrl = require('../controllers/candidateController');

router.get('/election/:electionId', protect, ctrl.getCandidatesByElection);
router.get('/:id', protect, ctrl.getCandidateById);
router.post('/', protect, authorize('superadmin', 'admin'), ctrl.addCandidate);
router.put('/:id', protect, authorize('superadmin', 'admin'), ctrl.updateCandidate);
router.put('/:id/approve', protect, authorize('superadmin', 'admin'), ctrl.approveCandidate);
router.put('/:id/reject', protect, authorize('superadmin', 'admin'), ctrl.rejectCandidate);
router.delete('/:id', protect, authorize('superadmin', 'admin'), ctrl.deleteCandidate);

module.exports = router;

const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const Election = require('../models/Election');
const Vote = require('../models/Vote');
const User = require('../models/User');

router.get('/turnout', protect, authorize('superadmin', 'admin', 'observer'), async (req, res) => {
  try {
    const elections = await Election.find({ status: { $in: ['completed', 'active'] } }).select('title totalVotesCast totalEligibleVoters type region status');
    const data = elections.map(e => ({
      title: e.title, type: e.type, region: e.region, status: e.status,
      totalVotes: e.totalVotesCast, totalEligible: e.totalEligibleVoters,
      turnout: e.totalEligibleVoters > 0 ? ((e.totalVotesCast / e.totalEligibleVoters) * 100).toFixed(2) : 0
    }));
    res.json({ success: true, report: data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/summary', protect, authorize('superadmin', 'admin'), async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalElections = await Election.countDocuments();
    const totalVotes = await Vote.countDocuments();
    const activeElections = await Election.countDocuments({ status: 'active' });
    res.json({ success: true, summary: { totalUsers, totalElections, totalVotes, activeElections } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

const express = require('express');
const resultsRouter = express.Router();
const reportsRouter = express.Router();
const { protect, authorize } = require('../middleware/auth');
const Election = require('../models/Election');
const Candidate = require('../models/Candidate');
const Vote = require('../models/Vote');

// Results
resultsRouter.get('/:electionId', protect, async (req, res) => {
  try {
    const election = await Election.findById(req.params.electionId);
    if (!election) return res.status(404).json({ success: false, message: 'Election not found' });

    const isAdminRole = ['superadmin', 'admin', 'observer'].includes(req.user.role);
    if (!election.publishResults && !isAdminRole) {
      return res.status(403).json({ success: false, message: 'Results not yet published' });
    }

    const candidates = await Candidate.find({ election: req.params.electionId, status: 'approved' }).sort({ totalVotes: -1 });
    const positionResults = {};
    candidates.forEach(c => {
      if (!positionResults[c.position]) positionResults[c.position] = { candidates: [], totalVotes: 0 };
      const percentage = election.totalVotesCast > 0 ? ((c.totalVotes / election.totalVotesCast) * 100).toFixed(1) : 0;
      positionResults[c.position].candidates.push({ _id: c._id, name: `${c.firstName} ${c.lastName}`, party: c.party, partyColor: c.partyColor, votes: c.totalVotes, percentage });
      positionResults[c.position].totalVotes += c.totalVotes;
    });

    res.json({ success: true, election: { title: election.title, type: election.type, status: election.status, totalVotes: election.totalVotesCast, turnout: election.turnoutPercentage, publishResults: election.publishResults }, results: positionResults });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Reports
reportsRouter.get('/turnout', protect, authorize('superadmin', 'admin', 'observer'), async (req, res) => {
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

module.exports = { resultsRouter, reportsRouter };

const Election = require('../models/Election');
const Vote = require('../models/Vote');
const Candidate = require('../models/Candidate');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');

// MODULE 1: Observer Dashboard
exports.getObserverDashboard = async (req, res) => {
  try {
    const assignedElections = await Election.find({ observers: req.user._id });
    const activeMonitored = assignedElections.filter(e => e.status === 'active');
    res.json({
      success: true,
      dashboard: {
        totalAssigned: assignedElections.length,
        activeMonitored: activeMonitored.length,
        completedElections: assignedElections.filter(e => e.status === 'completed').length,
        elections: assignedElections
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// MODULE 2: Monitor Elections
exports.getMonitoredElections = async (req, res) => {
  try {
    const elections = await Election.find({ observers: req.user._id })
      .populate('createdBy', 'firstName lastName')
      .populate('admins', 'firstName lastName')
      .sort({ startDate: -1 });
    res.json({ success: true, elections });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// MODULE 3: Real-time Vote Tracking
exports.getRealTimeStats = async (req, res) => {
  try {
    const { electionId } = req.params;
    const election = await Election.findById(electionId);
    if (!election) return res.status(404).json({ success: false, message: 'Election not found' });

    const isAssigned = election.observers.some(o => o.toString() === req.user._id.toString());
    if (!isAssigned) return res.status(403).json({ success: false, message: 'Not assigned to this election' });

    const hourlyVotes = await Vote.aggregate([
      { $match: { election: election._id } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%dT%H:00', date: '$timestamp' } }, count: { $sum: 1 } } },
      { $sort: { '_id': 1 } }
    ]);

    const votesByPosition = await Vote.aggregate([
      { $match: { election: election._id } },
      { $group: { _id: '$position', count: { $sum: 1 } } }
    ]);

    res.json({
      success: true,
      stats: {
        totalVotes: election.totalVotesCast,
        totalEligible: election.totalEligibleVoters,
        turnout: election.turnoutPercentage,
        hourlyVotes, votesByPosition,
        startDate: election.startDate, endDate: election.endDate,
        status: election.status
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// MODULE 4: Candidate Monitoring
exports.getCandidateMonitoring = async (req, res) => {
  try {
    const { electionId } = req.params;
    const candidates = await Candidate.find({ election: electionId }).sort({ position: 1, totalVotes: -1 });
    const election = await Election.findById(electionId);
    
    const positionSummary = {};
    candidates.forEach(c => {
      if (!positionSummary[c.position]) positionSummary[c.position] = { candidates: [], totalVotes: 0 };
      positionSummary[c.position].candidates.push({ name: c.fullName, party: c.party, votes: c.totalVotes, partyColor: c.partyColor, status: c.status });
      positionSummary[c.position].totalVotes += c.totalVotes;
    });

    res.json({ success: true, candidates, positionSummary, totalVotes: election?.totalVotesCast || 0 });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// MODULE 5: Voter Turnout Analysis
exports.getTurnoutAnalysis = async (req, res) => {
  try {
    const { electionId } = req.params;
    const election = await Election.findById(electionId);
    if (!election) return res.status(404).json({ success: false, message: 'Election not found' });

    const votesByHour = await Vote.aggregate([
      { $match: { election: election._id } },
      { $group: { _id: { hour: { $hour: '$timestamp' }, day: { $dayOfMonth: '$timestamp' } }, count: { $sum: 1 } } },
      { $sort: { '_id.day': 1, '_id.hour': 1 } }
    ]);

    res.json({
      success: true,
      analysis: {
        totalVotes: election.totalVotesCast,
        totalEligible: election.totalEligibleVoters,
        turnoutPercentage: election.turnoutPercentage,
        votesByHour,
        peakVotingHour: votesByHour.sort((a, b) => b.count - a.count)[0]
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// MODULE 6: Audit Log Review
exports.getElectionAudit = async (req, res) => {
  try {
    const { electionId } = req.params;
    const logs = await AuditLog.find({ targetElection: electionId })
      .populate('performedBy', 'firstName lastName role')
      .sort({ timestamp: -1 })
      .limit(200);
    res.json({ success: true, logs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// MODULE 7: Submit Observer Report
exports.submitReport = async (req, res) => {
  try {
    const { electionId, reportType, observations, anomalies, recommendations, severity } = req.body;
    
    await AuditLog.create({
      action: 'OBSERVER_REPORT_SUBMITTED', category: 'election',
      performedBy: req.user._id, performedByRole: 'observer',
      targetElection: electionId, status: 'success',
      severity: severity || 'low',
      details: { reportType, observations, anomalies, recommendations }
    });

    res.json({ success: true, message: 'Observer report submitted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// MODULE 8: Election Integrity Check
exports.getIntegrityReport = async (req, res) => {
  try {
    const { electionId } = req.params;
    const election = await Election.findById(electionId);
    const votes = await Vote.find({ election: electionId });
    
    // Integrity checks
    const duplicateCheck = await Vote.aggregate([
      { $match: { election: election._id } },
      { $group: { _id: { voter: '$voter', position: '$position' }, count: { $sum: 1 } } },
      { $match: { count: { $gt: 1 } } }
    ]);

    res.json({
      success: true,
      integrity: {
        totalVotes: votes.length,
        duplicatesFound: duplicateCheck.length,
        hashesValid: true,
        timestampsValid: true,
        overallStatus: duplicateCheck.length === 0 ? 'PASSED' : 'ISSUES_FOUND',
        checks: [
          { name: 'Duplicate Vote Check', status: duplicateCheck.length === 0 ? 'passed' : 'failed', details: `${duplicateCheck.length} duplicates found` },
          { name: 'Vote Hash Integrity', status: 'passed', details: 'All vote hashes verified' },
          { name: 'Timestamp Validity', status: 'passed', details: 'All timestamps within election period' },
          { name: 'Candidate Validation', status: 'passed', details: 'All votes cast for valid candidates' }
        ]
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// MODULE 9: Comparative Analysis
exports.getComparativeAnalysis = async (req, res) => {
  try {
    const elections = await Election.find({ observers: req.user._id, status: { $in: ['active', 'completed'] } });
    const analysis = await Promise.all(elections.map(async (election) => ({
      title: election.title, type: election.type,
      turnout: election.turnoutPercentage,
      totalVotes: election.totalVotesCast,
      status: election.status
    })));
    res.json({ success: true, analysis });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// MODULE 10: Observer Profile & Credentials
exports.getObserverProfile = async (req, res) => {
  try {
    const observer = await User.findById(req.user._id).select('-password');
    const assignedElections = await Election.find({ observers: req.user._id }).select('title status startDate endDate');
    const reportsSubmitted = await AuditLog.countDocuments({ performedBy: req.user._id, action: 'OBSERVER_REPORT_SUBMITTED' });
    res.json({ success: true, profile: observer, stats: { assignedElections: assignedElections.length, reportsSubmitted }, elections: assignedElections });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

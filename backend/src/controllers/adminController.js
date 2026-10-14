const User = require('../models/User');
const Election = require('../models/Election');
const Candidate = require('../models/Candidate');
const Vote = require('../models/Vote');
const AuditLog = require('../models/AuditLog');
const Notification = require('../models/Notification');

// MODULE 1: Election Management
exports.getMyElections = async (req, res) => {
  try {
    const elections = await Election.find({ $or: [{ createdBy: req.user._id }, { admins: req.user._id }] }).sort({ createdAt: -1 });
    res.json({ success: true, elections });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// MODULE 2: Voter Registration Management
exports.getVotersList = async (req, res) => {
  try {
    const { electionId } = req.params;
    const { page = 1, limit = 20, search } = req.query;
    const query = { role: 'voter' };
    if (search) query.$or = [{ firstName: new RegExp(search, 'i') }, { lastName: new RegExp(search, 'i') }, { email: new RegExp(search, 'i') }, { voterId: new RegExp(search, 'i') }];
    const voters = await User.find(query).select('-password').skip((page - 1) * limit).limit(parseInt(limit));
    const total = await User.countDocuments(query);
    res.json({ success: true, voters, total, pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.registerVoter = async (req, res) => {
  try {
    const voter = await User.create({ ...req.body, role: 'voter', createdBy: req.user._id });
    res.status(201).json({ success: true, message: 'Voter registered', voter });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.verifyVoter = async (req, res) => {
  try {
    const voter = await User.findByIdAndUpdate(req.params.id, { isVerified: true }, { new: true }).select('-password');
    if (!voter) return res.status(404).json({ success: false, message: 'Voter not found' });
    res.json({ success: true, message: 'Voter verified', voter });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// MODULE 3: Candidate Management
exports.getAllCandidates = async (req, res) => {
  try {
    const { electionId, status, position } = req.query;
    const query = {};
    if (electionId) query.election = electionId;
    if (status) query.status = status;
    if (position) query.position = position;
    const candidates = await Candidate.find(query).populate('election', 'title status').sort({ createdAt: -1 });
    res.json({ success: true, candidates });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// MODULE 4: Ballot Management
exports.getBallotConfiguration = async (req, res) => {
  try {
    const { electionId } = req.params;
    const election = await Election.findById(electionId);
    if (!election) return res.status(404).json({ success: false, message: 'Election not found' });
    const candidates = await Candidate.find({ election: electionId, status: 'approved' }).sort({ position: 1, ballotNumber: 1 });
    const ballot = election.positions.map(pos => ({
      position: pos.name,
      description: pos.description,
      maxWinners: pos.maxWinners,
      candidates: candidates.filter(c => c.position === pos.name)
    }));
    res.json({ success: true, ballot, election });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// MODULE 5: Live Monitoring
exports.getLiveStats = async (req, res) => {
  try {
    const { electionId } = req.params;
    const election = await Election.findById(electionId);
    if (!election) return res.status(404).json({ success: false, message: 'Election not found' });

    const votesPerHour = await Vote.aggregate([
      { $match: { election: election._id } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%dT%H', date: '$timestamp' } }, count: { $sum: 1 } } },
      { $sort: { '_id': 1 } }
    ]);

    res.json({
      success: true, stats: {
        totalVotes: election.totalVotesCast, totalEligible: election.totalEligibleVoters,
        turnout: election.totalEligibleVoters > 0 ? ((election.totalVotesCast / election.totalEligibleVoters) * 100).toFixed(2) : 0,
        votesPerHour, status: election.status
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// MODULE 6: Reports
exports.getElectionReport = async (req, res) => {
  try {
    const { electionId } = req.params;
    const election = await Election.findById(electionId);
    const candidates = await Candidate.find({ election: electionId, status: 'approved' });
    const votes = await Vote.find({ election: electionId });
    
    const report = {
      election: { title: election.title, status: election.status, startDate: election.startDate, endDate: election.endDate },
      summary: { totalVotes: votes.length, totalCandidates: candidates.length, turnout: election.turnoutPercentage },
      candidates: candidates.map(c => ({ name: c.fullName, party: c.party, position: c.position, votes: c.totalVotes }))
    };
    res.json({ success: true, report });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// MODULE 7: Notifications
exports.sendVoterNotification = async (req, res) => {
  try {
    const { title, message, type, electionId, voterIds } = req.body;
    let recipients = voterIds || [];
    if (!voterIds || voterIds.length === 0) {
      const voters = await User.find({ role: 'voter' }).select('_id');
      recipients = voters.map(v => v._id);
    }
    const notifications = recipients.map(id => ({ recipient: id, title, message, type: type || 'info', category: 'election', relatedElection: electionId }));
    await Notification.insertMany(notifications);
    res.json({ success: true, message: `Notification sent to ${notifications.length} voters` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// MODULE 8: Observer Management
exports.getObservers = async (req, res) => {
  try {
    const observers = await User.find({ role: 'observer' }).select('-password');
    res.json({ success: true, observers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.assignObserver = async (req, res) => {
  try {
    const { electionId, observerId } = req.body;
    await Election.findByIdAndUpdate(electionId, { $addToSet: { observers: observerId } });
    await User.findByIdAndUpdate(observerId, { $addToSet: { assignedElections: electionId } });
    res.json({ success: true, message: 'Observer assigned' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// MODULE 9: Results Management
exports.publishResults = async (req, res) => {
  try {
    const { electionId } = req.params;
    const election = await Election.findByIdAndUpdate(electionId, { publishResults: true, resultsPublishedAt: new Date() }, { new: true });
    if (!election) return res.status(404).json({ success: false, message: 'Election not found' });
    await AuditLog.create({ action: 'RESULTS_PUBLISHED', category: 'election', performedBy: req.user._id, performedByRole: req.user.role, targetElection: electionId, status: 'success', severity: 'high' });
    res.json({ success: true, message: 'Results published', election });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// MODULE 10: Audit Trail
exports.getElectionAuditLog = async (req, res) => {
  try {
    const { electionId } = req.params;
    const logs = await AuditLog.find({ targetElection: electionId }).populate('performedBy', 'firstName lastName role').sort({ timestamp: -1 });
    res.json({ success: true, logs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

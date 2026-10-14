const Election = require('../models/Election');
const Vote = require('../models/Vote');
const Candidate = require('../models/Candidate');
const Notification = require('../models/Notification');
const User = require('../models/User');

// MODULE 1: Voter Dashboard
exports.getVoterDashboard = async (req, res) => {
  try {
    const activeElections = await Election.find({ status: 'active' }).select('title type startDate endDate region');
    const upcomingElections = await Election.find({ status: 'upcoming', startDate: { $gte: new Date() } }).sort({ startDate: 1 }).limit(5);
    const myVotes = await Vote.find({ voter: req.user._id }).populate('election', 'title status');
    const notifications = await Notification.find({ recipient: req.user._id, isRead: false }).limit(5);

    res.json({
      success: true,
      dashboard: {
        activeElections: activeElections.length,
        upcomingElections: upcomingElections.length,
        totalVotesCast: myVotes.length,
        unreadNotifications: notifications.length,
        recentElections: activeElections.slice(0, 3),
        upcomingList: upcomingElections
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// MODULE 2: Available Elections
exports.getAvailableElections = async (req, res) => {
  try {
    const elections = await Election.find({ status: { $in: ['active', 'upcoming'] } })
      .select('title description type status startDate endDate region totalVotesCast totalEligibleVoters positions')
      .sort({ startDate: 1 });

    // Enrich with voter's voting status
    const enriched = await Promise.all(elections.map(async (election) => {
      const myVotes = await Vote.find({ election: election._id, voter: req.user._id });
      const positionsVoted = myVotes.map(v => v.position);
      const allPositions = election.positions.map(p => p.name);
      return {
        ...election.toJSON(),
        positionsVoted,
        hasVotedAll: allPositions.every(p => positionsVoted.includes(p)),
        votingProgress: `${positionsVoted.length}/${allPositions.length}`
      };
    }));

    res.json({ success: true, elections: enriched });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// MODULE 3: Voting Booth
exports.getElectionBallot = async (req, res) => {
  try {
    const { electionId } = req.params;
    const election = await Election.findById(electionId);
    if (!election) return res.status(404).json({ success: false, message: 'Election not found' });
    if (election.status !== 'active') return res.status(400).json({ success: false, message: 'Election is not active' });

    const candidates = await Candidate.find({ election: electionId, status: 'approved' });
    const myVotes = await Vote.find({ election: electionId, voter: req.user._id });
    const positionsVoted = myVotes.map(v => v.position);

    const ballot = election.positions.map(pos => ({
      position: pos.name,
      description: pos.description,
      maxWinners: pos.maxWinners,
      hasVoted: positionsVoted.includes(pos.name),
      candidates: candidates.filter(c => c.position === pos.name).map(c => ({
        _id: c._id, firstName: c.firstName, lastName: c.lastName, party: c.party,
        partyColor: c.partyColor, photo: c.photo, ballotNumber: c.ballotNumber,
        bio: c.bio, isIncumbent: c.isIncumbent
      }))
    }));

    res.json({ success: true, election: { _id: election._id, title: election.title, type: election.type, endDate: election.endDate, allowAbstain: election.allowAbstain }, ballot, positionsVoted });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// MODULE 4: Vote History
exports.getMyVoteHistory = async (req, res) => {
  try {
    const votes = await Vote.find({ voter: req.user._id })
      .populate('election', 'title type status startDate endDate')
      .populate('candidate', 'firstName lastName party position')
      .sort({ timestamp: -1 });
    res.json({ success: true, votes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// MODULE 5: Vote Receipt Verification
exports.verifyMyReceipt = async (req, res) => {
  try {
    const { receiptCode } = req.params;
    const vote = await Vote.findOne({ receiptCode, voter: req.user._id })
      .populate('election', 'title type status')
      .populate('candidate', 'firstName lastName party');
    if (!vote) return res.status(404).json({ success: false, message: 'Receipt not found or does not belong to you' });
    res.json({ success: true, receipt: { receiptCode: vote.receiptCode, voteHash: vote.voteHash, election: vote.election, candidate: vote.candidate, position: vote.position, isAbstain: vote.isAbstain, timestamp: vote.timestamp } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// MODULE 6: Election Results (public)
exports.getPublishedResults = async (req, res) => {
  try {
    const { electionId } = req.params;
    const election = await Election.findById(electionId);
    if (!election) return res.status(404).json({ success: false, message: 'Election not found' });
    if (!election.publishResults) return res.status(403).json({ success: false, message: 'Results not yet published' });

    const candidates = await Candidate.find({ election: electionId, status: 'approved' }).sort({ totalVotes: -1 });
    const positionResults = {};
    candidates.forEach(c => {
      if (!positionResults[c.position]) positionResults[c.position] = [];
      positionResults[c.position].push({ candidate: `${c.firstName} ${c.lastName}`, party: c.party, votes: c.totalVotes, partyColor: c.partyColor });
    });

    res.json({ success: true, election: { title: election.title, type: election.type, totalVotes: election.totalVotesCast, turnout: election.turnoutPercentage }, results: positionResults });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// MODULE 7: Candidate Information
exports.getCandidateInfo = async (req, res) => {
  try {
    const { candidateId } = req.params;
    const candidate = await Candidate.findById(candidateId).populate('election', 'title type status');
    if (!candidate || candidate.status !== 'approved') return res.status(404).json({ success: false, message: 'Candidate not found' });
    res.json({ success: true, candidate });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// MODULE 8: Voter Profile
exports.getVoterProfile = async (req, res) => {
  try {
    const voter = await User.findById(req.user._id).select('-password');
    const totalVotes = await Vote.countDocuments({ voter: req.user._id });
    const electionsParticipated = await Vote.distinct('election', { voter: req.user._id });
    res.json({ success: true, profile: voter, stats: { totalVotes, electionsParticipated: electionsParticipated.length } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// MODULE 9: Notifications
exports.getMyNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id }).sort({ createdAt: -1 }).limit(50);
    const unreadCount = await Notification.countDocuments({ recipient: req.user._id, isRead: false });
    res.json({ success: true, notifications, unreadCount });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.markNotificationRead = async (req, res) => {
  try {
    await Notification.findOneAndUpdate({ _id: req.params.id, recipient: req.user._id }, { isRead: true, readAt: new Date() });
    res.json({ success: true, message: 'Notification marked as read' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// MODULE 10: Election Search & Filter
exports.searchElections = async (req, res) => {
  try {
    const { q, type, region, status } = req.query;
    const query = {};
    if (q) query.$or = [{ title: new RegExp(q, 'i') }, { description: new RegExp(q, 'i') }];
    if (type) query.type = type;
    if (region) query.region = new RegExp(region, 'i');
    if (status) query.status = status;
    else query.status = { $in: ['active', 'upcoming', 'completed'] };

    const elections = await Election.find(query).select('title description type status startDate endDate region totalVotesCast').sort({ startDate: -1 }).limit(20);
    res.json({ success: true, elections });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

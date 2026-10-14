const Vote = require('../models/Vote');
const Election = require('../models/Election');
const Candidate = require('../models/Candidate');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');

exports.castVote = async (req, res) => {
  try {
    const { electionId, position, candidateId, isAbstain } = req.body;

    const election = await Election.findById(electionId);
    if (!election) return res.status(404).json({ success: false, message: 'Election not found' });
    if (election.status !== 'active') return res.status(400).json({ success: false, message: 'Election is not active' });

    const now = new Date();
    if (now < election.startDate || now > election.endDate) {
      return res.status(400).json({ success: false, message: 'Election is not within voting period' });
    }

    // Check if already voted for this position
    const existingVote = await Vote.findOne({ election: electionId, voter: req.user._id, position });
    if (existingVote) {
      return res.status(400).json({ success: false, message: 'You have already voted for this position' });
    }

    if (!isAbstain) {
      const candidate = await Candidate.findById(candidateId);
      if (!candidate || candidate.election.toString() !== electionId) {
        return res.status(400).json({ success: false, message: 'Invalid candidate' });
      }
      if (candidate.status !== 'approved') {
        return res.status(400).json({ success: false, message: 'Candidate is not approved' });
      }
    }

    const vote = await Vote.create({
      election: electionId, voter: req.user._id, position,
      candidate: isAbstain ? null : candidateId, isAbstain: isAbstain || false,
      ipAddress: req.ip, deviceInfo: req.headers['user-agent']
    });

    // Update candidate vote count
    if (!isAbstain && candidateId) {
      await Candidate.findByIdAndUpdate(candidateId, { $inc: { totalVotes: 1 } });
    }
    await Election.findByIdAndUpdate(electionId, { $inc: { totalVotesCast: 1 } });

    await AuditLog.create({
      action: 'VOTE_CAST', category: 'vote', performedBy: req.user._id, performedByRole: req.user.role,
      targetElection: electionId, status: 'success', severity: 'medium',
      details: { position, isAbstain, receiptCode: vote.receiptCode }
    });

    res.status(201).json({
      success: true,
      message: 'Vote cast successfully',
      receipt: { receiptCode: vote.receiptCode, voteHash: vote.voteHash, timestamp: vote.timestamp }
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'You have already voted for this position' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getVoterHistory = async (req, res) => {
  try {
    const votes = await Vote.find({ voter: req.user._id })
      .populate('election', 'title type status startDate endDate')
      .populate('candidate', 'firstName lastName party')
      .sort({ timestamp: -1 });
    res.json({ success: true, votes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.verifyVoteReceipt = async (req, res) => {
  try {
    const { receiptCode } = req.params;
    const vote = await Vote.findOne({ receiptCode })
      .populate('election', 'title status')
      .select('-voter -candidate -ipAddress');
    if (!vote) return res.status(404).json({ success: false, message: 'Receipt not found' });
    res.json({ success: true, vote, message: 'Vote verified successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.hasVoted = async (req, res) => {
  try {
    const { electionId } = req.params;
    const election = await Election.findById(electionId);
    if (!election) return res.status(404).json({ success: false, message: 'Election not found' });

    const votes = await Vote.find({ election: electionId, voter: req.user._id });
    const positionsVoted = votes.map(v => v.position);
    const allPositions = election.positions.map(p => p.name);
    const hasVotedAll = allPositions.every(p => positionsVoted.includes(p));

    res.json({ success: true, positionsVoted, hasVotedAll, totalPositions: allPositions.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getElectionVotes = async (req, res) => {
  try {
    const { electionId } = req.params;
    const votes = await Vote.find({ election: electionId })
      .populate('candidate', 'firstName lastName party position')
      .select('-voter -ipAddress -encryptedData');
    const total = votes.length;
    const byPosition = {};
    votes.forEach(vote => {
      if (!byPosition[vote.position]) byPosition[vote.position] = { total: 0, abstain: 0, candidates: {} };
      byPosition[vote.position].total += 1;
      if (vote.isAbstain) {
        byPosition[vote.position].abstain += 1;
      } else if (vote.candidate) {
        const candidateId = vote.candidate._id.toString();
        if (!byPosition[vote.position].candidates[candidateId]) {
          byPosition[vote.position].candidates[candidateId] = { count: 0, candidate: vote.candidate };
        }
        byPosition[vote.position].candidates[candidateId].count += 1;
      }
    });
    res.json({ success: true, total, byPosition });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const Election = require('../models/Election');
const User = require('../models/User');
const Vote = require('../models/Vote');
const Candidate = require('../models/Candidate');
const AuditLog = require('../models/AuditLog');

exports.createElection = async (req, res) => {
  try {
    const election = await Election.create({ ...req.body, createdBy: req.user._id });
    await AuditLog.create({ action: 'ELECTION_CREATED', category: 'election', performedBy: req.user._id, performedByRole: req.user.role, targetElection: election._id, status: 'success', severity: 'medium' });
    res.status(201).json({ success: true, message: 'Election created', election });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAllElections = async (req, res) => {
  try {
    const { status, type, region, page = 1, limit = 10 } = req.query;
    const query = {};
    if (status) query.status = status;
    if (type) query.type = type;
    if (region) query.region = region;

    const elections = await Election.find(query)
      .populate('createdBy', 'firstName lastName')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Election.countDocuments(query);
    res.json({ success: true, elections, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getElectionById = async (req, res) => {
  try {
    const election = await Election.findById(req.params.id)
      .populate('createdBy', 'firstName lastName email')
      .populate('admins', 'firstName lastName email')
      .populate('observers', 'firstName lastName email');
    if (!election) return res.status(404).json({ success: false, message: 'Election not found' });
    res.json({ success: true, election });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateElection = async (req, res) => {
  try {
    const election = await Election.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!election) return res.status(404).json({ success: false, message: 'Election not found' });
    await AuditLog.create({ action: 'ELECTION_UPDATED', category: 'election', performedBy: req.user._id, performedByRole: req.user.role, targetElection: election._id, status: 'success', severity: 'medium' });
    res.json({ success: true, message: 'Election updated', election });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateElectionStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const election = await Election.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!election) return res.status(404).json({ success: false, message: 'Election not found' });
    await AuditLog.create({ action: `ELECTION_STATUS_${status.toUpperCase()}`, category: 'election', performedBy: req.user._id, performedByRole: req.user.role, targetElection: election._id, status: 'success', severity: 'high' });
    res.json({ success: true, message: `Election ${status}`, election });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteElection = async (req, res) => {
  try {
    const election = await Election.findById(req.params.id);
    if (!election) return res.status(404).json({ success: false, message: 'Election not found' });
    if (election.status === 'active') return res.status(400).json({ success: false, message: 'Cannot delete an active election' });
    await Election.findByIdAndDelete(req.params.id);
    await AuditLog.create({ action: 'ELECTION_DELETED', category: 'election', performedBy: req.user._id, performedByRole: req.user.role, status: 'success', severity: 'high' });
    res.json({ success: true, message: 'Election deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getElectionStats = async (req, res) => {
  try {
    const stats = await Election.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    const totalElections = await Election.countDocuments();
    const totalVotes = await Vote.countDocuments();
    const totalVoters = await User.countDocuments({ role: 'voter' });
    const activeElections = await Election.countDocuments({ status: 'active' });

    res.json({
      success: true,
      stats: { totalElections, totalVotes, totalVoters, activeElections, byStatus: stats }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getPublicElections = async (req, res) => {
  try {
    const elections = await Election.find({ status: { $in: ['active', 'upcoming', 'completed'] } })
      .select('title description type status startDate endDate region totalVotesCast totalEligibleVoters')
      .sort({ startDate: -1 })
      .limit(20);
    res.json({ success: true, elections });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

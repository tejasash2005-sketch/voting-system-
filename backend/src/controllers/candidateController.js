const Candidate = require('../models/Candidate');
const Election = require('../models/Election');
const AuditLog = require('../models/AuditLog');

exports.addCandidate = async (req, res) => {
  try {
    const election = await Election.findById(req.body.election);
    if (!election) return res.status(404).json({ success: false, message: 'Election not found' });

    const candidate = await Candidate.create(req.body);
    await AuditLog.create({ action: 'CANDIDATE_ADDED', category: 'election', performedBy: req.user._id, performedByRole: req.user.role, targetElection: req.body.election, status: 'success', severity: 'medium' });
    res.status(201).json({ success: true, message: 'Candidate added', candidate });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getCandidatesByElection = async (req, res) => {
  try {
    const { electionId } = req.params;
    const { position, status } = req.query;
    const query = { election: electionId };
    if (position) query.position = position;
    if (status) query.status = status;

    const candidates = await Candidate.find(query).sort({ ballotNumber: 1, lastName: 1 });
    res.json({ success: true, candidates });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getCandidateById = async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.id).populate('election', 'title status type');
    if (!candidate) return res.status(404).json({ success: false, message: 'Candidate not found' });
    res.json({ success: true, candidate });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateCandidate = async (req, res) => {
  try {
    const candidate = await Candidate.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!candidate) return res.status(404).json({ success: false, message: 'Candidate not found' });
    res.json({ success: true, message: 'Candidate updated', candidate });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.approveCandidate = async (req, res) => {
  try {
    const candidate = await Candidate.findByIdAndUpdate(
      req.params.id,
      { status: 'approved', approvedBy: req.user._id, approvedAt: new Date() },
      { new: true }
    );
    if (!candidate) return res.status(404).json({ success: false, message: 'Candidate not found' });
    await AuditLog.create({ action: 'CANDIDATE_APPROVED', category: 'election', performedBy: req.user._id, performedByRole: req.user.role, status: 'success', severity: 'medium' });
    res.json({ success: true, message: 'Candidate approved', candidate });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.rejectCandidate = async (req, res) => {
  try {
    const { reason } = req.body;
    const candidate = await Candidate.findByIdAndUpdate(
      req.params.id,
      { status: 'rejected', rejectionReason: reason },
      { new: true }
    );
    if (!candidate) return res.status(404).json({ success: false, message: 'Candidate not found' });
    res.json({ success: true, message: 'Candidate rejected', candidate });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteCandidate = async (req, res) => {
  try {
    await Candidate.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Candidate deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

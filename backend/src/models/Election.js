const mongoose = require('mongoose');

const electionSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  type: { type: String, enum: ['general', 'primary', 'local', 'referendum', 'special'], required: true },
  status: { type: String, enum: ['draft', 'upcoming', 'active', 'paused', 'completed', 'cancelled'], default: 'draft' },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  timezone: { type: String, default: 'UTC' },
  region: { type: String, required: true },
  constituency: { type: String },
  banner: { type: String },
  rules: [{ type: String }],
  eligibleVoters: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  totalEligibleVoters: { type: Number, default: 0 },
  totalVotesCast: { type: Number, default: 0 },
  positions: [{
    name: { type: String, required: true },
    description: String,
    maxWinners: { type: Number, default: 1 },
    maxVotesPerVoter: { type: Number, default: 1 }
  }],
  votingMethod: { type: String, enum: ['single', 'ranked', 'approval', 'proportional'], default: 'single' },
  isAnonymous: { type: Boolean, default: true },
  requiresVerification: { type: Boolean, default: true },
  allowAbstain: { type: Boolean, default: false },
  publishResults: { type: Boolean, default: false },
  resultsPublishedAt: { type: Date },
  observers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  admins: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  auditLog: [{
    action: String,
    performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    timestamp: { type: Date, default: Date.now },
    details: String
  }],
  settings: {
    showLiveResults: { type: Boolean, default: false },
    enableComments: { type: Boolean, default: false },
    sendReminders: { type: Boolean, default: true },
    multipleVotingAllowed: { type: Boolean, default: false }
  }
}, { timestamps: true });

electionSchema.virtual('isActive').get(function() {
  const now = new Date();
  return this.status === 'active' && this.startDate <= now && this.endDate >= now;
});

electionSchema.virtual('turnoutPercentage').get(function() {
  if (this.totalEligibleVoters === 0) return 0;
  return ((this.totalVotesCast / this.totalEligibleVoters) * 100).toFixed(2);
});

electionSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Election', electionSchema);

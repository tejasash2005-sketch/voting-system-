const mongoose = require('mongoose');

const candidateSchema = new mongoose.Schema({
  election: { type: mongoose.Schema.Types.ObjectId, ref: 'Election', required: true },
  position: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  photo: { type: String },
  party: { type: String },
  partyLogo: { type: String },
  partyColor: { type: String, default: '#1a56db' },
  bio: { type: String },
  qualifications: [{ type: String }],
  manifesto: { type: String },
  website: { type: String },
  socialMedia: {
    twitter: String, facebook: String, instagram: String
  },
  region: { type: String },
  constituency: { type: String },
  ballotNumber: { type: Number },
  status: { type: String, enum: ['pending', 'approved', 'rejected', 'withdrawn'], default: 'pending' },
  totalVotes: { type: Number, default: 0 },
  isIncumbent: { type: Boolean, default: false },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  approvedAt: { type: Date },
  rejectionReason: { type: String },
  campaignStatement: { type: String },
  age: { type: Number },
  education: { type: String },
  experience: { type: String },
}, { timestamps: true });

candidateSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

candidateSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Candidate', candidateSchema);

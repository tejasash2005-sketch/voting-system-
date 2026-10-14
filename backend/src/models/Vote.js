const mongoose = require('mongoose');
const crypto = require('crypto');

const voteSchema = new mongoose.Schema({
  election: { type: mongoose.Schema.Types.ObjectId, ref: 'Election', required: true },
  voter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  position: { type: String, required: true },
  candidate: { type: mongoose.Schema.Types.ObjectId, ref: 'Candidate' },
  isAbstain: { type: Boolean, default: false },
  voteHash: { type: String, unique: true },
  receiptCode: { type: String, unique: true },
  ipAddress: { type: String },
  deviceInfo: { type: String },
  timestamp: { type: Date, default: Date.now },
  isVerified: { type: Boolean, default: true },
  encryptedData: { type: String },
}, { timestamps: true });

// Generate vote hash and receipt before saving
voteSchema.pre('save', function(next) {
  if (!this.voteHash) {
    const hashData = `${this.election}-${this.voter}-${this.position}-${Date.now()}-${Math.random()}`;
    this.voteHash = crypto.createHash('sha256').update(hashData).digest('hex');
  }
  if (!this.receiptCode) {
    this.receiptCode = 'RCP-' + crypto.randomBytes(8).toString('hex').toUpperCase();
  }
  next();
});

// Compound unique index - one vote per position per election per voter
voteSchema.index({ election: 1, voter: 1, position: 1 }, { unique: true });

module.exports = mongoose.model('Vote', voteSchema);

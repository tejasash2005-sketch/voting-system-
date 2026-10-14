const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  action: { type: String, required: true },
  category: { type: String, enum: ['auth', 'election', 'vote', 'user', 'candidate', 'system', 'report'], required: true },
  performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  performedByRole: { type: String },
  targetUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  targetElection: { type: mongoose.Schema.Types.ObjectId, ref: 'Election' },
  ipAddress: { type: String },
  userAgent: { type: String },
  details: { type: mongoose.Schema.Types.Mixed },
  status: { type: String, enum: ['success', 'failure', 'warning'], default: 'success' },
  severity: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'low' },
  timestamp: { type: Date, default: Date.now }
}, { timestamps: true });

auditLogSchema.index({ timestamp: -1 });
auditLogSchema.index({ performedBy: 1 });
auditLogSchema.index({ category: 1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);

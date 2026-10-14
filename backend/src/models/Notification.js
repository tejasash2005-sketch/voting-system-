const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ['info', 'warning', 'success', 'error', 'reminder'], default: 'info' },
  category: { type: String, enum: ['election', 'vote', 'system', 'account', 'result'], default: 'system' },
  relatedElection: { type: mongoose.Schema.Types.ObjectId, ref: 'Election' },
  isRead: { type: Boolean, default: false },
  readAt: { type: Date },
  link: { type: String },
  priority: { type: String, enum: ['low', 'normal', 'high'], default: 'normal' },
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);

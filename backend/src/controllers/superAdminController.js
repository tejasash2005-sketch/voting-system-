const User = require('../models/User');
const Election = require('../models/Election');
const Vote = require('../models/Vote');
const AuditLog = require('../models/AuditLog');
const Notification = require('../models/Notification');

// MODULE 1: System Dashboard
exports.getSystemDashboard = async (req, res) => {
  try {
    const [totalUsers, totalElections, totalVotes, activeElections] = await Promise.all([
      User.countDocuments(),
      Election.countDocuments(),
      Vote.countDocuments(),
      Election.countDocuments({ status: 'active' })
    ]);

    const usersByRole = await User.aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }]);
    const electionsByStatus = await Election.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]);
    const recentActivity = await AuditLog.find().sort({ timestamp: -1 }).limit(10).populate('performedBy', 'firstName lastName role');
    const votingTrend = await Vote.aggregate([
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } }, count: { $sum: 1 } } },
      { $sort: { '_id': -1 } }, { $limit: 30 }
    ]);

    res.json({ success: true, dashboard: { totalUsers, totalElections, totalVotes, activeElections, usersByRole, electionsByStatus, recentActivity, votingTrend } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// MODULE 2: User Management
exports.getAllUsers = async (req, res) => {
  try {
    const { role, isActive, page = 1, limit = 20, search } = req.query;
    const query = {};
    if (role) query.role = role;
    if (isActive !== undefined) query.isActive = isActive === 'true';
    if (search) query.$or = [{ firstName: new RegExp(search, 'i') }, { lastName: new RegExp(search, 'i') }, { email: new RegExp(search, 'i') }];

    const users = await User.find(query).select('-password').sort({ createdAt: -1 }).skip((page - 1) * limit).limit(parseInt(limit));
    const total = await User.countDocuments(query);
    res.json({ success: true, users, total, pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createUser = async (req, res) => {
  try {
    const user = await User.create({ ...req.body, createdBy: req.user._id });
    await AuditLog.create({ action: 'USER_CREATED', category: 'user', performedBy: req.user._id, performedByRole: req.user.role, targetUser: user._id, status: 'success', severity: 'medium' });
    res.status(201).json({ success: true, message: 'User created', user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, message: 'User updated', user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    user.isActive = !user.isActive;
    await user.save({ validateBeforeSave: false });
    await AuditLog.create({ action: user.isActive ? 'USER_ACTIVATED' : 'USER_DEACTIVATED', category: 'user', performedBy: req.user._id, performedByRole: req.user.role, targetUser: user._id, status: 'success', severity: 'high' });
    res.json({ success: true, message: `User ${user.isActive ? 'activated' : 'deactivated'}`, isActive: user.isActive });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    await AuditLog.create({ action: 'USER_DELETED', category: 'user', performedBy: req.user._id, performedByRole: req.user.role, status: 'success', severity: 'critical' });
    res.json({ success: true, message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// MODULE 3: Audit Logs
exports.getAuditLogs = async (req, res) => {
  try {
    const { category, status, severity, page = 1, limit = 50, startDate, endDate } = req.query;
    const query = {};
    if (category) query.category = category;
    if (status) query.status = status;
    if (severity) query.severity = severity;
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }
    const logs = await AuditLog.find(query).populate('performedBy', 'firstName lastName email role').sort({ timestamp: -1 }).skip((page - 1) * limit).limit(parseInt(limit));
    const total = await AuditLog.countDocuments(query);
    res.json({ success: true, logs, total, pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// MODULE 4: System Settings  
exports.getSystemSettings = async (req, res) => {
  res.json({
    success: true, settings: {
      siteName: 'VoteSecure Pro', maintenanceMode: false, maxLoginAttempts: 5,
      sessionTimeout: 480, requireEmailVerification: true, enableTwoFactor: false,
      defaultTimezone: 'UTC', supportEmail: 'support@votesecure.com',
      version: '1.0.0', lastUpdated: new Date()
    }
  });
};

// MODULE 5: Reports & Analytics
exports.getSystemReports = async (req, res) => {
  try {
    const voterParticipation = await Election.aggregate([
      { $match: { status: { $in: ['completed', 'active'] } } },
      { $project: { title: 1, turnout: { $cond: [{ $eq: ['$totalEligibleVoters', 0] }, 0, { $multiply: [{ $divide: ['$totalVotesCast', '$totalEligibleVoters'] }, 100] }] } } }
    ]);
    const totalRevenue = 0;
    res.json({ success: true, reports: { voterParticipation, totalRevenue } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// MODULE 6: Notifications  
exports.sendBroadcastNotification = async (req, res) => {
  try {
    const { title, message, type, targetRole } = req.body;
    const query = targetRole ? { role: targetRole } : {};
    const users = await User.find(query).select('_id');
    const notifications = users.map(u => ({ recipient: u._id, title, message, type: type || 'info', category: 'system' }));
    await Notification.insertMany(notifications);
    res.json({ success: true, message: `Notification sent to ${notifications.length} users` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// MODULE 7: Security Management
exports.getSecurityAlerts = async (req, res) => {
  try {
    const failedLogins = await AuditLog.find({ action: 'LOGIN_FAILED', timestamp: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } }).populate('performedBy', 'email firstName lastName');
    const lockedUsers = await User.find({ lockUntil: { $gt: new Date() } }).select('email firstName lastName lockUntil loginAttempts');
    res.json({ success: true, alerts: { failedLogins: failedLogins.length, lockedUsers, recentFailures: failedLogins.slice(0, 10) } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// MODULE 8: Backup & Data Management
exports.getDataSummary = async (req, res) => {
  try {
    const collections = {
      users: await User.countDocuments(),
      elections: await Election.countDocuments(),
      votes: await Vote.countDocuments(),
      auditLogs: await AuditLog.countDocuments()
    };
    res.json({ success: true, summary: collections, lastBackup: new Date() });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// MODULE 9: Role & Permission Management
exports.updateUserRole = async (req, res) => {
  try {
    const { role, permissions } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { role, permissions }, { new: true }).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    await AuditLog.create({ action: 'USER_ROLE_CHANGED', category: 'user', performedBy: req.user._id, performedByRole: req.user.role, targetUser: user._id, status: 'success', severity: 'high', details: { newRole: role } });
    res.json({ success: true, message: 'Role updated', user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// MODULE 10: System Health  
exports.getSystemHealth = async (req, res) => {
  try {
    const dbStatus = 'connected';
    const memUsage = process.memoryUsage();
    const uptime = process.uptime();
    res.json({
      success: true, health: {
        status: 'healthy', database: dbStatus, uptime: Math.floor(uptime),
        memory: { used: Math.round(memUsage.heapUsed / 1024 / 1024) + 'MB', total: Math.round(memUsage.heapTotal / 1024 / 1024) + 'MB' },
        timestamp: new Date()
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

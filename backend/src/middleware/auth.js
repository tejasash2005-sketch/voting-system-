const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');

exports.protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (!token) {
      return res.status(401).json({ success: false, message: 'Not authorized, no token' });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }
    if (!user.isActive) {
      return res.status(401).json({ success: false, message: 'Account deactivated' });
    }
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Token invalid or expired' });
  }
};

exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role '${req.user.role}' is not authorized to access this resource`
      });
    }
    next();
  };
};

exports.logActivity = (action, category, severity = 'low') => {
  return async (req, res, next) => {
    res.on('finish', async () => {
      try {
        await AuditLog.create({
          action,
          category,
          performedBy: req.user?._id,
          performedByRole: req.user?.role,
          ipAddress: req.ip,
          userAgent: req.headers['user-agent'],
          status: res.statusCode < 400 ? 'success' : 'failure',
          severity,
          details: { method: req.method, path: req.path, statusCode: res.statusCode }
        });
      } catch (err) {
        console.error('Audit log error:', err.message);
      }
    });
    next();
  };
};

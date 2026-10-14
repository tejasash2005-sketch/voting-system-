const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });
};

exports.register = async (req, res) => {
  try {
    const { firstName, lastName, email, password, role, nationalId, phone, dateOfBirth, address } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const user = await User.create({
      firstName, lastName, email, password, role: role || 'voter',
      nationalId, phone, dateOfBirth, address, isVerified: false
    });

    await AuditLog.create({
      action: 'USER_REGISTERED', category: 'auth', performedBy: user._id,
      performedByRole: user.role, ipAddress: req.ip, status: 'success', severity: 'low',
      details: { email, role: user.role }
    });

    const token = generateToken(user._id);
    res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: {
        id: user._id, firstName: user.firstName, lastName: user.lastName,
        email: user.email, role: user.role, voterId: user.voterId, isVerified: user.isVerified
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (user.isLocked()) {
      return res.status(423).json({ success: false, message: 'Account temporarily locked due to multiple failed attempts' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      user.loginAttempts += 1;
      if (user.loginAttempts >= 5) {
        user.lockUntil = new Date(Date.now() + 30 * 60 * 1000);
      }
      await user.save({ validateBeforeSave: false });
      await AuditLog.create({ action: 'LOGIN_FAILED', category: 'auth', performedBy: user._id, performedByRole: user.role, ipAddress: req.ip, status: 'failure', severity: 'medium' });
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    user.loginAttempts = 0;
    user.lockUntil = undefined;
    user.lastLogin = new Date();
    user.lastLoginIP = req.ip;
    await user.save({ validateBeforeSave: false });

    await AuditLog.create({ action: 'LOGIN_SUCCESS', category: 'auth', performedBy: user._id, performedByRole: user.role, ipAddress: req.ip, status: 'success', severity: 'low' });

    const token = generateToken(user._id);
    res.json({
      success: true, message: 'Login successful', token,
      user: {
        id: user._id, firstName: user.firstName, lastName: user.lastName,
        email: user.email, role: user.role, voterId: user.voterId,
        isVerified: user.isVerified, isActive: user.isActive,
        profilePhoto: user.profilePhoto, lastLogin: user.lastLogin
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, phone, address } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { firstName, lastName, phone, address },
      { new: true, runValidators: true }
    );
    res.json({ success: true, message: 'Profile updated', user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id).select('+password');
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }
    user.password = newPassword;
    await user.save();
    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.logout = async (req, res) => {
  await AuditLog.create({ action: 'LOGOUT', category: 'auth', performedBy: req.user._id, performedByRole: req.user.role, ipAddress: req.ip, status: 'success', severity: 'low' });
  res.json({ success: true, message: 'Logged out successfully' });
};

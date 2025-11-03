const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const Report = require('../models/Report');
const authMiddleware = require('../middleware/auth');
const { sendSMS } = require('../utils/sms');

// Admin login
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    const admin = await Admin.findOne({ username });
    if (!admin) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, {
      expiresIn: '24h',
    });

    res.json({
      success: true,
      token,
      admin: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
};

// Get all reports (protected)
exports.getAllReports = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};

    const reports = await Report.find(filter).sort({ reportedAt: -1 });

    res.json({ reports });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
};

// Verify report (protected)
exports.verifyReport = async (req, res) => {
  try {
    const { status, adminNotes } = req.body;

    const report = await Report.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    report.status = status;
    report.verifiedAt = new Date();
    report.verifiedBy = req.admin._id;
    report.adminNotes = adminNotes;
    await report.save();

    // Send SMS to user
    let message;
    if (status === 'verified') {
      message = `Your crime report (ID: ${report._id
        .toString()
        .slice(-6)}) has been verified by authorities. Action is being taken.`;
    } else if (status === 'spam') {
      message = `Your crime report (ID: ${report._id
        .toString()
        .slice(-6)}) has been marked as spam and cancelled.`;
    }

    await sendSMS(report.mobileNumber, message);

    res.json({
      success: true,
      message: 'Report updated successfully',
      report,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update report' });
  }
};

// Dashboard stats (protected)
exports.getDashboardStats = async (req, res) => {
  try {
    const totalReports = await Report.countDocuments();
    const pendingReports = await Report.countDocuments({ status: 'pending' });
    const verifiedReports = await Report.countDocuments({ status: 'verified' });
    const spamReports = await Report.countDocuments({ status: 'spam' });

    res.json({
      totalReports,
      pendingReports,
      verifiedReports,
      spamReports,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
};

module.exports = router;

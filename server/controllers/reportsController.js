const express = require('express');
const router = express.Router();
const Report = require('../models/Report');
const User = require('../models/User');
const { sendSMS } = require('../utils/sms');
const { reportRateLimiter } = require('../middleware/rateLimiter');

// Create new report
exports.createReport = async (req, res) => {
  try {
    const {
      mobileNumber,
      finalCrimeType,
      description,
      latitude,
      longitude,
      address,
    } = req.body;

    // Validate input
    if (
      !mobileNumber ||
      !finalCrimeType ||
      !description ||
      !latitude ||
      !longitude
    ) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Create report
    const report = new Report({
      mobileNumber,
      crimeType: finalCrimeType,
      description,
      location: { latitude, longitude, address },
    });

    await report.save();

    // Find or create user
    let user = await User.findOne({ mobileNumber });
    if (!user) {
      user = new User({ mobileNumber, isVerified: true });
    }
    user.reports.push(report._id);
    await user.save();

    // Send SMS confirmation
    const message = `Your crime report (ID: ${report._id
      .toString()
      .slice(
        -6
      )}) has been submitted successfully. You will be notified once verified.`;
    await sendSMS(mobileNumber, message);

    res.status(201).json({
      success: true,
      message: 'Report submitted successfully',
      reportId: report._id,
    });
  } catch (error) {
    console.error('Report creation error:', error);
    res.status(500).json({ error: 'Failed to create report' });
  }
};

// Get user reports
exports.getUserReport = async (req, res) => {
  try {
    const user = await User.findOne({
      mobileNumber: req.params.mobileNumber,
    }).populate('reports');

    if (!user) {
      return res.status(404).json({ error: 'No reports found' });
    }

    // Calculate remaining reports for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const reportsToday = await Report.countDocuments({
      mobileNumber,
      reportedAt: { $gte: today },
    });

    const remainingReports = 3 - reportsToday;

    // Check last report time
    const lastReport = await Report.findOne({ mobileNumber }).sort({
      reportedAt: -1,
    });

    let canReportNow = true;
    let nextReportTime = null;

    if (lastReport) {
      const eightHoursLater = new Date(
        lastReport.reportedAt.getTime() + 8 * 60 * 60 * 1000
      );
      if (eightHoursLater > new Date()) {
        canReportNow = false;
        nextReportTime = eightHoursLater;
      }
    }

    res.json({
      reports: user.reports,
      rateLimit: {
        reportsToday,
        remainingReports,
        canReportNow,
        nextReportTime,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
};

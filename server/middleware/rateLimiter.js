const Report = require('../models/Report');

// Check if user has exceeded daily limit (3 reports per day)
const checkDailyLimit = async (mobileNumber) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const reportsToday = await Report.countDocuments({
    mobileNumber,
    reportedAt: { $gte: today },
  });

  return reportsToday >= 3;
};

// Check if user's last report was within 8 hours
const checkTimeGap = async (mobileNumber) => {
  const eightHoursAgo = new Date(Date.now() - 8 * 60 * 60 * 1000);

  const recentReport = await Report.findOne({
    mobileNumber,
    reportedAt: { $gte: eightHoursAgo },
  }).sort({ reportedAt: -1 });

  if (recentReport) {
    const timeDiff = Date.now() - recentReport.reportedAt.getTime();
    const hoursRemaining = Math.ceil(
      (8 * 60 * 60 * 1000 - timeDiff) / (60 * 60 * 1000)
    );
    return { isWithin8Hours: true, hoursRemaining };
  }

  return { isWithin8Hours: false, hoursRemaining: 0 };
};

// Main rate limiter middleware
const reportRateLimiter = async (req, res, next) => {
  try {
    const { mobileNumber } = req.body;

    if (!mobileNumber) {
      return res.status(400).json({ error: 'Mobile number is required' });
    }

    // Check daily limit (3 reports per day)
    const exceedsDailyLimit = await checkDailyLimit(mobileNumber);
    if (exceedsDailyLimit) {
      return res.status(429).json({
        error: 'Daily limit exceeded',
        message:
          'You can only report 3 crimes per day. Please try again tomorrow.',
        limitType: 'daily',
      });
    }

    // Check 8-hour gap between reports
    const timeGapCheck = await checkTimeGap(mobileNumber);
    if (timeGapCheck.isWithin8Hours) {
      return res.status(429).json({
        error: 'Time limit not met',
        message: `Please wait ${timeGapCheck.hoursRemaining} more hour(s) before submitting another report.`,
        hoursRemaining: timeGapCheck.hoursRemaining,
        limitType: 'timeGap',
      });
    }

    // All checks passed, proceed to next middleware
    next();
  } catch (error) {
    console.error('Rate limiter error:', error);
    res.status(500).json({ error: 'Error checking rate limits' });
  }
};

module.exports = { reportRateLimiter, checkDailyLimit, checkTimeGap };

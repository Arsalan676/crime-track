/*const User = require('../models/User');

const verifyUserMiddleware = async (req, res, next) => {
  try {
    const { mobileNumber } = req.body;

    if (!mobileNumber) {
      return res.status(400).json({ error: 'Mobile number is required' });
    }

    // Find user
    const user = await User.findOne({ mobileNumber });

    if (!user) {
      return res.status(403).json({
        error: 'Number not verified',
        message:
          'Please verify your mobile number with OTP before reporting a crime.',
        requiresVerification: true,
      });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        error: 'Number not verified',
        message:
          'Your mobile number is not verified. Please verify with OTP first.',
        requiresVerification: true,
      });
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    console.error('User verification error:', error);
    res.status(500).json({ error: 'Verification check failed' });
  }
};

module.exports = verifyUserMiddleware; */

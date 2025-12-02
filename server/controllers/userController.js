const express = require('express');
const router = express.Router();
const admin = require('../config/firebase');
const User = require('../models/User');

// Verify Firebase ID Token and create/update user
/*exports.verifyFirebaseToken = async (req, res) => {
  try {
    const { idToken, phoneNumber } = req.body;

    if (!idToken || !phoneNumber) {
      return res.status(400).json({
        error: 'ID token and phone number are required',
      });
    }

    // Verify the Firebase ID token
    const decodedToken = await admin.auth().verifyIdToken(idToken);

    // Check if phone number matches
    if (decodedToken.phone_number !== phoneNumber) {
      return res.status(400).json({
        error: 'Phone number mismatch',
      });
    }

    // Extract phone number without country code for storage
    let mobileNumber = phoneNumber;
    if (phoneNumber.startsWith('+91')) {
      mobileNumber = phoneNumber.slice(3);
    } else if (phoneNumber.startsWith('+')) {
      mobileNumber = phoneNumber.slice(1);
    }

    // Find or create user
    let user = await User.findOne({ mobileNumber });

    if (user) {
      // Update existing user
      user.isVerified = true;
      user.firebaseUid = decodedToken.uid;
      await user.save();
    } else {
      // Create new user
      user = new User({
        mobileNumber,
        isVerified: true,
        firebaseUid: decodedToken.uid,
      });
      await user.save();
    }

    res.json({
      success: true,
      message: 'Phone number verified successfully',
      user: {
        mobileNumber: user.mobileNumber,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    console.error('Firebase token verification error:', error);

    if (error.code === 'auth/id-token-expired') {
      return res.status(401).json({
        error: 'Token expired. Please verify again.',
      });
    }

    if (error.code === 'auth/invalid-id-token') {
      return res.status(401).json({
        error: 'Invalid token. Please try again.',
      });
    }

    res.status(500).json({
      error: 'Verification failed. Please try again.',
    });
  }
}; */

// DEMO MODE: No Firebase. Always verifies OTP successfully.

exports.verifyFirebaseToken = async (req, res) => {
  try {
    const { phoneNumber } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({
        error: 'Phone number is required',
      });
    }

    // Extract mobile number (remove +91 or any +)
    let mobileNumber = phoneNumber.replace(/^\+91/, '').replace(/^\+/, '');

    // Find existing user
    let user = await User.findOne({ mobileNumber });

    if (user) {
      // Update user as verified
      user.isVerified = true;
      await user.save();
    } else {
      // Create new user in demo mode
      user = new User({
        mobileNumber,
        isVerified: true,
        firebaseUid: 'demo-user', // fake ID
      });
      await user.save();
    }

    return res.json({
      success: true,
      message: 'Phone number verified (DEMO MODE)',
      user: {
        mobileNumber: user.mobileNumber,
        isVerified: true,
      },
    });
  } catch (error) {
    console.error('Demo verification error:', error);
    return res.status(500).json({
      error: 'Verification failed (demo mode)',
    });
  }
};

// Check verification status
exports.checkVerificationStatus = async (req, res) => {
  try {
    let { mobileNumber } = req.params;

    // Remove country code if present
    if (mobileNumber.startsWith('+91')) {
      mobileNumber = mobileNumber.slice(3);
    }

    const user = await User.findOne({ mobileNumber });

    if (!user) {
      return res.json({
        isVerified: false,
        message: 'Number not registered. Please verify your number first.',
      });
    }

    res.json({
      isVerified: user.isVerified,
      mobileNumber: user.mobileNumber,
    });
  } catch (error) {
    console.error('Check verification error:', error);
    res.status(500).json({ error: 'Failed to check verification status' });
  }
};

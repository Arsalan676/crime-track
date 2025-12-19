const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  mobileNumber: {
    type: String,
    required: true,
    unique: true,
    match: /^[0-9]{10,15}$/,
  },
  firebaseUid: {
    type: String,
    unique: true,
    sparse: true, // Allows null values
  },
  lastVerifiedAt: { type: Date },
  otp: String,
  otpExpiry: Date,
  isVerified: {
    type: Boolean,
    default: false,
  },
  lastOtpSentAt: Date, // Track last OTP sent time
  reports: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Report',
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('User', userSchema);

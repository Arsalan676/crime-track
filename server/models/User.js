const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  mobileNumber: {
    type: String,
    required: true,
    unique: true,
    match: /^[0-9]{10}$/,
  },
  otp: String,
  otpExpiry: Date,
  isVerified: {
    type: Boolean,
    default: false,
  },
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

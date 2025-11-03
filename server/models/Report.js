const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  mobileNumber: {
    type: String,
    required: true,
    match: /^[0-9]{10}$/,
  },
  crimeType: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  location: {
    latitude: {
      type: Number,
      required: true,
    },
    longitude: {
      type: Number,
      required: true,
    },
    address: String,
  },
  status: {
    type: String,
    enum: ['pending', 'verified', 'spam', 'resolved'],
    default: 'pending',
  },
  reportedAt: {
    type: Date,
    default: Date.now,
    index: true, // Added index for faster queries
  },
  verifiedAt: Date,
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
  },
  adminNotes: String,
});

// Add compound index for efficient rate limit checks
reportSchema.index({ mobileNumber: 1, reportedAt: -1 });

module.exports = mongoose.model('Report', reportSchema);

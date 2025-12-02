const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const adminController = require('../controllers/adminController');
const reportsController = require('../controllers/reportsController');

// Admin routes
router.post(
  '/login',
  (req, res, next) => {
    console.log('🔥 Login route hit');
    next();
  },
  adminController.login
);
router.get('/reports', authMiddleware, adminController.getAllReports);
router.put('/reports/:id/verify', authMiddleware, adminController.verifyReport);
router.get(
  '/dashboard/stats',
  authMiddleware,
  adminController.getDashboardStats
);

module.exports = router;

const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const adminController = require('../controllers/adminController');
const reportController = require('../controllers/reportController');

// Admin routes
router.post('/login', adminController.login);
router.get('/reports', authMiddleware, reportController.getAllReports);
router.put(
  '/reports/:id/verify',
  authMiddleware,
  reportController.verifyReport
);
router.get(
  '/dashboard/stats',
  authMiddleware,
  reportController.getDashboardStats
);

module.exports = router;

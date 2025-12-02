const express = require('express');
const reportsController = require('../controllers/reportsController');
const verifyUserMiddleware = require('../middleware/verifyUser');
const { reportRateLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

router.post(
  '/create',
  //verifyUserMiddleware,
  reportRateLimiter,
  reportsController.createReport
);

router.get('/user/:mobileNumber', reportsController.getUserReports);

router.get('/heatmap-data', reportsController.getHeatmapData);

module.exports = router;

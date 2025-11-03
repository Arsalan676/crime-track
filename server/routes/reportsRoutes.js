const express = require('express');
const reportController = require('../controllers/reportsController');
const { reportRateLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

router.post('/create', reportRateLimiter, reportController.createReport);

router.get('/user/:mobileNumber', reportController.getUserReport);

module.exports = router;

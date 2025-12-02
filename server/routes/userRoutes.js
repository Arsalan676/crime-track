const express = require('express');
const userController = require('../controllers/userController');
const router = express.Router();

router.post('/verify-firebase-token', userController.verifyFirebaseToken);
router.get(
  '/check-verification/:mobileNumber',
  userController.checkVerificationStatus
);

module.exports = router;

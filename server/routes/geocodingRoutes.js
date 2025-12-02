const express = require('express');
const geocodingController = require('../controllers/geocodingController');
const router = express.Router();

router.post('/geocode', geocodingController.geocodeAddress);
router.post('/reverse-geocode', geocodingController.reverseGeocode);

module.exports = router;

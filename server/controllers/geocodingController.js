const express = require('express');
const router = express.Router();
const axios = require('axios');

const MAPBOX_ACCESS_TOKEN = process.env.MAPBOX_ACCESS_TOKEN;

// Geocode address to coordinates
exports.geocodeAddress = async (req, res) => {
  try {
    const { address } = req.body;

    if (!address) {
      return res.status(400).json({ error: 'Address is required' });
    }

    const response = await axios.get(
      `https://api.mapbox.com/search/geocode/v6/forward`,
      {
        params: {
          q: address,
          access_token: MAPBOX_ACCESS_TOKEN,
        },
      }
    );

    if (response.data.features && response.data.features.length > 0) {
      const coordinates = response.data.features[0].geometry.coordinates;
      res.json({
        latitude: coordinates[1],
        longitude: coordinates[0],
        formattedAddress:
          response.data.features[0].properties.full_address ||
          response.data.features[0].properties.name,
      });
    } else {
      res.status(404).json({ error: 'Address not found' });
    }
  } catch (error) {
    console.error('Geocoding error:', error);
    res.status(500).json({ error: 'Failed to geocode address' });
  }
};

// Reverse geocode coordinates to address
exports.reverseGeocode = async (req, res) => {
  try {
    const { latitude, longitude } = req.body;

    if (!latitude || !longitude) {
      return res
        .status(400)
        .json({ error: 'Latitude and longitude are required' });
    }

    const response = await axios.get(
      `https://api.mapbox.com/search/geocode/v6/reverse`,
      {
        params: {
          longitude: longitude,
          latitude: latitude,
          access_token: MAPBOX_ACCESS_TOKEN,
        },
      }
    );

    if (response.data.features && response.data.features.length > 0) {
      res.json({
        address:
          response.data.features[0].properties.full_address ||
          response.data.features[0].properties.name,
      });
    } else {
      res.status(404).json({ error: 'Address not found' });
    }
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    res.status(500).json({ error: 'Failed to reverse geocode' });
  }
};

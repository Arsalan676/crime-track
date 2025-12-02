const MAPBOX_ACCESS_TOKEN = process.env.MAPBOX_ACCESS_TOKEN;

// Geocode: Convert address to coordinates
export const geocodeAddress = async (address) => {
  try {
    const response = await fetch(
      `https://api.mapbox.com/search/geocode/v6/forward?q=${encodeURIComponent(
        address
      )}&access_token=${MAPBOX_ACCESS_TOKEN}`
    );
    const data = await response.json();

    if (data.features && data.features.length > 0) {
      const location = data.features[0].geometry.coordinates;
      return {
        latitude: location[1],
        longitude: location[0],
        formattedAddress:
          data.features[0].properties.full_address ||
          data.features[0].properties.name,
      };
    }
    throw new Error('Address not found');
  } catch (error) {
    console.error('Geocoding error:', error);
    throw error;
  }
};

// Reverse Geocode: Convert coordinates to address
export const reverseGeocode = async (latitude, longitude) => {
  try {
    const response = await fetch(
      `https://api.mapbox.com/search/geocode/v6/reverse?longitude=${longitude}&latitude=${latitude}&access_token=${MAPBOX_ACCESS_TOKEN}`
    );
    const data = await response.json();

    if (data.features && data.features.length > 0) {
      return (
        data.features[0].properties.full_address ||
        data.features[0].properties.name
      );
    }
    throw new Error('Address not found');
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    throw error;
  }
};

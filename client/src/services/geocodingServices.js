import api from "../config/api";

const geocodingService = {
  // Address to coordinates
  geocode: async (address) => {
    const response = await api.post("/geocoding/geocode", { address });
    return response.data;
  },

  // Coordinates to address
  reverseGeocode: async (latitude, longitude) => {
    const response = await api.post("/geocoding/reverse-geocode", {
      latitude,
      longitude,
    });
    return response.data;
  },
};

export default geocodingService;

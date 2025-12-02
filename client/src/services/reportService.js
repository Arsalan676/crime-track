import api from "../config/api";

const reportService = {
  // Create new report
  createReport: async (reportData) => {
    const response = await api.post("/reports/create", reportData);
    return response.data;
  },

  // Get user's reports
  getUserReports: async (mobileNumber) => {
    const response = await api.get(`/reports/user/${mobileNumber}`);
    return response.data;
  },

  // Get heatmap data
  getHeatmapData: async () => {
    const response = await api.get("/reports/heatmap-data");
    return response.data;
  },
};

export default reportService;

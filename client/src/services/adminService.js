import api from "../config/api";

const adminService = {
  // Get dashboard stats
  getDashboardStats: async () => {
    const response = await api.get("/admin/dashboard/stats");
    return response.data;
  },

  // Get all reports
  getReports: async (status = "") => {
    const url =
      status && status !== "all"
        ? `/admin/reports?status=${status}`
        : "/admin/reports";
    const response = await api.get(url);
    return response.data;
  },

  // Update report status
  verifyReport: async (reportId, status, adminNotes = "") => {
    const response = await api.put(`/admin/reports/${reportId}/verify`, {
      status,
      adminNotes,
    });
    return response.data;
  },
};

export default adminService;

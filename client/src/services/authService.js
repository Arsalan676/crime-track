import api from "../config/api";

const authService = {
  // Verify phone with Firebase token
  verifyFirebaseToken: async (idToken, phoneNumber) => {
    const response = await api.post("/users/verify-firebase-token", {
      idToken,
      phoneNumber,
    });
    return response.data;
  },

  // Check if number is verified
  checkVerification: async (mobileNumber) => {
    const response = await api.get(`/users/check-verification/${mobileNumber}`);
    return response.data;
  },

  // Admin login
  adminLogin: async (username, password) => {
    const response = await api.post("/admin/login", { username, password });
    if (response.data.token) {
      localStorage.setItem("adminToken", response.data.token);
    }
    return response.data;
  },

  // Admin logout
  adminLogout: () => {
    localStorage.removeItem("adminToken");
  },

  // Check if admin is logged in
  isAdminLoggedIn: () => {
    return !!localStorage.getItem("adminToken");
  },

  // Get stored mobile number
  getVerifiedMobile: () => {
    return localStorage.getItem("verifiedMobile");
  },

  // Store verified mobile
  setVerifiedMobile: (mobile) => {
    localStorage.setItem("verifiedMobile", mobile);
  },

  // Clear verified mobile
  clearVerifiedMobile: () => {
    localStorage.removeItem("verifiedMobile");
  },
};

export default authService;

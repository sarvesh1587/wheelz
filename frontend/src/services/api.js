// frontend/src/services/api.js
import axios from "axios";
import toast from "react-hot-toast";

const API_BASE =
  process.env.REACT_APP_API_URL || "https://wheelz-ldq2.onrender.com/api";

console.log("API Base URL:", API_BASE);

const api = axios.create({
  baseURL: API_BASE,
  timeout: 120000,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("wheelz_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error),
);

// Update the response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    console.error("API Error:", error.config?.url, error.message);

    // ✅ If 401 and not already retrying, try to refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Try to refresh token (if you have refresh token endpoint)
      try {
        const refreshToken = localStorage.getItem("wheelz_refresh_token");
        if (refreshToken) {
          const response = await api.post("/auth/refresh-token", {
            refreshToken,
          });
          localStorage.setItem("wheelz_token", response.data.token);
          originalRequest.headers.Authorization = `Bearer ${response.data.token}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, logout
        localStorage.removeItem("wheelz_token");
        localStorage.removeItem("wheelz_user");
        window.location.href = "/login";
        return Promise.reject(error);
      }
    }

    // Don't redirect on 401 for specific endpoints
    if (
      error.response?.status === 401 &&
      error.config?.url?.includes("/rideshare")
    ) {
      // Just return empty data instead of redirecting
      return Promise.resolve({ data: { success: false, trips: [] } });
    }

    const message =
      error.response?.data?.message || error.message || "Something went wrong";

    if (error.response?.status === 401) {
      localStorage.removeItem("wheelz_token");
      localStorage.removeItem("wheelz_user");
      // ✅ Add delay before redirect to avoid race conditions
      setTimeout(() => {
        window.location.href = "/login";
      }, 100);
    } else if (error.response?.status !== 404) {
      toast.error(message);
    }
    return Promise.reject(error);
  },
);

export const authAPI = {
  register: (data) => api.post("/auth/register", data),
  login: (data) => api.post("/auth/login", data),
  getMe: () => api.get("/auth/me"),
  updateProfile: (data) => api.put("/auth/profile", data),
  changePassword: (data) => api.put("/auth/change-password", data),
  forgotPassword: (data) => api.post("/auth/forgot-password", data),
  resetPassword: (token, data) =>
    api.post(`/auth/reset-password/${token}`, data),
  googleLogin: (data) => api.post("/auth/google/google-login", data),
};
export const tripPlannerAPI = {
  plan: (data) => api.post("/trip-planner/plan", data),
  quickEstimate: (data) => api.post("/trip-planner/estimate", data),
};
// frontend/src/services/api.js - rideShareAPI section
export const rideShareAPI = {
  create: (data) => api.post("/rideshare", data),
  search: (params) => api.get("/rideshare/search", { params }),
  getOne: (id) => api.get(`/rideshare/${id}`),
  getMyTrips: () => api.get("/rideshare/my/trips"),
  getMyRides: () => api.get("/rideshare/my/rides"),
  getTripRequests: (tripId) => api.get(`/rideshare/${tripId}/requests`),
  getDriverRequests: () => api.get("/rideshare/driver/requests"),
  requestSeat: (data) => api.post("/rideshare/request", data),
  respondToRequest: (requestId, data) =>
    api.put(`/rideshare/request/${requestId}/respond`, data),

  // ✅ These are the ones that were missing/404ing
  cancelRequest: (requestId) =>
    api.put(`/rideshare/request/${requestId}/cancel`),
  createPayment: (requestId) => api.post(`/rideshare/request/${requestId}/pay`),
  verifyPayment: (data) =>
    api.post(`/rideshare/request/${data.requestId}/verify`, data),
  sendMessage: (requestId, data) =>
    api.post(`/rideshare/request/${requestId}/message`, data),
  getMessages: (requestId) =>
    api.get(`/rideshare/request/${requestId}/messages`),
  rateUser: (requestId, data) =>
    api.post(`/rideshare/request/${requestId}/rate`, data),
  reportRide: (requestId, data) =>
    api.post(`/rideshare/request/${requestId}/report`, data),

  completeTrip: (tripId) => api.put(`/rideshare/${tripId}/complete`),
  cancelTrip: (tripId, reason) =>
    api.put(`/rideshare/${tripId}/cancel`, { reason }),
};
export const vehicleAPI = {
  getAll: (params) => api.get("/vehicles", { params }),
  getOne: (id) => api.get(`/vehicles/${id}`),
  create: (data) => api.post("/vehicles", data),
  update: (id, data) => api.put(`/vehicles/${id}`, data),
  delete: (id) => api.delete(`/vehicles/${id}`),
  checkAvailability: (id, params) =>
    api.get(`/vehicles/${id}/availability`, { params }),
  getCategoryStats: () => api.get("/vehicles/stats/categories"),
  getVendorVehicles: () => api.get("/vehicles/vendor/my-vehicles"),
};

export const bookingAPI = {
  create: (data) => api.post("/bookings", data),
  getAll: (params) => api.get("/bookings", { params }),
  getOne: (id) => api.get(`/bookings/${id}`),
  cancel: (id, data) => api.put(`/bookings/${id}/cancel`, data),
  processPayment: (id, data) => api.put(`/bookings/${id}/payment`, data),
  getMyStats: () => api.get("/bookings/my-stats"),
  getVendorBookings: () => api.get("/bookings/vendor/my-bookings"),
};

export const paymentAPI = {
  createOrder: (bookingId) => api.post("/payments/create-order", { bookingId }),
  verifyPayment: (data) => api.post("/payments/verify", data),
  createQRCode: (bookingId) => api.post("/payments/create-qr", { bookingId }),
  checkQRStatus: (qrCodeId) => api.get(`/payments/qr-status/${qrCodeId}`),
  createUPIIntent: (bookingId) =>
    api.post("/payments/create-upi-intent", { bookingId }),
  confirm: (bookingId, method) =>
    api.post(`/payments/confirm/${bookingId}`, { method }),
};

export const aiAPI = {
  chat: (message, history) =>
    api.post("/ai/chat", { message, conversationHistory: history }),
  smartSearch: (query) => api.post("/ai/smart-search", { query }),
  getRecommendations: () => api.get("/ai/recommendations"),
  getFraudAlerts: () => api.get("/ai/fraud-alerts"),
  resolveFraudAlert: (id, data) =>
    api.put(`/ai/fraud-alerts/${id}/resolve`, data),
};

export const adminAPI = {
  getDashboard: () => api.get("/admin/dashboard"),
  getAllUsers: (params) => api.get("/admin/users", { params }),
  getUserById: (id) => api.get(`/admin/users/${id}`),
  toggleUserActive: (id) => api.put(`/admin/users/${id}/toggle-active`),
  toggleVendorStatus: (id, status) =>
    api.put(`/admin/vendors/${id}/status`, { approved: status }),
  getRevenueBreakdown: () => api.get("/admin/revenue/breakdown"),
};

export const reviewAPI = {
  getByVehicle: (vehicleId) => api.get(`/reviews/vehicle/${vehicleId}`),
  getFeatured: () => api.get("/reviews/featured"),
  create: (data) => api.post("/reviews", data),
};

export const wishlistAPI = {
  get: () => api.get("/wishlist"),
  toggle: (vehicleId) => api.post(`/wishlist/${vehicleId}`),
};

export const kycAPI = {
  submit: (formData) =>
    api.post("/kyc/submit", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  getStatus: () => api.get("/kyc/status"),
  getAll: (params) => api.get("/kyc/admin/all", { params }),
  getByUser: (userId) => api.get(`/kyc/admin/${userId}`),
  verify: (userId) => api.put(`/kyc/admin/${userId}/verify`),
  reject: (userId, reason) =>
    api.put(`/kyc/admin/${userId}/reject`, { reason }),
};

export const chatbotAPI = {
  chat: (data) => api.post("/chatbot/chat", data),
  getMyBookings: () => api.get("/chatbot/my-bookings"),
};

export default api;

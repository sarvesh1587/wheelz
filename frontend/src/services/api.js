/**
 * API Service - Axios instance with interceptors
 */

import axios from "axios";
import toast from "react-hot-toast";

// API Base URL - Single declaration
const API_BASE =
  process.env.REACT_APP_API_URL || "https://wheelz-ldq2.onrender.com/api";

console.log("API Base URL:", API_BASE);

const api = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
  headers: { "Content-Type": "application/json" },
});

// Attach JWT token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("wheelz_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error),
);

// Global response error handler
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error.config?.url, error.message);
    const message =
      error.response?.data?.message || error.message || "Something went wrong";
    if (error.response?.status === 401) {
      localStorage.removeItem("wheelz_token");
      localStorage.removeItem("wheelz_user");
      window.location.href = "/login";
    } else if (error.response?.status !== 404) {
      toast.error(message);
    }
    return Promise.reject(error);
  },
);

// ─── Auth ─────────────────────────────────────────────────────────────────────
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

// ─── Vehicles ─────────────────────────────────────────────────────────────────
// export const vehicleAPI = {
//   getAll: (params) => api.get("/vehicles", { params }),
//   getOne: (id) => api.get(`/vehicles/${id}`),
//   create: (data) => api.post("/vehicles", data),
//   update: (id, data) => api.put(`/vehicles/${id}`, data),
//   delete: (id) => api.delete(`/vehicles/${id}`),
//   checkAvailability: (id, params) =>
//     api.get(`/vehicles/${id}/availability`, { params }),
//   getCategoryStats: () => api.get("/vehicles/stats/categories"),
// };
// Add to your api.js file

export const vehicleAPI = {
  getAll: (params) => api.get("/vehicles", { params }),
  getOne: (id) => api.get(`/vehicles/${id}`),
  create: (data) => api.post("/vehicles", data),
  update: (id, data) => api.put(`/vehicles/${id}`, data),
  delete: (id) => api.delete(`/vehicles/${id}`),
  checkAvailability: (id, params) =>
    api.get(`/vehicles/${id}/availability`, { params }),
  getCategoryStats: () => api.get("/vehicles/stats/categories"),

  // ✅ ADD THESE NEW METHODS:
  getVendorVehicles: () => api.get("/vehicles/vendor/my-vehicles"), // ← New endpoint
};

export const bookingAPI = {
  create: (data) => api.post("/bookings", data),
  getAll: (params) => api.get("/bookings", { params }),
  getOne: (id) => api.get(`/bookings/${id}`),
  cancel: (id, data) => api.put(`/bookings/${id}/cancel`, data),
  processPayment: (id, data) => api.put(`/bookings/${id}/payment`, data),
  getMyStats: () => api.get("/bookings/my-stats"),

  // ✅ ADD THESE NEW METHODS:
  getVendorBookings: () => api.get("/bookings/vendor/my-bookings"), // ← New endpoint
};
// ─── Bookings ─────────────────────────────────────────────────────────────────
// export const bookingAPI = {
//   create: (data) => api.post("/bookings", data),
//   getAll: (params) => api.get("/bookings", { params }),
//   getOne: (id) => api.get(`/bookings/${id}`),
//   cancel: (id, data) => api.put(`/bookings/${id}/cancel`, data),
//   processPayment: (id, data) => api.put(`/bookings/${id}/payment`, data),
//   getMyStats: () => api.get("/bookings/my-stats"),
// };

// ─── Payments ─────────────────────────────────────────────────────────────────
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

// ─── AI ───────────────────────────────────────────────────────────────────────
export const aiAPI = {
  chat: (message, history) =>
    api.post("/ai/chat", { message, conversationHistory: history }),
  smartSearch: (query) => api.post("/ai/smart-search", { query }),
  getRecommendations: () => api.get("/ai/recommendations"),
  getFraudAlerts: () => api.get("/ai/fraud-alerts"),
  resolveFraudAlert: (id, data) =>
    api.put(`/ai/fraud-alerts/${id}/resolve`, data),
};

// ─── Admin ────────────────────────────────────────────────────────────────────
// export const adminAPI = {
//   getDashboard: () => api.get("/admin/dashboard"),
//   getAllUsers: (params) => api.get("/admin/users", { params }),
//   toggleUserActive: (id) => api.put(`/admin/users/${id}/toggle-active`),
//   getRevenueBreakdown: () => api.get("/admin/revenue/breakdown"),
// };
// Add to adminAPI object in api.js
export const adminAPI = {
  getDashboard: () => api.get("/admin/dashboard"),
  getAllUsers: (params) => api.get("/admin/users", { params }),
  getUserById: (id) => api.get(`/admin/users/${id}`), // ← Add this
  toggleUserActive: (id) => api.put(`/admin/users/${id}/toggle-active`),
  toggleVendorStatus: (id, status) =>
    api.put(`/admin/vendors/${id}/status`, { approved: status }), // ← Add this
  getRevenueBreakdown: () => api.get("/admin/revenue/breakdown"),
};
// ─── Reviews ──────────────────────────────────────────────────────────────────
export const reviewAPI = {
  getByVehicle: (vehicleId) => api.get(`/reviews/vehicle/${vehicleId}`),
  create: (data) => api.post("/reviews", data),
};

// ─── Wishlist ─────────────────────────────────────────────────────────────────
export const wishlistAPI = {
  get: () => api.get("/wishlist"),
  toggle: (vehicleId) => api.post(`/wishlist/${vehicleId}`),
};

export default api;

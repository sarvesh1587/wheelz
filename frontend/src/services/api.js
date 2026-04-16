/**
 * API Service - Axios instance with interceptors
 */

import axios from "axios";
import toast from "react-hot-toast";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5002/api";

const api = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
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

api.interceptors.response.use(
  (response) => response,
  (error) => {
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

export const authAPI = {
  register: (data) => api.post("/auth/register", data),
  login: (data) => api.post("/auth/login", data),
  getMe: () => api.get("/auth/me"),
  updateProfile: (data) => api.put("/auth/profile", data),
  changePassword: (data) => api.put("/auth/change-password", data),
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
};

export const bookingAPI = {
  create: (data) => api.post("/bookings", data),
  getAll: (params) => api.get("/bookings", { params }),
  getOne: (id) => api.get(`/bookings/${id}`),
  cancel: (id, data) => api.put(`/bookings/${id}/cancel`, data),
  processPayment: (id, data) => api.put(`/bookings/${id}/payment`, data),
  getMyStats: () => api.get("/bookings/my-stats"),
};

export const paymentAPI = {
  createIntent: (bookingId) =>
    api.post("/payments/create-intent", { bookingId }),
  confirm: (bookingId, method) =>
    api.post("/payments/confirm", { bookingId, paymentMethod: method }),
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
  toggleUserActive: (id) => api.put(`/admin/users/${id}/toggle-active`),
  getRevenueBreakdown: () => api.get("/admin/revenue/breakdown"),
};

export const reviewAPI = {
  getByVehicle: (vehicleId) => api.get(`/reviews/vehicle/${vehicleId}`),
  create: (data) => api.post("/reviews", data),
};

export const wishlistAPI = {
  get: () => api.get("/wishlist"),
  toggle: (vehicleId) => api.post(`/wishlist/${vehicleId}`),
};

export default api;

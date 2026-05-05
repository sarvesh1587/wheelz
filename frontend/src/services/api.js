import axios from "axios";
import toast from "react-hot-toast";

const API_BASE =
  process.env.REACT_APP_API_URL || "https://wheelz-ldq2.onrender.com/api";

console.log("API Base URL:", API_BASE);

const api = axios.create({
  baseURL: API_BASE,
  timeout: 60000,
  headers: { "Content-Type": "application/json" },
});

// Track pending requests
let pendingRequests = new Map();

// Attach JWT token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("wheelz_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;

    const requestKey = `${config.method}:${config.url}`;
    if (pendingRequests.has(requestKey) && !config.url.includes("/bookings")) {
      const cancelToken = pendingRequests.get(requestKey);
      cancelToken.cancel("Duplicate request cancelled");
    }

    const cancelTokenSource = axios.CancelToken.source();
    config.cancelToken = cancelTokenSource.token;
    pendingRequests.set(requestKey, cancelTokenSource);
    config.requestKey = requestKey;

    return config;
  },
  (error) => Promise.reject(error),
);

// Cleanup pending requests after response
api.interceptors.response.use(
  (response) => {
    if (response.config.requestKey) {
      pendingRequests.delete(response.config.requestKey);
    }
    return response;
  },
  (error) => {
    if (error.config && error.config.requestKey) {
      pendingRequests.delete(error.config.requestKey);
    }

    if (axios.isCancel(error)) {
      console.log("Request cancelled:", error.message);
      return Promise.reject(error);
    }

    console.error("API Error:", error.config?.url, error.message);

    if (
      error.config?.url?.includes("/bookings") &&
      (error.code === "ECONNABORTED" || error.message?.includes("timeout"))
    ) {
      return Promise.reject({ ...error, isBookingTimeout: true });
    }

    if (error.code === "ECONNABORTED" || error.message?.includes("timeout")) {
      toast.error(
        "Server is taking longer than expected. Please check your dashboard.",
      );
      return Promise.reject(error);
    }

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
export const otpAPI = {
  send: (data) => api.post("/otp/send", data, { timeout: 120000 }), // 120 seconds
  verify: (data) => api.post("/otp/verify", data),
  resend: (data) => api.post("/otp/resend", data),
  check: (email) => api.get(`/otp/check?email=${email}`),
};
// ─── Vehicles ─────────────────────────────────────────────────────────────────
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

// ─── Bookings ─────────────────────────────────────────────────────────────────
export const bookingAPI = {
  create: (data) => api.post("/bookings", data),
  getAll: (params) => api.get("/bookings", { params }),
  getOne: (id) => api.get(`/bookings/${id}`),
  cancel: (id, data) => api.put(`/bookings/${id}/cancel`, data),
  processPayment: (id, data) => api.put(`/bookings/${id}/payment`, data),
  getMyStats: () => api.get("/bookings/my-stats"),
  getVendorBookings: () => api.get("/bookings/vendor/my-bookings"),
};

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
export const adminAPI = {
  getDashboard: () => api.get("/admin/dashboard"),
  getAllUsers: (params) => api.get("/admin/users", { params }),
  getUserById: (id) => api.get(`/admin/users/${id}`),
  toggleUserActive: (id) => api.put(`/admin/users/${id}/toggle-active`),
  toggleVendorStatus: (id, status) =>
    api.put(`/admin/vendors/${id}/status`, { approved: status }),
  getRevenueBreakdown: () => api.get("/admin/revenue/breakdown"),
};

// ─── Reviews ──────────────────────────────────────────────────────────────────
export const reviewAPI = {
  getByVehicle: (vehicleId) => api.get(`/reviews/vehicle/${vehicleId}`),
  getFeatured: () => api.get("/reviews/featured"),
  create: (data) => api.post("/reviews", data),
};

// ─── Wishlist ─────────────────────────────────────────────────────────────────
export const wishlistAPI = {
  get: () => api.get("/wishlist"),
  toggle: (vehicleId) => api.post(`/wishlist/${vehicleId}`),
};

// ─── KYC ─────────────────────────────────────────────────────────────────────
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

export default api;

// frontend/src/pages/Register.jsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { authAPI } from "../services/api";
import toast from "react-hot-toast";
import { useGoogleReCaptcha } from "@google-recaptcha/react"; // ADD THIS

export default function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const googleReCaptcha = useGoogleReCaptcha(); // ADD THIS

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    // Validate phone number (optional but recommended)
    if (formData.phone && !/^[6-9]\d{9}$/.test(formData.phone)) {
      toast.error("Please enter a valid 10-digit mobile number");
      return;
    }

    setLoading(true);

    try {
      // CHECK: Is reCAPTCHA loaded?
      if (!googleReCaptcha) {
        toast.error("Security check not loaded. Please refresh the page.");
        setLoading(false);
        return;
      }

      // EXECUTE: Get reCAPTCHA token (invisible to user)
      const token = await googleReCaptcha.executeV3("register");

      if (!token) {
        toast.error("Security verification failed. Please try again.");
        setLoading(false);
        return;
      }

      // SEND: Include token with registration data
      const res = await authAPI.register({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        recaptchaToken: token, // ADD THIS - sends token to backend
      });

      // Auto login after registration
      login(res.data.token, res.data.user);
      toast.success("Registration successful!");
      navigate("/");
    } catch (error) {
      console.error("Registration error:", error);

      // Handle specific error cases
      if (error.response?.data?.message === "reCAPTCHA verification failed") {
        toast.error("Security verification failed. Please try again.");
      } else if (error.response?.data?.message?.includes("already exists")) {
        toast.error("Email already registered. Please login.");
        navigate("/login");
      } else {
        const errorMsg = error.response?.data?.message || "Registration failed";
        toast.error(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 pt-20">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Create Account
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              Join Wheelz for seamless vehicle rentals
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-amber-500"
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-amber-500"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-amber-500"
                placeholder="9876543210"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-amber-500"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-amber-500"
                placeholder="••••••••"
              />
            </div>

            {/* ADD THIS: Hidden reCAPTCHA badge (required by Google) */}
            <div className="text-xs text-gray-400 text-center mt-2">
              Protected by reCAPTCHA
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
            >
              {loading ? "Creating account..." : "Sign Up"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-amber-500 hover:underline">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

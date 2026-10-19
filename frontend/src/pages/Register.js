// frontend/src/pages/Register.jsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { authAPI } from "../services/api";
import toast from "react-hot-toast";
import AuthShell from "../components/auth/AuthShell";
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
    <AuthShell
      eyebrow="Join Wheelz"
      title={["Create", "your account."]}
      subtitle="Rent cars and bikes from verified owners across 15 cities."
      image="https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=1600&q=80"
      quote={{ text: "Weekend in Goa on a Royal Enfield. Smoothest rental I've had.", author: "Rohit, Pune" }}
    >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="field-label">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="field"
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label className="field-label">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="field"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="field-label">
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                className="field"
                placeholder="9876543210"
              />
            </div>

            <div>
              <label className="field-label">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="field"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label className="field-label">
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="field"
                placeholder="••••••••"
              />
            </div>

            <div className="eyebrow">
              Protected by reCAPTCHA
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full !py-4"
            >
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>

          <p className="mt-10 text-sm text-muted">
            Already have an account?{" "}
            <Link to="/login" className="link-underline font-medium text-ink">
              Log in
            </Link>
          </p>
    </AuthShell>
  );
}

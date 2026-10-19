import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { authAPI } from "../services/api";
import { GoogleLogin } from "@react-oauth/google";
import { GoogleOAuthProvider } from "@react-oauth/google";
import toast from "react-hot-toast";
import AuthShell from "../components/auth/AuthShell";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authAPI.login(formData);

      if (res.data.token && res.data.user) {
        login(res.data.token, res.data.user);
        toast.success("Login successful!");
        navigate("/");
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error(error.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };
  // const handleGoogleSuccess = async (credentialResponse) => {
  //   try {
  //     const res = await authAPI.googleLogin({
  //       credential: credentialResponse.credential,
  //     });
  //     login(res.data.token, res.data.user);
  //     toast.success("Google login successful!");
  //     navigate("/");
  //   } catch (error) {
  //     console.error("Google login error:", error);
  //     toast.error("Google login failed. Please try again.");
  //   }
  // };
  const handleGoogleSuccess = async (credentialResponse) => {

    try {
      const res = await authAPI.googleLogin({
        credential: credentialResponse.credential,
      });
      login(res.data.token, res.data.user);
      toast.success("Google login successful!");
      navigate("/");
    } catch (error) {
      console.error("Google login error:", error);
      console.error("Error response:", error.response?.data);
      toast.error(
        error.response?.data?.message ||
          "Google login failed. Please try again.",
      );
    }
  };
  const handleGoogleError = () => {
    toast.error("Google login failed. Please try again.");
  };

  return (
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
      <AuthShell
        eyebrow="Welcome back"
        title={["Log in."]}
        subtitle="Pick up where you left off."
        image="https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=1600&q=80"
        quote={{ text: "Booked a Creta in four minutes. Keys were waiting at the pickup point.", author: "Ananya, Bangalore" }}
      >
            {/* Email/Password Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
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

              <div className="flex justify-end">
                <Link
                  to="/forgot-password"
                  className="link-underline text-sm text-muted hover:text-ink"
                >
                  Forgot Password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full !py-4"
              >
                {loading ? "Logging in…" : "Log in"}
              </button>
            </form>

            <div className="my-8 flex items-center gap-4">
              <span className="h-px flex-1 bg-line/10" />
              <span className="eyebrow">or</span>
              <span className="h-px flex-1 bg-line/10" />
            </div>

            {/* Fixed Google Login Button */}
            <div className="flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                width="250"
                size="large"
                text="continue_with"
                theme="filled_black"
                shape="pill"
              />
            </div>

            <p className="mt-10 text-sm text-muted">
              New to Wheelz?{" "}
              <Link to="/register" className="link-underline font-medium text-ink">
                Create an account
              </Link>
            </p>
      </AuthShell>
    </GoogleOAuthProvider>
  );
}

import React, { useState } from "react";
import { Link } from "react-router-dom";
import { authAPI } from "../services/api";
import toast from "react-hot-toast";
import { ArrowLeft, Mail } from "lucide-react";
import AuthShell from "../components/auth/AuthShell";
import { Spinner } from "../components/ui";

const SHELL = {
  image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1600&q=80",
  quote: { text: "Reset your password and get back on the road.", author: "Wheelz" },
};

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email");
      return;
    }

    setLoading(true);
    try {
      await authAPI.forgotPassword({ email });
      setSent(true);
      toast.success("Reset link sent to your email!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send reset link");
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <AuthShell
        eyebrow="Check your inbox"
        title={["Link sent."]}
        subtitle="The link expires in 10 minutes."
        {...SHELL}
      >
        <div className="flex items-start gap-4 border-y border-line/10 py-6">
          <Mail size={18} className="mt-0.5 shrink-0 text-accent" />
          <p className="text-muted">
            We've sent a password reset link to <strong className="text-ink">{email}</strong>
          </p>
        </div>
        <Link to="/login" className="btn-ghost mt-10">
          <ArrowLeft size={16} /> Back to login
        </Link>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      eyebrow="Account recovery"
      title={["Forgot", "password?"]}
      subtitle="Enter your email and we'll send you a reset link."
      {...SHELL}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="field-label">Email address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="field"
            placeholder="you@example.com"
            required
          />
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full !py-4">
          {loading ? <Spinner /> : "Send reset link"}
        </button>
      </form>

      <p className="mt-10 text-sm text-muted">
        Remembered it?{" "}
        <Link to="/login" className="link-underline font-medium text-ink">
          Back to login
        </Link>
      </p>
    </AuthShell>
  );
}

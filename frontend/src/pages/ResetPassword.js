import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';
import { Eye, EyeOff } from 'lucide-react';
import AuthShell from '../components/auth/AuthShell';
import { Spinner } from '../components/ui';

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await authAPI.resetPassword(token, { password });
      toast.success('Password reset successful! Please login.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      eyebrow="Account recovery"
      title={['New', 'password.']}
      subtitle="Enter your new password below."
      image="https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1600&q=80"
      quote={{ text: 'Reset your password and get back on the road.', author: 'Wheelz' }}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="field-label">New password</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="field !pr-10"
              placeholder="••••••"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="absolute right-0 top-1/2 -translate-y-1/2 text-muted hover:text-ink"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <div>
          <label className="field-label">Confirm password</label>
          <input
            type={showPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="field"
            placeholder="••••••"
            required
          />
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full !py-4">
          {loading ? <Spinner /> : 'Reset password'}
        </button>
      </form>

      <p className="mt-10 text-sm text-muted">
        <Link to="/login" className="link-underline font-medium text-ink">
          Back to login
        </Link>
      </p>
    </AuthShell>
  );
}

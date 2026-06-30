// frontend/src/pages/auth/LoginPage.jsx
/**
 * Login page with resend OTP for unverified accounts.
 */
import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiEye, FiEyeOff, FiSend, FiAlertCircle } from 'react-icons/fi';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../api';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showResendOTP, setShowResendOTP] = useState(false);
  const [resendEmail, setResendEmail] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setShowResendOTP(false);
    setError('');

    // Basic validation
    if (!form.email.trim()) {
      setError('Please enter your email address.');
      setLoading(false);
      return;
    }
    if (!form.password.trim()) {
      setError('Please enter your password.');
      setLoading(false);
      return;
    }

    try {
      const user = await login(form.email, form.password);
      toast.success(`Welcome back, ${user.full_name?.split(' ')[0] || 'User'}!`);
      navigate(from, { replace: true });
    } catch (err) {
      console.error('Login error details:', err);
      console.error('Error response:', err.response?.data);
      
      // Get error message - handle both string and object responses
      let msg = 'Invalid email or password. Please try again.';
      
      if (err.response?.data) {
        const data = err.response.data;
        // Check if data is an object with detail field
        if (typeof data === 'object') {
          // Try to get the error message from various possible fields
          if (data.detail && typeof data.detail === 'string') {
            msg = data.detail;
          } else if (data.message && typeof data.message === 'string') {
            msg = data.message;
          } else if (data.error && typeof data.error === 'string') {
            msg = data.error;
          } else if (data.non_field_errors && Array.isArray(data.non_field_errors)) {
            msg = data.non_field_errors.join(', ');
          } else if (data.email) {
            msg = Array.isArray(data.email) ? data.email.join(', ') : String(data.email);
          } else if (data.password) {
            msg = Array.isArray(data.password) ? data.password.join(', ') : String(data.password);
          } else {
            // If no specific field, stringify the object
            msg = JSON.stringify(data);
          }
        } else if (typeof data === 'string') {
          msg = data;
        }
      }
      
      // Ensure msg is a string before calling toLowerCase
      const msgStr = typeof msg === 'string' ? msg : String(msg);
      
      // Check if the error is about account not being verified
      if (msgStr.toLowerCase().includes('verify') || 
          msgStr.toLowerCase().includes('activate') || 
          msgStr.toLowerCase().includes('otp') ||
          msgStr.toLowerCase().includes('email') ||
          msgStr.toLowerCase().includes('not active') ||
          msgStr.toLowerCase().includes('inactive')) {
        setShowResendOTP(true);
        setResendEmail(form.email);
        setError('Account not activated. Please verify your email OTP.');
        toast.error('Account not activated.');
      } else {
        setError(msgStr);
        toast.error(msgStr);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!resendEmail) {
      toast.error('Please enter your email address.');
      return;
    }
    setResendLoading(true);
    try {
      await authAPI.requestOTP({ 
        email: resendEmail, 
        purpose: 'email_register' 
      });
      toast.success('OTP resent successfully! Please check your email.');
      navigate('/verify-otp', { 
        state: { email: resendEmail } 
      });
    } catch (err) {
      const errorMsg = err.response?.data?.detail || 'Failed to resend OTP. Please try again.';
      toast.error(errorMsg);
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-10">
      <Helmet><title>Login - Lintro</title></Helmet>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md card p-6 md:p-8"
      >
        <h1 className="font-display font-bold text-2xl text-center mb-1">Welcome Back</h1>
        <p className="text-sm text-slate-500 text-center mb-6">Log in to your Lintro account</p>

        {/* ===== ERROR ALERT ===== */}
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mb-4 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-2"
          >
            <FiAlertCircle className="text-red-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm text-red-700 dark:text-red-300 font-medium">
                {error}
              </p>
            </div>
            <button
              onClick={() => setError('')}
              className="text-red-400 hover:text-red-600 text-sm"
            >
              ✕
            </button>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Email Address</label>
            <div className="relative">
              <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                required
                autoComplete="email"
                value={form.email}
                onChange={(e) => {
                  setForm({ ...form, email: e.target.value });
                  setError('');
                }}
                className={`input pl-10 ${error ? 'border-red-500 focus:ring-red-500' : ''}`}
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div>
            <label className="label">Password</label>
            <div className="relative">
              <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type={showPwd ? 'text' : 'password'}
                required
                autoComplete="current-password"
                value={form.password}
                onChange={(e) => {
                  setForm({ ...form, password: e.target.value });
                  setError('');
                }}
                className={`input pl-10 pr-10 ${error ? 'border-red-500 focus:ring-red-500' : ''}`}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPwd(!showPwd)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPwd ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          </div>

          <div className="text-right">
            <Link to="/forgot-password" className="text-sm text-brand hover:underline">
              Forgot password?
            </Link>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full py-3">
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>

        {/* ===== RESEND OTP SECTION ===== */}
        {showResendOTP && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-4 p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg"
          >
            <div className="flex items-start gap-2">
              <FiAlertCircle className="text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm text-amber-800 dark:text-amber-200 font-medium">
                  Account not activated
                </p>
                <p className="text-xs text-amber-700 dark:text-amber-300 mt-0.5">
                  Please verify your email address to continue.
                </p>
                <button
                  onClick={handleResendOTP}
                  disabled={resendLoading}
                  className="mt-2 text-xs text-brand hover:underline flex items-center gap-1"
                >
                  <FiSend size={12} />
                  {resendLoading ? 'Sending...' : 'Resend OTP'}
                </button>
              </div>
            </div>
          </motion.div>
        )}

        <p className="text-sm text-center text-slate-500 mt-4">
          Don't have an account?{' '}
          <Link to="/register" className="link">Sign up</Link>
        </p>

        <div className="mt-6 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
          <p className="text-xs text-amber-800 dark:text-amber-200">
            <strong>Safety Notice:</strong> Buyers must verify the seller before making any payment.
            Lintro only connects users and is not responsible for offline transactions.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
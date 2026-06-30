// frontend/src/pages/auth/RegisterPage.jsx
/**
 * Register page - submits and redirects to OTP verification.
 */
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiUser, FiPhone, FiEye, FiEyeOff, FiAlertCircle } from 'react-icons/fi';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { authAPI } from '../../api';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    full_name: '', email: '', mobile_number: '',
    password: '', password2: '',
    whatsapp_number: '', district: '', state: '',
  });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.password2) {
      toast.error('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      await authAPI.register(form);
      toast.success('Registration successful! Please verify your email with the OTP sent.');
      navigate('/verify-otp', { 
        state: { 
          email: form.email,
          fromRegister: true
        } 
      });
    } catch (err) {
      const errors = err.response?.data;
      if (errors) {
        // Check if account already exists but unverified
        if (errors.email && errors.email.some(e => e.toLowerCase().includes('already') || e.toLowerCase().includes('exists'))) {
          // Try to resend OTP for existing unverified user
          try {
            await authAPI.requestOTP({ 
              email: form.email, 
              purpose: 'email_register' 
            });
            toast.success('An OTP has been sent to your email. Please verify.');
            navigate('/verify-otp', { 
              state: { 
                email: form.email,
                fromRegister: true,
                isResend: true
              } 
            });
          } catch (otpErr) {
            toast.error('Account exists but is not verified. Please check your email or try logging in.');
          }
          setLoading(false);
          return;
        }
        Object.entries(errors).forEach(([key, val]) => {
          const msg = Array.isArray(val) ? val.join(', ') : String(val);
          toast.error(`${key}: ${msg}`);
        });
      } else {
        toast.error('Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-10">
      <Helmet><title>Sign Up - Lintro</title></Helmet>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg card p-6 md:p-8"
      >
        <h1 className="font-display font-bold text-2xl text-center mb-1">Create Your Account</h1>
        <p className="text-sm text-slate-500 text-center mb-6">
          One account to buy and sell on Lintro
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="label">Full Name</label>
              <div className="relative">
                <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  name="full_name"
                  required
                  value={form.full_name}
                  onChange={handleChange}
                  className="input pl-10"
                  placeholder="Ramesh Kumar"
                />
              </div>
            </div>
            <div>
              <label className="label">Mobile Number</label>
              <div className="relative">
                <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  name="mobile_number"
                  required
                  value={form.mobile_number}
                  onChange={handleChange}
                  className="input pl-10"
                  placeholder="+919876543210"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="label">Email Address</label>
            <div className="relative">
              <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                name="email"
                type="email"
                required
                value={form.email}
                onChange={handleChange}
                className="input pl-10"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="label">WhatsApp Number (optional)</label>
              <input
                name="whatsapp_number"
                value={form.whatsapp_number}
                onChange={handleChange}
                className="input"
                placeholder="+919876543210"
              />
            </div>
            <div>
              <label className="label">District</label>
              <input
                name="district"
                value={form.district}
                onChange={handleChange}
                className="input"
                placeholder="Tirupur"
              />
            </div>
          </div>

          <div>
            <label className="label">State</label>
            <input
              name="state"
              value={form.state}
              onChange={handleChange}
              className="input"
              placeholder="TamilNadu"
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  name="password"
                  type={showPwd ? 'text' : 'password'}
                  required
                  value={form.password}
                  onChange={handleChange}
                  className="input pl-10 pr-10"
                  placeholder="Min 8 characters"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                >
                  {showPwd ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>
            <div>
              <label className="label">Confirm Password</label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  name="password2"
                  type={showPwd ? 'text' : 'password'}
                  required
                  value={form.password2}
                  onChange={handleChange}
                  className="input pl-10"
                  placeholder="Re-enter password"
                />
              </div>
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="text-sm text-center text-slate-500 mt-4">
          Already have an account?{' '}
          <Link to="/login" className="link">Log in</Link>
        </p>

        {/* Info message */}
        <div className="mt-4 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
          <div className="flex items-start gap-2">
            <FiAlertCircle className="text-blue-600 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-blue-700 dark:text-blue-300">
              <strong>Note:</strong> Your account will be created only after you verify your email.
              If you don't verify, you can request a new OTP.
            </p>
          </div>
        </div>

        <p className="text-[11px] text-slate-400 mt-4 text-center">
          By signing up, you agree to verify the seller before any payment.
          Lintro only connects users and is not responsible for offline transactions.
        </p>
      </motion.div>
    </div>
  );
}
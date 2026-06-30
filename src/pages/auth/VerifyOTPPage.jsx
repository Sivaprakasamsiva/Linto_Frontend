// frontend/src/pages/auth/VerifyOTPPage.jsx
/**
 * OTP verification page - used for email registration & password reset.
 */
import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { authAPI } from '../../api';

export default function VerifyOTPPage({ mode = 'register' }) {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';
  const fromRegister = location.state?.fromRegister || false;
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState('');

  const purpose = mode === 'forgot' ? 'password_reset' : 'email_register';

  useEffect(() => {
    if (!email) {
      const params = new URLSearchParams(location.search);
      const emailParam = params.get('email');
      if (emailParam) {
        // Use email from URL
        toast.info('Please enter the OTP sent to your email.');
      } else {
        toast.error('No email provided. Please register first.');
        navigate('/register');
      }
    }
  }, [email, navigate, location]);

  useEffect(() => {
    if (resendTimer > 0) {
      const t = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [resendTimer]);

  const handleChange = (idx, val) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp];
    next[idx] = val;
    setOtp(next);
    setError('');
    if (val && idx < 5) {
      const nextInput = document.getElementById(`otp-${idx + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (idx, e) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) {
      const prevInput = document.getElementById(`otp-${idx - 1}`);
      prevInput?.focus();
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length !== 6) {
      setError('Please enter the 6-digit code.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await authAPI.verifyOTP({ email, code, purpose });
      if (purpose === 'email_register') {
        toast.success('🎉 Email verified! Your account is now active.');
        // Navigate to login with success message
        navigate('/login', { 
          state: { 
            message: 'Account created and verified successfully! Please log in.',
            email: email 
          } 
        });
      } else {
        toast.success('OTP verified. Set a new password.');
        navigate('/reset-password', { 
          state: { email, verified: true, token: res.data.token } 
        });
      }
    } catch (err) {
      const errorMsg = err.response?.data?.detail || 'Invalid or expired OTP.';
      if (errorMsg.toLowerCase().includes('expired')) {
        setError('OTP expired. Please request a new one.');
        handleResend();
      } else if (errorMsg.toLowerCase().includes('verified') || errorMsg.toLowerCase().includes('already')) {
        toast.success('Account already verified! Please log in.');
        navigate('/login', { 
          state: { 
            message: 'Account already verified! Please log in.',
            email: email 
          } 
        });
      } else {
        setError(errorMsg);
        toast.error(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0 || isResending) return;
    setIsResending(true);
    try {
      await authAPI.requestOTP({ email, purpose });
      toast.success('New OTP sent to your email.');
      setResendTimer(60);
      setOtp(['', '', '', '', '', '']);
      setError('');
      document.getElementById('otp-0')?.focus();
    } catch (err) {
      const errorMsg = err.response?.data?.detail || 'Failed to resend OTP.';
      toast.error(errorMsg);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-10">
      <Helmet><title>Verify OTP - Lintro</title></Helmet>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md card p-6 md:p-8"
      >
        <h1 className="font-display font-bold text-2xl text-center mb-1">
          {purpose === 'password_reset' ? 'Reset Password' : 'Verify Your Email'}
        </h1>
        <p className="text-sm text-slate-500 text-center mb-2">
          Enter the 6-digit code sent to{' '}
          <span className="font-medium text-slate-700 dark:text-slate-200">{email}</span>
        </p>
        {fromRegister && (
          <p className="text-xs text-brand text-center mb-4">
            🔑 Your account will be created after verification
          </p>
        )}

        <form onSubmit={handleVerify} className="space-y-4">
          <div className="flex justify-center gap-2">
            {otp.map((digit, idx) => (
              <input
                key={idx}
                id={`otp-${idx}`}
                type="text"
                inputMode="numeric"
                maxLength="1"
                value={digit}
                onChange={(e) => handleChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                className={`w-12 h-14 text-center text-xl font-bold input ${
                  error ? 'border-red-500 focus:ring-red-500' : ''
                }`}
                autoFocus={idx === 0}
              />
            ))}
          </div>

          {error && (
            <p className="text-sm text-red-500 text-center">{error}</p>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Verifying...' : 'Verify & Create Account'}
          </button>
        </form>

        <div className="mt-4 text-center">
          {resendTimer > 0 ? (
            <p className="text-xs text-slate-500">
              Resend code in {resendTimer}s
            </p>
          ) : (
            <button 
              onClick={handleResend} 
              disabled={isResending}
              className="text-sm text-brand hover:underline disabled:opacity-50"
            >
              {isResending ? 'Sending...' : 'Resend OTP'}
            </button>
          )}
        </div>

        <div className="mt-4 text-center">
          <Link to="/login" className="text-sm text-slate-500 hover:underline">
            Back to login
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
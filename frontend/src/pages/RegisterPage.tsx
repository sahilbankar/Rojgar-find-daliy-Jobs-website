import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Briefcase, Lock, Mail, User as UserIcon, Phone, ArrowRight, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { UserRole } from '../types';
import { authAPI } from '../services/auth.service';

export const RegisterPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialRole = (searchParams.get('role') as UserRole) || 'jobseeker';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<UserRole>(initialRole);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const { login } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const cleanedPhone = phone.replace(/\D/g, '');

    if (!trimmedName || trimmedName.length < 2) {
      return 'Please enter your full name (at least 2 characters).';
    }
    if (!trimmedEmail) {
      return 'Please enter your email address.';
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      return 'Please enter a valid email address (e.g. yourname@example.com).';
    }
    if (phone && cleanedPhone.length !== 10) {
      return 'Phone number should be exactly 10 digits.';
    }
    if (!password) {
      return 'Please enter a password.';
    }
    if (password.length < 6) {
      return 'Password must be at least 6 characters long.';
    }
    if (!confirmPassword) {
      return 'Please confirm your password.';
    }
    if (password !== confirmPassword) {
      return 'Passwords do not match. Please re-enter your password.';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await authAPI.register({
        name: name.trim(),
        email: email.trim(),
        password,
        role,
        phone: phone.trim()
      });

      if (res && res.user) {
        setSuccessMessage('Registration successful! Redirecting to your dashboard...');
        
        // Save auth tokens & user in session
        login(res.user, res.accessToken || res.token || '', res.refreshToken);

        setTimeout(() => {
          if (res.user.role === 'admin') {
            navigate('/dashboard/admin');
          } else if (res.user.role === 'employer') {
            navigate('/dashboard/employer');
          } else {
            navigate('/dashboard/jobseeker');
          }
        }, 700);
      }
    } catch (err: any) {
      console.error('Register submit error:', err);
      const serverMsg =
        err?.response?.data?.message ||
        err?.response?.data?.errors?.[0]?.msg ||
        (err?.message === 'Network Error'
          ? 'Cannot connect to the server. Please check your network and try again.'
          : 'Registration failed. Please check your details and try again.');
      setError(serverMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white p-8 rounded-3xl border border-gray-200 shadow-xl space-y-6">
        
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 bg-blue-50 text-blue-600 rounded-2xl mb-2 shadow-sm">
            <Briefcase className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">ROJGAR Register</h1>
          <p className="text-xs text-gray-500 font-medium">Fill in the details to create a new account</p>
        </div>

        {/* Success Alert */}
        {successMessage && (
          <div className="p-4 bg-emerald-50 text-emerald-800 text-sm font-semibold rounded-2xl border border-emerald-200 flex items-start space-x-2.5 shadow-sm">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-emerald-900">Registration successful!</p>
              <p className="text-xs text-emerald-700 font-normal mt-0.5">{successMessage}</p>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="p-4 bg-red-50 text-red-700 text-sm rounded-2xl border border-red-200 flex items-start space-x-2.5 shadow-sm">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-red-900">Registration Failed</p>
              <p className="text-xs text-red-700 font-medium mt-0.5">{error}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Role selector */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-700 uppercase">Account Type (Role)</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setRole('jobseeker');
                  setError(null);
                }}
                className={`py-2.5 px-3 text-xs font-bold rounded-xl transition-all border ${
                  role === 'jobseeker'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                    : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                }`}
              >
                Job Seeker
              </button>
              <button
                type="button"
                onClick={() => {
                  setRole('employer');
                  setError(null);
                }}
                className={`py-2.5 px-3 text-xs font-bold rounded-xl transition-all border ${
                  role === 'employer'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                    : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                }`}
              >
                Employer / Contractor
              </button>
            </div>
          </div>

          {/* Full Name */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-700 uppercase">Full Name</label>
            <div className="flex items-center space-x-2 px-3 py-2.5 bg-gray-50 rounded-xl border border-gray-200 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200 transition-all">
              <UserIcon className="w-4 h-4 text-gray-400" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="e.g. Rahul Sharma"
                className="w-full bg-transparent focus:outline-none text-sm text-gray-800 placeholder:text-gray-400"
              />
            </div>
          </div>

          {/* Email Address */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-700 uppercase">Email Address</label>
            <div className="flex items-center space-x-2 px-3 py-2.5 bg-gray-50 rounded-xl border border-gray-200 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200 transition-all">
              <Mail className="w-4 h-4 text-gray-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="you@example.com"
                className="w-full bg-transparent focus:outline-none text-sm text-gray-800 placeholder:text-gray-400"
              />
            </div>
          </div>

          {/* Phone Number */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-700 uppercase">Phone Number</label>
            <div className="flex items-center space-x-2 px-3 py-2.5 bg-gray-50 rounded-xl border border-gray-200 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200 transition-all">
              <Phone className="w-4 h-4 text-gray-400" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="9876543210 (10 digits)"
                className="w-full bg-transparent focus:outline-none text-sm text-gray-800 placeholder:text-gray-400"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-700 uppercase">Password</label>
            <div className="flex items-center space-x-2 px-3 py-2.5 bg-gray-50 rounded-xl border border-gray-200 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200 transition-all">
              <Lock className="w-4 h-4 text-gray-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="•••••••• (min 6 characters)"
                className="w-full bg-transparent focus:outline-none text-sm text-gray-800 placeholder:text-gray-400"
              />
            </div>
          </div>

          {/* Confirm Password */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-700 uppercase">Confirm Password</label>
            <div className="flex items-center space-x-2 px-3 py-2.5 bg-gray-50 rounded-xl border border-gray-200 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200 transition-all">
              <Lock className="w-4 h-4 text-gray-400" />
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="•••••••• (re-type password)"
                className="w-full bg-transparent focus:outline-none text-sm text-gray-800 placeholder:text-gray-400"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || !!successMessage}
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold text-sm rounded-xl shadow-lg transition-all flex items-center justify-center space-x-2"
          >
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            <span>{isSubmitting ? 'Creating account...' : 'Register'}</span>
            {!isSubmitting && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        <div className="text-center text-xs text-gray-500 pt-2 border-t border-gray-100">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-blue-600 hover:underline">
            Login now
          </Link>
        </div>

      </div>
    </div>
  );
};

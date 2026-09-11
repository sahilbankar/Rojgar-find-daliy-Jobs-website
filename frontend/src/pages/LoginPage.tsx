import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Briefcase, Lock, Mail, ArrowRight, AlertCircle, CheckCircle2, Loader2, ShieldCheck } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { authAPI } from '../services/auth.service';

export const LoginPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'jobseeker' | 'employer' | 'admin'>(() => {
    return searchParams.get('role') === 'admin' ? 'admin' : 'jobseeker';
  });
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const { login } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (searchParams.get('role') === 'admin') {
      setRole('admin');
    }
  }, [searchParams]);

  const validateForm = () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      return 'Please enter your email address.';
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      return 'Please enter a valid email address (e.g. yourname@example.com).';
    }
    if (!password) {
      return 'Please enter your password.';
    }
    if (password.length < 6) {
      return 'Password must be at least 6 characters long.';
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
      const res = await authAPI.login({
        email: email.trim(),
        password,
        role
      });

      if (res && res.user) {
        setSuccessMessage('Login successful!');
        
        // Store user and tokens in AuthContext & LocalStorage
        login(res.user, res.accessToken || res.token || '', res.refreshToken);

        // Small delay to allow user to see success notification before redirect
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
      console.error('Login submit error:', err);
      const serverMsg =
        err?.response?.data?.message ||
        err?.response?.data?.errors?.[0]?.msg ||
        (err?.message === 'Network Error'
          ? 'Cannot reach the server. Please check your internet connection or try again.'
          : 'Invalid login credentials. Please check your email and password.');
      setError(serverMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isAdminMode = role === 'admin';

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white p-8 rounded-3xl border border-gray-200 shadow-xl space-y-6">
        
        <div className="text-center space-y-2">
          <div className={`inline-flex p-3 rounded-2xl mb-2 shadow-sm ${isAdminMode ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600'}`}>
            {isAdminMode ? <ShieldCheck className="w-8 h-8" /> : <Briefcase className="w-8 h-8" />}
          </div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">
            {isAdminMode ? 'ROJGAR Admin Portal' : 'ROJGAR Login'}
          </h1>
          <p className="text-xs text-gray-500 font-medium">
            {isAdminMode ? 'Authorized administrative access only' : 'Enter your credentials to access your account'}
          </p>
        </div>

        {/* Success Alert */}
        {successMessage && (
          <div className="p-4 bg-emerald-50 text-emerald-800 text-sm font-semibold rounded-2xl border border-emerald-200 flex items-start space-x-2.5 animate-fadeIn shadow-sm">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-emerald-900">Login successful!</p>
              <p className="text-xs text-emerald-700 font-normal mt-0.5">{successMessage}</p>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="p-4 bg-red-50 text-red-700 text-sm rounded-2xl border border-red-200 flex items-start space-x-2.5 shadow-sm">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-red-900">Login Failed</p>
              <p className="text-xs text-red-700 font-medium mt-0.5">{error}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Role selector (Only Job Seeker and Employer) */}
          {!isAdminMode ? (
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700 uppercase">Select Role</label>
              <div className="grid grid-cols-2 gap-2">
                {(['jobseeker', 'employer'] as const).map((r) => (
                  <button
                    type="button"
                    key={r}
                    onClick={() => {
                      setRole(r);
                      setError(null);
                    }}
                    className={`py-2 px-1 text-xs font-bold rounded-xl capitalize transition-all border ${
                      role === r
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                        : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    {r === 'jobseeker' ? 'Seeker' : r}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-3 bg-purple-50 border border-purple-100 rounded-2xl text-center">
              <span className="text-xs font-bold text-purple-700 uppercase tracking-wider">Logging in as Administrator</span>
            </div>
          )}

          {/* Email input */}
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

          {/* Password input */}
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
                placeholder="••••••••"
                className="w-full bg-transparent focus:outline-none text-sm text-gray-800 placeholder:text-gray-400"
              />
            </div>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={isSubmitting || !!successMessage}
            className={`w-full py-3.5 ${isAdminMode ? 'bg-purple-600 hover:bg-purple-700' : 'bg-blue-600 hover:bg-blue-700'} disabled:opacity-60 text-white font-bold text-sm rounded-xl shadow-lg transition-all flex items-center justify-center space-x-2`}
          >
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            <span>{isSubmitting ? 'Verifying credentials...' : (isAdminMode ? 'Admin Login' : 'Login')}</span>
            {!isSubmitting && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        <div className="space-y-3 pt-2 border-t border-gray-100 text-center text-xs text-gray-500">
          <div>
            Don't have an account?{' '}
            <Link to="/register" className="font-bold text-blue-600 hover:underline">
              Register now
            </Link>
          </div>
          
          <div className="pt-2 border-t border-gray-100">
            {!isAdminMode ? (
              <button
                type="button"
                onClick={() => {
                  setRole('admin');
                  setError(null);
                }}
                className="text-xs text-gray-500 hover:text-purple-600 font-semibold transition-colors flex items-center justify-center space-x-1 mx-auto"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                <span>Admin Portal Login</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setRole('jobseeker');
                  setError(null);
                }}
                className="text-xs text-gray-500 hover:text-blue-600 font-semibold transition-colors flex items-center justify-center space-x-1 mx-auto"
              >
                <span>← Back to User Login</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

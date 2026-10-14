import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Activity, Eye, EyeOff, AlertCircle, ArrowRight, Lock, Mail, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  const handleDemoLogin = async () => {
    setEmail('demo@pulseai.com');
    setPassword('Password123!');
    setError('');
    setLoading(true);
    try {
      await login('demo@pulseai.com', 'Password123!');
      navigate(from, { replace: true });
    } catch (err) {
      console.warn('Direct demo login failed, attempting auto-registration...', err);
      try {
        await api.register({
          email: 'demo@pulseai.com',
          full_name: 'Demo Explorer',
          password: 'Password123!'
        });
        await login('demo@pulseai.com', 'Password123!');
        navigate(from, { replace: true });
      } catch (regErr) {
        console.error('Demo auto-register failed:', regErr);
        setError(regErr.response?.data?.detail || err.response?.data?.detail || 'Demo login failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }

    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      console.error('Login error:', err);
      const msg = err.response?.data?.detail || 'Invalid email or password.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-2.5 mb-6 group">
          <div className="w-10 h-10 rounded-xl bg-[#2457D6] flex items-center justify-center text-white shadow-sm group-hover:bg-[#1948BB] transition-colors">
            <Activity className="w-5 h-5 stroke-[2.2]" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-[#17243B]">
            pulse<span className="text-[#2457D6]">ai</span>
          </span>
        </Link>
        <h2 className="text-2xl font-extrabold text-[#17243B] tracking-tight">
          Welcome back
        </h2>
        <p className="mt-2 text-sm text-[#66758A]">
          Sign in to access your emotion intelligence workspace
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="surface-card p-8 border border-[#E2E8F0] rounded-2xl bg-white shadow-lg shadow-[#17243B]/5">
          {/* Quick Demo Access Card */}
          <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-[#EEF4FF] to-[#F5F8FF] border border-[#BFD5FE]/70 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#2457D6]/10 flex items-center justify-center text-[#2457D6] shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="text-left">
                <div className="text-xs font-bold text-[#17243B]">Exploring PulseAI?</div>
                <div className="text-[11px] text-[#66758A]">Sign in with 1-click using pre-populated demo data</div>
              </div>
            </div>
            <button
              type="button"
              onClick={handleDemoLogin}
              disabled={loading}
              className="w-full sm:w-auto px-3.5 py-1.5 text-xs font-semibold text-white bg-[#2457D6] hover:bg-[#1948BB] rounded-lg transition-colors shadow-xs cursor-pointer whitespace-nowrap shrink-0 disabled:opacity-50"
            >
              Demo Sign In
            </button>
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#E2E8F0]" />
            </div>
            <div className="relative flex justify-center text-[11px] uppercase">
              <span className="bg-white px-3 text-[#94A3B8] font-semibold tracking-wider">Or sign in with email</span>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-[#FCE8ED] border border-[#F7C4CE] text-[#C9475B] text-xs flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span className="font-medium">{error}</span>
              </div>
              {(error.toLowerCase().includes('no account') || error.toLowerCase().includes('register') || error.toLowerCase().includes('not found') || error.toLowerCase().includes('invalid email or password')) && (
                <div className="pt-2 border-t border-[#F7C4CE]/50 flex items-center justify-between">
                  <span className="text-[11px] text-[#A83244]">Don't have an account on this server?</span>
                  <Link
                    to="/register"
                    state={{ email }}
                    className="font-bold text-[#2457D6] hover:underline inline-flex items-center gap-1"
                  >
                    Create account now →
                  </Link>
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-[#17243B] uppercase tracking-wider mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#94A3B8]">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex@company.com"
                  className="w-full pl-10 pr-4 py-2.5 text-sm text-[#17243B] bg-[#F5F7FA] border border-[#E2E8F0] rounded-xl focus:bg-white focus:border-[#2457D6] focus:ring-1 focus:ring-[#2457D6] outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-semibold text-[#17243B] uppercase tracking-wider">
                  Password
                </label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#94A3B8]">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 text-sm text-[#17243B] bg-[#F5F7FA] border border-[#E2E8F0] rounded-xl focus:bg-white focus:border-[#2457D6] focus:ring-1 focus:ring-[#2457D6] outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#94A3B8] hover:text-[#17243B] cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 text-sm font-semibold text-white bg-[#2457D6] hover:bg-[#1948BB] rounded-xl transition-all shadow-sm shadow-[#2457D6]/20 disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing In...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-[#E2E8F0] text-center text-xs text-[#66758A]">
            Don't have an account yet?{' '}
            <Link
              to="/register"
              className="font-semibold text-[#2457D6] hover:text-[#1948BB] hover:underline"
            >
              Create free account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

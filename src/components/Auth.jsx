import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { Wallet, User, Lock, TrendingUp, ShieldCheck, BarChart2 } from 'lucide-react';

const GOOGLE_CLIENT_ID = '180806298382-q7ofrc16oqep2k7jsd5budl10o1qkqn6.apps.googleusercontent.com';

export default function Auth({ onLoginSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ username: '', password: '' });
  const navigate = useNavigate();

  const recordConsent = async (token) => {
    try {
      await fetch('/api/consent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ platform: 'web', policyVersion: '2026-05' }),
      });
    } catch (_) { /* non-blocking */ }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/signup';

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    const data = await response.json();

    if (response.ok) {
      if (isLogin) {
        localStorage.setItem('token', data.token);
        await recordConsent(data.token);
        navigate('/dashboard');
      } else {
        // signup: auto-login to get token then record consent
        const loginRes = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: formData.username, password: formData.password }),
        });
        if (loginRes.ok) {
          const loginData = await loginRes.json();
          localStorage.setItem('token', loginData.token);
          await recordConsent(loginData.token);
          navigate('/dashboard');
        } else {
          setIsLogin(true);
        }
      }
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const response = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken: credentialResponse.credential }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        await recordConsent(data.token);
        navigate('/dashboard');
      } else {
        console.error('Google login failed:', data);
      }
    } catch (err) {
      console.error('Google login error:', err);
    }
  };

  const features = [
    { icon: <TrendingUp size={20} />, text: 'Track income & expenses in real time' },
    { icon: <BarChart2 size={20} />, text: 'Visual analytics & spending insights' },
    { icon: <ShieldCheck size={20} />, text: 'Secure, private, and always in sync' },
  ];

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <div className="flex min-h-screen">
        {/* ── Left panel — desktop only ── */}
        <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 flex-col justify-center items-start p-16 text-white relative overflow-hidden">
          {/* Decorative circles */}
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-white/5 rounded-full" />
          <div className="absolute -bottom-32 -right-16 w-[500px] h-[500px] bg-white/5 rounded-full" />

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-10">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Wallet size={24} className="text-white" />
              </div>
              <span className="text-2xl font-black tracking-tight">FinanceTracker</span>
            </div>

            <h1 className="text-5xl font-black leading-tight mb-4">
              Take control of<br />your finances.
            </h1>
            <p className="text-blue-200 text-lg mb-12 max-w-sm leading-relaxed">
              The smart way to track spending, understand your habits, and reach your financial goals.
            </p>

            <ul className="space-y-5">
              {features.map((f, i) => (
                <li key={i} className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center flex-shrink-0">
                    {f.icon}
                  </div>
                  <span className="text-blue-100 font-medium">{f.text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ── Right panel — form ── */}
        <div className="flex-1 flex items-center justify-center bg-white dark:bg-[#0f172a] p-6 md:p-12">
          <div className="w-full max-w-sm">
            {/* Logo mark for mobile */}
            <div className="md:hidden flex justify-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-xl shadow-blue-200 dark:shadow-blue-900/30">
                <Wallet size={30} className="text-white" />
              </div>
            </div>

            {/* App icon circle for desktop form */}
            <div className="hidden md:flex justify-center mb-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-xl shadow-blue-200 dark:shadow-blue-900/30">
                <Wallet size={30} className="text-white" />
              </div>
            </div>

            <h2 className="text-3xl font-black text-gray-900 dark:text-gray-100 text-center mb-1">
              {isLogin ? 'Welcome back' : 'Create account'}
            </h2>
            <p className="text-gray-400 dark:text-gray-500 text-center text-sm mb-8">
              {isLogin ? 'Sign in to your account to continue' : 'Start tracking your finances today'}
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Username field */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1">Username</label>
                <div className="relative">
                  <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                  <input
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-[#1e293b] border border-gray-200 dark:border-[#334155] rounded-xl outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50 dark:focus:ring-blue-900/30 transition text-sm font-medium dark:text-gray-100"
                    placeholder="Enter your username"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  />
                </div>
              </div>

              {/* Password field */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1">Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                  <input
                    type="password"
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-[#1e293b] border border-gray-200 dark:border-[#334155] rounded-xl outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50 dark:focus:ring-blue-900/30 transition text-sm font-medium dark:text-gray-100"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                </div>
              </div>

              {/* Privacy consent checkbox — sign-up only */}
              {!isLogin && (
                <div className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    required
                    id="privacy-consent"
                    className="mt-1 accent-blue-600"
                  />
                  <label htmlFor="privacy-consent" className="text-xs text-gray-500 dark:text-gray-400">
                    I agree to the{' '}
                    <Link to="/terms" className="text-blue-600 hover:underline">Terms of Service</Link>
                    {' '}and{' '}
                    <Link to="/privacy" className="text-blue-600 hover:underline">Privacy Policy</Link>
                  </label>
                </div>
              )}

              {/* Submit button */}
              <button
                type="submit"
                className="w-full py-3.5 rounded-xl font-black text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-200 transition-all active:scale-[0.98] mt-2"
              >
                {isLogin ? 'Sign In' : 'Create Account'}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-gray-200 dark:bg-[#334155]" />
              <span className="text-xs text-gray-400 dark:text-gray-600 font-semibold">or continue with</span>
              <div className="flex-1 h-px bg-gray-200 dark:bg-[#334155]" />
            </div>

            {/* Google login */}
            <div style={{ width: '100%', maxWidth: '100%', overflow: 'hidden' }}>
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => console.error('Google OAuth error')}
                text={isLogin ? 'continue_with' : 'signup_with'}
                shape="rectangular"
              />
            </div>

            {/* Toggle */}
            <p className="text-sm text-center mt-6 text-gray-500 dark:text-gray-400">
              {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-blue-600 font-bold hover:text-indigo-600 transition"
              >
                {isLogin ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
}

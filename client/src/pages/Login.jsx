import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  ShieldCheck,
  Mail,
  Lock,
  ArrowRight,
  AlertCircle,
  Loader2,
  GraduationCap,
  Shield,
  Wrench,
} from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const googleButtonRef = useRef(null);

  const { login, googleLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname;

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId || !window.google?.accounts?.id || !googleButtonRef.current) {
      return;
    }

    const handleCredentialResponse = async (response) => {
      setSubmitting(true);
      setError('');

      const result = await googleLogin({ token: response.credential });
      setSubmitting(false);

      if (result.success) {
        if (from) {
          navigate(from, { replace: true });
        } else if (result.user.role === 'admin' || result.user.role === 'staff') {
          navigate('/admin/dashboard', { replace: true });
        } else {
          navigate('/student/dashboard', { replace: true });
        }
      } else {
        setError(result.message || 'Google sign-in failed.');
      }
    };

    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: handleCredentialResponse,
    });

    window.google.accounts.id.renderButton(googleButtonRef.current, {
      theme: 'outline',
      size: 'large',
      text: 'continue_with',
      shape: 'pill',
      logo_alignment: 'left',
    });
  }, [from, googleLogin, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setSubmitting(true);
    const result = await login(email, password);
    setSubmitting(false);

    if (result.success) {
      if (from) {
        navigate(from, { replace: true });
      } else if (result.user.role === 'admin' || result.user.role === 'staff') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate('/student/dashboard', { replace: true });
      }
    } else {
      setError(result.message || 'Invalid email or password.');
    }
  };

  const handleFillCredentials = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError('');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white mx-auto shadow-glow mb-4">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Sign In to NITC CARE
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-300 mt-2">
            Access the National Institute of Technology Calicut hostel grievance system
          </p>
        </div>

        {/* Demo Credentials Helper Pill */}
        <div className="bg-brand-50/80 dark:bg-brand-950/40 border border-brand-200 dark:border-brand-800/80 rounded-2xl p-4 text-xs">
          <p className="font-semibold text-brand-900 dark:text-brand-200 mb-2 flex items-center gap-1.5">
            ⚡ 1-Click Fill Demo Accounts:
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleFillCredentials('keerthan_b241139ch@nitc.ac.in', 'Student@123')}
              className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 hover:bg-brand-100 dark:hover:bg-brand-900/60 border border-brand-200 dark:border-brand-700/50 text-slate-800 dark:text-slate-200 text-center font-medium transition"
            >
              🎓 Student
            </button>
            <button
              type="button"
              onClick={() => handleFillCredentials('chiefwarden@nitc.ac.in', 'Admin@123')}
              className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 hover:bg-brand-100 dark:hover:bg-brand-900/60 border border-brand-200 dark:border-brand-700/50 text-slate-800 dark:text-slate-200 text-center font-medium transition"
            >
              👑 Chief Warden
            </button>
            <button
              type="button"
              onClick={() => handleFillCredentials('caretaker.mh@nitc.ac.in', 'Staff@123')}
              className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 hover:bg-brand-100 dark:hover:bg-brand-900/60 border border-brand-200 dark:border-brand-700/50 text-slate-800 dark:text-slate-200 text-center font-medium transition"
            >
              🛠️ Caretaker
            </button>
          </div>
        </div>

        {/* Form */}
        <div className="glass-card rounded-3xl p-8 border border-slate-200/80 dark:border-slate-800 shadow-xl">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/80 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-4">
            {!import.meta.env.VITE_GOOGLE_CLIENT_ID ? (
              <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
                Google sign-in is not configured yet. Add VITE_GOOGLE_CLIENT_ID in Vercel.
              </div>
            ) : (
              <div ref={googleButtonRef} className="flex justify-center" />
            )}

            <div className="relative flex items-center">
              <div className="flex-1 border-t border-slate-200 dark:border-slate-700" />
              <span className="px-3 text-[10px] uppercase tracking-[0.2em] text-slate-400">or</span>
              <div className="flex-1 border-t border-slate-200 dark:border-slate-700" />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 mt-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                College Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail size={16} />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. keerthan_b241139ch@nitc.ac.in"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock size={16} />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-bold text-sm shadow-glow hover:shadow-glow-lg transition-all flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Signing In...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 text-center">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Are you a new student?{' '}
              <Link
                to="/register"
                className="font-semibold text-brand-600 dark:text-brand-400 hover:underline"
              >
                Create student account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

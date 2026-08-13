import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../utils/api.js';
import { useAuth } from '../context/AuthContext.jsx';

import PageLayout from '../components/PageLayout';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const { user } = useAuth();
  const [status, setStatus] = useState(token ? 'verifying' : 'idle'); // idle | verifying | success | error
  const [resending, setResending] = useState(false);
  const [email, setEmail] = useState(user?.email || '');
  const [toast, setToast] = useState('');

  useEffect(() => {
    if (token) {
      api
        .get(`/auth/verify-email?token=${token}`)
        .then(() => setStatus('success'))
        .catch(() => setStatus('error'));
    }
  }, [token]);

  const handleResend = async (e) => {
    e.preventDefault();
    if (!email) return;

    setResending(true);
    try {
      await api.post('/auth/resend-verification', { email });
      setToast('Verification link sent! Check your inbox.');
    } catch (err) {
      setToast(err.response?.data?.message || 'Failed to resend link.');
    } finally {
      setResending(false);
      setTimeout(() => setToast(''), 3000);
    }
  };

  return (
    <PageLayout width="5xl" title="Email Verification">
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed left-1/2 top-24 z-[100] -translate-x-1/2 rounded-2xl bg-char-950 px-8 py-4 font-display text-lg font-black text-white shadow-2xl"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="text-center py-10 max-w-md mx-auto">
        {status === 'idle' && (
          <div className="bg-char-950/5 border border-char-950/10 rounded-[32px] p-8 animate-rise">
            <p className="font-display text-xl font-bold text-char-950 mb-4">Verify your email</p>
            <p className="text-sm font-medium text-char-950/40 mb-8">Click the link in your email to verify your account. Didn't receive it?</p>
            <form onSubmit={handleResend} className="space-y-4">
              <input
                type="email"
                placeholder="Enter your email"
                required
                className="input-field w-full px-6 py-3 font-bold text-sm bg-white"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <button
                type="submit"
                disabled={resending}
                className="btn-primary w-full py-3 text-xs uppercase tracking-widest"
              >
                {resending ? 'Resending…' : 'Resend Verification Link'}
              </button>
            </form>
          </div>
        )}

        {status === 'verifying' && <p className="font-display text-xl text-char-950/40 italic animate-pulse">Verifying your email…</p>}

        {status === 'success' && (
          <div className="bg-basil/5 border border-basil/20 rounded-[32px] p-8 animate-rise">
            <p className="font-display text-2xl font-black text-basil mb-6">Email verified successfully! ✓</p>
            <Link to="/dashboard" className="btn-primary inline-block px-10 py-4 shadow-lg shadow-basil/20 text-sm">
              Go to dashboard
            </Link>
          </div>
        )}

        {status === 'error' && (
           <div className="bg-tomato/5 border border-tomato/20 rounded-[32px] p-8 animate-rise">
                <p className="font-display text-xl font-bold text-tomato mb-4 text-center">Verification failed</p>
                <p className="text-sm font-medium text-char-950/40 mb-8">Invalid or expired verification link.</p>

                <div className="pt-6 border-t border-tomato/10">
                  <p className="text-[10px] font-black uppercase tracking-widest text-tomato/60 mb-4">Request a new link</p>
                  <form onSubmit={handleResend} className="space-y-4">
                    <input
                      type="email"
                      placeholder="Enter your email"
                      required
                      className="input-field w-full px-6 py-3 font-bold text-sm bg-white"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                    <button
                      type="submit"
                      disabled={resending}
                      className="btn-primary w-full py-3 text-xs uppercase tracking-widest"
                    >
                      {resending ? 'Resending…' : 'Resend Link'}
                    </button>
                  </form>
                </div>

                <Link to="/login" className="mt-8 inline-block font-black text-[10px] uppercase tracking-widest text-char-950/20 hover:text-tomato transition-colors">Back to login</Link>
           </div>
        )}
      </div>
    </PageLayout>
  );
};

export default VerifyEmail;

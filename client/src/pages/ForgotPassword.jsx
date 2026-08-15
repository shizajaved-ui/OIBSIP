import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../utils/api.js';

import PageLayout from '../components/PageLayout';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState('');

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(''), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setToast('');
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
      setToast('Success! Check your inbox for the reset link.');
    } catch (err) {
      setToast('Failed to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageLayout
      title="Reset password"
      subtitle="Enter your email and we'll send you a reset link."
      width="5xl"
    >
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed left-1/2 top-24 z-[100] -translate-x-1/2 rounded-2xl px-8 py-4 font-display text-lg font-black text-white shadow-2xl ${
              sent ? 'bg-basil shadow-basil/20' : 'bg-tomato shadow-tomato/20'
            }`}
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {sent ? (
        <div className="rounded-[28px] border border-basil/20 bg-basil/5 p-8 text-center text-basil animate-rise">
          <p className="font-bold">Check your inbox!</p>
          <p className="mt-2 text-sm opacity-80">If that email exists, a reset link has been sent.</p>
          <button
            onClick={() => setSent(false)}
            className="mt-6 text-xs font-black uppercase tracking-widest text-basil/60 hover:text-basil transition-colors"
          >
            Try another email
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            type="email"
            placeholder="Email"
            required
            className="input-field w-full px-6 py-3 md:py-4 font-bold text-sm md:text-lg"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-3.5 md:py-4 text-[10px] md:text-xs uppercase tracking-[0.2em] shadow-xl shadow-tomato/20"
          >
            {loading ? 'Sending…' : 'Send reset link'}
          </button>
        </form>
      )}

      <p className="mt-10 text-center text-sm font-bold text-char-950/40">
        <Link to="/login" className="text-tomato hover:text-tomato-dark">
          Back to sign in
        </Link>
      </p>
    </PageLayout>
  );
};

export default ForgotPassword;

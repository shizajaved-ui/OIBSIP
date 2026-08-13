import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api.js';

import PageLayout from '../components/PageLayout';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
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
      {sent ? (
        <div className="rounded-[28px] border border-basil/20 bg-basil/5 p-8 text-center text-basil">
          <p className="font-bold">Check your inbox!</p>
          <p className="mt-2 text-sm opacity-80">If that email exists, a reset link has been sent.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            type="email"
            placeholder="Email"
            required
            className="input-field w-full px-6 py-4 font-bold text-lg"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button type="submit" disabled={loading} className="btn-primary w-full py-5 text-xl shadow-xl shadow-tomato/20">
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

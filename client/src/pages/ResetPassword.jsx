import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import api from '../utils/api.js';

import PageLayout from '../components/PageLayout';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/auth/reset-password', { token, newPassword });
      setDone(true);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Reset failed');
    }
  };

  return (
    <PageLayout width="5xl" title="Set a new password">
      {error && (
        <div className="mb-6 rounded-2xl border border-tomato/20 bg-tomato/5 p-4 text-center text-sm font-bold text-tomato">
          {error}
        </div>
      )}

      {done ? (
        <div className="bg-basil/5 border border-basil/20 rounded-[32px] p-8 text-center">
            <p className="font-display text-xl font-black text-basil">Password reset! ✓</p>
            <p className="mt-2 text-sm font-medium text-char-950/40">Redirecting to sign in…</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            type="password"
            placeholder="New password"
            required
            minLength={6}
            className="input-field w-full px-6 py-3 md:py-4 font-bold text-sm md:text-lg"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <button type="submit" className="btn-primary w-full py-3.5 md:py-5 text-[10px] md:text-xl uppercase md:normal-case tracking-[0.2em] md:tracking-normal shadow-xl shadow-tomato/20">
            Update password
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

export default ResetPassword;

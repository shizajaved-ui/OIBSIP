import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../utils/api.js';
import { useAuth } from '../context/AuthContext.jsx';

import PageLayout from '../components/PageLayout';

const Register = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [toast, setToast] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/register', form);
      setRegistered(true);
      setToast('Account created! Welcome to the crust.');

      // Delay to show success state before logging in/navigating
      setTimeout(() => {
        login(data.token, data.user);
        navigate('/dashboard');
      }, 800);
    } catch (err) {
      if (!err.response) {
        setError('Server unreachable. Please check your connection or backend status.');
      } else {
        const msg = err.response.data?.message || 'Registration failed';
        const detail = err.response.data?.error ? ` (${err.response.data.error})` : '';
        setError(`${msg}${detail}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageLayout
      title="Create your account"
      subtitle="We'll send a verification link to your inbox."
      width="5xl"
    >
      {/* Success Toast */}
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed left-1/2 top-24 z-[100] -translate-x-1/2 rounded-2xl bg-basil px-8 py-4 font-display text-lg font-black text-white shadow-2xl"
        >
          {toast}
        </motion.div>
      )}

      {error && (
        <div className="mb-6 rounded-2xl border border-tomato/20 bg-tomato/5 p-4 text-center text-sm font-bold text-tomato">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <input
          type="text"
          placeholder="Full name"
          required
          className="input-field w-full px-6 py-3 md:py-4 font-bold text-sm md:text-base"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <input
          type="email"
          placeholder="Email"
          required
          className="input-field w-full px-6 py-3 md:py-4 font-bold text-sm md:text-base"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <input
          type="password"
          placeholder="Password"
          required
          minLength={6}
          className="input-field w-full px-6 py-3 md:py-4 font-bold text-sm md:text-base"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        <button
          type="submit"
          disabled={loading || registered}
          className={`btn-primary w-full py-3.5 md:py-4 text-[10px] md:text-xs uppercase tracking-[0.2em] shadow-xl transition-colors duration-500 ${
            registered ? 'bg-basil shadow-basil/20' : 'shadow-tomato/20'
          }`}
        >
          {registered ? 'Account Created! ✓' : loading ? 'Creating account…' : 'Create account'}
        </button>
      </form>

      <p className="mt-10 text-center text-sm font-bold text-char-950/40">
        Already have an account?{' '}
        <Link to="/login" className="text-tomato hover:text-tomato-dark">
          Sign in
        </Link>
      </p>
    </PageLayout>
  );
};

export default Register;

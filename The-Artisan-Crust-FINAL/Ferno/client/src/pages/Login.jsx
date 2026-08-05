import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../utils/api.js';
import { useAuth } from '../context/AuthContext.jsx';

import PageLayout from '../components/PageLayout';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', form);
      login(data.token, data.user);
      navigate('/dashboard');
    } catch (err) {
      if (!err.response) {
        setError('Server unreachable. Please make sure the backend is running on port 5000.');
      } else {
        const msg = err.response.data?.message || 'Login failed';
        const detail = err.response.data?.error ? ` (${err.response.data.error})` : '';
        setError(`${msg}${detail}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageLayout
      title="Welcome back"
      subtitle="Sign in to track your order."
      width="md"
    >
      {error && (
        <div className="mb-6 rounded-2xl border border-tomato/20 bg-tomato/5 p-4 text-center text-sm font-bold text-tomato">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <input
          type="email"
          placeholder="Email"
          required
          className="input-field w-full px-6 py-4 font-bold text-lg"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <input
          type="password"
          placeholder="Password"
          required
          className="input-field w-full px-6 py-4 font-bold text-lg"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        <div className="text-right text-sm">
          <Link to="/forgot-password" title="Forgot password?" className="font-bold text-char-950/40 hover:text-tomato">
            Forgot password?
          </Link>
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full py-5 text-xl shadow-xl shadow-tomato/20">
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      <p className="mt-10 text-center text-sm font-bold text-char-950/40">
        New here?{' '}
        <Link to="/register" className="text-tomato hover:text-tomato-dark">
          Create an account
        </Link>
      </p>
      <p className="mt-2 text-center text-xs font-bold text-char-950/30">
        Are you staff?{' '}
        <Link to="/admin-login" className="hover:text-tomato">
          Admin sign in
        </Link>
      </p>
    </PageLayout>
  );
};

export default Login;

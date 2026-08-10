import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api.js';
import { useAuth } from '../context/AuthContext.jsx';

import PageLayout from '../components/PageLayout';

const Account = () => {
  const { user, logout, login } = useAuth();
  const [profile, setProfile] = useState(null);
  const [name, setName] = useState('');
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/auth/me').then(({ data }) => {
      setProfile(data);
      setName(data.name);
    });
  }, []);

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    setError('');
    try {
      const { data } = await api.put('/auth/me', { name });
      setProfile(data);
      // Keep localStorage / navbar in sync with the new name immediately
      login(localStorage.getItem('token'), { ...user, name: data.name });
      setEditing(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <PageLayout title="Account" width="2xl" isFloating fullMobile useDoodleOverlay>
      <div className="bg-white rounded-[32px] p-8 shadow-sm">
        <div className="flex items-center gap-6">
          <span className="flex h-16 w-14 shrink-0 items-center justify-center rounded-2xl bg-tomato text-white font-display text-2xl font-black shadow-lg shadow-tomato/20">
            {profile?.name?.[0]?.toUpperCase() || '·'}
          </span>
          <div className="min-w-0 flex-1">
            {editing ? (
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-field w-full px-4 py-2 text-lg font-bold"
                autoFocus
              />
            ) : (
              <h2 className="truncate font-display text-2xl font-bold text-char-950">{profile?.name || '…'}</h2>
            )}
            <p className="truncate text-sm font-bold text-char-950/30 uppercase tracking-widest">{profile?.email}</p>
          </div>
        </div>

        {error && <p className="mt-4 text-sm font-bold text-tomato">{error}</p>}

        <div className="mt-8 flex gap-3">
          {editing ? (
            <>
              <button onClick={handleSave} disabled={saving} className="btn-primary px-6 py-2 text-sm disabled:opacity-60">
                {saving ? 'Saving…' : 'Save name'}
              </button>
              <button
                onClick={() => { setEditing(false); setName(profile?.name || ''); }}
                className="rounded-full border-2 border-char-950/10 bg-white px-6 py-2 text-sm font-black uppercase tracking-widest text-char-950 transition-all hover:border-char-950/30"
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              onClick={() => setEditing(true)}
              className="rounded-full border-2 border-char-950/10 bg-white px-6 py-2 text-sm font-black uppercase tracking-widest text-char-950 transition-all hover:border-char-950/30"
            >
              Edit name
            </button>
          )}
        </div>

        {!profile?.isVerified && (
          <div className="mt-6 rounded-2xl bg-tomato/5 border border-tomato/10 p-4">
            <p className="text-xs font-bold text-tomato uppercase tracking-widest">
              Email not verified — check your inbox for the link.
            </p>
          </div>
        )}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Link to="/dashboard" className="group bg-white rounded-3xl p-6 shadow-sm border border-char-950/5 transition-all hover:shadow-md hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <span className="font-display text-lg font-bold text-char-950">Dashboard</span>
            <svg viewBox="0 0 24 24" className="h-5 w-5 text-tomato transform transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </div>
        </Link>
        <Link to="/history" className="group bg-white rounded-3xl p-6 shadow-sm border border-char-950/5 transition-all hover:shadow-md hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <span className="font-display text-lg font-bold text-char-950">Order History</span>
            <svg viewBox="0 0 24 24" className="h-5 w-5 text-tomato transform transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </div>
        </Link>
      </div>

      <button
        onClick={handleLogout}
        className="mt-10 w-full rounded-full border-2 border-char-950/10 bg-white px-5 py-4 font-display text-sm font-black uppercase tracking-widest text-tomato transition-all hover:border-tomato/40 hover:bg-tomato/5"
      >
        Sign out
      </button>
    </PageLayout>
  );
};

export default Account;

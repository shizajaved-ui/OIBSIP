import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../utils/api.js';

import PageLayout from '../components/PageLayout';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState('verifying'); // verifying | success | error

  useEffect(() => {
    api
      .get(`/auth/verify-email?token=${token}`)
      .then(() => setStatus('success'))
      .catch(() => setStatus('error'));
  }, [token]);

  return (
    <PageLayout width="5xl" title="Email Verification">
      <div className="text-center py-10">
        {status === 'verifying' && <p className="font-display text-xl text-char-950/40 italic animate-pulse">Verifying your email…</p>}
        {status === 'success' && (
          <div className="bg-basil/5 border border-basil/20 rounded-[32px] p-8">
            <p className="font-display text-2xl font-black text-basil mb-6">Email verified successfully! ✓</p>
            <Link to="/dashboard" className="btn-primary inline-block px-10 py-4 shadow-lg shadow-basil/20">
              Go to dashboard
            </Link>
          </div>
        )}
        {status === 'error' && (
           <div className="bg-tomato/5 border border-tomato/20 rounded-[32px] p-8">
                <p className="font-display text-xl font-bold text-tomato mb-4 text-center">Verification failed</p>
                <p className="text-sm font-medium text-char-950/40">Invalid or expired verification link.</p>
                <Link to="/login" className="mt-8 inline-block font-black text-xs uppercase tracking-widest text-tomato">Back to login</Link>
           </div>
        )}
      </div>
    </PageLayout>
  );
};

export default VerifyEmail;

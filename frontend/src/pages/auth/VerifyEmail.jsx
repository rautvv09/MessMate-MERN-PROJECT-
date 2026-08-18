import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import ThemeToggle from '../../components/ui/ThemeToggle';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setAuthUser } = useAuth();
  const [status, setStatus] = useState('verifying');

  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      setStatus('error');
      return;
    }

    const verify = async () => {
      try {
        const { data } = await api.post('/auth/verify-email', { token });
        setAuthUser(data.data.user);
        setStatus('success');
        toast.success('Email verified!');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } catch (error) {
        setStatus('error');
      }
    };
    verify();
  }, [searchParams, navigate, setAuthUser]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-text-primary px-4 py-10 transition-colors">
      <div className="w-full max-w-md bg-surface border border-border rounded-3xl shadow-xl p-8 text-center relative">
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>
        {status === 'verifying' && <p className="text-text-secondary">Verifying your email...</p>}
        {status === 'success' && (
          <>
            <h1 className="text-xl font-extrabold font-heading text-primary mb-2">Email verified!</h1>
            <p className="text-text-secondary text-sm">Redirecting you to your dashboard...</p>
          </>
        )}
        {status === 'error' && (
          <>
            <h1 className="text-xl font-extrabold font-heading text-status-danger mb-2">Verification failed</h1>
            <p className="text-text-secondary text-sm mb-4">This link may be invalid or expired.</p>
            <Link to="/login" className="text-primary text-sm font-bold hover:underline">Back to login</Link>
          </>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
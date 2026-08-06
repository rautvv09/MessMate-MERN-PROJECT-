import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setAuthUser } = useAuth();
  const [status, setStatus] = useState('verifying'); // verifying | success | error

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
          navigate(data.data.user.role === 'owner' ? '/owner/dashboard' : '/dashboard');
        }, 2000);
      } catch (error) {
        setStatus('error');
      }
    };
    verify();
  }, [searchParams, navigate, setAuthUser]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-md p-8 text-center">
        {status === 'verifying' && <p className="text-gray-500">Verifying your email...</p>}
        {status === 'success' && (
          <>
            <h1 className="text-xl font-bold text-emerald-600 mb-2">Email verified!</h1>
            <p className="text-gray-500 text-sm">Redirecting you to your dashboard...</p>
          </>
        )}
        {status === 'error' && (
          <>
            <h1 className="text-xl font-bold text-red-500 mb-2">Verification failed</h1>
            <p className="text-gray-500 text-sm mb-4">This link may be invalid or expired.</p>
            <Link to="/login" className="text-emerald-600 text-sm font-medium hover:underline">Back to login</Link>
          </>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
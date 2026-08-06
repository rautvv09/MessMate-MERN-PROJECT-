import { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import FormInput from '../../components/FormInput';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setAuthUser } = useAuth();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8 || !/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
      setError('Password needs 8+ characters, one uppercase letter, and one number');
      return;
    }

    setIsSubmitting(true);
    try {
      const { data } = await api.post('/auth/reset-password', { token, password });
      setAuthUser(data.data.user);
      toast.success('Password reset — you are now logged in.');
      navigate(data.data.user.role === 'owner' ? '/owner/dashboard' : '/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset link is invalid or expired');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center">
          <p className="text-gray-500 mb-3">No reset token found in this link.</p>
          <Link to="/forgot-password" className="text-emerald-600 text-sm font-medium hover:underline">Request a new link</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-md p-8">
        <h1 className="text-xl font-bold text-gray-900 mb-1">Set a new password</h1>
        <p className="text-gray-500 text-sm mb-6">Choose something you haven't used before.</p>
        <form onSubmit={handleSubmit}>
          <FormInput label="New Password" name="password" type="password" value={password}
            onChange={(e) => setPassword(e.target.value)} error={error} />
          <button type="submit" disabled={isSubmitting}
            className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-300 text-white font-medium py-2.5 rounded-lg mt-2">
            {isSubmitting ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
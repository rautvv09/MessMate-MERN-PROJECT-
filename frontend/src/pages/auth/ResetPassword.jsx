import { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import FormInput from '../../components/FormInput';
import ThemeToggle from '../../components/ui/ThemeToggle';

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
      <div className="min-h-screen flex items-center justify-center bg-background text-text-primary px-4 py-10 transition-colors">
        <div className="text-center bg-surface border border-border p-8 rounded-3xl max-w-md w-full shadow-xl">
          <p className="text-text-secondary mb-3">No reset token found in this link.</p>
          <Link to="/forgot-password" className="text-primary text-sm font-bold hover:underline">Request a new link</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-text-primary px-4 py-10 transition-colors">
      <div className="w-full max-w-md bg-surface border border-border rounded-3xl shadow-xl p-8">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-xl font-extrabold font-heading text-text-primary">Set a new password</h1>
          <ThemeToggle />
        </div>
        <p className="text-text-secondary text-sm mb-6">Choose something you haven't used before.</p>
        <form onSubmit={handleSubmit}>
          <FormInput label="New Password" name="password" type="password" value={password}
            onChange={(e) => setPassword(e.target.value)} error={error} />
          <button type="submit" disabled={isSubmitting}
            className="w-full bg-primary hover:bg-primary-dark disabled:bg-primary/50 text-white font-bold py-3 rounded-xl shadow-md transition-all mt-2">
            {isSubmitting ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
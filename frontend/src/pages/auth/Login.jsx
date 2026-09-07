import { useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import useGoogleSignIn from '../../hooks/useGoogleSignIn';
import FormInput from '../../components/FormInput';
import ThemeToggle from '../../components/ui/ThemeToggle';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { setAuthUser } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: null });
  };

  const postLoginRedirect = (user) => {
    setAuthUser(user);
    toast.success(`Welcome back, ${user.name}!`);
    if (user.role === 'admin') {
      navigate('/admin/dashboard');
    } else if (user.role === 'owner') {
      navigate('/owner/dashboard');
    } else {
      navigate('/dashboard');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      setErrors({
        email: !formData.email ? 'Email is required' : null,
        password: !formData.password ? 'Password is required' : null,
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { data } = await api.post('/auth/login', formData);
      postLoginRedirect(data.data.user);
    } catch (error) {
      const status = error.response?.status;
      const message = error.response?.data?.message || 'Login failed. Please try again.';

      // A 423 (Locked) gets a distinct, longer-lived toast since it's genuinely
      // important information, not a routine transient error
      if (status === 423) {
        toast.error(message, { duration: 8000, icon: '🔒' });
      } else if (status === 403 && message.includes('verify')) {
        toast.error(message, { duration: 6000 });
      } else {
        toast.error(message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Wrapped in useCallback so useGoogleSignIn's effect doesn't re-initialize
  // the Google button on every single Login component re-render
  const handleGoogleCredential = useCallback(async (response) => {
    try {
      const { data } = await api.post('/auth/google', { idToken: response.credential });

      if (data.requiresRoleSelection) {
        // Stash the verified Google profile + raw idToken for the role-selection
        // step (built in the next module) to complete registration with
        sessionStorage.setItem('pendingGoogleAuth', JSON.stringify({
          idToken: response.credential,
          profile: data.data.googleProfile,
        }));
        navigate('/complete-google-signup');
        return;
      }

      postLoginRedirect(data.data.user);
    } catch (error) {
      console.error('[Google Sign-In Error]', error);
      toast.error(error.response?.data?.message || 'Google sign-in failed');
    }
  }, [navigate]);

  const googleButtonRef = useGoogleSignIn(handleGoogleCredential);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-text-primary px-4 py-10 transition-colors">
      <div className="w-full max-w-md bg-surface border border-border rounded-3xl shadow-xl p-8">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-extrabold font-heading text-text-primary">Welcome back</h1>
          <ThemeToggle />
        </div>
        <p className="text-text-secondary text-sm mb-6">Log in to your MessMate account</p>

        <div ref={googleButtonRef} className="mb-5 flex justify-center" />

        <div className="flex items-center gap-3 mb-5">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs font-bold text-text-muted">OR</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <FormInput label="Email" name="email" type="email" value={formData.email} onChange={handleChange} error={errors.email} />
          <FormInput label="Password" name="password" type="password" value={formData.password} onChange={handleChange} error={errors.password} />

          <div className="text-right mb-4">
            <Link to="/forgot-password" className="text-xs font-bold text-primary hover:underline">
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-primary hover:bg-primary-dark disabled:bg-primary/50 text-white font-bold py-3 rounded-xl shadow-md transition-all"
          >
            {isSubmitting ? 'Logging in...' : 'Log In'}
          </button>
        </form>

        <p className="text-center text-sm text-text-secondary mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-primary font-bold hover:underline">Sign up</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
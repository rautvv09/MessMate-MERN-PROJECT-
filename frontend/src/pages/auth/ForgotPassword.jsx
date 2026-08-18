import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import FormInput from '../../components/FormInput';
import ThemeToggle from '../../components/ui/ThemeToggle';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post('/auth/forgot-password', { email });
    } finally {
      setSubmitted(true);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-text-primary px-4 py-10 transition-colors">
      <div className="w-full max-w-md bg-surface border border-border rounded-3xl shadow-xl p-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-extrabold font-heading text-text-primary">Forgot password</h1>
          <ThemeToggle />
        </div>

        {submitted ? (
          <div className="text-center">
            <h2 className="text-lg font-bold text-text-primary mb-2">Check your inbox</h2>
            <p className="text-text-secondary text-sm mb-4">
              If an account exists with that email, a reset link is on its way.
            </p>
            <Link to="/login" className="text-primary text-sm font-bold hover:underline">Back to login</Link>
          </div>
        ) : (
          <>
            <p className="text-text-secondary text-sm mb-6">We'll email you a reset link.</p>
            <form onSubmit={handleSubmit}>
              <FormInput label="Email" name="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              <button type="submit" disabled={isSubmitting}
                className="w-full bg-primary hover:bg-primary-dark disabled:bg-primary/50 text-white font-bold py-3 rounded-xl shadow-md transition-all mt-2">
                {isSubmitting ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
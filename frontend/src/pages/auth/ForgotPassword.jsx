import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import FormInput from '../../components/FormInput';

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
      // Always show the same confirmation, regardless of outcome — matches the
      // backend's deliberately generic, anti-enumeration response from Module 8
      setSubmitted(true);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-md p-8">
        {submitted ? (
          <div className="text-center">
            <h1 className="text-xl font-bold text-gray-900 mb-2">Check your inbox</h1>
            <p className="text-gray-500 text-sm mb-4">
              If an account exists with that email, a reset link is on its way.
            </p>
            <Link to="/login" className="text-emerald-600 text-sm font-medium hover:underline">Back to login</Link>
          </div>
        ) : (
          <>
            <h1 className="text-xl font-bold text-gray-900 mb-1">Forgot password</h1>
            <p className="text-gray-500 text-sm mb-6">We'll email you a reset link.</p>
            <form onSubmit={handleSubmit}>
              <FormInput label="Email" name="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              <button type="submit" disabled={isSubmitting}
                className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-300 text-white font-medium py-2.5 rounded-lg mt-2">
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
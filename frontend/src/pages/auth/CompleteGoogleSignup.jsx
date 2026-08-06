import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import FormInput from '../../components/FormInput';

const CompleteGoogleSignup = () => {
  const navigate = useNavigate();
  const { setAuthUser } = useAuth();

  const [pendingAuth, setPendingAuth] = useState(null);
  const [role, setRole] = useState('student');
  const [roleDetails, setRoleDetails] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem('pendingGoogleAuth');
    if (!stored) {
      // Someone landed here directly without going through the Google button first —
      // nothing to complete, send them back to a sensible starting point
      toast.error('No pending Google sign-in found. Please try again.');
      navigate('/login');
      return;
    }
    setPendingAuth(JSON.parse(stored));
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { data } = await api.post('/auth/google', {
        idToken: pendingAuth.idToken,
        role,
        roleDetails,
      });

      sessionStorage.removeItem('pendingGoogleAuth');
      setAuthUser(data.data.user);
      toast.success(`Welcome to MessMate, ${data.data.user.name}!`);
      navigate(role === 'owner' ? '/owner/dashboard' : '/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not complete signup');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!pendingAuth) return null; // brief flash before the redirect effect above fires

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-md p-8">
        <div className="flex items-center gap-3 mb-6">
          {pendingAuth.profile.avatarUrl && (
            <img src={pendingAuth.profile.avatarUrl} alt="" className="w-12 h-12 rounded-full" />
          )}
          <div>
            <p className="font-semibold text-gray-900">{pendingAuth.profile.name}</p>
            <p className="text-sm text-gray-400">{pendingAuth.profile.email}</p>
          </div>
        </div>

        <h1 className="text-lg font-bold text-gray-900 mb-1">One more step</h1>
        <p className="text-gray-500 text-sm mb-6">Tell us how you'll use MessMate</p>

        <div className="flex bg-gray-100 rounded-lg p-1 mb-5">
          <button type="button" onClick={() => { setRole('student'); setRoleDetails({}); }}
            className={`flex-1 py-2 rounded-md text-sm font-medium ${role === 'student' ? 'bg-white shadow text-emerald-600' : 'text-gray-500'}`}>
            Student
          </button>
          <button type="button" onClick={() => { setRole('owner'); setRoleDetails({}); }}
            className={`flex-1 py-2 rounded-md text-sm font-medium ${role === 'owner' ? 'bg-white shadow text-emerald-600' : 'text-gray-500'}`}>
            Mess Owner
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {role === 'student' ? (
            <>
              <FormInput label="College" name="college" value={roleDetails.college || ''}
                onChange={(e) => setRoleDetails({ ...roleDetails, college: e.target.value })} />
              <FormInput label="City" name="city" value={roleDetails.city || ''}
                onChange={(e) => setRoleDetails({ ...roleDetails, city: e.target.value })} />
            </>
          ) : (
            <>
              <FormInput label="Business Name" name="businessName" value={roleDetails.businessName || ''}
                onChange={(e) => setRoleDetails({ ...roleDetails, businessName: e.target.value })} />
              <FormInput label="Business Address" name="address" value={roleDetails.address || ''}
                onChange={(e) => setRoleDetails({ ...roleDetails, address: e.target.value })} />
            </>
          )}

          <button type="submit" disabled={isSubmitting}
            className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-300 text-white font-medium py-2.5 rounded-lg mt-2">
            {isSubmitting ? 'Creating account...' : 'Complete Signup'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CompleteGoogleSignup;
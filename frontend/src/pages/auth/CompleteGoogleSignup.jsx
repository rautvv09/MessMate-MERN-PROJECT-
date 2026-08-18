import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import FormInput from '../../components/FormInput';
import ThemeToggle from '../../components/ui/ThemeToggle';

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

  if (!pendingAuth) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-text-primary px-4 py-10 transition-colors">
      <div className="w-full max-w-md bg-surface border border-border rounded-3xl shadow-xl p-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {pendingAuth.profile.avatarUrl && (
              <img src={pendingAuth.profile.avatarUrl} alt="" className="w-12 h-12 rounded-full border border-primary/30" />
            )}
            <div>
              <p className="font-extrabold font-heading text-text-primary">{pendingAuth.profile.name}</p>
              <p className="text-xs text-text-secondary">{pendingAuth.profile.email}</p>
            </div>
          </div>
          <ThemeToggle />
        </div>

        <h1 className="text-xl font-extrabold font-heading text-text-primary mb-1">One more step</h1>
        <p className="text-text-secondary text-sm mb-6">Tell us how you'll use MessMate</p>

        <div className="flex bg-background border border-border rounded-xl p-1 mb-5">
          <button type="button" onClick={() => { setRole('student'); setRoleDetails({}); }}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${role === 'student' ? 'bg-surface shadow-sm text-primary border border-border' : 'text-text-secondary hover:text-text-primary'}`}>
            Student
          </button>
          <button type="button" onClick={() => { setRole('owner'); setRoleDetails({}); }}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${role === 'owner' ? 'bg-surface shadow-sm text-primary border border-border' : 'text-text-secondary hover:text-text-primary'}`}>
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
            className="w-full bg-primary hover:bg-primary-dark disabled:bg-primary/50 text-white font-bold py-3 rounded-xl shadow-md transition-all mt-2">
            {isSubmitting ? 'Creating account...' : 'Complete Signup'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CompleteGoogleSignup;
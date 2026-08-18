import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../services/api';
import FormInput from '../../components/FormInput';
import ThemeToggle from '../../components/ui/ThemeToggle';

const STUDENT_FIELDS = [
  { name: 'name', label: 'Full Name', type: 'text' },
  { name: 'email', label: 'Email', type: 'email' },
  { name: 'password', label: 'Password', type: 'password' },
  { name: 'phone', label: 'Phone Number', type: 'tel' },
  { name: 'college', label: 'College', type: 'text' },
  { name: 'city', label: 'City', type: 'text' },
];
const OWNER_FIELDS = [
  { name: 'name', label: 'Your Name', type: 'text' },
  { name: 'email', label: 'Email', type: 'email' },
  { name: 'password', label: 'Password', type: 'password' },
  { name: 'phone', label: 'Phone Number', type: 'tel' },
  { name: 'businessName', label: 'Business Name', type: 'text' },
  { name: 'address', label: 'Business Address', type: 'text' },
];

const Register = () => {
  const [role, setRole] = useState('student');
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState(null);
  const navigate = useNavigate();

  const activeFields = role === 'student' ? STUDENT_FIELDS : OWNER_FIELDS;

  const handleRoleSwitch = (newRole) => {
    setRole(newRole);
    setFormData({});
    setErrors({});
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: null });
  };

  const validate = () => {
    const newErrors = {};
    activeFields.forEach(({ name, label }) => {
      if (!formData[name]?.trim()) newErrors[name] = `${label} is required`;
    });
    if (formData.password) {
      if (formData.password.length < 8) newErrors.password = 'At least 8 characters';
      else if (!/[A-Z]/.test(formData.password)) newErrors.password = 'Needs an uppercase letter';
      else if (!/[0-9]/.test(formData.password)) newErrors.password = 'Needs a number';
    }
    if (formData.phone && !/^[6-9]\d{9}$/.test(formData.phone)) {
      newErrors.phone = 'Enter a valid 10-digit phone number';
    }
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const { college, city, businessName, address, ...rest } = formData;
    const payload = {
      ...rest,
      role,
      roleDetails: role === 'student' ? { college, city } : { businessName, address },
    };

    setIsSubmitting(true);
    try {
      const { data } = await api.post('/auth/register', payload);
      setRegisteredEmail(data.data.email);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (registeredEmail) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-text-primary px-4 py-10 transition-colors">
        <div className="w-full max-w-md bg-surface border border-border rounded-3xl shadow-xl p-8 text-center">
          <h1 className="text-xl font-extrabold font-heading text-text-primary mb-2">Check your inbox</h1>
          <p className="text-text-secondary text-sm mb-4">
            We sent a verification link to <span className="font-bold text-text-primary">{registeredEmail}</span>.
            Click it to activate your account before logging in.
          </p>
          <Link to="/login" className="text-primary text-sm font-bold hover:underline">
            Back to login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-text-primary px-4 py-10 transition-colors">
      <div className="w-full max-w-md bg-surface border border-border rounded-3xl shadow-xl p-8">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-extrabold font-heading text-text-primary">Create your account</h1>
          <ThemeToggle />
        </div>
        <p className="text-text-secondary text-sm mb-6">Join MessMate as a student or mess owner</p>

        <div className="flex bg-background border border-border rounded-xl p-1 mb-6">
          <button type="button" onClick={() => handleRoleSwitch('student')}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${role === 'student' ? 'bg-surface shadow-sm text-primary border border-border' : 'text-text-secondary hover:text-text-primary'}`}>
            Student
          </button>
          <button type="button" onClick={() => handleRoleSwitch('owner')}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${role === 'owner' ? 'bg-surface shadow-sm text-primary border border-border' : 'text-text-secondary hover:text-text-primary'}`}>
            Mess Owner
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          {activeFields.map((field) => (
            <FormInput key={field.name} label={field.label} name={field.name} type={field.type}
              value={formData[field.name] || ''} onChange={handleChange} error={errors[field.name]} />
          ))}
          <button type="submit" disabled={isSubmitting}
            className="w-full bg-primary hover:bg-primary-dark disabled:bg-primary/50 text-white font-bold py-3 rounded-xl shadow-md transition-all mt-2">
            {isSubmitting ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-sm text-text-secondary mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-primary font-bold hover:underline">Log in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
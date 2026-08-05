import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { registerStudent, registerOwner } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';
import FormInput from '../../components/FormInput';

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

  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const activeFields = role === 'student' ? STUDENT_FIELDS : OWNER_FIELDS;

  const handleRoleSwitch = (newRole) => {
    setRole(newRole);
    setFormData({}); // clear fields when switching tabs — avoids submitting stale cross-role data
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
    if (formData.password && formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
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

    setIsSubmitting(true);
    try {
      const registerFn = role === 'student' ? registerStudent : registerOwner;
      const { data } = await registerFn(formData);
      const { user, token } = data.data;

      loginUser(user, token);
      toast.success(`Welcome to MessMate, ${user.name}!`);

      navigate(role === 'owner' ? '/owner/dashboard' : '/dashboard');
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed. Please try again.';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-10">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-md p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Create your account</h1>
        <p className="text-gray-500 mb-6">Join MessMate as a student or mess owner</p>

        {/* Role Tab Switcher */}
        <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
          <button
            type="button"
            onClick={() => handleRoleSwitch('student')}
            className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${
              role === 'student' ? 'bg-white shadow text-emerald-600' : 'text-gray-500'
            }`}
          >
            Student
          </button>
          <button
            type="button"
            onClick={() => handleRoleSwitch('owner')}
            className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${
              role === 'owner' ? 'bg-white shadow text-emerald-600' : 'text-gray-500'
            }`}
          >
            Mess Owner
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          {activeFields.map((field) => (
            <FormInput
              key={field.name}
              label={field.label}
              name={field.name}
              type={field.type}
              value={formData[field.name] || ''}
              onChange={handleChange}
              error={errors[field.name]}
            />
          ))}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-300 text-white font-medium py-2.5 rounded-lg transition-colors mt-2"
          >
            {isSubmitting ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-emerald-600 font-medium hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
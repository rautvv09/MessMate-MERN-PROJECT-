import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getMess, createMess, updateMess } from '../../services/messService';
import FormInput from '../../components/FormInput';
import FacilitiesCheckboxGrid from '../../components/FacilitiesCheckboxGrid';

const EMPTY_FORM = {
  name: '', description: '', foodType: 'veg', address: '', city: '',
  baseFee: '', deposit: '', registrationFee: '', totalSeats: '',
  facilities: [], tags: '', nearbyColleges: '', longitude: '', latitude: '',
};

const MessForm = () => {
  const { messId } = useParams(); // undefined on /owner/messes/new — that's how we detect the mode
  const isEditMode = Boolean(messId);
  const navigate = useNavigate();

  const [formData, setFormData] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(isEditMode); // only true if we need to fetch existing data first
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isEditMode) return;

    const loadExistingMess = async () => {
      try {
        const { data } = await getMess(messId);
        const mess = data.data.mess;

        setFormData({
          name: mess.name,
          description: mess.description,
          foodType: mess.foodType,
          address: mess.address,
          city: mess.city,
          baseFee: mess.pricing.baseFee,
          deposit: mess.pricing.deposit,
          registrationFee: mess.pricing.registrationFee,
          totalSeats: mess.totalSeats,
          facilities: mess.facilities,
          tags: mess.tags.join(', '),
          nearbyColleges: mess.nearbyColleges.join(', '),
          longitude: mess.location?.coordinates?.[0] || '',
          latitude: mess.location?.coordinates?.[1] || '',
        });
      } catch (error) {
        toast.error('Could not load mess details');
        navigate('/owner/dashboard');
      } finally {
        setIsLoading(false);
      }
    };
    loadExistingMess();
  }, [messId, isEditMode, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: null });
  };

  const validate = () => {
    const newErrors = {};
    const required = ['name', 'description', 'address', 'city', 'baseFee', 'totalSeats'];
    required.forEach((field) => {
      if (!String(formData[field]).trim()) newErrors[field] = 'This field is required';
    });
    if (formData.baseFee && Number(formData.baseFee) < 0) {
      newErrors.baseFee = 'Base fee cannot be negative';
    }
    if (formData.totalSeats && Number(formData.totalSeats) < 1) {
      newErrors.totalSeats = 'Must have at least 1 seat';
    }
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast.error('Please fix the errors below');
      return;
    }

    // Convert comma-separated text inputs back into the arrays the backend expects,
    // and drop empty entries left by trailing/double commas
    const payload = {
      ...formData,
      baseFee: Number(formData.baseFee),
      deposit: Number(formData.deposit) || 0,
      registrationFee: Number(formData.registrationFee) || 0,
      totalSeats: Number(formData.totalSeats),
      tags: formData.tags.split(',').map((t) => t.trim()).filter(Boolean),
      nearbyColleges: formData.nearbyColleges.split(',').map((c) => c.trim()).filter(Boolean),
    };

    // Only include coordinates if both were actually provided — matches the backend's
    // optional-location handling from Phase 6
    if (formData.longitude && formData.latitude) {
      payload.longitude = Number(formData.longitude);
      payload.latitude = Number(formData.latitude);
    } else {
      delete payload.longitude;
      delete payload.latitude;
    }

    setIsSubmitting(true);
    try {
      if (isEditMode) {
        await updateMess(messId, payload);
        toast.success('Mess updated');
      } else {
        await createMess(payload);
        toast.success('Mess listing created');
      }
      navigate('/owner/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not save mess listing');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <p className="text-center py-16 text-gray-400">Loading...</p>;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        {isEditMode ? 'Edit Mess Listing' : 'Add a New Mess'}
      </h1>

      <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl p-6">
        <h3 className="font-semibold text-gray-800 mb-3">Basic Information</h3>
        <FormInput label="Mess Name" name="name" value={formData.name} onChange={handleChange} error={errors.name} />

        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={3}
          className={`w-full px-3 py-2 border rounded-lg mb-4 text-sm ${errors.description ? 'border-red-400' : 'border-gray-300'}`}
        />

        <label className="block text-sm font-medium text-gray-700 mb-1">Food Type</label>
        <select
          name="foodType"
          value={formData.foodType}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-4 text-sm"
        >
          <option value="veg">Veg</option>
          <option value="non-veg">Non-Veg</option>
          <option value="both">Both</option>
        </select>

        <FormInput label="Address" name="address" value={formData.address} onChange={handleChange} error={errors.address} />
        <FormInput label="City" name="city" value={formData.city} onChange={handleChange} error={errors.city} />

        <div className="grid grid-cols-2 gap-3">
          <FormInput label="Longitude (optional)" name="longitude" type="number" step="any" value={formData.longitude} onChange={handleChange} />
          <FormInput label="Latitude (optional)" name="latitude" type="number" step="any" value={formData.latitude} onChange={handleChange} />
        </div>

        <h3 className="font-semibold text-gray-800 mb-3 mt-6">Pricing</h3>
        <div className="grid grid-cols-3 gap-3">
          <FormInput label="Base Fee (₹/mo)" name="baseFee" type="number" value={formData.baseFee} onChange={handleChange} error={errors.baseFee} />
          <FormInput label="Deposit (₹)" name="deposit" type="number" value={formData.deposit} onChange={handleChange} />
          <FormInput label="Registration Fee (₹)" name="registrationFee" type="number" value={formData.registrationFee} onChange={handleChange} />
        </div>

        <FormInput label="Total Seats" name="totalSeats" type="number" value={formData.totalSeats} onChange={handleChange} error={errors.totalSeats} />

        <h3 className="font-semibold text-gray-800 mb-3 mt-6">Facilities</h3>
        <FacilitiesCheckboxGrid
          selected={formData.facilities}
          onChange={(facilities) => setFormData({ ...formData, facilities })}
        />

        <h3 className="font-semibold text-gray-800 mb-3 mt-6">Additional Details</h3>
        <FormInput
          label="Tags (comma-separated)"
          name="tags"
          value={formData.tags}
          onChange={handleChange}
          placeholder="homely, budget-friendly"
        />
        <FormInput
          label="Nearby Colleges (comma-separated)"
          name="nearbyColleges"
          value={formData.nearbyColleges}
          onChange={handleChange}
          placeholder="DKTE Textile & Engineering Institute"
        />

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-300 text-white font-medium py-2.5 rounded-lg mt-4"
        >
          {isSubmitting ? 'Saving...' : isEditMode ? 'Save Changes' : 'Create Mess Listing'}
        </button>
      </form>
    </div>
  );
};

export default MessForm;
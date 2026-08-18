import { useState, useEffect } from 'react';
import { FaSave, FaSpinner, FaRupeeSign, FaPercent } from 'react-icons/fa';

/**
 * PricingConfig — Form component for owners to set their per-meal prices and GST.
 */
const PricingConfig = ({ initialPricing, onSave, isSaving }) => {
  const [formData, setFormData] = useState({
    breakfast: 40,
    lunch: 70,
    dinner: 70,
    fullDay: 180,
    gstPercentage: 5,
  });

  useEffect(() => {
    if (initialPricing) {
      setFormData(initialPricing);
    }
  }, [initialPricing]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value === '' ? '' : Number(value),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="bg-surface border border-border rounded-3xl p-6 shadow-sm">
      <div className="mb-5">
        <h2 className="text-lg font-extrabold font-heading text-text-primary">Meal Pricing</h2>
        <p className="text-xs text-text-secondary mt-1">
          Set your base prices per meal. These prices will be locked in for a student
          when their monthly bill is generated.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <PriceInput
            label="Breakfast"
            name="breakfast"
            value={formData.breakfast}
            onChange={handleChange}
            icon={<FaRupeeSign size={12} className="text-text-secondary" />}
          />
          <PriceInput
            label="Lunch"
            name="lunch"
            value={formData.lunch}
            onChange={handleChange}
            icon={<FaRupeeSign size={12} className="text-text-secondary" />}
          />
          <PriceInput
            label="Dinner"
            name="dinner"
            value={formData.dinner}
            onChange={handleChange}
            icon={<FaRupeeSign size={12} className="text-text-secondary" />}
          />
          <PriceInput
            label="Full Day (Unused currently)"
            name="fullDay"
            value={formData.fullDay}
            onChange={handleChange}
            icon={<FaRupeeSign size={12} className="text-text-secondary" />}
            disabled
          />
        </div>

        <div className="pt-5 border-t border-border flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="w-full sm:w-48">
            <PriceInput
              label="GST Percentage"
              name="gstPercentage"
              value={formData.gstPercentage}
              onChange={handleChange}
              icon={<FaPercent size={12} className="text-text-secondary" />}
              step="0.1"
            />
          </div>
          <button
            type="submit"
            disabled={isSaving}
            className={`flex items-center justify-center gap-2 px-6 py-2.5 text-xs font-bold rounded-xl transition-all ${
              isSaving
                ? 'bg-border text-text-muted cursor-not-allowed'
                : 'bg-primary hover:bg-primary-dark text-white shadow-sm hover:shadow-md'
            }`}
          >
            {isSaving ? (
              <>
                <FaSpinner className="animate-spin" size={13} />
                Saving...
              </>
            ) : (
              <>
                <FaSave size={13} />
                Save Pricing
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

const PriceInput = ({ label, name, value, onChange, icon, disabled = false, step = '1' }) => (
  <div>
    <label className="block text-xs font-bold text-text-primary mb-1">{label}</label>
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        {icon}
      </div>
      <input
        type="number"
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        min="0"
        step={step}
        required
        className={`w-full pl-8 pr-3 py-2 border border-border rounded-xl text-xs font-bold text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/30 ${
          disabled ? 'bg-background text-text-muted cursor-not-allowed opacity-60' : 'bg-background'
        }`}
      />
    </div>
  </div>
);

export default PricingConfig;

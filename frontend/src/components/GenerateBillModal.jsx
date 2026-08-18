import { useState, useEffect } from 'react';
import { FaTimes, FaSpinner, FaRupeeSign } from 'react-icons/fa';

/**
 * GenerateBillModal — Modal to configure extras (deposit, discount) and
 * generate a bill for a specific student booking.
 */
const GenerateBillModal = ({
  isOpen,
  onClose,
  booking,
  year,
  month,
  pricing,
  onGenerate,
  isGenerating,
}) => {
  const [formData, setFormData] = useState({
    discount: 0,
    deposit: 0,
    registrationFee: 0,
    dueDate: '',
    notes: '',
  });

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      // Default due date to 10th of next month
      const defaultDueDate = new Date(year, month, 10);
      setFormData({
        discount: 0,
        deposit: 0,
        registrationFee: 0,
        dueDate: defaultDueDate.toISOString().split('T')[0],
        notes: '',
      });
    }
  }, [isOpen, year, month]);

  if (!isOpen || !booking) return null;

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? '' : Number(value)) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await onGenerate(booking._id, formData);
    if (success) {
      onClose();
    }
  };

  const monthNames = [
    '', 'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-surface rounded-2xl w-full max-w-lg shadow-2xl border border-border overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-background">
          <div>
            <h3 className="text-lg font-extrabold font-heading text-text-primary">Generate Bill</h3>
            <p className="text-xs text-text-secondary mt-0.5">
              {monthNames[month]} {year} • {booking.studentId.name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-text-secondary hover:text-text-primary hover:bg-surface rounded-xl transition-colors border border-transparent hover:border-border"
            disabled={isGenerating}
          >
            <FaTimes />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          {/* Current Pricing Info */}
          <div className="bg-primary/10 rounded-xl p-3 border border-primary/20 flex flex-wrap gap-4 text-xs text-primary font-medium">
            <span className="font-bold">Current Rates:</span>
            <span>Breakfast: ₹{pricing.breakfast}</span>
            <span>Lunch: ₹{pricing.lunch}</span>
            <span>Dinner: ₹{pricing.dinner}</span>
            <span>GST: {pricing.gstPercentage}%</span>
          </div>

          <form id="generate-bill-form" onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <ExtraInput
                label="Deposit (₹)"
                name="deposit"
                value={formData.deposit}
                onChange={handleChange}
              />
              <ExtraInput
                label="Registration Fee (₹)"
                name="registrationFee"
                value={formData.registrationFee}
                onChange={handleChange}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
               <ExtraInput
                label="Discount (₹)"
                name="discount"
                value={formData.discount}
                onChange={handleChange}
              />
              <div>
                <label className="block text-xs font-bold text-text-primary mb-1">Due Date</label>
                <input
                  type="date"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 bg-background border border-border text-text-primary rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-text-primary mb-1">Notes (Optional)</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={2}
                maxLength={500}
                placeholder="E.g., Adjusted for late joining"
                className="w-full px-3 py-2 bg-background border border-border text-text-primary placeholder:text-text-muted rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
              />
            </div>
          </form>
          
          <div className="text-[11px] text-text-secondary bg-background p-2.5 rounded-xl border border-border">
            <strong>Formula:</strong> (Meals Consumed × Rate) + Deposit + Reg. Fee - Discount + GST
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border flex items-center justify-end gap-3 bg-background">
          <button
            type="button"
            onClick={onClose}
            disabled={isGenerating}
            className="px-4 py-2 text-xs font-bold text-text-secondary hover:text-text-primary hover:bg-surface rounded-xl transition-colors border border-border"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="generate-bill-form"
            disabled={isGenerating}
            className={`flex items-center gap-2 px-5 py-2 text-xs font-bold text-white rounded-xl shadow-sm transition-all ${
              isGenerating ? 'bg-primary/50 cursor-not-allowed' : 'bg-primary hover:bg-primary-dark shadow-md'
            }`}
          >
            {isGenerating ? <FaSpinner className="animate-spin" /> : null}
            Generate Bill
          </button>
        </div>
      </div>
    </div>
  );
};

const ExtraInput = ({ label, name, value, onChange }) => (
  <div>
    <label className="block text-xs font-bold text-text-primary mb-1">{label}</label>
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
        <FaRupeeSign size={10} className="text-text-secondary" />
      </div>
      <input
        type="number"
        name={name}
        value={value}
        onChange={onChange}
        min="0"
        className="w-full pl-7 pr-3 py-2 bg-background border border-border text-text-primary rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
      />
    </div>
  </div>
);

export default GenerateBillModal;

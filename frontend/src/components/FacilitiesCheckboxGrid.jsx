const FACILITY_OPTIONS = [
  { key: 'AC_DINING', label: 'AC Dining' },
  { key: 'HOME_DELIVERY', label: 'Home Delivery' },
  { key: 'UNLIMITED_ROTI', label: 'Unlimited Roti' },
  { key: 'HYGIENE_CERTIFIED', label: 'Hygiene Certified' },
  { key: 'PARKING', label: 'Parking' },
  { key: 'CCTV', label: 'CCTV' },
  { key: 'WIFI', label: 'WiFi' },
  { key: 'CARD_UPI_PAYMENT', label: 'Card/UPI Payment' },
];

const FacilitiesCheckboxGrid = ({ selected, onChange }) => {
  const toggle = (key) => {
    if (selected.includes(key)) {
      onChange(selected.filter((f) => f !== key));
    } else {
      onChange([...selected, key]);
    }
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
      {FACILITY_OPTIONS.map(({ key, label }) => (
        <label
          key={key}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm cursor-pointer transition-colors ${
            selected.includes(key)
              ? 'border-emerald-400 bg-emerald-50 text-emerald-700'
              : 'border-gray-200 text-gray-600'
          }`}
        >
          <input
            type="checkbox"
            checked={selected.includes(key)}
            onChange={() => toggle(key)}
            className="accent-emerald-500"
          />
          {label}
        </label>
      ))}
    </div>
  );
};

export default FacilitiesCheckboxGrid;
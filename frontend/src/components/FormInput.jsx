const FormInput = ({ label, name, type = 'text', value, onChange, error, ...rest }) => {
  return (
    <div className="mb-4">
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
          error
            ? 'border-red-400 focus:ring-red-300'
            : 'border-gray-300 focus:ring-emerald-400'
        }`}
        {...rest}
      />
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
};

export default FormInput;
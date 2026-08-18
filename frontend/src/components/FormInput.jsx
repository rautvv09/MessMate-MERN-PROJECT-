const FormInput = ({ label, name, type = 'text', value, onChange, error, ...rest }) => {
  return (
    <div className="mb-4">
      <label htmlFor={name} className="block text-sm font-medium text-text-primary mb-1">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        className={`w-full px-3 py-2 border rounded-lg bg-surface text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 transition-colors ${
          error
            ? 'border-status-danger focus:ring-status-danger/30'
            : 'border-border focus:ring-primary/30 focus:border-primary'
        }`}
        {...rest}
      />
      {error && <p className="mt-1 text-sm text-status-danger">{error}</p>}
    </div>
  );
};

export default FormInput;
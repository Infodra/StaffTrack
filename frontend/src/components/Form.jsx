export const Input = ({ label, error, className = '', ...props }) => {
  return (
    <div className={className}>
      {label && <label className="label">{label}</label>}
      <input
        className={`input ${error ? 'border-red-500 focus:ring-red-500' : ''}`}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export const Select = ({ label, error, options = [], className = '', ...props }) => {
  return (
    <div className={className}>
      {label && <label className="label">{label}</label>}
      <select
        className={`input ${error ? 'border-red-500 focus:ring-red-500' : ''}`}
        {...props}
      >
        <option value="">Select...</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

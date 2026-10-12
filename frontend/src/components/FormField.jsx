// Labelled, controlled input with an inline error message
const FormField = ({ label, name, error, hint, ...inputProps }) => (
  <div>
    <label htmlFor={name} className="field-label">
      {label}
    </label>
    <input
      id={name}
      name={name}
      aria-invalid={Boolean(error)}
      aria-describedby={error ? `${name}-error` : undefined}
      className="field"
      {...inputProps}
    />
    {error ? (
      <p id={`${name}-error`} className="mt-1 text-xs font-medium text-chili">
        {error}
      </p>
    ) : (
      hint && <p className="mt-1 text-xs text-ink-faint">{hint}</p>
    )}
  </div>
);

export default FormField;

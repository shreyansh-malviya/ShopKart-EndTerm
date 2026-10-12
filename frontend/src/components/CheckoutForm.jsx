const FIELDS = [
  { name: "fullName", label: "Full Name", autoComplete: "name", placeholder: "Aarav Sharma", span: 2 },
  { name: "phone", label: "Phone", autoComplete: "tel", placeholder: "9876543210", inputMode: "tel" },
  { name: "pincode", label: "Pincode", autoComplete: "postal-code", placeholder: "560001", inputMode: "numeric", maxLength: 6 },
  { name: "addressLine1", label: "Address", autoComplete: "street-address", placeholder: "22 MG Road, Apartment 4B", span: 2 },
  { name: "city", label: "City", autoComplete: "address-level2", placeholder: "Bengaluru" },
  { name: "state", label: "State", autoComplete: "address-level1", placeholder: "Karnataka" },
];

// Controlled shipping form. State and validation live in the Checkout page.
const CheckoutForm = ({ values, errors, onChange, disabled }) => (
  <fieldset disabled={disabled} className="grid gap-4 sm:grid-cols-2">
    <legend className="sr-only">Shipping details</legend>
    {FIELDS.map((field) => (
      <div key={field.name} className={field.span === 2 ? "sm:col-span-2" : ""}>
        <label htmlFor={`ship-${field.name}`} className="field-label">
          {field.label}
        </label>
        <input
          id={`ship-${field.name}`}
          name={field.name}
          value={values[field.name]}
          onChange={onChange}
          placeholder={field.placeholder}
          autoComplete={field.autoComplete}
          inputMode={field.inputMode}
          maxLength={field.maxLength}
          aria-invalid={Boolean(errors[field.name])}
          aria-describedby={errors[field.name] ? `ship-${field.name}-error` : undefined}
          className="field"
        />
        {errors[field.name] && (
          <p id={`ship-${field.name}-error`} className="mt-1 text-xs font-medium text-chili">
            {errors[field.name]}
          </p>
        )}
      </div>
    ))}
  </fieldset>
);

export default CheckoutForm;

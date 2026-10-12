// Client-side validation mirrors the backend rules so users get instant feedback.
// The server still re-validates everything.

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PHONE_REGEX = /^(?:\+91[-\s]?|0)?[6-9]\d{9}$/;
export const PINCODE_REGEX = /^[1-9]\d{5}$/;

const blank = (value) => !value || !String(value).trim();

export const validateRegister = ({ fullName, email, password, phone }) => {
  const errors = {};
  if (blank(fullName)) errors.fullName = "Full name is required.";
  if (blank(email)) errors.email = "Email is required.";
  else if (!EMAIL_REGEX.test(email.trim())) errors.email = "Enter a valid email address.";
  if (!password) errors.password = "Password is required.";
  else if (password.length < 6) errors.password = "Password must be at least 6 characters.";
  if (blank(phone)) errors.phone = "Phone number is required.";
  else if (!PHONE_REGEX.test(phone.trim())) errors.phone = "Enter a valid 10-digit mobile number.";
  return errors;
};

export const validateLogin = ({ email, password }) => {
  const errors = {};
  if (blank(email)) errors.email = "Email is required.";
  if (!password) errors.password = "Password is required.";
  return errors;
};

export const validateShipping = (address) => {
  const errors = {};
  const required = {
    fullName: "Full name is required.",
    phone: "Phone number is required.",
    addressLine1: "Address is required.",
    city: "City is required.",
    state: "State is required.",
    pincode: "Pincode is required.",
  };

  // Whitespace-only input counts as empty
  for (const [field, message] of Object.entries(required)) {
    if (blank(address[field])) errors[field] = message;
  }

  if (!errors.phone && !PHONE_REGEX.test(address.phone.trim())) {
    errors.phone = "Enter a valid 10-digit mobile number.";
  }
  if (!errors.pincode && !PINCODE_REGEX.test(address.pincode.trim())) {
    errors.pincode = "Pincode must contain 6 digits.";
  }
  return errors;
};

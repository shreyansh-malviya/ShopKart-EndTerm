import mongoose from "mongoose";

// Strict check: only 24-char hex strings count as valid ids
export const isValidObjectId = (id) =>
  typeof id === "string" && /^[a-f\d]{24}$/i.test(id) && mongoose.Types.ObjectId.isValid(id);

// Escapes regex special characters so search text is matched literally
export const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const isBlank = (value) => typeof value !== "string" || value.trim() === "";

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Indian mobile number: 10 digits starting with 6-9, optional +91 or 0 prefix
export const PHONE_REGEX = /^(?:\+91[-\s]?|0)?[6-9]\d{9}$/;
// Indian pincode: 6 digits, cannot start with 0
export const PINCODE_REGEX = /^[1-9]\d{5}$/;

// Turns a Mongoose ValidationError into one readable message
export const validationMessage = (error) =>
  Object.values(error.errors)
    .map((e) => e.message)
    .join(", ");

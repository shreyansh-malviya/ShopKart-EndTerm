import bcrypt from "bcrypt";
import User from "../models/user.model.js";
import generateToken, { cookieOptions, clearCookieOptions, TOKEN_COOKIE } from "../utils/generateToken.js";
import { EMAIL_REGEX, PHONE_REGEX, isBlank } from "../utils/validators.js";

const SALT_ROUNDS = 10;
const MIN_PASSWORD_LENGTH = 6;

// Only these fields are ever sent to the client - never the password hash.
const toPublicCustomer = (user) => ({
  _id: user._id,
  fullName: user.fullName,
  email: user.email,
  phone: user.phone,
  createdAt: user.createdAt,
});

// POST /customers/register
export const registerCustomer = async (req, res) => {
  try {
    const { fullName, email, password, phone } = req.body ?? {};

    if ([fullName, email, password, phone].some(isBlank)) {
      return res.status(400).json({
        success: false,
        message: "All fields (fullName, email, password, phone) are required",
      });
    }

    if (!EMAIL_REGEX.test(email.trim())) {
      return res.status(400).json({ success: false, message: "Please enter a valid email address" });
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
      return res.status(400).json({
        success: false,
        message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters`,
      });
    }

    if (!PHONE_REGEX.test(phone.trim())) {
      return res.status(400).json({ success: false, message: "Please enter a valid 10-digit phone number" });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existing = await User.exists({ email: normalizedEmail });
    if (existing) {
      return res.status(409).json({ success: false, message: "Email is already registered" });
    }

    // Only the bcrypt hash is stored in MongoDB
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const customer = await User.create({
      fullName: fullName.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      phone: phone.trim(),
    });

    return res.status(201).json({
      success: true,
      message: "Customer registered successfully",
      customer: toPublicCustomer(customer),
    });
  } catch (error) {
    // Unique index race: two requests registering the same email at the same time
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: "Email is already registered" });
    }
    console.error("registerCustomer:", error);
    return res.status(500).json({ success: false, message: "Unable to register right now" });
  }
};

// POST /customers/login
export const loginCustomer = async (req, res) => {
  try {
    const { email, password } = req.body ?? {};

    if (isBlank(email) || isBlank(password)) {
      return res.status(400).json({ success: false, message: "Email and password are required" });
    }

    // password has select: false, so ask for it explicitly here
    const customer = await User.findOne({ email: email.trim().toLowerCase() }).select("+password");

    // Same message for unknown email and wrong password, so we don't reveal which one failed
    const passwordMatches = customer && (await bcrypt.compare(password, customer.password));
    if (!passwordMatches) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const token = generateToken(customer._id);
    res.cookie(TOKEN_COOKIE, token, cookieOptions);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      customer: toPublicCustomer(customer),
    });
  } catch (error) {
    console.error("loginCustomer:", error);
    return res.status(500).json({ success: false, message: "Unable to log in right now" });
  }
};

// GET /customers/me  (protected)
export const getMyProfile = (req, res) => {
  // req.user was attached by the auth middleware
  return res.status(200).json(toPublicCustomer(req.user));
};

// POST /customers/logout  (protected)
export const logoutCustomer = (req, res) => {
  res.clearCookie(TOKEN_COOKIE, clearCookieOptions);
  return res.status(200).json({ success: true, message: "Logged out successfully" });
};

// PATCH /customers/change-password  (protected) - Lab 01 bonus
export const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body ?? {};

    if (isBlank(oldPassword) || isBlank(newPassword)) {
      return res.status(400).json({ success: false, message: "Old and new passwords are required" });
    }

    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      return res.status(400).json({
        success: false,
        message: `New password must be at least ${MIN_PASSWORD_LENGTH} characters`,
      });
    }

    const customer = await User.findById(req.user._id).select("+password");

    const oldMatches = await bcrypt.compare(oldPassword, customer.password);
    if (!oldMatches) {
      return res.status(401).json({ success: false, message: "Old password is incorrect" });
    }

    if (await bcrypt.compare(newPassword, customer.password)) {
      return res.status(400).json({ success: false, message: "New password must be different from the old one" });
    }

    customer.password = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await customer.save();

    return res.status(200).json({ success: true, message: "Password changed successfully" });
  } catch (error) {
    console.error("changePassword:", error);
    return res.status(500).json({ success: false, message: "Unable to change password right now" });
  }
};

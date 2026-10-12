import jwt from "jsonwebtoken";

export const TOKEN_COOKIE = "token";
const TOKEN_TTL_DAYS = 7;

// The JWT payload only carries the user id - never sensitive data like passwords.
const generateToken = (userId) =>
  jwt.sign({ userId }, process.env.jwt_secret, { expiresIn: `${TOKEN_TTL_DAYS}d` });

// HttpOnly: browser JavaScript cannot read the cookie (protects the token from XSS).
// sameSite "lax" works for localhost:5173 -> localhost:8086 because both are the same site.
export const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  maxAge: TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000,
};

// clearCookie needs the same options that were used to set the cookie (minus maxAge).
export const clearCookieOptions = {
  httpOnly: cookieOptions.httpOnly,
  secure: cookieOptions.secure,
  sameSite: cookieOptions.sameSite,
};

export default generateToken;

import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import { TOKEN_COOKIE } from "../utils/generateToken.js";

// Protects routes: reads the JWT (HttpOnly cookie first, Bearer header as a fallback
// for Postman), verifies it, loads the user and attaches it to req.user.
export const protect = async (req, res, next) => {
  try {
    let token = req.cookies?.[TOKEN_COOKIE];

    const authHeader = req.headers.authorization;
    if (!token && authHeader?.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({ success: false, message: "Unauthorized: please log in" });
    }

    const decoded = jwt.verify(token, process.env.jwt_secret);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ success: false, message: "Unauthorized: user no longer exists" });
    }

    req.user = user;
    next();
  } catch {
    return res.status(401).json({ success: false, message: "Unauthorized: invalid or expired token" });
  }
};

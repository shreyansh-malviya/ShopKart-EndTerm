import "dotenv/config";
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import connectDB from "./config/db.js";
import customerRoutes from "./routes/customer.routes.js";
import productRoutes from "./routes/product.routes.js";
import wishlistRoutes from "./routes/wishlist.routes.js";
import cartRoutes from "./routes/cart.routes.js";
import orderRoutes from "./routes/order.routes.js";

const REQUIRED_ENV = ["MONGODB_URI", "jwt_secret"];
const missingEnv = REQUIRED_ENV.filter((key) => !process.env[key]);
if (missingEnv.length) {
  console.error(`Missing required environment variable(s): ${missingEnv.join(", ")}`);
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 8086;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

// credentials: true lets the browser send/receive the HttpOnly auth cookie cross-origin
app.use(cors({ origin: CLIENT_URL.split(",").map((url) => url.trim()), credentials: true }));
app.use(express.json({ limit: "100kb" }));
app.use(cookieParser());

app.get("/", (req, res) => res.json({ success: true, message: "ShopKart API is running" }));

app.use("/customers", customerRoutes);
app.use("/products", productRoutes);
app.use("/wishlist", wishlistRoutes);
app.use("/cart", cartRoutes);
app.use("/orders", orderRoutes);

// Unknown route
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.originalUrl}` });
});

// Central error handler (e.g. malformed JSON body)
app.use((err, req, res, next) => {
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ success: false, message: "Request body is not valid JSON" });
  }
  console.error("Unhandled error:", err);
  res.status(500).json({ success: false, message: "Something went wrong" });
});

connectDB()
  .then(() => {
    app.listen(PORT, () => console.log(`ShopKart API listening on http://localhost:${PORT}`));
  })
  .catch((error) => {
    console.error("Failed to connect to MongoDB:", error.message);
    process.exit(1);
  });

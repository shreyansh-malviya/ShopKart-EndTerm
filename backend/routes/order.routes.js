import express from "express";
import {
  getPaymentConfig,
  createPaymentOrder,
  verifyPayment,
  markPaymentFailed,
  getMyOrders,
  getOrderById,
  advanceOrderStatus,
} from "../controllers/order.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.use(protect);

router.get("/payment-config", getPaymentConfig);
router.post("/create-payment-order", createPaymentOrder);
// Alias used by the lab's Postman test plan ("POST /orders" with an empty cart -> 400)
router.post("/", createPaymentOrder);
router.post("/verify-payment", verifyPayment);

router.get("/", getMyOrders);
router.get("/:id", getOrderById);
router.post("/:id/payment-failed", markPaymentFailed);

// Bonus: development-only status progression endpoint
if (process.env.NODE_ENV !== "production") {
  router.patch("/:id/status", advanceOrderStatus);
}

export default router;

import crypto from "crypto";
import Order, { ORDER_STATUSES } from "../models/order.model.js";
import Product from "../models/product.model.js";
import User from "../models/user.model.js";
import getRazorpay, { isRazorpayConfigured } from "../config/razorpay.js";
import { PHONE_REGEX, PINCODE_REGEX, isBlank, isValidObjectId } from "../utils/validators.js";

const ADDRESS_FIELDS = ["fullName", "phone", "addressLine1", "city", "state", "pincode"];

// Statuses a PAID order moves through (Lab 06 bonus)
const FULFILMENT_FLOW = ["PLACED", "CONFIRMED", "SHIPPED", "DELIVERED"];

const roundMoney = (value) => Math.round(value * 100) / 100;

// Server-side shipping validation. Returns { address } or { error }.
const validateShippingAddress = (input) => {
  if (!input || typeof input !== "object") {
    return { error: "Shipping address is required" };
  }

  const missing = ADDRESS_FIELDS.filter((field) => isBlank(input[field]));
  if (missing.length) {
    return { error: `Missing shipping field(s): ${missing.join(", ")}` };
  }

  // Only copy the known fields, trimmed - anything else in the body is ignored
  const address = Object.fromEntries(ADDRESS_FIELDS.map((field) => [field, input[field].trim()]));

  if (!PHONE_REGEX.test(address.phone)) {
    return { error: "Phone must be a valid 10-digit mobile number" };
  }
  if (!PINCODE_REGEX.test(address.pincode)) {
    return { error: "Pincode must contain 6 digits" };
  }

  return { address };
};

// Constant-time comparison of two hex signatures
const signaturesMatch = (expected, received) => {
  if (typeof received !== "string" || received.length !== expected.length) return false;
  return crypto.timingSafeEqual(Buffer.from(expected, "utf8"), Buffer.from(received, "utf8"));
};

// GET /orders/payment-config - lets the UI know whether Razorpay keys are set (never exposes the secret)
export const getPaymentConfig = (req, res) => {
  return res.status(200).json({
    success: true,
    enabled: isRazorpayConfigured(),
    key: process.env.RAZORPAY_KEY_ID || null,
  });
};

// POST /orders/create-payment-order
// Body: { shippingAddress }. Anything else (items, totals) is ignored - the server owns pricing.
export const createPaymentOrder = async (req, res) => {
  try {
    const { address, error: addressError } = validateShippingAddress(req.body?.shippingAddress);
    if (addressError) {
      return res.status(400).json({ success: false, message: addressError });
    }

    // 1. Load the authenticated user's cart (never trust items sent by the client)
    const cart = req.user.cart ?? [];
    if (cart.length === 0) {
      return res.status(400).json({ success: false, message: "Your cart is empty" });
    }

    // 2. Load the LATEST product data for every cart item
    const productIds = cart.map((item) => item.product);
    const products = await Product.find({ _id: { $in: productIds } }).lean();
    const productMap = new Map(products.map((p) => [p._id.toString(), p]));

    // 3. Verify existence + stock, build the purchase-time snapshot, and total it on the server
    const items = [];
    let totalAmount = 0;

    for (const cartItem of cart) {
      const product = productMap.get(cartItem.product.toString());

      if (!product) {
        return res.status(400).json({
          success: false,
          message: "A product in your cart is no longer available. Please remove it and try again.",
        });
      }

      if (cartItem.quantity > product.stock) {
        return res.status(400).json({
          success: false,
          message:
            product.stock === 0
              ? `${product.name} is out of stock`
              : `Insufficient stock for ${product.name}. Only ${product.stock} left.`,
        });
      }

      items.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: cartItem.quantity,
        image: product.image,
      });
      totalAmount += product.price * cartItem.quantity;
    }

    totalAmount = roundMoney(totalAmount);

    const razorpay = getRazorpay();
    if (!razorpay) {
      return res.status(503).json({
        success: false,
        message: "Payments are not configured on the server yet (missing Razorpay Test keys).",
      });
    }

    // 4. Persist a pending ShopKart order. The cart is NOT touched here.
    const order = await Order.create({
      user: req.user._id,
      items,
      shippingAddress: address,
      totalAmount,
      paymentStatus: "PENDING",
      status: "PENDING_PAYMENT",
    });

    // 5. Create the matching Razorpay order. Razorpay expects the amount in paise.
    let razorpayOrder;
    try {
      razorpayOrder = await razorpay.orders.create({
        amount: Math.round(totalAmount * 100),
        currency: "INR",
        receipt: order._id.toString(),
        notes: { shopKartOrderId: order._id.toString() },
      });
    } catch (razorpayError) {
      order.paymentStatus = "FAILED";
      await order.save();
      console.error("Razorpay orders.create failed:", razorpayError?.error ?? razorpayError);
      return res.status(502).json({
        success: false,
        message: "Could not start the payment. Please try again.",
      });
    }

    order.razorpayOrderId = razorpayOrder.id;
    await order.save();

    // Only the public Key ID goes to the browser - never the Key Secret
    return res.status(201).json({
      success: true,
      shopKartOrderId: order._id,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error("createPaymentOrder:", error);
    return res.status(500).json({ success: false, message: "Unable to create order" });
  }
};

// POST /orders/verify-payment
// Body: { shopKartOrderId, razorpay_order_id, razorpay_payment_id, razorpay_signature }
export const verifyPayment = async (req, res) => {
  try {
    const { shopKartOrderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body ?? {};

    if (!isValidObjectId(shopKartOrderId) || isBlank(razorpay_payment_id) || isBlank(razorpay_signature)) {
      return res.status(400).json({ success: false, message: "Missing or invalid payment details" });
    }

    if (!isRazorpayConfigured()) {
      return res.status(503).json({ success: false, message: "Payments are not configured on the server" });
    }

    // Ownership check is part of the query - another user's order is simply "not found"
    const order = await Order.findOne({ _id: shopKartOrderId, user: req.user._id });
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    // Idempotent: verifying an already-paid order just returns it
    if (order.paymentStatus === "PAID") {
      return res.status(200).json({ success: true, message: "Payment already verified", order });
    }

    if (!order.razorpayOrderId) {
      return res.status(400).json({ success: false, message: "This order has no payment attached" });
    }

    // The trusted Razorpay order id is the one WE stored, not the one the browser sent
    if (razorpay_order_id && razorpay_order_id !== order.razorpayOrderId) {
      return res.status(400).json({ success: false, message: "Invalid payment signature" });
    }

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${order.razorpayOrderId}|${razorpay_payment_id}`)
      .digest("hex");

    if (!signaturesMatch(expectedSignature, razorpay_signature)) {
      // Order stays unpaid and the cart is left untouched
      return res.status(400).json({ success: false, message: "Invalid payment signature" });
    }

    // Signature is valid -> mark PAID + PLACED. The paymentStatus guard makes this safe
    // against two verify calls racing each other.
    const paidOrder = await Order.findOneAndUpdate(
      { _id: order._id, paymentStatus: { $ne: "PAID" } },
      {
        $set: {
          paymentStatus: "PAID",
          status: "PLACED",
          razorpayPaymentId: razorpay_payment_id,
          paidAt: new Date(),
        },
      },
      { returnDocument: "after" }
    );

    if (!paidOrder) {
      const current = await Order.findById(order._id);
      return res.status(200).json({ success: true, message: "Payment already verified", order: current });
    }

    // Reduce stock for what was actually bought. The $gte guard stops stock going negative.
    await Product.bulkWrite(
      paidOrder.items.map((item) => ({
        updateOne: {
          filter: { _id: item.product, stock: { $gte: item.quantity } },
          update: { $inc: { stock: -item.quantity } },
        },
      }))
    );

    // Only now, after verified payment, is the cart cleared
    await User.updateOne({ _id: req.user._id }, { $set: { cart: [] } });

    return res.status(200).json({ success: true, message: "Payment verified. Order placed.", order: paidOrder });
  } catch (error) {
    console.error("verifyPayment:", error);
    return res.status(500).json({ success: false, message: "Unable to verify payment" });
  }
};

// POST /orders/:id/payment-failed - records a failed Checkout attempt (cart stays as it is)
export const markPaymentFailed = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "Invalid order ID" });
    }

    const order = await Order.findOneAndUpdate(
      { _id: id, user: req.user._id, paymentStatus: "PENDING" },
      { $set: { paymentStatus: "FAILED" } },
      { returnDocument: "after" }
    );

    if (!order) {
      return res.status(404).json({ success: false, message: "Pending order not found" });
    }

    return res.status(200).json({ success: true, message: "Payment marked as failed" });
  } catch (error) {
    console.error("markPaymentFailed:", error);
    return res.status(500).json({ success: false, message: "Unable to update order" });
  }
};

// GET /orders - current user's orders, newest first.
// By default only paid orders are listed; ?include=all also returns pending/failed attempts.
export const getMyOrders = async (req, res) => {
  try {
    const filter = { user: req.user._id };
    if (req.query.include !== "all") {
      filter.paymentStatus = "PAID";
    }

    const orders = await Order.find(filter).sort({ createdAt: -1 }).lean();
    return res.status(200).json({ success: true, count: orders.length, orders });
  } catch (error) {
    console.error("getMyOrders:", error);
    return res.status(500).json({ success: false, message: "Unable to load orders" });
  }
};

// GET /orders/:id - only the owner can read it
export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "Invalid order ID" });
    }

    // Filtering by user means guessing someone else's order id returns 404
    const order = await Order.findOne({ _id: id, user: req.user._id }).lean();
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    return res.status(200).json({ success: true, order });
  } catch (error) {
    console.error("getOrderById:", error);
    return res.status(500).json({ success: false, message: "Unable to load order" });
  }
};

// PATCH /orders/:id/status - Lab 06 bonus, development-only endpoint.
// Moves a PAID order one step forward: PLACED -> CONFIRMED -> SHIPPED -> DELIVERED.
// Body (optional): { status } - must be the next step in the flow.
export const advanceOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "Invalid order ID" });
    }

    const order = await Order.findOne({ _id: id, user: req.user._id });
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    if (order.paymentStatus !== "PAID") {
      return res.status(400).json({ success: false, message: "Only paid orders can be progressed" });
    }

    const currentIndex = FULFILMENT_FLOW.indexOf(order.status);
    const nextStatus = FULFILMENT_FLOW[currentIndex + 1];
    if (!nextStatus) {
      return res.status(400).json({ success: false, message: "Order is already delivered" });
    }

    const requested = req.body?.status;
    if (requested !== undefined) {
      if (!ORDER_STATUSES.includes(requested) || requested !== nextStatus) {
        return res.status(400).json({
          success: false,
          message: `Invalid transition. ${order.status} can only move to ${nextStatus}`,
        });
      }
    }

    order.status = nextStatus;
    await order.save();

    return res.status(200).json({ success: true, message: `Order is now ${nextStatus}`, order });
  } catch (error) {
    console.error("advanceOrderStatus:", error);
    return res.status(500).json({ success: false, message: "Unable to update order status" });
  }
};

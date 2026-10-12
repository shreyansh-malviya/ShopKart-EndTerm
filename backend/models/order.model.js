import mongoose from "mongoose";

export const ORDER_STATUSES = ["PENDING_PAYMENT", "PLACED", "CONFIRMED", "SHIPPED", "DELIVERED"];
export const PAYMENT_STATUSES = ["PENDING", "PAID", "FAILED"];

// Each order item is a SNAPSHOT of the product at purchase time.
// If the product's price or name changes later, old orders stay accurate.
const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    image: { type: String },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    items: {
      type: [orderItemSchema],
      validate: {
        validator: (items) => items.length > 0,
        message: "Order must contain at least one item",
      },
    },
    shippingAddress: {
      fullName: { type: String, required: true },
      phone: { type: String, required: true },
      addressLine1: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String, required: true },
    },
    // Always calculated on the server from the latest Product prices
    totalAmount: { type: Number, required: true },
    paymentStatus: {
      type: String,
      enum: PAYMENT_STATUSES,
      default: "PENDING",
    },
    status: {
      type: String,
      enum: ORDER_STATUSES,
      default: "PENDING_PAYMENT",
    },
    razorpayOrderId: { type: String, index: true },
    razorpayPaymentId: String,
    paidAt: Date,
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);

export default Order;

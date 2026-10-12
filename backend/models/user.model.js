import mongoose from "mongoose";

// One row in the cart: a reference to the Product plus how many units.
// Price/name are NOT copied here - the Product collection stays the source of truth.
const cartItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    quantity: {
      type: Number,
      default: 1,
      min: [1, "Quantity cannot be less than 1"],
    },
  },
  { _id: false }
);

// The ShopKart "Customer". Registered as the "User" model so that
// Order.user can reference it with ref: "User".
const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    // Always a bcrypt hash, never the plain password.
    // select: false keeps it out of every query unless explicitly requested.
    password: {
      type: String,
      required: [true, "Password is required"],
      select: false,
    },
    phone: {
      type: String,
      required: [true, "Phone is required"],
      trim: true,
    },
    // Lab 04: wishlist holds only Product ObjectIds (referencing, not embedding)
    wishlist: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
      default: [],
    },
    // Lab 05: cart holds a Product reference + quantity
    cart: {
      type: [cartItemSchema],
      default: [],
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;

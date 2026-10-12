import User from "../models/user.model.js";
import Product from "../models/product.model.js";
import { isValidObjectId } from "../utils/validators.js";

const CART_PRODUCT_FIELDS = "name price category image stock";

// Loads the user's cart with each item's latest Product data.
// Items whose product was deleted from the catalogue come back as null and are skipped.
const loadPopulatedCart = async (userId) => {
  const user = await User.findById(userId)
    .select("cart")
    .populate({ path: "cart.product", select: CART_PRODUCT_FIELDS })
    .lean();

  return (user?.cart ?? []).filter((item) => item.product);
};

const findCartItem = (user, productId) =>
  user.cart.find((item) => item.product.toString() === productId);

// POST /cart/:productId - add 1 unit (or increase quantity if already in the cart)
export const addToCart = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!isValidObjectId(productId)) {
      return res.status(400).json({ success: false, message: "Invalid product ID" });
    }

    const product = await Product.findById(productId).select("name stock").lean();
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    const user = req.user;
    const existing = findCartItem(user, productId);
    const newQuantity = (existing?.quantity ?? 0) + 1;

    // Business rule: requested quantity can never exceed the latest stock
    if (newQuantity > product.stock) {
      const message =
        product.stock === 0
          ? `${product.name} is out of stock`
          : `Only ${product.stock} unit(s) of ${product.name} available`;
      return res.status(400).json({ success: false, message });
    }

    if (existing) {
      existing.quantity = newQuantity;
    } else {
      user.cart.push({ product: productId, quantity: 1 });
    }
    await user.save();

    const cart = await loadPopulatedCart(user._id);
    return res.status(200).json({ success: true, message: "Cart updated", cart });
  } catch (error) {
    console.error("addToCart:", error);
    return res.status(500).json({ success: false, message: "Unable to add to cart" });
  }
};

// GET /cart
export const getCart = async (req, res) => {
  try {
    const cart = await loadPopulatedCart(req.user._id);
    return res.status(200).json({ success: true, cart });
  } catch (error) {
    console.error("getCart:", error);
    return res.status(500).json({ success: false, message: "Unable to load cart" });
  }
};

// PATCH /cart/:productId  body: { quantity }
export const updateCartQuantity = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body ?? {};

    if (!isValidObjectId(productId)) {
      return res.status(400).json({ success: false, message: "Invalid product ID" });
    }

    if (typeof quantity !== "number" || !Number.isInteger(quantity)) {
      return res.status(400).json({ success: false, message: "Quantity must be a whole number" });
    }

    if (quantity < 1) {
      return res.status(400).json({ success: false, message: "Quantity must be at least 1" });
    }

    const product = await Product.findById(productId).select("name stock").lean();
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    const user = req.user;
    const item = findCartItem(user, productId);
    if (!item) {
      return res.status(404).json({ success: false, message: "Product is not in your cart" });
    }

    if (quantity > product.stock) {
      return res.status(400).json({
        success: false,
        message: `Only ${product.stock} unit(s) of ${product.name} available`,
      });
    }

    item.quantity = quantity;
    await user.save();

    const cart = await loadPopulatedCart(user._id);
    return res.status(200).json({ success: true, message: "Cart updated", cart });
  } catch (error) {
    console.error("updateCartQuantity:", error);
    return res.status(500).json({ success: false, message: "Unable to update quantity" });
  }
};

// DELETE /cart/:productId
export const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!isValidObjectId(productId)) {
      return res.status(400).json({ success: false, message: "Invalid product ID" });
    }

    const result = await User.updateOne(
      { _id: req.user._id, "cart.product": productId },
      { $pull: { cart: { product: productId } } }
    );

    if (result.modifiedCount === 0) {
      return res.status(404).json({ success: false, message: "Product is not in your cart" });
    }

    const cart = await loadPopulatedCart(req.user._id);
    return res.status(200).json({ success: true, message: "Product removed from cart", cart });
  } catch (error) {
    console.error("removeFromCart:", error);
    return res.status(500).json({ success: false, message: "Unable to remove product" });
  }
};

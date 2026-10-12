import User from "../models/user.model.js";
import Product from "../models/product.model.js";
import { isValidObjectId } from "../utils/validators.js";

const WISHLIST_FIELDS = "name price category image stock";

// The user always comes from the auth middleware (req.user), never from the request body.

// POST /wishlist/:productId
export const addToWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!isValidObjectId(productId)) {
      return res.status(400).json({ success: false, message: "Invalid product ID" });
    }

    const productExists = await Product.exists({ _id: productId });
    if (!productExists) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    // Atomic add-if-missing: the filter only matches when the product is NOT already saved,
    // so two fast clicks can never create a duplicate entry.
    const result = await User.updateOne(
      { _id: req.user._id, wishlist: { $ne: productId } },
      { $push: { wishlist: productId } }
    );

    if (result.modifiedCount === 0) {
      return res.status(409).json({ success: false, message: "Product is already in your wishlist" });
    }

    return res.status(201).json({ success: true, message: "Product added to wishlist" });
  } catch (error) {
    console.error("addToWishlist:", error);
    return res.status(500).json({ success: false, message: "Unable to save product" });
  }
};

// GET /wishlist
export const getWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select("wishlist")
      .populate({ path: "wishlist", select: WISHLIST_FIELDS })
      .lean();

    // populate() returns null for products that were deleted after being saved
    const wishlist = (user?.wishlist ?? []).filter(Boolean);

    return res.status(200).json({ success: true, count: wishlist.length, wishlist });
  } catch (error) {
    console.error("getWishlist:", error);
    return res.status(500).json({ success: false, message: "Unable to load wishlist" });
  }
};

// DELETE /wishlist/:productId
export const removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!isValidObjectId(productId)) {
      return res.status(400).json({ success: false, message: "Invalid product ID" });
    }

    const result = await User.updateOne(
      { _id: req.user._id, wishlist: productId },
      { $pull: { wishlist: productId } }
    );

    if (result.modifiedCount === 0) {
      return res.status(404).json({ success: false, message: "Product is not in your wishlist" });
    }

    return res.status(200).json({ success: true, message: "Product removed from wishlist" });
  } catch (error) {
    console.error("removeFromWishlist:", error);
    return res.status(500).json({ success: false, message: "Unable to remove product" });
  }
};

// PATCH /wishlist/:productId/toggle - Lab 04 bonus
export const toggleWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!isValidObjectId(productId)) {
      return res.status(400).json({ success: false, message: "Invalid product ID" });
    }

    // Try removing first; if nothing was removed, the product was not saved yet, so add it.
    const removed = await User.updateOne(
      { _id: req.user._id, wishlist: productId },
      { $pull: { wishlist: productId } }
    );

    if (removed.modifiedCount === 1) {
      return res.status(200).json({ success: true, saved: false, message: "Product removed from wishlist" });
    }

    const productExists = await Product.exists({ _id: productId });
    if (!productExists) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    await User.updateOne({ _id: req.user._id }, { $addToSet: { wishlist: productId } });

    return res.status(200).json({ success: true, saved: true, message: "Product added to wishlist" });
  } catch (error) {
    console.error("toggleWishlist:", error);
    return res.status(500).json({ success: false, message: "Unable to update wishlist" });
  }
};

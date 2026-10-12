import mongoose from "mongoose";
import Product from "../models/product.model.js";
import { escapeRegex, isValidObjectId, validationMessage } from "../utils/validators.js";

// Fields the listing UI needs (description is only needed on the details page)
const LIST_FIELDS = "name price category image stock createdAt";

const SORT_OPTIONS = {
  price_asc: { price: 1, _id: 1 },
  price_desc: { price: -1, _id: 1 },
  newest: { createdAt: -1, _id: 1 },
};

// POST /products
export const createProduct = async (req, res) => {
  try {
    const { name, description, price, category, image, stock } = req.body ?? {};

    const missing = Object.entries({ name, description, price, category, image, stock })
      .filter(([, value]) => value === undefined || value === null || String(value).trim() === "")
      .map(([key]) => key);

    if (missing.length) {
      return res.status(400).json({ success: false, message: `Missing required field(s): ${missing.join(", ")}` });
    }

    const numericPrice = Number(price);
    if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
      return res.status(400).json({ success: false, message: "Price must be a number greater than 0" });
    }

    const numericStock = Number(stock);
    if (!Number.isInteger(numericStock) || numericStock < 0) {
      return res.status(400).json({ success: false, message: "Stock must be a whole number of 0 or more" });
    }

    const product = await Product.create({
      name,
      description,
      price: numericPrice,
      category,
      image,
      stock: numericStock,
    });

    return res.status(201).json({ success: true, message: "Product created", product });
  } catch (error) {
    if (error instanceof mongoose.Error.ValidationError) {
      return res.status(400).json({ success: false, message: validationMessage(error) });
    }
    console.error("createProduct:", error);
    return res.status(500).json({ success: false, message: "Unable to create product" });
  }
};

// GET /products?search=&category=&sort=
// One endpoint, query built dynamically from whichever filters are present.
export const getProducts = async (req, res) => {
  try {
    const { search, category, sort } = req.query;
    const filter = {};

    if (typeof search === "string" && search.trim()) {
      // Case-insensitive "contains" match on the product name
      filter.name = { $regex: escapeRegex(search.trim()), $options: "i" };
    }

    if (typeof category === "string" && category.trim() && category !== "All") {
      // Exact category match, ignoring case ("electronics" == "Electronics")
      filter.category = { $regex: `^${escapeRegex(category.trim())}$`, $options: "i" };
    }

    const sortBy = SORT_OPTIONS[sort] ?? SORT_OPTIONS.newest;

    const products = await Product.find(filter).select(LIST_FIELDS).sort(sortBy).lean();

    return res.status(200).json({ success: true, count: products.length, products });
  } catch (error) {
    console.error("getProducts:", error);
    return res.status(500).json({ success: false, message: "Unable to load products" });
  }
};

// GET /products/categories - distinct categories for the filter dropdown
export const getCategories = async (req, res) => {
  try {
    const categories = (await Product.distinct("category")).sort();
    return res.status(200).json({ success: true, categories });
  } catch (error) {
    console.error("getCategories:", error);
    return res.status(500).json({ success: false, message: "Unable to load categories" });
  }
};

// GET /products/:id
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "Invalid product ID" });
    }

    const product = await Product.findById(id).lean();
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    return res.status(200).json({ success: true, product });
  } catch (error) {
    console.error("getProductById:", error);
    return res.status(500).json({ success: false, message: "Unable to load product" });
  }
};

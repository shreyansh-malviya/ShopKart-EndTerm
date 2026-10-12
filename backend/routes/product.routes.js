import express from "express";
import {
  createProduct,
  getProducts,
  getCategories,
  getProductById,
} from "../controllers/product.controller.js";

const router = express.Router();

// Product creation is intentionally open for now (admin auth comes in a later lab)
router.post("/", createProduct);
router.get("/", getProducts);
// Must be declared before "/:id" so "categories" is not treated as an id
router.get("/categories", getCategories);
router.get("/:id", getProductById);

export default router;

import { Router } from "express";
import {
  addProduct,
  getAllProduct,
  getDeleteProduct,
  getDraftProduct,
  getFeaturedProduct,
  getProductBySku,
  getProductDetails,
  getTopSellingProduct,
  primaryProductDelete,
} from "../controllers/product.controller";

const router = Router();

router.post("/", addProduct);
router.get("/", getAllProduct);
router.get("/", getProductBySku);
router.get("/featured", getFeaturedProduct);
router.get("/draft", getDraftProduct);
router.get("/delete-product", getDeleteProduct);
router.get("/get-top-selling-product", getTopSellingProduct);
router.patch("/primary-delete/:id", primaryProductDelete);

router.get("/:slug", getProductDetails);

export default router;

import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import isAdmin from "../middleware/isAdmin.js";
import {
  getCategories,
  getArchivedCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  archiveCategory,
  restoreCategory,
} from "../controllers/categoryController.js";

const router = express.Router();

// Public
router.get("/", getCategories);

// Admin only — must come before "/:id" or "archived" would be treated
// as an :id param and match the wrong route.
router.get("/archived", authMiddleware, isAdmin, getArchivedCategories);

router.get("/:id", getCategoryById);

// Admin only
router.post("/", authMiddleware, isAdmin, createCategory);
router.put("/:id", authMiddleware, isAdmin, updateCategory);
router.delete("/:id", authMiddleware, isAdmin, archiveCategory);
router.patch("/:id/restore", authMiddleware, isAdmin, restoreCategory);

export default router;
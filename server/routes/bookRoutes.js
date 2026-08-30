import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import isAdmin from "../middleware/isAdmin.js";
import {
  getBooks,
  getArchivedBooks,
  getBookById,
  createBook,
  updateBook,
  archiveBook,
  restoreBook,
} from "../controllers/bookController.js";

const router = express.Router();

// Public
router.get("/", getBooks);

// Admin only — must come before "/:id" for the same reason as categories.
router.get("/archived", authMiddleware, isAdmin, getArchivedBooks);

router.get("/:id", getBookById);

// Admin only
router.post("/", authMiddleware, isAdmin, createBook);
router.put("/:id", authMiddleware, isAdmin, updateBook);
router.delete("/:id", authMiddleware, isAdmin, archiveBook);
router.patch("/:id/restore", authMiddleware, isAdmin, restoreBook);

export default router;
import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { createReview, getBookReviews } from "../controllers/reviewController.js";

// mergeParams: true is required here — this router gets mounted at
// "/:id/reviews" inside bookRoutes.js, and without mergeParams it
// wouldn't see the parent route's :id param.
const router = express.Router({ mergeParams: true });

router.get("/", getBookReviews);
router.post("/", authMiddleware, createReview);

export default router;
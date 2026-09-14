import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import isAdmin from "../middleware/isAdmin.js";
import {
  createPaymentIntent,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
} from "../controllers/orderController.js";

const router = express.Router();

// All of these require login — this is the actual checkout gate we
// designed: guests can cart, but checkout requires an account.
router.post("/create-payment-intent", authMiddleware, createPaymentIntent);
router.get("/", authMiddleware, getMyOrders);

// Admin routes — must come BEFORE "/:id" or "admin" would be matched as
// an :id value and hit the wrong handler (same issue we fixed on
// Book/Category's "/archived" routes).
router.get("/admin", authMiddleware, isAdmin, getAllOrders);
router.patch("/admin/:id/status", authMiddleware, isAdmin, updateOrderStatus);

router.get("/:id", authMiddleware, getOrderById);

// NOTE: the webhook route (POST /api/orders/webhook) is intentionally NOT
// here — it's mounted directly on the app in server.js, before the global
// express.json() middleware, because it needs the raw request body for
// Stripe signature verification.

export default router;

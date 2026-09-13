import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { createPaymentIntent, getMyOrders, getOrderById } from "../controllers/orderController.js";

const router = express.Router();

// All of these require login — this is the actual checkout gate we
// designed: guests can cart, but checkout requires an account.
router.post("/create-payment-intent", authMiddleware, createPaymentIntent);
router.get("/", authMiddleware, getMyOrders);
router.get("/:id", authMiddleware, getOrderById);

// NOTE: the webhook route (POST /api/orders/webhook) is intentionally NOT
// here — it's mounted directly on the app in server.js, before the global
// express.json() middleware, because it needs the raw request body for
// Stripe signature verification.

export default router;

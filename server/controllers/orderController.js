import Stripe from "stripe";
import Order from "../models/Order.js";
import Cart from "../models/Cart.js";
import Book from "../models/Book.js";

// Lazily constructed instead of at module top-level. ES module imports are
// resolved and evaluated BEFORE server.js's own dotenv.config() call runs,
// so a top-level `new Stripe(process.env.STRIPE_SECRET_KEY)` here would
// fire before STRIPE_SECRET_KEY is even loaded into process.env — this
// defers construction until the first request actually needs it.
let _stripe;
function getStripe() {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  }
  return _stripe;
}

// POST /api/orders/create-payment-intent
// Protected (requires login — this is the actual checkout gate).
// body: { shippingAddress }
export const createPaymentIntent = async (req, res) => {
  try {
    const { shippingAddress } = req.body;

    if (
      !shippingAddress ||
      !shippingAddress.fullName ||
      !shippingAddress.line1 ||
      !shippingAddress.city ||
      !shippingAddress.postalCode ||
      !shippingAddress.country
    ) {
      return res.status(400).json({ message: "A complete shipping address is required" });
    }

    const cart = await Cart.findOne({ user: req.user.userId }).populate(
      "items.book",
      "title price stock isActive"
    );

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Your cart is empty" });
    }

    // Final server-side re-validation against LIVE stock, right before any
    // money moves — this is the checkout-time re-check we designed early
    // on. Nothing is charged if anything here is stale.
    const issues = [];
    let subtotal = 0;
    const orderItems = [];

    for (const item of cart.items) {
      const book = item.book;
      if (!book || !book.isActive) {
        issues.push(`"${book?.title || "An item"}" is no longer available`);
        continue;
      }
      if (item.quantity > book.stock) {
        issues.push(`Only ${book.stock} left of "${book.title}"`);
        continue;
      }
      subtotal += book.price * item.quantity;
      orderItems.push({
        book: book._id,
        title: book.title,
        quantity: item.quantity,
        price: book.price,
      });
    }

    if (issues.length > 0) {
      return res.status(409).json({
        message: "Some items in your cart need attention before checkout",
        issues,
      });
    }

    // Order is created as "pending" BEFORE the PaymentIntent — its id goes
    // into the PaymentIntent's metadata so the webhook can find and
    // finalize it once payment actually succeeds.
    const order = await Order.create({
      user: req.user.userId,
      items: orderItems,
      subtotal,
      shippingAddress,
      status: "pending",
    });

    const paymentIntent = await getStripe().paymentIntents.create({
      amount: Math.round(subtotal * 100), // Stripe expects the smallest currency unit (cents)
      currency: "usd",
      metadata: { orderId: order._id.toString() },
    });

    order.stripePaymentIntentId = paymentIntent.id;
    await order.save();

    res.status(201).json({ clientSecret: paymentIntent.client_secret, orderId: order._id });
  } catch (error) {
    console.error("createPaymentIntent error:", error.name, error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// POST /api/orders/webhook
// NOT behind authMiddleware — Stripe calls this directly, verified via
// signature instead of a session. Requires the RAW request body (see the
// express.raw() wiring in server.js) — express.json() would break signature
// verification for this route specifically.
export const handleStripeWebhook = async (req, res) => {
  const signature = req.headers["stripe-signature"];
  let event;

  try {
    event = getStripe().webhooks.constructEvent(req.body, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (error) {
    console.error("Webhook signature verification failed:", error.message);
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }

  if (event.type === "payment_intent.succeeded") {
    await finalizeOrderFromPaymentIntent(event.data.object);
  }

  if (event.type === "payment_intent.payment_failed") {
    const orderId = event.data.object.metadata?.orderId;
    if (orderId) {
      await Order.findByIdAndUpdate(orderId, { status: "failed" }).catch((error) =>
        console.error("Error marking order failed:", error.name)
      );
    }
  }

  // Always 200 once we've handled (or deliberately ignored) the event —
  // a non-2xx tells Stripe to retry, which is only useful for OUR errors,
  // not for event types we don't care about.
  res.json({ received: true });
};

async function finalizeOrderFromPaymentIntent(paymentIntent) {
  const orderId = paymentIntent.metadata?.orderId;
  if (!orderId) return;

  try {
    const order = await Order.findById(orderId);

    // Idempotency guard: Stripe can and does redeliver webhooks. If this
    // order isn't "pending" anymore, it's already been finalized by an
    // earlier delivery of this same event — skip re-processing entirely,
    // since running the stock decrement twice would be a real bug.
    if (!order || order.status !== "pending") {
      return;
    }

    const stockIssues = [];
    for (const item of order.items) {
      // Atomic conditional decrement — the actual guard against
      // overselling (not a read-then-write). Only succeeds if stock is
      // still >= quantity at this exact moment.
      const updated = await Book.findOneAndUpdate(
        { _id: item.book, stock: { $gte: item.quantity } },
        { $inc: { stock: -item.quantity } },
        { new: true }
      );

      if (!updated) {
        // Sold out in the gap between checkout and payment confirmation.
        // Deliberately not reversing the payment here — this is the
        // manual-review edge case we chose to accept instead of building
        // a stock-reservation system.
        stockIssues.push({
          book: item.book,
          requested: item.quantity,
          message: "Sold out between checkout and payment confirmation",
        });
      }
    }

    order.status = "paid";
    order.stockIssues = stockIssues;
    await order.save();

    // Cart's job is done now that the order exists — clear it.
    await Cart.deleteOne({ user: order.user });
  } catch (error) {
    console.error("Error finalizing order after payment:", error.name);
    // Not rethrowing: a thrown error here would make the webhook handler
    // return non-2xx, and Stripe would retry — but retrying a failure
    // that happens AFTER payment already succeeded risks double-processing
    // more than it helps. This needs manual reconciliation if it happens.
  }
}

// GET /api/orders
// Protected. Current user's order history.
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.userId }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error("getMyOrders error:", error.name);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/orders/:id
// Protected. Scoped to req.user.userId so one customer can't fetch
// another's order by guessing an id.
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user.userId });
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.json(order);
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid order id" });
    }
    console.error("getOrderById error:", error.name);
    res.status(500).json({ message: "Server error" });
  }
};
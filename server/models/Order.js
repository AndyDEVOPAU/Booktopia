import mongoose, { Schema } from "mongoose";

// Snapshotting title/price here on purpose: if a book's price changes or it
// gets archived after this order was placed, the order should still show
// what was actually charged and bought, not today's (possibly different) data.
const orderItemSchema = new Schema(
  {
    book: { type: Schema.Types.ObjectId, ref: "Book", required: true },
    title: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true }, // price at time of purchase
  },
  { _id: false }
);

const shippingAddressSchema = new Schema(
  {
    fullName: { type: String, required: true },
    line1: { type: String, required: true },
    line2: { type: String, default: "" },
    city: { type: String, required: true },
    state: { type: String, default: "" },
    postalCode: { type: String, required: true },
    country: { type: String, required: true },
    phone: { type: String, default: "" },
  },
  { _id: false }
);

const orderSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    items: [orderItemSchema],
    subtotal: { type: Number, required: true },
    shippingAddress: { type: shippingAddressSchema, required: true },

    // "pending" = created, awaiting payment. "paid" = webhook confirmed
    // payment and decremented stock. "failed" = payment declined/failed.
    status: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },

    stripePaymentIntentId: { type: String },

    // Populated only in the rare case where an item's atomic stock
    // decrement failed AFTER payment succeeded (sold out in the gap
    // between checkout and payment confirmation). This is the edge case
    // we deliberately chose not to prevent (no stock reservation system)
    // — it needs manual review/refund rather than automatic handling.
    stockIssues: [
      {
        book: { type: Schema.Types.ObjectId, ref: "Book" },
        requested: Number,
        message: String,
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);

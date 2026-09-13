import mongoose, { Schema } from "mongoose";

const cartItemSchema = new Schema(
  {
    book: { type: Schema.Types.ObjectId, ref: "Book", required: true },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const cartSchema = new Schema(
  {
    // Exactly one of these is set per cart: a logged-in user's cart has
    // `user` and no `sessionId`; a guest's cart has `sessionId` (from an
    // anonymous cookie, see attachCartOwner middleware) and no `user`.
    user: { type: Schema.Types.ObjectId, ref: "User", default: null },
    sessionId: { type: String, default: null },
    items: [cartItemSchema],
  },
  { timestamps: true }
);

// Partial unique indexes: only enforce uniqueness among documents where
// the field actually exists, so a null `sessionId` on every user-owned
// cart doesn't collide with a null `sessionId` on another user-owned cart.
cartSchema.index(
  { user: 1 },
  { unique: true, partialFilterExpression: { user: { $type: "objectId" } } }
);
cartSchema.index(
  { sessionId: 1 },
  { unique: true, partialFilterExpression: { sessionId: { $type: "string" } } }
);

export default mongoose.model("Cart", cartSchema);
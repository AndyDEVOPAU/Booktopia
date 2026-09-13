import Cart from "../models/Cart.js";
import Book from "../models/Book.js";

// Builds the { user } or { sessionId } filter for the current request,
// based on what attachCartOwner set.
function ownerFilter(req) {
  return req.user ? { user: req.user.userId } : { sessionId: req.guestCartId };
}

async function findOrCreateCart(req) {
  const filter = ownerFilter(req);
  let cart = await Cart.findOne(filter);
  if (!cart) {
    cart = await Cart.create({ ...filter, items: [] });
  }
  return cart;
}

// Shapes the response consistently: populates book details and computes
// a server-side subtotal so the frontend never has to re-derive pricing
// itself. Also flags items whose live stock can no longer cover the
// quantity in the cart (book was archived, or stock dropped since it was
// added) — the frontend cart page will need this for Milestone 3 Day 10.
async function serializeCart(cart) {
  await cart.populate("items.book", "title author price coverImage stock isActive");

  let subtotal = 0;
  const items = cart.items.map((item) => {
    const book = item.book;
    const isValid = book && book.isActive;
    const lineTotal = isValid ? book.price * item.quantity : 0;
    if (isValid) subtotal += lineTotal;

    return {
      book,
      quantity: item.quantity,
      lineTotal,
      exceedsStock: isValid ? item.quantity > book.stock : false,
      unavailable: !isValid,
    };
  });

  return { _id: cart._id, items, subtotal };
}

// GET /api/cart
export const getCart = async (req, res) => {
  try {
    const cart = await findOrCreateCart(req);
    res.json(await serializeCart(cart));
  } catch (error) {
    console.error("getCart error:", error.name);
    res.status(500).json({ message: "Server error" });
  }
};

// POST /api/cart/items
// body: { bookId, quantity = 1 }
export const addItem = async (req, res) => {
  try {
    const { bookId, quantity = 1 } = req.body;

    if (!bookId || quantity < 1) {
      return res.status(400).json({ message: "bookId and a quantity of at least 1 are required" });
    }

    const book = await Book.findById(bookId);
    if (!book || !book.isActive) {
      return res.status(404).json({ message: "Book not found" });
    }

    const cart = await findOrCreateCart(req);
    const existing = cart.items.find((item) => item.book.toString() === bookId);
    const newQuantity = (existing?.quantity || 0) + quantity;

    if (newQuantity > book.stock) {
      return res.status(409).json({
        message: `Only ${book.stock} in stock — you already have ${existing?.quantity || 0} in your cart`,
      });
    }

    if (existing) {
      existing.quantity = newQuantity;
    } else {
      cart.items.push({ book: bookId, quantity });
    }

    await cart.save();
    res.status(201).json(await serializeCart(cart));
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid bookId" });
    }
    console.error("addItem error:", error.name);
    res.status(500).json({ message: "Server error" });
  }
};

// PUT /api/cart/items/:bookId
// body: { quantity }
export const updateItem = async (req, res) => {
  try {
    const { bookId } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      return res.status(400).json({ message: "Quantity must be at least 1 — use DELETE to remove an item" });
    }

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    if (quantity > book.stock) {
      return res.status(409).json({ message: `Only ${book.stock} in stock` });
    }

    const cart = await findOrCreateCart(req);
    const item = cart.items.find((i) => i.book.toString() === bookId);
    if (!item) {
      return res.status(404).json({ message: "That item isn't in your cart" });
    }

    item.quantity = quantity;
    await cart.save();
    res.json(await serializeCart(cart));
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid bookId" });
    }
    console.error("updateItem error:", error.name);
    res.status(500).json({ message: "Server error" });
  }
};

// DELETE /api/cart/items/:bookId
export const removeItem = async (req, res) => {
  try {
    const { bookId } = req.params;
    const cart = await findOrCreateCart(req);

    cart.items = cart.items.filter((item) => item.book.toString() !== bookId);

    await cart.save();
    res.json(await serializeCart(cart));
  } catch (error) {
    console.error("removeItem error:", error.name);
    res.status(500).json({ message: "Server error" });
  }
};

// Called from authController on login/register — NOT a route handler.
// Folds a guest's anonymous cart into their now-identified user cart,
// capping merged quantities at live stock so a merge can never leave
// the cart holding more than what's actually available. Safe to call
// even if no guest cart exists (no-op).
export async function mergeGuestCartIntoUserCart(guestSessionId, userId) {
  if (!guestSessionId) return;

  const guestCart = await Cart.findOne({ sessionId: guestSessionId });
  if (!guestCart || guestCart.items.length === 0) {
    if (guestCart) await guestCart.deleteOne();
    return;
  }

  let userCart = await Cart.findOne({ user: userId });
  if (!userCart) {
    userCart = await Cart.create({ user: userId, items: [] });
  }

  for (const guestItem of guestCart.items) {
    const book = await Book.findById(guestItem.book);
    if (!book || !book.isActive) continue; // dropped silently — book no longer sellable

    const existing = userCart.items.find(
      (item) => item.book.toString() === guestItem.book.toString()
    );
    const combinedQuantity = (existing?.quantity || 0) + guestItem.quantity;
    const cappedQuantity = Math.min(combinedQuantity, book.stock);

    if (cappedQuantity < 1) continue; // out of stock entirely — drop it

    if (existing) {
      existing.quantity = cappedQuantity;
    } else {
      userCart.items.push({ book: guestItem.book, quantity: cappedQuantity });
    }
  }

  await userCart.save();
  await guestCart.deleteOne();
}
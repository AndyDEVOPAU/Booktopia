const CART_KEY = "bookstore_cart";

// Cart shape in localStorage: an array of { bookId, quantity, addedAt }.
// Deliberately NOT storing price/title/stock snapshots here — those can
// go stale (price changes, book gets archived). Anything that reads the
// cart should re-fetch live book data by bookId when it needs to display
// or validate it (e.g. at the checkout-page re-check we designed earlier).

export function getCart() {
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error("Failed to read cart from localStorage:", err);
    return [];
  }
}

function saveCart(cart) {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  } catch (err) {
    console.error("Failed to save cart to localStorage:", err);
  }
}

// Adds `quantity` of a book to the cart, or increments if it's already
// in there. Does NOT check stock here — that's the caller's job (the
// detail page checks against the book's live stock before calling this).
export function addToCart(bookId, quantity = 1) {
  const cart = getCart();
  const existing = cart.find((item) => item.bookId === bookId);

  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.push({ bookId, quantity, addedAt: new Date().toISOString() });
  }

  saveCart(cart);
  return cart;
}

export function updateQuantity(bookId, quantity) {
  const cart = getCart().map((item) =>
    item.bookId === bookId ? { ...item, quantity } : item
  );
  saveCart(cart);
  return cart;
}

export function removeFromCart(bookId) {
  const cart = getCart().filter((item) => item.bookId !== bookId);
  saveCart(cart);
  return cart;
}

export function clearCart() {
  saveCart([]);
}

export function getCartCount() {
  return getCart().reduce((sum, item) => sum + item.quantity, 0);
}

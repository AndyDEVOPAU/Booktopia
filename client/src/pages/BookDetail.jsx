import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { addToCart, getCart } from "../utils/cartStorage";
import api from "../api/axios";

const LOW_STOCK_THRESHOLD = 5;

export default function BookDetail() {
  const { id } = useParams();

  const [book, setBook] = useState(null);
  const [status, setStatus] = useState("loading"); // 'loading' | 'success' | 'error' | 'not-found'
  const [quantity, setQuantity] = useState(1);
  const [addState, setAddState] = useState("idle"); // 'idle' | 'added'

  useEffect(() => {
    setStatus("loading");
    setQuantity(1);
    setAddState("idle");

    let cancelled = false;

    api
      .get(`/books/${id}`)
      .then(({ data }) => {
        if (cancelled) return;
        setBook(data);
        setStatus("success");
      })
      .catch((err) => {
        if (cancelled) return;
        if (err.response?.status === 404) {
          setStatus("not-found");
        } else {
          console.error("Failed to load book:", err);
          setStatus("error");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  const isOutOfStock = book?.stock === 0;
  const isLowStock = book && !isOutOfStock && book.stock <= LOW_STOCK_THRESHOLD;

  // How many of this book are already sitting in the cart, so we can cap
  // the quantity selector at what's actually left — the "hard cap" option
  // we discussed but hadn't committed to. Doing it here since it's cheap
  // and prevents an easily-avoidable trip to the checkout-page error state.
  const alreadyInCart = book
    ? getCart().find((item) => item.bookId === book._id)?.quantity || 0
    : 0;
  const maxSelectable = book ? Math.max(0, book.stock - alreadyInCart) : 0;

  const handleAddToCart = () => {
    if (!book || quantity < 1 || quantity > maxSelectable) return;
    addToCart(book._id, quantity);
    setAddState("added");
    setTimeout(() => setAddState("idle"), 2000);
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-background px-4 py-10 text-text sm:px-8">
        <div className="mx-auto grid max-w-4xl animate-pulse grid-cols-1 gap-8 sm:grid-cols-[280px_1fr]">
          <div className="aspect-[2/3] w-full rounded-md bg-text/10" />
          <div className="flex flex-col gap-3">
            <div className="h-3 w-24 rounded bg-text/10" />
            <div className="h-8 w-3/4 rounded bg-text/10" />
            <div className="h-4 w-1/2 rounded bg-text/10" />
            <div className="h-24 w-full rounded bg-text/10" />
            <div className="h-10 w-32 rounded bg-text/10" />
          </div>
        </div>
      </div>
    );
  }

  if (status === "not-found") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-background px-4 text-center text-text">
        <p className="text-lg font-medium">This book isn't on the shelf.</p>
        <p className="max-w-sm text-sm text-text/70">
          It may have been removed or the link is out of date.
        </p>
        <Link
          to="/books"
          className="mt-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-background hover:bg-secondary"
        >
          Back to catalog
        </Link>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-background px-4 text-center text-text">
        <p className="text-lg font-medium">This book didn't load.</p>
        <p className="max-w-sm text-sm text-text/70">
          Check your connection and try again.
        </p>
        <Link
          to="/books"
          className="mt-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-background hover:bg-secondary"
        >
          Back to catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-4 py-10 text-text sm:px-8">
      <div className="mx-auto max-w-4xl">
        <Link to="/books" className="mb-6 inline-block text-sm text-text/60 hover:text-text">
          ← Back to catalog
        </Link>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-[280px_1fr]">
          {/* Cover */}
          <div className="relative aspect-[2/3] w-full overflow-hidden rounded-md bg-primary/10">
            {book.coverImage ? (
              <img
                src={book.coverImage}
                alt={`Cover of ${book.title}`}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center px-4 text-center">
                <span className="font-medium text-text/50">{book.title}</span>
              </div>
            )}

            {isOutOfStock && (
              <span className="absolute left-3 top-3 rounded-sm bg-text/85 px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide text-background">
                Out of stock
              </span>
            )}
            {isLowStock && (
              <span className="absolute left-3 top-3 rounded-sm bg-accent px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide text-background">
                Only {book.stock} left
              </span>
            )}
          </div>

          {/* Details */}
          <div className="flex flex-col gap-3">
            <p className="text-[11px] uppercase tracking-wide text-text/50">
              {book.category?.name || "Uncategorized"}
            </p>
            <h1 className="text-3xl font-semibold leading-tight text-text">{book.title}</h1>
            <p className="text-base text-text/70">by {book.author}</p>

            <p className="font-mono text-2xl font-medium text-text">
              ${book.price?.toFixed(2)}
            </p>

            {book.description && (
              <p className="max-w-prose text-sm leading-relaxed text-text/80">
                {book.description}
              </p>
            )}

            <div className="mt-2 flex items-center gap-3">
              {!isOutOfStock && maxSelectable > 0 && (
                <select
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="rounded-md border border-text/15 bg-background px-2 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {Array.from({ length: maxSelectable }, (_, i) => i + 1).map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              )}

              <button
                type="button"
                onClick={handleAddToCart}
                disabled={isOutOfStock || maxSelectable === 0}
                className="rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-background transition-colors hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-40"
              >
                {isOutOfStock
                  ? "Out of stock"
                  : addState === "added"
                  ? "Added ✓"
                  : maxSelectable === 0
                  ? "All in cart"
                  : "Add to Cart"}
              </button>
            </div>

            {alreadyInCart > 0 && maxSelectable > 0 && (
              <p className="text-xs text-text/50">
                {alreadyInCart} already in your cart
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
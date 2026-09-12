import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/useCart";

export default function CartPage() {
  const { cart, itemCount, loading, error, updateItem, removeItem, refreshCart } = useCart();
  const [rowError, setRowError] = useState({}); // { [bookId]: message }
  const [pendingId, setPendingId] = useState(null);

  const handleQuantityChange = async (bookId, quantity) => {
    setPendingId(bookId);
    setRowError((prev) => ({ ...prev, [bookId]: "" }));
    try {
      await updateItem(bookId, quantity);
    } catch (err) {
      console.error("Failed to update quantity:", err);
      setRowError((prev) => ({
        ...prev,
        [bookId]: err.response?.data?.message || "Couldn't update that item.",
      }));
    } finally {
      setPendingId(null);
    }
  };

  const handleRemove = async (bookId) => {
    setPendingId(bookId);
    try {
      await removeItem(bookId);
    } catch (err) {
      console.error("Failed to remove item:", err);
      setRowError((prev) => ({
        ...prev,
        [bookId]: err.response?.data?.message || "Couldn't remove that item.",
      }));
    } finally {
      setPendingId(null);
    }
  };

  const hasBlockingIssue = cart.items.some((item) => item.unavailable || item.exceedsStock);

  if (loading && cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-background px-4 py-10 text-text sm:px-8">
        <p className="mx-auto max-w-3xl text-sm text-text/60">Loading your cart...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-background px-4 text-center text-text">
        <p className="text-lg font-medium">Your cart didn't load.</p>
        <p className="max-w-sm text-sm text-text/70">Check your connection and try again.</p>
        <button
          type="button"
          onClick={refreshCart}
          className="mt-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-background hover:bg-secondary"
        >
          Retry
        </button>
      </div>
    );
  }

  if (cart.items.length === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 bg-background px-4 text-center text-text">
        <p className="text-lg font-medium">Your cart is empty.</p>
        <p className="max-w-sm text-sm text-text/70">
          Browse the catalog and add something you'd like to read.
        </p>
        <Link
          to="/books"
          className="mt-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-background hover:bg-secondary"
        >
          Browse Books
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-4 py-10 text-text sm:px-8">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-6 text-2xl font-semibold sm:text-3xl">
          Your Cart
          <span className="ml-2 text-lg font-normal text-text/50">
            ({itemCount} {itemCount === 1 ? "item" : "items"})
          </span>
        </h1>

        <div className="flex flex-col gap-4">
          {cart.items.map((item) => {
            const book = item.book;
            const bookId = book?._id;
            const isPending = pendingId === bookId;

            return (
              <div
                key={bookId || Math.random()}
                className="flex gap-4 rounded-md border border-text/10 bg-primary/5 p-4"
              >
                <div className="h-24 w-16 shrink-0 overflow-hidden rounded-sm bg-primary/10">
                  {book?.coverImage ? (
                    <img
                      src={book.coverImage}
                      alt={`Cover of ${book.title}`}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center px-1 text-center text-[10px] text-text/50">
                      {book?.title || "Unavailable"}
                    </div>
                  )}
                </div>

                <div className="flex flex-1 flex-col gap-1">
                  {book ? (
                    <Link to={`/books/${book._id}`} className="font-medium text-text hover:underline">
                      {book.title}
                    </Link>
                  ) : (
                    <span className="font-medium text-text/50">This book is no longer available</span>
                  )}
                  {book && <p className="text-sm text-text/60">{book.author}</p>}

                  {item.unavailable && (
                    <p className="text-xs text-accent">
                      No longer available — remove it to continue to checkout.
                    </p>
                  )}
                  {!item.unavailable && item.exceedsStock && (
                    <p className="text-xs text-accent">
                      Only {book.stock} left in stock — lower the quantity to continue.
                    </p>
                  )}
                  {rowError[bookId] && (
                    <p className="text-xs text-accent">{rowError[bookId]}</p>
                  )}

                  <div className="mt-2 flex items-center gap-3">
                    {!item.unavailable && (
                      <select
                        value={item.quantity}
                        disabled={isPending}
                        onChange={(e) => handleQuantityChange(bookId, Number(e.target.value))}
                        className="rounded-md border border-text/15 bg-background px-2 py-1 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                      >
                        {Array.from({ length: Math.max(item.quantity, book?.stock || item.quantity) }, (_, i) => i + 1).map(
                          (n) => (
                            <option key={n} value={n}>
                              {n}
                            </option>
                          )
                        )}
                      </select>
                    )}
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => handleRemove(bookId)}
                      className="text-sm text-text/60 hover:underline disabled:opacity-50"
                    >
                      Remove
                    </button>
                  </div>
                </div>

                <div className="whitespace-nowrap font-mono text-sm font-medium text-text">
                  ${item.lineTotal.toFixed(2)}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8 flex flex-col items-end gap-3 border-t border-text/10 pt-6">
          <p className="text-lg font-semibold text-text">
            Subtotal: <span className="font-mono">${cart.subtotal.toFixed(2)}</span>
          </p>

          {hasBlockingIssue && (
            <p className="text-sm text-accent">
              Resolve the items above before checking out.
            </p>
          )}

          <Link
            to="/checkout"
            aria-disabled={hasBlockingIssue}
            onClick={(e) => hasBlockingIssue && e.preventDefault()}
            className={`rounded-md px-5 py-2.5 text-sm font-medium transition-colors ${
              hasBlockingIssue
                ? "cursor-not-allowed bg-text/10 text-text/40"
                : "bg-primary text-background hover:bg-secondary"
            }`}
          >
            Proceed to Checkout
          </Link>
        </div>
      </div>
    </div>
  );
}

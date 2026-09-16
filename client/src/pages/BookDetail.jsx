import React, { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { useCart } from "../context/useCart";
import { useAuth } from "../context/useAuth";
import api from "../api/axios";
import StarRating from "../components/reviews/StarRating";
import ReviewForm from "../components/reviews/ReviewForm";
import ReviewList from "../components/reviews/ReviewList";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001";
const LOW_STOCK_THRESHOLD = 5;

export default function BookDetail() {
  const { id } = useParams();
  const { cart, addItem } = useCart();
  const { user } = useAuth();

  const [book, setBook] = useState(null);
  const [status, setStatus] = useState("loading"); // 'loading' | 'success' | 'error' | 'not-found'
  const [quantity, setQuantity] = useState(1);
  const [addState, setAddState] = useState("idle"); // 'idle' | 'adding' | 'added' | 'error'
  const [addError, setAddError] = useState("");

  const [reviews, setReviews] = useState([]);
  const [reviewsLoaded, setReviewsLoaded] = useState(false);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState("");

  useEffect(() => {
    setStatus("loading");
    setQuantity(1);
    setAddState("idle");
    setAddError("");

    fetch(`${API_BASE}/api/books/${id}`, { credentials: "include" })
      .then((res) => {
        if (res.status === 404) {
          setStatus("not-found");
          return null;
        }
        if (!res.ok) throw new Error(`Request failed with status ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (data) {
          setBook(data);
          setStatus("success");
        }
      })
      .catch((err) => {
        console.error("Failed to load book:", err);
        setStatus("error");
      });
  }, [id]);

  const fetchReviews = useCallback(() => {
    api
      .get(`/books/${id}/reviews`)
      .then(({ data }) => {
        setReviews(data);
        setReviewsLoaded(true);
      })
      .catch((err) => {
        console.error("Failed to load reviews:", err);
        setReviewsLoaded(true); // don't block the page over reviews failing
      });
  }, [id]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const isOutOfStock = book?.stock === 0;
  const isLowStock = book && !isOutOfStock && book.stock <= LOW_STOCK_THRESHOLD;

  const alreadyInCart = book
    ? cart.items.find((item) => item.book?._id === book._id)?.quantity || 0
    : 0;
  const maxSelectable = book ? Math.max(0, book.stock - alreadyInCart) : 0;

  const handleAddToCart = async () => {
    if (!book || quantity < 1 || quantity > maxSelectable) return;
    setAddState("adding");
    setAddError("");
    try {
      await addItem(book._id, quantity);
      setAddState("added");
      setTimeout(() => setAddState("idle"), 2000);
    } catch (err) {
      console.error("Failed to add to cart:", err);
      setAddError(err.response?.data?.message || "Couldn't add that to your cart.");
      setAddState("error");
    }
  };

  // Computed client-side from the same review list the page already
  // fetches to display — avoids a separate backend aggregation endpoint
  // for something this cheap to derive from data we have anyway.
  const reviewCount = reviews.length;
  const averageRating =
    reviewCount > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount : 0;

  const myReview = user
    ? reviews.find((r) => String(r.user?._id) === String(user.id))
    : null;

  const handleReviewSubmit = async (rating, comment) => {
    setReviewSubmitting(true);
    setReviewError("");
    try {
      await api.post(`/books/${id}/reviews`, { rating, comment });
      fetchReviews(); // re-fetch rather than optimistically append, so the
                       // average and "already reviewed" state stay accurate
    } catch (err) {
      console.error("Failed to submit review:", err);
      setReviewError(
        err.response?.data?.message || "Couldn't submit your review. Try again."
      );
    } finally {
      setReviewSubmitting(false);
    }
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

            {reviewsLoaded && reviewCount > 0 && (
              <div className="flex items-center gap-2">
                <StarRating rating={averageRating} />
                <span className="text-sm text-text/60">
                  {averageRating.toFixed(1)} ({reviewCount} {reviewCount === 1 ? "review" : "reviews"})
                </span>
              </div>
            )}

            <p className="font-mono text-2xl font-medium text-text">
              ${book.price?.toFixed(2)}
            </p>

            {book.description && (
              <p className="max-w-prose text-sm leading-relaxed text-text/80">
                {book.description}
              </p>
            )}

            {addError && (
              <p className="rounded-md bg-accent/10 px-3 py-2 text-sm text-text">{addError}</p>
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
                disabled={isOutOfStock || maxSelectable === 0 || addState === "adding"}
                className="rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-background transition-colors hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-40"
              >
                {isOutOfStock
                  ? "Out of stock"
                  : addState === "adding"
                  ? "Adding..."
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

        {/* Reviews */}
        <div className="mt-12 border-t border-text/10 pt-8">
          <h2 className="mb-4 text-xl font-semibold text-text">Reviews</h2>

          {!user && (
            <p className="mb-6 text-sm text-text/60">
              <Link to="/login" className="text-primary hover:underline">
                Log in
              </Link>{" "}
              to leave a review after your order is delivered.
            </p>
          )}

          {user && myReview && (
            <div className="mb-6 flex items-center gap-2 rounded-md border border-text/10 bg-primary/5 px-3 py-2 text-sm text-text/70">
              <StarRating rating={myReview.rating} size="text-sm" />
              <span>You've already reviewed this book.</span>
            </div>
          )}

          {user && !myReview && (
            <div className="mb-6">
              <ReviewForm
                onSubmit={handleReviewSubmit}
                submitting={reviewSubmitting}
                error={reviewError}
              />
            </div>
          )}

          {reviewsLoaded ? (
            <ReviewList reviews={reviews} />
          ) : (
            <p className="text-sm text-text/60">Loading reviews...</p>
          )}
        </div>
      </div>
    </div>
  );
}
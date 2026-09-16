import React, { useState } from "react";

export default function ReviewForm({ onSubmit, submitting, error }) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (rating < 1) return;
    onSubmit(rating, comment);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 rounded-md border border-text/10 bg-primary/5 p-4">
      <div className="flex items-center gap-1 text-2xl">
        {Array.from({ length: 5 }, (_, i) => {
          const starValue = i + 1;
          const filled = starValue <= (hoverRating || rating);
          return (
            <button
              key={starValue}
              type="button"
              onClick={() => setRating(starValue)}
              onMouseEnter={() => setHoverRating(starValue)}
              onMouseLeave={() => setHoverRating(0)}
              aria-label={`${starValue} star${starValue > 1 ? "s" : ""}`}
              className={filled ? "text-accent" : "text-text/20"}
            >
              ★
            </button>
          );
        })}
      </div>

      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Share your thoughts on this book (optional)"
        rows={3}
        className="resize-none rounded-md border border-text/15 bg-background px-3 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary"
      />

      {error && <p className="text-sm text-accent">{error}</p>}

      <button
        type="submit"
        disabled={rating < 1 || submitting}
        className="self-start rounded-md bg-primary px-4 py-2 text-sm font-medium text-background hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-50"
      >
        {submitting ? "Submitting..." : "Submit Review"}
      </button>
    </form>
  );
}
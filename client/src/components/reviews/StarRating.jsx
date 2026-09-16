import React from "react";

// Read-only display. Supports fractional ratings (e.g. 3.7) by clipping
// each star's fill width proportionally — used for the average rating,
// while ReviewForm uses whole-star clicks for the actual input.
export default function StarRating({ rating = 0, size = "text-base" }) {
  return (
    <span className={`inline-flex ${size}`} aria-label={`${rating.toFixed(1)} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, i) => {
        const fillPercent = Math.max(0, Math.min(1, rating - i)) * 100;
        return (
          <span key={i} className="relative inline-block">
            <span className="text-text/20">★</span>
            <span
              className="absolute inset-0 overflow-hidden text-accent"
              style={{ width: `${fillPercent}%` }}
            >
              ★
            </span>
          </span>
        );
      })}
    </span>
  );
}
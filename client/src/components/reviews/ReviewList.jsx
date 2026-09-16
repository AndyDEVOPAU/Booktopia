import React from "react";
import StarRating from "./StarRating";

export default function ReviewList({ reviews }) {
  if (reviews.length === 0) {
    return <p className="text-sm text-text/60">No reviews yet.</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      {reviews.map((review) => (
        <div key={review._id} className="border-b border-text/10 pb-4 last:border-b-0">
          <div className="flex items-center gap-2">
            <StarRating rating={review.rating} size="text-sm" />
            <span className="text-sm font-medium text-text">{review.user?.name || "A reader"}</span>
            <span className="text-xs text-text/40">
              {new Date(review.createdAt).toLocaleDateString()}
            </span>
          </div>
          {review.comment && (
            <p className="mt-1 text-sm text-text/80">{review.comment}</p>
          )}
        </div>
      ))}
    </div>
  );
}
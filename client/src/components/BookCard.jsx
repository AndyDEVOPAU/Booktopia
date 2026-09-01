import React from "react";
import { useNavigate } from "react-router-dom";

// Cycles through your 3 theme accent tokens so each category consistently
// lands on the same "spine" color, like books grouped by color on a shelf.
const SPINE_TOKENS = ["bg-primary", "bg-secondary", "bg-accent"];

function spineTokenFor(categoryName = "") {
  let hash = 0;
  for (let i = 0; i < categoryName.length; i++) {
    hash = categoryName.charCodeAt(i) + ((hash << 5) - hash);
  }
  return SPINE_TOKENS[Math.abs(hash) % SPINE_TOKENS.length];
}

const LOW_STOCK_THRESHOLD = 5;

export default function BookCard({ book, onSelect }) {
  const navigate = useNavigate();
  const spineToken = spineTokenFor(book.category?.name);
  const isOutOfStock = book.stock === 0;
  const isLowStock = !isOutOfStock && book.stock <= LOW_STOCK_THRESHOLD;

  const handleClick = () => {
    if (onSelect) {
      onSelect(book);
    } else {
      navigate(`/books/${book._id}`);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="group relative flex flex-col overflow-hidden rounded-md bg-background text-left text-text shadow-sm ring-1 ring-text/10 transition-transform duration-200 hover:-translate-y-1 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
    >
      {/* Spine bar — signature element, colored per category */}
      <span aria-hidden="true" className={`absolute inset-y-0 left-0 w-1.5 ${spineToken}`} />

      <div className="ml-1.5 flex flex-1 flex-col">
        {/* Cover */}
        <div className="relative aspect-[2/3] w-full overflow-hidden bg-primary/10">
          {book.coverImage ? (
            <img
              src={book.coverImage}
              alt={`Cover of ${book.title}`}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center px-3 text-center">
              <span className="text-sm font-medium leading-snug text-text/50">
                {book.title}
              </span>
            </div>
          )}

          {/* Stock badges */}
          {isOutOfStock && (
            <span className="absolute left-2 top-2 rounded-sm bg-text/85 px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide text-background">
              Out of stock
            </span>
          )}
          {isLowStock && (
            <span className="absolute left-2 top-2 rounded-sm bg-accent px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide text-background">
              Only {book.stock} left
            </span>
          )}
        </div>

        {/* Details */}
        <div className="flex flex-1 flex-col gap-1 p-3">
          <p className="text-[11px] uppercase tracking-wide text-text/50">
            {book.category?.name || "Uncategorized"}
          </p>
          <h3 className="text-[15px] font-semibold leading-snug text-text">
            {book.title}
          </h3>
          <p className="text-[13px] text-text/70">{book.author}</p>

          <div className="mt-auto flex items-center justify-between pt-2">
            <span className="font-mono text-[15px] font-medium text-text">
              ${book.price?.toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}

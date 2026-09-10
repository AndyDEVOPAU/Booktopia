import React from "react";
import BookCard from "../BookCard";

export default function BestSellerGrid({ title = "Best Sellers", books }) {
  if (!books || books.length === 0) return null;

  return (
    <section className="mx-auto max-w-6xl px-4 py-8 sm:px-8">
      <h2 className="mb-4 text-xl font-semibold text-text">{title}</h2>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {books.slice(0, 10).map((book) => (
          <BookCard key={book._id} book={book} />
        ))}
      </div>
    </section>
  );
}

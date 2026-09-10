import React from "react";
import { Link } from "react-router-dom";

// "Popular" here just means "the categories that exist" — there's no
// per-category sales/view count yet to actually rank by popularity.
// Swap in real ranking once that data exists.
export default function CategoryGrid({ categories }) {
  if (!categories || categories.length === 0) return null;

  return (
    <section className="mx-auto max-w-6xl px-4 py-8 sm:px-8">
      <h2 className="mb-4 text-xl font-semibold text-text">Popular Categories</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {categories.map((cat) => (
          <Link
            key={cat._id}
            to={`/books?category=${cat._id}`}
            className="rounded-md border border-text/10 bg-primary/5 px-4 py-6 text-center text-sm font-medium text-text transition-colors hover:bg-primary/10"
          >
            {cat.name}
          </Link>
        ))}
      </div>
    </section>
  );
}

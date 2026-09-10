import React, { useRef } from "react";
import BookCard from "../BookCard";

export default function BookSlider({ title, books }) {
  const scrollRef = useRef(null);

  if (!books || books.length === 0) return null;

  const scroll = (direction) => {
    scrollRef.current?.scrollBy({ left: direction * 320, behavior: "smooth" });
  };

  return (
    <section className="mx-auto max-w-6xl px-4 py-8 sm:px-8">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-text">{title}</h2>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => scroll(-1)}
            aria-label="Scroll left"
            className="rounded-md border border-text/15 px-2.5 py-1.5 text-text hover:bg-text/5"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={() => scroll(1)}
            aria-label="Scroll right"
            className="rounded-md border border-text/15 px-2.5 py-1.5 text-text hover:bg-text/5"
          >
            ›
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{ scrollSnapType: "x mandatory" }}
      >
        {books.map((book) => (
          <div key={book._id} className="h-auto w-40 shrink-0 self-stretch" style={{ scrollSnapAlign: "start" }}>
            <BookCard book={book} />
          </div>
        ))}
      </div>
    </section>
  );
}

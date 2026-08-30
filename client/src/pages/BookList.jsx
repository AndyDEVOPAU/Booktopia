import React, { useEffect, useState, useCallback } from "react";
import BookCard from "../components/BookCard";
import BookCardSkeleton from "../components/BookCardSkeleton";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001";
const PAGE_SIZE = 20;

export default function BookList() {
  const [books, setBooks] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalBooks, setTotalBooks] = useState(0);
  const [status, setStatus] = useState("loading"); // 'loading' | 'success' | 'error'

  const fetchBooks = useCallback(async (pageToLoad) => {
    setStatus("loading");
    try {
      const res = await fetch(
        `${API_BASE}/api/books?page=${pageToLoad}&limit=${PAGE_SIZE}`,
        { credentials: "include" }
      );

      if (!res.ok) {
        throw new Error(`Request failed with status ${res.status}`);
      }

      const data = await res.json();
      setBooks(data.books);
      setTotalPages(data.totalPages || 1);
      setTotalBooks(data.totalBooks || 0);
      setStatus("success");
    } catch (err) {
      console.error("Failed to load books:", err);
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    fetchBooks(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [page, fetchBooks]);

  return (
    <div className="min-h-screen bg-background px-4 py-10 text-text sm:px-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8 border-b border-text/10 pb-6">
          <p className="text-[11px] uppercase tracking-[0.15em] text-text/50">
            The Catalog
          </p>
          <h1 className="mt-1 text-3xl font-semibold text-text sm:text-4xl">
            Browse every book on the shelf
          </h1>
          {status === "success" && (
            <p className="mt-2 text-sm text-text/70">
              {totalBooks} {totalBooks === 1 ? "book" : "books"} in stock
            </p>
          )}
        </div>

        {/* Error state */}
        {status === "error" && (
          <div className="flex flex-col items-center gap-3 rounded-md border border-text/10 bg-primary/5 py-16 text-center">
            <p className="text-lg font-medium text-text">The catalog didn't load.</p>
            <p className="max-w-sm text-sm text-text/70">
              Check your connection and try again.
            </p>
            <button
              type="button"
              onClick={() => fetchBooks(page)}
              className="mt-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-background transition-colors hover:bg-secondary"
            >
              Retry
            </button>
          </div>
        )}

        {/* Loading state */}
        {status === "loading" && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: PAGE_SIZE }).map((_, i) => (
              <BookCardSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Empty state */}
        {status === "success" && books.length === 0 && (
          <div className="flex flex-col items-center gap-2 rounded-md border border-text/10 bg-primary/5 py-20 text-center">
            <p className="text-lg font-medium text-text">No books here yet.</p>
            <p className="max-w-sm text-sm text-text/70">
              Once titles are added to the catalog, they'll show up on this shelf.
            </p>
          </div>
        )}

        {/* Grid */}
        {status === "success" && books.length > 0 && (
          <>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {books.map((book) => (
                <BookCard key={book._id} book={book} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-10 flex items-center justify-center gap-2">
                <button
                  type="button"
                  disabled={page === 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="rounded-md border border-text/15 px-3 py-1.5 text-sm text-text transition-colors hover:bg-text/5 disabled:cursor-not-allowed disabled:opacity-30"
                >
                  Previous
                </button>

                <span className="px-3 font-mono text-sm text-text/70">
                  {page} / {totalPages}
                </span>

                <button
                  type="button"
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="rounded-md border border-text/15 px-3 py-1.5 text-sm text-text transition-colors hover:bg-text/5 disabled:cursor-not-allowed disabled:opacity-30"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

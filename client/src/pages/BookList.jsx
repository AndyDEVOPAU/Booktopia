import React, { useEffect, useState, useCallback, useMemo } from "react";
import BookCard from "../components/BookCard";
import BookCardSkeleton from "../components/BookCardSkeleton";
import BookFilters from "../components/BookFilters";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001";
const PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 400;

export default function BookList() {
  const [books, setBooks] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalBooks, setTotalBooks] = useState(0);
  const [status, setStatus] = useState("loading"); // 'loading' | 'success' | 'error'

  const [categories, setCategories] = useState([]);

  // Raw input state (updates immediately as the user types/selects)
  const [searchInput, setSearchInput] = useState("");
  const [category, setCategory] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sort, setSort] = useState("newest");

  // Debounced search — only this triggers a fetch, so typing doesn't fire
  // a request on every keystroke.
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput.trim());
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Any filter change resets to page 1 — staying on page 4 of a new,
  // smaller result set would just show an empty page.
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, category, minPrice, maxPrice, sort]);

  // Load categories once for the filter dropdown.
  useEffect(() => {
    fetch(`${API_BASE}/api/categories`)
      .then((res) => res.json())
      .then(setCategories)
      .catch((err) => console.error("Failed to load categories:", err));
  }, []);

  const buildQueryString = useCallback(() => {
    const params = new URLSearchParams();
    if (debouncedSearch) params.set("search", debouncedSearch);
    if (category) params.set("category", category);
    if (minPrice !== "") params.set("minPrice", minPrice);
    if (maxPrice !== "") params.set("maxPrice", maxPrice);
    if (sort) params.set("sort", sort);
    params.set("page", page);
    params.set("limit", PAGE_SIZE);
    return params.toString();
  }, [debouncedSearch, category, minPrice, maxPrice, sort, page]);

  const fetchBooks = useCallback(async () => {
    setStatus("loading");
    try {
      const res = await fetch(`${API_BASE}/api/books?${buildQueryString()}`, {
        credentials: "include",
      });

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
  }, [buildQueryString]);

  useEffect(() => {
    fetchBooks();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [fetchBooks]);

  const hasActiveFilters = useMemo(
    () => Boolean(searchInput || category || minPrice || maxPrice || sort !== "newest"),
    [searchInput, category, minPrice, maxPrice, sort]
  );

  const handleClearFilters = () => {
    setSearchInput("");
    setCategory("");
    setMinPrice("");
    setMaxPrice("");
    setSort("newest");
  };

  return (
    <div className="min-h-screen bg-background px-4 py-10 text-text sm:px-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-6 border-b border-text/10 pb-6">
          <p className="text-[11px] uppercase tracking-[0.15em] text-text/50">
            The Catalog
          </p>
          <h1 className="mt-1 text-3xl font-semibold text-text sm:text-4xl">
            Browse every book on the shelf
          </h1>
        </div>

        {/* Filters */}
        <BookFilters
          search={searchInput}
          onSearchChange={setSearchInput}
          category={category}
          onCategoryChange={setCategory}
          categories={categories}
          minPrice={minPrice}
          onMinPriceChange={setMinPrice}
          maxPrice={maxPrice}
          onMaxPriceChange={setMaxPrice}
          sort={sort}
          onSortChange={setSort}
          onClear={handleClearFilters}
          hasActiveFilters={hasActiveFilters}
        />

        {status === "success" && (
          <p className="mb-4 text-sm text-text/70">
            {totalBooks} {totalBooks === 1 ? "book" : "books"} found
          </p>
        )}

        {/* Error state */}
        {status === "error" && (
          <div className="flex flex-col items-center gap-3 rounded-md border border-text/10 bg-primary/5 py-16 text-center">
            <p className="text-lg font-medium text-text">The catalog didn't load.</p>
            <p className="max-w-sm text-sm text-text/70">
              Check your connection and try again.
            </p>
            <button
              type="button"
              onClick={fetchBooks}
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
            <p className="text-lg font-medium text-text">
              {hasActiveFilters ? "No books match your filters." : "No books here yet."}
            </p>
            <p className="max-w-sm text-sm text-text/70">
              {hasActiveFilters
                ? "Try adjusting your search or clearing filters."
                : "Once titles are added to the catalog, they'll show up on this shelf."}
            </p>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="mt-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-background transition-colors hover:bg-secondary"
              >
                Clear filters
              </button>
            )}
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

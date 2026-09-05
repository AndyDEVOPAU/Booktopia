import React, { useEffect, useState, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";
import BookFilters from "../../components/BookFilters";

const PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 400;

export default function AdminBookList() {
  const [books, setBooks] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalBooks, setTotalBooks] = useState(0);
  const [status, setStatus] = useState("loading");
  const [showArchived, setShowArchived] = useState(false);
  const [actionError, setActionError] = useState("");

  const [categories, setCategories] = useState([]);

  const [searchInput, setSearchInput] = useState("");
  const [category, setCategory] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sort, setSort] = useState("newest");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput.trim());
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, category, minPrice, maxPrice, sort, showArchived]);

  useEffect(() => {
    api
      .get("/categories")
      .then(({ data }) => setCategories(data))
      .catch((err) => console.error("Failed to load categories:", err));
  }, []);

  const buildParams = useCallback(() => {
    const params = {};
    if (debouncedSearch) params.search = debouncedSearch;
    if (category) params.category = category;
    if (minPrice !== "") params.minPrice = minPrice;
    if (maxPrice !== "") params.maxPrice = maxPrice;
    if (sort) params.sort = sort;
    params.page = page;
    params.limit = PAGE_SIZE;
    return params;
  }, [debouncedSearch, category, minPrice, maxPrice, sort, page]);

  const fetchBooks = useCallback(async () => {
    setStatus("loading");
    setActionError("");
    try {
      if (showArchived) {
        const { data } = await api.get("/books/archived");
        setBooks(data);
        setTotalPages(1);
        setTotalBooks(data.length);
      } else {
        const { data } = await api.get("/books", { params: buildParams() });
        setBooks(data.books);
        setTotalPages(data.totalPages || 1);
        setTotalBooks(data.totalBooks || 0);
      }
      setStatus("success");
    } catch (err) {
      console.error("Failed to load books:", err);
      setStatus("error");
    }
  }, [showArchived, buildParams]);

  useEffect(() => {
    fetchBooks();
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

  const handleArchive = async (id) => {
    setActionError("");
    try {
      await api.delete(`/books/${id}`);
      setBooks((prev) => prev.filter((b) => b._id !== id));
    } catch (err) {
      console.error("Failed to archive book:", err);
      setActionError("Couldn't archive that book. Try again.");
    }
  };

  const handleRestore = async (id) => {
    setActionError("");
    try {
      await api.patch(`/books/${id}/restore`);
      setBooks((prev) => prev.filter((b) => b._id !== id));
    } catch (err) {
      console.error("Failed to restore book:", err);
      setActionError("Couldn't restore that book. Try again.");
    }
  };

  return (
    <div className="min-h-screen bg-background px-4 py-10 text-text sm:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-text/10 pb-6">
          <div>
            <p className="text-[11px] uppercase tracking-[0.15em] text-text/50">Admin</p>
            <h1 className="mt-1 text-2xl font-semibold text-text sm:text-3xl">Books</h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowArchived((v) => !v)}
              className="rounded-md border border-text/15 px-3 py-2 text-sm text-text hover:bg-text/5"
            >
              {showArchived ? "View active" : "View archived"}
            </button>
            <Link
              to="/admin/books/new"
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-background hover:bg-secondary"
            >
              New Book
            </Link>
          </div>
        </div>

        {actionError && (
          <p className="mb-4 rounded-md bg-accent/10 px-3 py-2 text-sm text-text">
            {actionError}
          </p>
        )}

        {!showArchived && (
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
        )}

        {status === "success" && (
          <p className="mb-4 text-sm text-text/70">
            {totalBooks} {totalBooks === 1 ? "book" : "books"} found
          </p>
        )}

        {status === "loading" && <p className="text-sm text-text/60">Loading...</p>}

        {status === "error" && (
          <p className="text-sm text-text/60">
            Couldn't load books.{" "}
            <button type="button" onClick={fetchBooks} className="underline">
              Retry
            </button>
          </p>
        )}

        {status === "success" && books.length === 0 && (
          <p className="text-sm text-text/60">
            {showArchived
              ? "No archived books."
              : hasActiveFilters
              ? "No books match your filters."
              : "No books yet."}
          </p>
        )}

        {status === "success" && books.length > 0 && (
          <>
            <div className="overflow-x-auto rounded-md border border-text/10">
              <table className="w-full text-left text-sm">
                <thead className="bg-primary/5 text-text/60">
                  <tr>
                    <th className="px-4 py-3 font-medium">Title</th>
                    <th className="px-4 py-3 font-medium">Author</th>
                    <th className="px-4 py-3 font-medium">Category</th>
                    <th className="px-4 py-3 font-medium">Price</th>
                    <th className="px-4 py-3 font-medium">Stock</th>
                    <th className="px-4 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {books.map((book) => (
                    <tr key={book._id} className="border-t border-text/10">
                      <td className="px-4 py-3 font-medium">{book.title}</td>
                      <td className="px-4 py-3 text-text/70">{book.author}</td>
                      <td className="px-4 py-3 text-text/70">
                        {book.category?.name || "—"}
                      </td>
                      <td className="px-4 py-3 font-mono">${book.price?.toFixed(2)}</td>
                      <td className="px-4 py-3">{book.stock}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {!showArchived && (
                            <Link
                              to={`/admin/books/${book._id}/edit`}
                              className="text-primary hover:underline"
                            >
                              Edit
                            </Link>
                          )}
                          {showArchived ? (
                            <button
                              type="button"
                              onClick={() => handleRestore(book._id)}
                              className="text-primary hover:underline"
                            >
                              Restore
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleArchive(book._id)}
                              className="text-text/60 hover:underline"
                            >
                              Archive
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {!showArchived && totalPages > 1 && (
              <div className="mt-6 flex items-center justify-center gap-2">
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
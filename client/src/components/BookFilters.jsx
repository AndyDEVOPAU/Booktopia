import React from "react";

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "title_asc", label: "Title: A to Z" },
  { value: "title_desc", label: "Title: Z to A" },
];

export default function BookFilters({
  search,
  onSearchChange,
  category,
  onCategoryChange,
  categories,
  minPrice,
  onMinPriceChange,
  maxPrice,
  onMaxPriceChange,
  sort,
  onSortChange,
  onClear,
  hasActiveFilters,
}) {
  return (
    <div className="mb-6 flex flex-col gap-3 rounded-md border border-text/10 bg-primary/5 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {/* Search */}
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by title or author..."
          className="flex-1 rounded-md border border-text/15 bg-background px-3 py-2 text-sm text-text placeholder:text-text/40 focus:outline-none focus:ring-2 focus:ring-primary"
        />

        {/* Category */}
        <select
          value={category}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="rounded-md border border-text/15 bg-background px-3 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary sm:w-48"
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>

        {/* Sort */}
        <select
          value={sort}
          onChange={(e) => onSortChange(e.target.value)}
          className="rounded-md border border-text/15 bg-background px-3 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary sm:w-48"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {/* Price range */}
        <div className="flex items-center gap-2">
          <label className="text-sm text-text/70">Price</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={minPrice}
            onChange={(e) => onMinPriceChange(e.target.value)}
            placeholder="Min"
            className="w-24 rounded-md border border-text/15 bg-background px-2 py-1.5 text-sm text-text placeholder:text-text/40 focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <span className="text-text/40">–</span>
          <input
            type="number"
            min="0"
            step="0.01"
            value={maxPrice}
            onChange={(e) => onMaxPriceChange(e.target.value)}
            placeholder="Max"
            className="w-24 rounded-md border border-text/15 bg-background px-2 py-1.5 text-sm text-text placeholder:text-text/40 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={onClear}
            className="text-sm text-text/60 underline underline-offset-2 hover:text-text sm:ml-2"
          >
            Clear filters
          </button>
        )}
      </div>
    </div>
  );
}

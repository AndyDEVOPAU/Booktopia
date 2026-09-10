import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function SearchBar({ className = "" }) {
  const [value, setValue] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    const query = value.trim();
    navigate(query ? `/books?search=${encodeURIComponent(query)}` : "/books");
  };

  return (
    <form onSubmit={handleSubmit} className={`flex ${className}`}>
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search by title or author..."
        className="w-full rounded-l-md border border-text/15 bg-background px-3 py-2 text-sm text-text placeholder:text-text/40 focus:outline-none focus:ring-2 focus:ring-primary"
      />
      <button
        type="submit"
        aria-label="Search"
        className="rounded-r-md border border-l-0 border-text/15 bg-primary px-3 text-background hover:bg-secondary"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="h-4 w-4"
        >
          <circle cx="11" cy="11" r="7" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      </button>
    </form>
  );
}

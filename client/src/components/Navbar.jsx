import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { useCart } from "../context/useCart";
import SearchBar from "./SearchBar";

const linkClass = ({ isActive }) =>
  `text-sm font-medium transition-colors ${
    isActive ? "text-primary" : "text-text/70 hover:text-text"
  }`;

export default function Navbar() {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <header className="border-b border-text/10 bg-background">
      {/* Utility row: brand, search, user/login */}
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <NavLink to="/" className="text-lg font-semibold text-text">
          Booktopia
        </NavLink>

        <SearchBar className="w-full sm:max-w-md" />

        <div className="flex items-center justify-end gap-3">
          {user ? (
            <>
              <span className="text-sm text-text/60">Hi, {user.name}</span>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-md border border-text/15 px-3 py-1.5 text-sm text-text hover:bg-text/5"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={linkClass}>
                Log in
              </NavLink>
              <NavLink
                to="/register"
                className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-background hover:bg-secondary"
              >
                Sign up
              </NavLink>
            </>
          )}
        </div>
      </div>

      {/* Navigation row */}
      <div className="border-t border-text/10 bg-primary/5">
        <nav className="mx-auto flex max-w-6xl items-center gap-6 px-4 py-2.5 sm:px-8">
          <NavLink to="/books" className={linkClass}>
            Books
          </NavLink>

          <NavLink to="/cart" className="relative text-sm font-medium text-text/70 hover:text-text">
            Cart
            {itemCount > 0 && (
              <span className="absolute -right-3 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-background">
                {itemCount > 9 ? "9+" : itemCount}
              </span>
            )}
          </NavLink>

          {user?.role === "admin" && (
            <NavLink to="/admin/books" className={linkClass}>
              Admin
            </NavLink>
          )}
        </nav>
      </div>
    </header>
  );
}

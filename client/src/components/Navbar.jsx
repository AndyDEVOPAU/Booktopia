import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { getCartCount, onCartUpdated } from "../utils/cartStorage";

const linkClass = ({ isActive }) =>
  `text-sm font-medium transition-colors ${
    isActive ? "text-primary" : "text-text/70 hover:text-text"
  }`;

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    setCartCount(getCartCount());
    const unsubscribe = onCartUpdated(() => setCartCount(getCartCount()));
    return unsubscribe;
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <header className="border-b border-text/10 bg-background">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-8">
        <NavLink to="/" className="text-lg font-semibold text-text">
          Booktopia
        </NavLink>

        <nav className="flex items-center gap-6">
          <NavLink to="/books" className={linkClass}>
            Books
          </NavLink>

          <NavLink to="/cart" className="relative text-sm font-medium text-text/70 hover:text-text">
            Cart
            {cartCount > 0 && (
              <span className="absolute -right-3 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-background">
                {cartCount > 9 ? "9+" : cartCount}
              </span>
            )}
          </NavLink>

          {user?.role === "admin" && (
            <NavLink to="/admin/books" className={linkClass}>
              Admin
            </NavLink>
          )}

          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-sm text-text/60">Hi, {user.name}</span>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-md border border-text/15 px-3 py-1.5 text-sm text-text hover:bg-text/5 cursor-pointer"
              >
                Log out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <NavLink to="/login" className={linkClass}>
                Log in
              </NavLink>
              <NavLink
                to="/register"
                className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-background hover:bg-secondary"
              >
                Sign up
              </NavLink>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}

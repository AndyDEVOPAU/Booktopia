import React from "react";
import { Link } from "react-router-dom";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-text/10 bg-secondary/20 text-text">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-8">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          <div className="col-span-2 sm:col-span-1">
            <p className="text-lg font-semibold">Booktopia</p>
            <p className="mt-2 text-sm">
              Books for every shelf, delivered to yours.
            </p>
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-wide">
              Shop
            </p>
            <ul className="mt-3 flex flex-col gap-2 text-sm">
              <li>
                <Link to="/books" className="hover:text-primary">
                  All Books
                </Link>
              </li>
              <li>
                <Link to="/books?sort=newest" className="hover:text-primary">
                  New Releases
                </Link>
              </li>
              <li>
                <Link to="/cart" className="hover:text-background">
                  Cart
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-wide">
              Account
            </p>
            <ul className="mt-3 flex flex-col gap-2 text-sm">
              <li>
                <Link to="/login" className="hover:text-primary">
                  Log In
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-primary">
                  Sign Up
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-wide ">
              Support
            </p>
            <ul className="mt-3 flex flex-col gap-2 text-sm">
              <li>
                <a href="mailto:support@booktopia.example" className="hover:text-primary">
                  Contact Us
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-background/10 pt-6 text-xs">
          © {year} Booktopia. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

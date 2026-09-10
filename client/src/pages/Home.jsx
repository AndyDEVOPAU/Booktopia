import { useEffect, useState } from "react";
import api from "../api/axios";
import PromoSlider from "../components/home/PromoSlider";
import BookSlider from "../components/home/BookSlider";
import BestSellerGrid from "../components/home/BestSellerGrid";
import CategoryGrid from "../components/home/CategoryGrid";

const Home = () => {
  const [pool, setPool] = useState([]);
  const [categories, setCategories] = useState([]);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    Promise.all([
      api.get("/books", { params: { sort: "newest", limit: 30 } }),
      api.get("/categories"),
    ])
      .then(([booksRes, categoriesRes]) => {
        setPool(booksRes.data.books || []);
        setCategories(categoriesRes.data || []);
        setStatus("success");
      })
      .catch((err) => {
        console.error("Failed to load homepage data:", err);
        setStatus("error");
      });
  }, []);

  if (status === "loading") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-text/60">
        Loading...
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-2 text-center text-text">
        <p className="font-medium">The homepage didn't load.</p>
        <p className="text-sm text-text/60">Check your connection and refresh.</p>
      </div>
    );
  }

  // NOTE: there's no real sales/view data yet (no Order model in use here),
  // so "Trending" / "Best Sellers" / "New This Week" are just different
  // slices of the newest-books pool rather than actually ranked data.
  // "New This Week" is the one honest label here since it's genuinely the
  // most recently added books. Swap the other two for real queries once
  // order history exists to rank by.
  const newThisWeek = pool.slice(0, 8);
  const trending = pool.slice(8, 16).length ? pool.slice(8, 16) : pool.slice(0, 8);
  const bestSellers = pool.slice(16, 26).length ? pool.slice(16, 26) : pool.slice(0, 10);

  return (
    <div className="bg-background">
      <PromoSlider />
      <BookSlider title="Trending Books" books={trending} />
      <BestSellerGrid books={bestSellers} />
      <BookSlider title="New This Week" books={newThisWeek} />
      <CategoryGrid categories={categories} />
    </div>
  );
};

export default Home;

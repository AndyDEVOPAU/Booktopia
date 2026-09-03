import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";

export default function AdminCategoryList() {
  const [categories, setCategories] = useState([]);
  const [status, setStatus] = useState("loading");
  const [showArchived, setShowArchived] = useState(false);
  const [actionError, setActionError] = useState("");

  const fetchCategories = useCallback(async (archived) => {
    setStatus("loading");
    setActionError("");
    try {
      const { data } = archived
        ? await api.get("/categories/archived")
        : await api.get("/categories");
      setCategories(data);
      setStatus("success");
    } catch (err) {
      console.error("Failed to load categories:", err);
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    fetchCategories(showArchived);
  }, [showArchived, fetchCategories]);

  const handleArchive = async (id) => {
    setActionError("");
    try {
      await api.delete(`/categories/${id}`);
      setCategories((prev) => prev.filter((c) => c._id !== id));
    } catch (err) {
      console.error("Failed to archive category:", err);
      setActionError("Couldn't archive that category. Try again.");
    }
  };

  const handleRestore = async (id) => {
    setActionError("");
    try {
      await api.patch(`/categories/${id}/restore`);
      setCategories((prev) => prev.filter((c) => c._id !== id));
    } catch (err) {
      console.error("Failed to restore category:", err);
      setActionError("Couldn't restore that category. Try again.");
    }
  };

  return (
    <div className="min-h-screen bg-background px-4 py-10 text-text sm:px-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-text/10 pb-6">
          <div>
            <p className="text-[11px] uppercase tracking-[0.15em] text-text/50">Admin</p>
            <h1 className="mt-1 text-2xl font-semibold text-text sm:text-3xl">Categories</h1>
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
              to="/admin/categories/new"
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-background hover:bg-secondary"
            >
              New Category
            </Link>
          </div>
        </div>

        {actionError && (
          <p className="mb-4 rounded-md bg-accent/10 px-3 py-2 text-sm text-text">
            {actionError}
          </p>
        )}

        {status === "loading" && <p className="text-sm text-text/60">Loading...</p>}

        {status === "error" && (
          <p className="text-sm text-text/60">
            Couldn't load categories.{" "}
            <button
              type="button"
              onClick={() => fetchCategories(showArchived)}
              className="underline"
            >
              Retry
            </button>
          </p>
        )}

        {status === "success" && categories.length === 0 && (
          <p className="text-sm text-text/60">
            {showArchived ? "No archived categories." : "No categories yet."}
          </p>
        )}

        {status === "success" && categories.length > 0 && (
          <div className="overflow-x-auto rounded-md border border-text/10">
            <table className="w-full text-left text-sm">
              <thead className="bg-primary/5 text-text/60">
                <tr>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Slug</th>
                  <th className="px-4 py-3 font-medium">Description</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((cat) => (
                  <tr key={cat._id} className="border-t border-text/10">
                    <td className="px-4 py-3 font-medium">{cat.name}</td>
                    <td className="px-4 py-3 font-mono text-text/60">{cat.slug}</td>
                    <td className="px-4 py-3 text-text/70">{cat.description || "—"}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {!showArchived && (
                          <Link
                            to={`/admin/categories/${cat._id}/edit`}
                            className="text-primary hover:underline"
                          >
                            Edit
                          </Link>
                        )}
                        {showArchived ? (
                          <button
                            type="button"
                            onClick={() => handleRestore(cat._id)}
                            className="text-primary hover:underline"
                          >
                            Restore
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleArchive(cat._id)}
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
        )}
      </div>
    </div>
  );
}

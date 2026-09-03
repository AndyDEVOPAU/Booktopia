import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/axios";

export default function AdminCategoryForm() {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isEditMode) return;

    api
      .get(`/categories/${id}`)
      .then(({ data }) => {
        setName(data.name || "");
        setDescription(data.description || "");
      })
      .catch((err) => {
        console.error("Failed to load category:", err);
        setError("Couldn't load this category.");
      })
      .finally(() => setLoading(false));
  }, [id, isEditMode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      if (isEditMode) {
        await api.put(`/categories/${id}`, { name, description });
      } else {
        await api.post("/categories", { name, description });
      }
      navigate("/admin/categories");
    } catch (err) {
      console.error("Failed to save category:", err);
      setError(err.response?.data?.message || "Something went wrong. Try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background px-4 py-10 text-text sm:px-8">
        <p className="mx-auto max-w-lg text-sm text-text/60">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-4 py-10 text-text sm:px-8">
      <div className="mx-auto max-w-lg">
        <p className="text-[11px] uppercase tracking-[0.15em] text-text/50">Admin</p>
        <h1 className="mt-1 text-2xl font-semibold text-text">
          {isEditMode ? "Edit Category" : "New Category"}
        </h1>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          {error && (
            <p className="rounded-md bg-accent/10 px-3 py-2 text-sm text-text">{error}</p>
          )}

          <label className="flex flex-col gap-1 text-sm">
            <span className="text-text/70">
              Name<span className="text-accent"> *</span>
            </span>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="rounded-md border border-text/15 bg-background px-3 py-2 text-text focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </label>

          <label className="flex flex-col gap-1 text-sm">
            <span className="text-text/70">Description</span>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="resize-none rounded-md border border-text/15 bg-background px-3 py-2 text-text focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </label>

          <div className="mt-2 flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-background hover:bg-secondary disabled:opacity-50"
            >
              {saving ? "Saving..." : isEditMode ? "Save Changes" : "Create Category"}
            </button>
            <button
              type="button"
              onClick={() => navigate("/admin/categories")}
              className="rounded-md border border-text/15 px-5 py-2.5 text-sm text-text hover:bg-text/5"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

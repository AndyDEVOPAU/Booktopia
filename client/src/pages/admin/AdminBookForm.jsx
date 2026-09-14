import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/axios";
import { uploadImageToCloudinary } from "../../utils/uploadToCloudinary";

const EMPTY_FORM = {
  title: "",
  author: "",
  isbn: "",
  price: "",
  stock: "",
  description: "",
  coverImage: "",
  category: "",
};

const inputClass =
  "rounded-md border border-text/15 bg-background px-3 py-2 text-text focus:outline-none focus:ring-2 focus:ring-primary";

export default function AdminBookForm() {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [form, setForm] = useState(EMPTY_FORM);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  useEffect(() => {
    api
      .get("/categories")
      .then(({ data }) => setCategories(data))
      .catch((err) => console.error("Failed to load categories:", err));
  }, []);

  useEffect(() => {
    if (!isEditMode) return;

    api
      .get(`/books/${id}`)
      .then(({ data }) => {
        setForm({
          title: data.title || "",
          author: data.author || "",
          isbn: data.isbn || "",
          price: data.price ?? "",
          stock: data.stock ?? "",
          description: data.description || "",
          coverImage: data.coverImage || "",
          category: data.category?._id || "",
        });
      })
      .catch((err) => {
        console.error("Failed to load book:", err);
        setError("Couldn't load this book.");
      })
      .finally(() => setLoading(false));
  }, [id, isEditMode]);

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError("");
    setUploading(true);
    try {
      const url = await uploadImageToCloudinary(file);
      setForm((prev) => ({ ...prev, coverImage: url }));
    } catch (err) {
      console.error("Cover upload failed:", err);
      setUploadError(err.message || "Upload failed. Try a different image.");
    } finally {
      setUploading(false);
      // Reset the input so selecting the same file again still fires onChange
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemoveCover = () => {
    setForm((prev) => ({ ...prev, coverImage: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    const payload = {
      ...form,
      price: Number(form.price),
      stock: Number(form.stock),
    };

    try {
      if (isEditMode) {
        await api.put(`/books/${id}`, payload);
      } else {
        await api.post("/books", payload);
      }
      navigate("/admin/books");
    } catch (err) {
      console.error("Failed to save book:", err);
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
          {isEditMode ? "Edit Book" : "New Book"}
        </h1>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          {error && (
            <p className="rounded-md bg-accent/10 px-3 py-2 text-sm text-text">{error}</p>
          )}

          <Field label="Title" required>
            <input
              type="text"
              required
              value={form.title}
              onChange={handleChange("title")}
              className={inputClass}
            />
          </Field>

          <Field label="Author" required>
            <input
              type="text"
              required
              value={form.author}
              onChange={handleChange("author")}
              className={inputClass}
            />
          </Field>

          <Field label="ISBN" required>
            <input
              type="text"
              required
              value={form.isbn}
              onChange={handleChange("isbn")}
              className={inputClass}
            />
          </Field>

          <div className="flex gap-4">
            <Field label="Price ($)" required className="flex-1">
              <input
                type="number"
                min="0"
                step="0.01"
                required
                value={form.price}
                onChange={handleChange("price")}
                className={inputClass}
              />
            </Field>
            <Field label="Stock" required className="flex-1">
              <input
                type="number"
                min="0"
                required
                value={form.stock}
                onChange={handleChange("stock")}
                className={inputClass}
              />
            </Field>
          </div>

          <Field label="Category" required>
            <select
              required
              value={form.category}
              onChange={handleChange("category")}
              className={inputClass}
            >
              <option value="" disabled>
                Select a category
              </option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Cover Image">
            <div className="flex items-start gap-4">
              <div className="h-28 w-20 shrink-0 overflow-hidden rounded-sm bg-primary/10">
                {form.coverImage ? (
                  <img
                    src={form.coverImage}
                    alt="Cover preview"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-[10px] text-text/40">
                    No cover
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  disabled={uploading}
                  className="text-sm text-text/70 file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-background hover:file:bg-secondary"
                />
                {uploading && <p className="text-xs text-text/50">Uploading...</p>}
                {uploadError && <p className="text-xs text-accent">{uploadError}</p>}
                {form.coverImage && !uploading && (
                  <button
                    type="button"
                    onClick={handleRemoveCover}
                    className="text-left text-xs text-text/60 hover:underline"
                  >
                    Remove cover
                  </button>
                )}
              </div>
            </div>
          </Field>

          <Field label="Description">
            <textarea
              rows={4}
              value={form.description}
              onChange={handleChange("description")}
              className={`${inputClass} resize-none`}
            />
          </Field>

          <div className="mt-2 flex gap-3">
            <button
              type="submit"
              disabled={saving || uploading}
              className="rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-background hover:bg-secondary disabled:opacity-50"
            >
              {saving ? "Saving..." : isEditMode ? "Save Changes" : "Create Book"}
            </button>
            <button
              type="button"
              onClick={() => navigate("/admin/books")}
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

function Field({ label, required, children, className = "" }) {
  return (
    <label className={`flex flex-col gap-1 text-sm ${className}`}>
      <span className="text-text/70">
        {label}
        {required && <span className="text-accent"> *</span>}
      </span>
      {children}
    </label>
  );
}

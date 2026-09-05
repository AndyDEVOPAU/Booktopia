import Category from "../models/Category.js";

// GET /api/categories
// Public. Always returns active categories only.
export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true }).sort({ name: 1 });
    res.json(categories);
  } catch (error) {
    console.error("getCategories error:", error.name);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/categories/archived
// Admin only. Powers the admin "bin" view.
export const getArchivedCategories = async (req, res) => {
  try {
    const categories = await Category.find({ isActive: false }).sort({ name: 1 });
    res.json(categories);
  } catch (error) {
    console.error("getArchivedCategories error:", error.name);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/categories/:id
// Public.
export const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.json(category);
  } catch (error) {
    console.error("getCategoryById error:", error.name);
    res.status(500).json({ message: "Server error" });
  }
};

// POST /api/categories
// Admin only.
export const createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Category name is required" });
    }

    const category = await Category.create({ name, description });
    res.status(201).json(category);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "A category with this name already exists" });
    }
    console.error("createCategory error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// PUT /api/categories/:id
// Admin only.
export const updateCategory = async (req, res) => {
  try {
    const { name, description } = req.body;

    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    if (name !== undefined) category.name = name;
    if (description !== undefined) category.description = description;

    await category.save();
    res.json(category);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "A category with this name already exists" });
    }
    console.error("updateCategory error:", error.name);
    res.status(500).json({ message: "Server error" });
  }
};

// DELETE /api/categories/:id
// Admin only. Soft-delete: sets isActive to false rather than removing
// the document, so existing Book references stay valid.
export const archiveCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    category.isActive = false;
    await category.save();

    res.json({ message: "Category archived", category });
  } catch (error) {
    console.error("archiveCategory error:", error.name);
    res.status(500).json({ message: "Server error" });
  }
};

// PATCH /api/categories/:id/restore
// Admin only. Reverses an archive.
export const restoreCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    category.isActive = true;
    await category.save();

    res.json({ message: "Category restored", category });
  } catch (error) {
    console.error("restoreCategory error:", error.name);
    res.status(500).json({ message: "Server error" });
  }
};
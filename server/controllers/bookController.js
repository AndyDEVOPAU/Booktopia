import Book from "../models/Book.js";

const SORT_OPTIONS = {
  newest: { createdAt: -1 },
  oldest: { createdAt: 1 },
  price_asc: { price: 1 },
  price_desc: { price: -1 },
  title_asc: { title: 1 },
  title_desc: { title: -1 },
};

// GET /api/books
// Public. Active books only. Supports:
//   ?search=<text>        matches title OR author, partial + case-insensitive
//   ?category=<id>        exact category match (this is what "genre" maps to —
//                          there's no separate genre field on Book)
//   ?minPrice=&maxPrice=  either or both; inclusive range
//   ?sort=<key>           one of SORT_OPTIONS above, defaults to "newest"
//   ?page=&limit=         pagination, defaults to page 1 / 20 per page
export const getBooks = async (req, res) => {
  try {
    const {
      search,
      category,
      minPrice,
      maxPrice,
      sort = "newest",
      page = 1,
      limit = 20,
    } = req.query;

    const filter = { isActive: true };

    if (category) {
      filter.category = category;
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.price = {};
      const min = Number(minPrice);
      const max = Number(maxPrice);
      if (minPrice !== undefined && !Number.isNaN(min)) filter.price.$gte = min;
      if (maxPrice !== undefined && !Number.isNaN(max)) filter.price.$lte = max;
      // If neither turned out to be a valid number, drop the empty filter
      // rather than sending Mongo an empty {} range object.
      if (Object.keys(filter.price).length === 0) delete filter.price;
    }

    if (search && search.trim()) {
      // Regex (not $text) on purpose: partial substring matches like "harr"
      // finding "Harry Potter" is the behavior users expect from a search
      // box, which a $text index alone won't give you.
      const safeSearch = search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(safeSearch, "i");
      filter.$or = [{ title: regex }, { author: regex }];
    }

    const sortBy = SORT_OPTIONS[sort] || SORT_OPTIONS.newest;

    const books = await Book.find(filter)
      .populate("category", "name slug")
      .sort(sortBy)
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    const total = await Book.countDocuments(filter);

    res.json({
      books,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)) || 1,
      totalBooks: total,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid category id" });
    }
    console.error("getBooks error:", error.name);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/books/archived
// Admin only.
export const getArchivedBooks = async (req, res) => {
  try {
    const books = await Book.find({ isActive: false }).populate("category", "name slug");
    res.json(books);
  } catch (error) {
    console.error("getArchivedBooks error:", error.name);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/books/:id
// Public.
export const getBookById = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id).populate("category", "name slug");

    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    res.json(book);
  } catch (error) {
    console.error("getBookById error:", error.name);
    res.status(500).json({ message: "Server error" });
  }
};

// POST /api/books
// Admin only.
export const createBook = async (req, res) => {
  try {
    const { title, author, isbn, price, stock, description, coverImage, category } = req.body;

    if (!title || !author || !isbn || price === undefined || !category) {
      return res.status(400).json({
        message: "title, author, isbn, price, and category are required",
      });
    }

    const book = await Book.create({
      title,
      author,
      isbn,
      price,
      stock,
      description,
      coverImage,
      category,
    });

    res.status(201).json(book);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "A book with this ISBN already exists" });
    }
    if (error.name === "ValidationError" || error.name === "CastError") {
      return res.status(400).json({ message: error.message });
    }
    console.error("createBook error:", error.name);
    res.status(500).json({ message: "Server error" });
  }
};

// PUT /api/books/:id
// Admin only.
export const updateBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    const editableFields = [
      "title",
      "author",
      "isbn",
      "price",
      "stock",
      "description",
      "coverImage",
      "category",
    ];

    editableFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        book[field] = req.body[field];
      }
    });

    await book.save();
    res.json(book);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "A book with this ISBN already exists" });
    }
    if (error.name === "ValidationError" || error.name === "CastError") {
      return res.status(400).json({ message: error.message });
    }
    console.error("updateBook error:", error.name);
    res.status(500).json({ message: "Server error" });
  }
};

// DELETE /api/books/:id
// Admin only. Soft-delete: sets isActive to false so Order/Review
// references stay valid.
export const archiveBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    book.isActive = false;
    await book.save();

    res.json({ message: "Book archived", book });
  } catch (error) {
    console.error("archiveBook error:", error.name);
    res.status(500).json({ message: "Server error" });
  }
};

// PATCH /api/books/:id/restore
// Admin only.
export const restoreBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    book.isActive = true;
    await book.save();

    res.json({ message: "Book restored", book });
  } catch (error) {
    console.error("restoreBook error:", error.name);
    res.status(500).json({ message: "Server error" });
  }
};
import Review from "../models/Review.js";
import Book from "../models/Book.js";
import Order from "../models/Order.js";

// POST /api/books/:id/reviews
// Protected. Further gated: the logged-in user must have a delivered order
// containing this specific book — reviews are restricted to verified
// purchases that have actually arrived, not just anyone logged in.
// body: { rating, comment }
export const createReview = async (req, res) => {
  try {
    const { id: bookId } = req.params;
    const { rating, comment = "" } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

    const book = await Book.findById(bookId);
    if (!book || !book.isActive) {
      return res.status(404).json({ message: "Book not found" });
    }

    const qualifyingOrder = await Order.findOne({
      user: req.user.userId,
      status: "paid",
      fulfillmentStatus: "delivered",
      "items.book": bookId,
    });

    if (!qualifyingOrder) {
      return res.status(403).json({
        message: "You can only review books from an order that's been delivered to you",
      });
    }

    const review = await Review.create({
      book: bookId,
      user: req.user.userId,
      rating,
      comment,
    });

    await review.populate("user", "name");
    res.status(201).json(review);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "You've already reviewed this book" });
    }
    if (error.name === "ValidationError" || error.name === "CastError") {
      return res.status(400).json({ message: error.message });
    }
    console.error("createReview error:", error.name);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/books/:id/reviews
// Public. Newest first, with reviewer name populated.
export const getBookReviews = async (req, res) => {
  try {
    const { id: bookId } = req.params;

    const reviews = await Review.find({ book: bookId })
      .populate("user", "name")
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid book id" });
    }
    console.error("getBookReviews error:", error.name);
    res.status(500).json({ message: "Server error" });
  }
};
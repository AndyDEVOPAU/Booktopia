import mongoose, { Schema } from "mongoose";

const reviewSchema = new Schema(
  {
    book: { type: Schema.Types.ObjectId, ref: "Book", required: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, trim: true, maxlength: 1000, default: "" },
  },
  { timestamps: true }
);

// One review per user per book — Mongo enforces this at the DB level via
// a compound unique index, in addition to whatever check the route does.
reviewSchema.index({ book: 1, user: 1 }, { unique: true });

export default mongoose.model("Review", reviewSchema);
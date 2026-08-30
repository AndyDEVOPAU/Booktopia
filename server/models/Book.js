import mongoose, { Schema } from 'mongoose';

const bookSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    author: {
      type: String,
      required: [true, 'Author is required'],
      trim: true,
      maxlength: [100, 'Author cannot exceed 100 characters'],
    },
    isbn: {
      type: String,
      required: [true, 'ISBN is required'],
      unique: true,
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    stock: {
      type: Number,
      required: true,
      min: [0, 'Stock cannot be negative'],
      default: 0,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    coverImage: {
      // Cloudinary URL
      type: String,
      default: '',
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required'],
    },
    // Soft-delete flag: same reasoning as Category. Orders reference
    // bookId, so hard-deleting a book would break historical order
    // records. Archived books are hidden from catalog/search but
    // existing Order/Review references stay valid.
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

bookSchema.index({ title: 'text', author: 'text' });

export default mongoose.model('Book', bookSchema);
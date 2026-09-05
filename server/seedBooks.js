// seedBooks.js
//
// Usage: run this from your server directory with:
//   node seedBooks.js
//
// Generates 20 books per category (200 total), looking up each
// category by name so books reference the REAL ObjectId from your
// database (not a hardcoded/fake one). Safe to re-run: skips
// creating a book if one with the same ISBN already exists.

import dotenv from "dotenv";
import connectDB from "./config/db.js";
import Category from "./models/Category.js";
import Book from "./models/Book.js";
import mongoose from "mongoose";

dotenv.config();

const BOOKS_PER_CATEGORY = 20;

// Word pools per category, used to generate plausible-sounding titles.
// Not real books — fine for dev/testing data.
const CATEGORY_WORDS = {
  Fiction: {
    adjectives: ["Quiet", "Distant", "Unspoken", "Hollow", "Faded", "Gentle", "Restless", "Silent", "Broken", "Lingering"],
    nouns: ["Orchard", "Harbor", "Letter", "Garden", "Season", "River", "House", "Afternoon", "Promise", "Shore"],
  },
  "Non-Fiction": {
    adjectives: ["Unseen", "Modern", "Hidden", "Ordinary", "Complete", "Brief", "Untold", "Practical", "Honest", "Curious"],
    nouns: ["History", "Ledger", "Mind", "City", "Economy", "Century", "Idea", "Argument", "Record", "Theory"],
  },
  "Science Fiction": {
    adjectives: ["Last", "Distant", "Silent", "Fractured", "Orbital", "Synthetic", "Forgotten", "Quantum", "Drifting", "Ancient"],
    nouns: ["Signal", "Colony", "Horizon", "Engine", "Station", "Frontier", "Code", "Drift", "Archive", "Reactor"],
  },
  Fantasy: {
    adjectives: ["Ember", "Ninefold", "Ashen", "Silver", "Forgotten", "Wandering", "Cursed", "Hollow", "Gilded", "Shattered"],
    nouns: ["Oath", "Court", "Gate", "Crown", "Kingdom", "Blade", "Grove", "Throne", "Legacy", "Prophecy"],
  },
  "Mystery & Thriller": {
    adjectives: ["Fifth", "Cold", "Quiet", "Missing", "Final", "Silent", "Hidden", "Last", "Dark", "Unsolved"],
    nouns: ["Witness", "Case", "Detective", "Alibi", "Confession", "Suspect", "Ledger", "Evidence", "Verdict", "Silence"],
  },
  Romance: {
    adjectives: ["Second", "Sweet", "Unexpected", "Quiet", "Lasting", "Warm", "Gentle", "Golden", "Tender", "Familiar"],
    nouns: ["Chance", "Summer", "Letter", "Promise", "Reunion", "Bookshop", "Wedding", "Garden", "Harbor", "Homecoming"],
  },
  Biography: {
    adjectives: ["Quiet", "Long", "Unfinished", "Remarkable", "Complete", "Untold", "Early", "Later", "Lasting", "True"],
    nouns: ["Life", "Apprenticeship", "Journey", "Legacy", "Years", "Voice", "Path", "Career", "Story", "Revolution"],
  },
  "Self-Help": {
    adjectives: ["Small", "Daily", "Simple", "Lasting", "Quiet", "Practical", "Honest", "Gentle", "Steady", "Mindful"],
    nouns: ["Habits", "Discipline", "Focus", "Change", "Balance", "Clarity", "Growth", "Routine", "Purpose", "Rest"],
  },
  "Children's Books": {
    adjectives: ["Sleepy", "Tiny", "Little", "Brave", "Curious", "Friendly", "Silly", "Gentle", "Happy", "Wandering"],
    nouns: ["Fox", "Turtle", "Boat", "Balloon", "Garden", "Friend", "Adventure", "Cloud", "Forest", "Star"],
  },
  Poetry: {
    adjectives: ["Quiet", "Small", "Salt", "Late", "Slow", "Soft", "Winter", "Early", "Fading", "Still"],
    nouns: ["Hour", "Weather", "River", "Fieldnotes", "Orchard", "Silence", "Season", "Light", "Garden", "Distance"],
  },
};

const FIRST_NAMES = ["Elena", "Owen", "Priya", "Liam", "Nadia", "Marcus", "Sofia", "Tomas", "Aiko", "Daniel", "Vera", "Idris", "Renata", "Callum", "Mei", "Brannon", "Isolde", "Rowan", "Serina", "Dorian"];
const LAST_NAMES = ["Marsh", "Vance", "Nandan", "Ferro", "Kessler", "Bell", "Reyes", "Berg", "Tanaka", "Frost", "Okonkwo", "Wray", "Solis", "Ash", "Zhou", "Voss", "Marrow", "Fitch", "Vale", "Hale"];

function randomFrom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateBooksForCategory(categoryName, categorySlug, count) {
  const words = CATEGORY_WORDS[categoryName] || { adjectives: ["Notable"], nouns: ["Title"] };
  const books = [];
  const usedTitles = new Set();

  for (let i = 1; i <= count; i++) {
    let title;
    do {
      title = `The ${randomFrom(words.adjectives)} ${randomFrom(words.nouns)}`;
    } while (usedTitles.has(title));
    usedTitles.add(title);

    const author = `${randomFrom(FIRST_NAMES)} ${randomFrom(LAST_NAMES)}`;
    const isbn = `978-0-00-${categorySlug.slice(0, 3)}-${String(i).padStart(4, "0")}`;
    const price = Number((Math.random() * 20 + 8).toFixed(2));
    const stock = Math.floor(Math.random() * 35) + 5;

    books.push({
      title,
      author,
      isbn,
      price,
      stock,
      description: `${title} by ${author} — a title in our ${categoryName} collection.`,
      // Placeholder cover — picsum.photos generates a real (but random,
      // non-book) photo per seed value. Using the isbn as the seed
      // means the same book always gets the same placeholder image
      // instead of a new random one on every page load.
      coverImage: `https://picsum.photos/seed/${isbn}/400/600`,
    });
  }

  return books;
}

async function seedBooks() {
  await connectDB();

  let created = 0;
  let skippedNoCategory = 0;
  let skippedDuplicate = 0;

  const categories = await Category.find({ isActive: true });

  if (categories.length === 0) {
    console.warn("No active categories found — create your categories first, then re-run this script.");
  }

  for (const category of categories) {
    const books = generateBooksForCategory(category.name, category.slug, BOOKS_PER_CATEGORY);

    for (const book of books) {
      const exists = await Book.findOne({ isbn: book.isbn });
      if (exists) {
        skippedDuplicate += 1;
        continue;
      }

      await Book.create({
        ...book,
        category: category._id,
      });
      created += 1;
    }
  }

  console.log(`Done. Created: ${created}, skipped (duplicate ISBN): ${skippedDuplicate}, skipped (no matching category): ${skippedNoCategory}`);
  await mongoose.connection.close();
  process.exit(0);
}

seedBooks().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
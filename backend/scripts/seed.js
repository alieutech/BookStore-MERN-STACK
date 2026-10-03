// Adds 10 sample books to the database in DATABASE_URI, e.g. your live MongoDB Atlas database.
// Books that are already there (same title and author) are skipped, so it is safe to run again.
//
// Usage (from the backend folder):
//   DATABASE_URI="mongodb+srv://user:password@cluster0.xxxxx.mongodb.net/bookstore?retryWrites=true&w=majority" npm run seed
require('dotenv').config();
const mongoose = require('mongoose');
const Books = require('../models/Books');
const sampleBooks = require('../data/sampleBooks');

const seed = async () => {
    if (!process.env.DATABASE_URI) {
        throw new Error('Set DATABASE_URI to your MongoDB connection string first (see the comment at the top of this file).');
    }
    await mongoose.connect(process.env.DATABASE_URI);
    console.log(`Connected to database "${mongoose.connection.name}".`);

    const existing = await Books.find({}, { title: 1, author: 1 }).lean();
    const have = new Set(existing.map((book) => `${book.title}|${book.author}`));
    const missing = sampleBooks.filter((book) => !have.has(`${book.title}|${book.author}`));

    if (missing.length === 0) {
        console.log('All sample books are already in the store. Nothing to add.');
        return;
    }
    await Books.insertMany(missing);
    console.log(`Added ${missing.length} book(s):`);
    for (const book of missing) console.log(`  - ${book.title} (${book.author})`);
};

seed()
    .catch((err) => {
        console.error('Seeding failed:', err.message);
        process.exitCode = 1;
    })
    .finally(() => mongoose.disconnect());

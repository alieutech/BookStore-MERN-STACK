const mongoose = require('mongoose');
const Books = require('../models/Books');
const Review = require('../models/Review');

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

const SORT_OPTIONS = {
    newest: { createdAt: -1 },
    oldest: { createdAt: 1 },
    price_asc: { price: 1, createdAt: -1 },
    price_desc: { price: -1, createdAt: -1 },
    title: { title: 1 },
    rating: { averageRating: -1, numReviews: -1 },
};
const BOOK_FIELDS = ['title', 'author', 'publishYear', 'price', 'image', 'category', 'description', 'stock'];

// Escape user text so it is matched literally inside a regular expression
const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Fetch Books, optionally filtered and sorted:
// ?q=text (title or author) &category=Name &minPrice=5 &maxPrice=20 &sort=newest|oldest|price_asc|price_desc|title|rating
const getBooks = async (req, res, next) => {
    const { q, category, minPrice, maxPrice, sort = 'newest' } = req.query;
    const filter = {};

    if (typeof q === 'string' && q.trim()) {
        const pattern = new RegExp(escapeRegex(q.trim()), 'i');
        filter.$or = [{ title: pattern }, { author: pattern }];
    }
    if (typeof category === 'string' && category.trim()) {
        filter.category = category.trim();
    }
    for (const [key, op] of [[minPrice, '$gte'], [maxPrice, '$lte']]) {
        if (key === undefined || key === '') continue;
        const value = Number(key);
        if (Number.isNaN(value) || value < 0) {
            return res.status(400).json({ success: false, message: 'minPrice and maxPrice must be positive numbers.' });
        }
        filter.price = { ...filter.price, [op]: value };
    }
    if (!Object.hasOwn(SORT_OPTIONS, sort)) {
        return res.status(400).json({ success: false, message: `sort must be one of: ${Object.keys(SORT_OPTIONS).join(', ')}.` });
    }

    try {
        const books = await Books.find(filter).sort(SORT_OPTIONS[sort]);
        res.status(200).json({ success: true, data: books });
    } catch (err) {
        next(err);
    }
};

// List the categories that have at least one book
const getCategories = async (req, res, next) => {
    try {
        const categories = (await Books.distinct('category')).filter(Boolean).sort((a, b) => a.localeCompare(b));
        res.status(200).json({ success: true, data: categories });
    } catch (err) {
        next(err);
    }
};

// Create new Book
const createNewBook = async (req, res, next) => {
    const { title, author, publishYear, price, image, category, description, stock } = req.body;
    if (!title || !author || !publishYear || !price || !image) {
        return res.status(400).json({ success: false, message: 'title, author, publishYear, price and image are required.' });
    }
    try {
        const book = await Books.create({ title, author, publishYear, price, image, category: category || undefined, description, stock });
        res.status(201).json({ success: true, message: 'Book created successfully.', data: book });
    } catch (err) {
        next(err);
    }
};

// Update Book by ID
const updateBooks = async (req, res, next) => {
    const { id } = req.params;
    if (!isValidId(id)) {
        return res.status(400).json({ success: false, message: `Invalid book ID ${id}.` });
    }
    try {
        // Only update the fields that were sent
        const updates = {};
        for (const field of BOOK_FIELDS) {
            if (req.body[field] !== undefined) updates[field] = req.body[field];
        }
        const book = await Books.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
        if (!book) {
            return res.status(404).json({ success: false, message: `No book matches ID ${id}.` });
        }
        res.status(200).json({ success: true, message: 'Book updated successfully.', data: book });
    } catch (err) {
        next(err);
    }
};

// Get Book by ID
const getBook = async (req, res, next) => {
    const { id } = req.params;
    if (!isValidId(id)) {
        return res.status(400).json({ success: false, message: `Invalid book ID ${id}.` });
    }
    try {
        const book = await Books.findById(id).exec();
        if (!book) {
            return res.status(404).json({ success: false, message: `No book matches ID ${id}.` });
        }
        res.status(200).json({ success: true, data: book });
    } catch (err) {
        next(err);
    }
};

// Delete Book by ID
const deleteBook = async (req, res, next) => {
    const { id } = req.params;
    if (!isValidId(id)) {
        return res.status(400).json({ success: false, message: `Invalid book ID ${id}.` });
    }
    try {
        const book = await Books.findByIdAndDelete(id);
        if (!book) {
            return res.status(404).json({ success: false, message: `No book matches ID ${id}.` });
        }
        await Review.deleteMany({ book: id });
        res.status(200).json({ success: true, message: `Book with ID ${id} deleted successfully.`, data: book });
    } catch (err) {
        next(err);
    }
};

module.exports = { getBooks, getCategories, createNewBook, updateBooks, getBook, deleteBook };

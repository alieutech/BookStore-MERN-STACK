const mongoose = require('mongoose');
const Books = require('../models/Books');

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

// Fetch all Books
const getBooks = async (req, res, next) => {
    try {
        const books = await Books.find();
        res.status(200).json({ success: true, data: books });
    } catch (err) {
        next(err);
    }
};

// Create new Book
const createNewBook = async (req, res, next) => {
    const { title, author, publishYear, price, image } = req.body;
    if (!title || !author || !publishYear || !price || !image) {
        return res.status(400).json({ success: false, message: 'title, author, publishYear, price and image are required.' });
    }
    try {
        const book = await Books.create({ title, author, publishYear, price, image });
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
        for (const field of ['title', 'author', 'publishYear', 'price', 'image']) {
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
        res.status(200).json({ success: true, message: `Book with ID ${id} deleted successfully.`, data: book });
    } catch (err) {
        next(err);
    }
};

module.exports = { getBooks, createNewBook, updateBooks, getBook, deleteBook };

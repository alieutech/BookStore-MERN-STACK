const mongoose = require('mongoose');


const books = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    author: {
        type: String,
        required: true
    },
    publishYear: {
        type: Number,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    category: {
        type: String,
        trim: true,
        default: 'General'
    },
    description: {
        type: String,
        trim: true,
        default: ''
    }
}, { timestamps: true })


// Speeds up category filters and the default "newest first" sort
books.index({ category: 1 });
books.index({ createdAt: -1 });

module.exports = mongoose.model('Books', books);

const mongoose = require('mongoose');

const review = new mongoose.Schema({
    book: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Books',
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    comment: {
        type: String,
        trim: true,
        maxlength: 1000,
        default: ''
    },
    // True when the reviewer has a (non-cancelled) order containing this book
    verifiedPurchase: {
        type: Boolean,
        default: false
    }
}, { timestamps: true })

// One review per user per book
review.index({ book: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('Review', review);

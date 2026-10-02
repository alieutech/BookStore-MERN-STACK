const mongoose = require('mongoose');
const Books = require('../models/Books');
const Order = require('../models/Order');
const Review = require('../models/Review');

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);
const MAX_COMMENT_LENGTH = 1000;

// Recalculate a book's average rating and review count from its reviews
const updateBookRating = async (bookId) => {
    const [stats] = await Review.aggregate([
        { $match: { book: new mongoose.Types.ObjectId(String(bookId)) } },
        { $group: { _id: '$book', average: { $avg: '$rating' }, count: { $sum: 1 } } },
    ]);
    await Books.findByIdAndUpdate(bookId, {
        averageRating: stats ? Math.round(stats.average * 10) / 10 : 0,
        numReviews: stats ? stats.count : 0,
    });
};

// Reviews of a book, newest first
const getReviews = async (req, res, next) => {
    const { id } = req.params;
    if (!isValidId(id)) {
        return res.status(400).json({ success: false, message: `Invalid book ID ${id}.` });
    }
    try {
        const reviews = await Review.find({ book: id }).sort({ createdAt: -1 }).populate('user', 'name');
        res.status(200).json({ success: true, data: reviews });
    } catch (err) {
        next(err);
    }
};

// Add or update the logged-in user's review of a book
const saveReview = async (req, res, next) => {
    const { id } = req.params;
    const { rating, comment = '' } = req.body;
    if (!isValidId(id)) {
        return res.status(400).json({ success: false, message: `Invalid book ID ${id}.` });
    }
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
        return res.status(400).json({ success: false, message: 'Rating must be a whole number from 1 to 5.' });
    }
    if (typeof comment !== 'string' || comment.length > MAX_COMMENT_LENGTH) {
        return res.status(400).json({ success: false, message: `Comment must be text of at most ${MAX_COMMENT_LENGTH} characters.` });
    }
    try {
        if (!(await Books.exists({ _id: id }))) {
            return res.status(404).json({ success: false, message: `No book matches ID ${id}.` });
        }
        const verifiedPurchase = Boolean(
            await Order.exists({ user: req.user._id, 'items.book': id, status: { $ne: 'cancelled' } })
        );
        const existing = await Review.exists({ book: id, user: req.user._id });
        const review = await Review.findOneAndUpdate(
            { book: id, user: req.user._id },
            { rating, comment: comment.trim(), verifiedPurchase },
            { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
        ).populate('user', 'name');
        await updateBookRating(id);
        res.status(existing ? 200 : 201).json({
            success: true,
            message: existing ? 'Your review was updated.' : 'Thanks for your review!',
            data: review,
        });
    } catch (err) {
        next(err);
    }
};

// Delete a review: its author or an admin
const deleteReview = async (req, res, next) => {
    const { id, reviewId } = req.params;
    if (!isValidId(id) || !isValidId(reviewId)) {
        return res.status(400).json({ success: false, message: 'Invalid book or review ID.' });
    }
    try {
        const review = await Review.findOne({ _id: reviewId, book: id });
        if (!review || (req.user.role !== 'admin' && !review.user.equals(req.user._id))) {
            return res.status(404).json({ success: false, message: `No review matches ID ${reviewId}.` });
        }
        await review.deleteOne();
        await updateBookRating(id);
        res.status(200).json({ success: true, message: 'Review deleted.' });
    } catch (err) {
        next(err);
    }
};

module.exports = { getReviews, saveReview, deleteReview };

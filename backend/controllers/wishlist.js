const mongoose = require('mongoose');
const Books = require('../models/Books');
const User = require('../models/User');

const MAX_WISHLIST = 200;
const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

const wishlistIds = (user) => (user?.wishlist || []).map(String);

// The logged-in user's saved books, most recently saved first
const getWishlist = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id).populate('wishlist');
        // Books deleted since they were saved come back as null; leave them out
        const books = user.wishlist.filter(Boolean).reverse();
        res.status(200).json({ success: true, data: books });
    } catch (err) {
        next(err);
    }
};

// Save a book (saving it again does nothing)
const addToWishlist = async (req, res, next) => {
    const { bookId } = req.params;
    if (!isValidId(bookId)) {
        return res.status(400).json({ success: false, message: `Invalid book ID ${bookId}.` });
    }
    try {
        if (!(await Books.exists({ _id: bookId }))) {
            return res.status(404).json({ success: false, message: `No book matches ID ${bookId}.` });
        }
        // Only add while there is room, in one atomic update
        const user = await User.findOneAndUpdate(
            { _id: req.user._id, [`wishlist.${MAX_WISHLIST - 1}`]: { $exists: false } },
            { $addToSet: { wishlist: bookId } },
            { new: true }
        );
        if (!user) {
            const current = await User.findById(req.user._id);
            if (!wishlistIds(current).includes(bookId)) {
                return res.status(409).json({ success: false, message: `Your wishlist is full (${MAX_WISHLIST} books). Remove some to save more.` });
            }
            return res.status(200).json({ success: true, message: 'Saved to your wishlist.', data: wishlistIds(current) });
        }
        res.status(200).json({ success: true, message: 'Saved to your wishlist.', data: wishlistIds(user) });
    } catch (err) {
        next(err);
    }
};

// Remove a book (removing one that isn't saved does nothing)
const removeFromWishlist = async (req, res, next) => {
    const { bookId } = req.params;
    if (!isValidId(bookId)) {
        return res.status(400).json({ success: false, message: `Invalid book ID ${bookId}.` });
    }
    try {
        const user = await User.findByIdAndUpdate(req.user._id, { $pull: { wishlist: bookId } }, { new: true });
        res.status(200).json({ success: true, message: 'Removed from your wishlist.', data: wishlistIds(user) });
    } catch (err) {
        next(err);
    }
};

module.exports = { getWishlist, addToWishlist, removeFromWishlist, MAX_WISHLIST };

const mongoose = require('mongoose');

const user = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        select: false
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    // Books saved for later, oldest first (see controllers/wishlist.js)
    wishlist: {
        type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Books' }],
        default: []
    }
}, { timestamps: true })

// Never send the password hash back to clients
user.set('toJSON', {
    transform: (doc, ret) => {
        delete ret.password;
        delete ret.wishlist; // served by /me/wishlist instead
        delete ret.__v;
        return ret;
    }
});

module.exports = mongoose.model('User', user);

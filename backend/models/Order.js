const mongoose = require('mongoose');

const ORDER_STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

// A snapshot of the book at the time of ordering, so later edits or deletes don't change past orders
const orderItem = new mongoose.Schema({
    book: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Books',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    image: String,
    price: {
        type: Number,
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    }
}, { _id: false })

const shippingAddress = new mongoose.Schema({
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    country: { type: String, required: true }
}, { _id: false })

const order = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    items: {
        type: [orderItem],
        validate: [(items) => items.length > 0, 'An order needs at least one item.']
    },
    shippingAddress: {
        type: shippingAddress,
        required: true
    },
    paymentMethod: {
        type: String,
        enum: ['cash_on_delivery'],
        default: 'cash_on_delivery'
    },
    totalPrice: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ORDER_STATUSES,
        default: 'pending'
    }
}, { timestamps: true })

module.exports = mongoose.model('Order', order);
module.exports.ORDER_STATUSES = ORDER_STATUSES;

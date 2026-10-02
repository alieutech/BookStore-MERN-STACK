const mongoose = require('mongoose');
const Books = require('../models/Books');
const Order = require('../models/Order');
const { ORDER_STATUSES } = require('../models/Order');

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

const MAX_QUANTITY = 99;
const ADDRESS_FIELDS = ['fullName', 'phone', 'address', 'city', 'country'];

// Round money to 2 decimal places
const roundMoney = (amount) => Math.round(amount * 100) / 100;

// Put an order's items back into stock (after a cancellation or a failed order)
const restock = (items) =>
    Promise.all(items.map(({ book, quantity }) => Books.updateOne({ _id: book }, { $inc: { stock: quantity } })));

// Place an order for the logged-in user. Prices come from the database, not the client.
const createOrder = async (req, res, next) => {
    const { items, shippingAddress } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ success: false, message: 'Your cart is empty.' });
    }
    for (const item of items) {
        if (!item || !isValidId(item.book) || !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > MAX_QUANTITY) {
            return res.status(400).json({ success: false, message: `Each item needs a valid book and a quantity from 1 to ${MAX_QUANTITY}.` });
        }
    }
    const missing = ADDRESS_FIELDS.filter(
        (field) => typeof shippingAddress?.[field] !== 'string' || shippingAddress[field].trim() === ''
    );
    if (missing.length > 0) {
        return res.status(400).json({ success: false, message: `Shipping address is missing: ${missing.join(', ')}.` });
    }

    try {
        // Merge duplicate lines for the same book
        const quantities = new Map();
        for (const { book, quantity } of items) {
            quantities.set(String(book), (quantities.get(String(book)) || 0) + quantity);
        }

        const books = await Books.find({ _id: { $in: [...quantities.keys()] } });
        if (books.length !== quantities.size) {
            return res.status(400).json({ success: false, message: 'Some books in your cart are no longer available. Please refresh your cart.' });
        }

        // Reserve stock one book at a time. Each update only succeeds if enough copies are left,
        // so two customers can never buy the same last copy. Undo the reservations if any fails.
        const reserved = [];
        for (const book of books) {
            const quantity = quantities.get(String(book._id));
            const updated = await Books.updateOne({ _id: book._id, stock: { $gte: quantity } }, { $inc: { stock: -quantity } });
            if (updated.modifiedCount === 0) {
                await restock(reserved);
                const left = (await Books.findById(book._id))?.stock ?? 0;
                return res.status(409).json({
                    success: false,
                    message: left > 0 ? `Only ${left} ${left === 1 ? 'copy' : 'copies'} of "${book.title}" left.` : `"${book.title}" is out of stock.`,
                });
            }
            reserved.push({ book: book._id, quantity });
        }

        const orderItems = books.map((book) => ({
            book: book._id,
            title: book.title,
            image: book.image,
            price: book.price,
            quantity: quantities.get(String(book._id)),
        }));
        const totalPrice = roundMoney(orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0));

        let order;
        try {
            order = await Order.create({
                user: req.user._id,
                items: orderItems,
                shippingAddress: Object.fromEntries(ADDRESS_FIELDS.map((field) => [field, shippingAddress[field].trim()])),
                totalPrice,
            });
        } catch (err) {
            await restock(reserved);
            throw err;
        }
        res.status(201).json({ success: true, message: 'Order placed successfully.', data: order });
    } catch (err) {
        next(err);
    }
};

// Orders of the logged-in user, newest first
const getMyOrders = async (req, res, next) => {
    try {
        const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: orders });
    } catch (err) {
        next(err);
    }
};

// All orders (admin), newest first
const getAllOrders = async (req, res, next) => {
    try {
        const orders = await Order.find().sort({ createdAt: -1 }).populate('user', 'name email');
        res.status(200).json({ success: true, data: orders });
    } catch (err) {
        next(err);
    }
};

// One order: its owner or an admin can see it
const getOrder = async (req, res, next) => {
    const { id } = req.params;
    if (!isValidId(id)) {
        return res.status(400).json({ success: false, message: `Invalid order ID ${id}.` });
    }
    try {
        const order = await Order.findById(id).populate('user', 'name email');
        // Answer 404 for other people's orders so their existence isn't revealed
        if (!order || (req.user.role !== 'admin' && !order.user?._id.equals(req.user._id))) {
            return res.status(404).json({ success: false, message: `No order matches ID ${id}.` });
        }
        res.status(200).json({ success: true, data: order });
    } catch (err) {
        next(err);
    }
};

// Cancel your own order while it is still pending
const cancelOrder = async (req, res, next) => {
    const { id } = req.params;
    if (!isValidId(id)) {
        return res.status(400).json({ success: false, message: `Invalid order ID ${id}.` });
    }
    try {
        // Only flip pending -> cancelled once, even if two requests arrive together
        const order = await Order.findOneAndUpdate(
            { _id: id, user: req.user._id, status: 'pending' },
            { status: 'cancelled' },
            { new: true }
        );
        if (!order) {
            const existing = await Order.findOne({ _id: id, user: req.user._id });
            if (!existing) {
                return res.status(404).json({ success: false, message: `No order matches ID ${id}.` });
            }
            return res.status(409).json({ success: false, message: `This order is already ${existing.status} and can no longer be cancelled.` });
        }
        await restock(order.items);
        res.status(200).json({ success: true, message: 'Order cancelled.', data: order });
    } catch (err) {
        next(err);
    }
};

// Change an order's status (admin)
const updateOrderStatus = async (req, res, next) => {
    const { id } = req.params;
    const { status } = req.body;
    if (!isValidId(id)) {
        return res.status(400).json({ success: false, message: `Invalid order ID ${id}.` });
    }
    if (!ORDER_STATUSES.includes(status)) {
        return res.status(400).json({ success: false, message: `Status must be one of: ${ORDER_STATUSES.join(', ')}.` });
    }
    try {
        // A cancelled order has already returned its stock, so it stays cancelled
        const order = await Order.findOneAndUpdate(
            { _id: id, status: { $ne: 'cancelled' } },
            { status },
            { new: true, runValidators: true }
        ).populate('user', 'name email');
        if (!order) {
            if (await Order.exists({ _id: id })) {
                return res.status(409).json({ success: false, message: 'Cancelled orders cannot be changed.' });
            }
            return res.status(404).json({ success: false, message: `No order matches ID ${id}.` });
        }
        if (status === 'cancelled') {
            await restock(order.items);
        }
        res.status(200).json({ success: true, message: `Order marked as ${status}.`, data: order });
    } catch (err) {
        next(err);
    }
};

module.exports = { createOrder, getMyOrders, getAllOrders, getOrder, cancelOrder, updateOrderStatus };

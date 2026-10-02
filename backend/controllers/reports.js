const Books = require('../models/Books');
const Order = require('../models/Order');
const User = require('../models/User');

const LOW_STOCK_THRESHOLD = 5;
const SALES_DAYS = 30;

const roundMoney = (amount) => Math.round(amount * 100) / 100;
const toDayKey = (date) => date.toISOString().slice(0, 10);

// Sales dashboard numbers for admins. Cancelled orders don't count as sales.
const getSalesReport = async (req, res, next) => {
    try {
        const since = new Date();
        since.setUTCHours(0, 0, 0, 0);
        since.setUTCDate(since.getUTCDate() - (SALES_DAYS - 1));
        const sold = { status: { $ne: 'cancelled' } };

        const [[totals], [itemTotals], byStatus, daily, topBooks, lowStock, customers] = await Promise.all([
            Order.aggregate([{ $match: sold }, { $group: { _id: null, revenue: { $sum: '$totalPrice' }, orders: { $sum: 1 } } }]),
            Order.aggregate([{ $match: sold }, { $unwind: '$items' }, { $group: { _id: null, itemsSold: { $sum: '$items.quantity' } } }]),
            Order.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
            Order.aggregate([
                { $match: { ...sold, createdAt: { $gte: since } } },
                { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, revenue: { $sum: '$totalPrice' }, orders: { $sum: 1 } } },
            ]),
            Order.aggregate([
                { $match: sold },
                { $unwind: '$items' },
                {
                    $group: {
                        _id: '$items.book',
                        title: { $last: '$items.title' },
                        quantity: { $sum: '$items.quantity' },
                        revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
                    },
                },
                { $sort: { quantity: -1, revenue: -1 } },
                { $limit: 5 },
            ]),
            Books.find({ stock: { $lte: LOW_STOCK_THRESHOLD } }).sort({ stock: 1, title: 1 }).limit(10).select('title author stock'),
            User.countDocuments({ role: 'user' }),
        ]);

        // One entry per day, including days without sales
        const dailyByKey = new Map(daily.map((day) => [day._id, day]));
        const salesByDay = Array.from({ length: SALES_DAYS }, (_, i) => {
            const date = new Date(since);
            date.setUTCDate(since.getUTCDate() + i);
            const day = dailyByKey.get(toDayKey(date));
            return { date: toDayKey(date), revenue: roundMoney(day?.revenue || 0), orders: day?.orders || 0 };
        });

        const revenue = roundMoney(totals?.revenue || 0);
        const orders = totals?.orders || 0;
        res.status(200).json({
            success: true,
            data: {
                totals: {
                    revenue,
                    orders,
                    itemsSold: itemTotals?.itemsSold || 0,
                    averageOrderValue: orders ? roundMoney(revenue / orders) : 0,
                    customers,
                },
                ordersByStatus: Object.fromEntries(byStatus.map((status) => [status._id, status.count])),
                salesByDay,
                topBooks: topBooks.map((book) => ({ book: book._id, title: book.title, quantity: book.quantity, revenue: roundMoney(book.revenue) })),
                lowStock,
                lowStockThreshold: LOW_STOCK_THRESHOLD,
            },
        });
    } catch (err) {
        next(err);
    }
};

module.exports = { getSalesReport };

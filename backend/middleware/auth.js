const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Require a valid "Authorization: Bearer <token>" header and attach the user to req.user
const requireAuth = async (req, res, next) => {
    const header = req.headers.authorization || '';
    const [scheme, token] = header.split(' ');
    if (scheme !== 'Bearer' || !token) {
        return res.status(401).json({ success: false, message: 'Please log in to continue.' });
    }
    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(payload.sub);
        if (!user) {
            return res.status(401).json({ success: false, message: 'Your account no longer exists.' });
        }
        req.user = user;
        next();
    } catch (err) {
        if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
            return res.status(401).json({ success: false, message: 'Your session is invalid or has expired. Please log in again.' });
        }
        next(err);
    }
};

// Only allow users with the admin role (use after requireAuth)
const requireAdmin = (req, res, next) => {
    if (req.user?.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Only admins can do this.' });
    }
    next();
};

module.exports = { requireAuth, requireAdmin };

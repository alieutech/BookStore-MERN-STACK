const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;
// bcrypt only looks at the first 72 bytes, and very long inputs just waste CPU
const MAX_PASSWORD_LENGTH = 72;
const MAX_NAME_LENGTH = 100;

// Emails listed in ADMIN_EMAILS get the admin role when they register
const adminEmails = () =>
    (process.env.ADMIN_EMAILS || '')
        .split(',')
        .map((email) => email.trim().toLowerCase())
        .filter(Boolean);

const allStrings = (...values) => values.every((value) => typeof value === 'string' && value.trim() !== '');

const createToken = (user) =>
    jwt.sign({ sub: user._id.toString(), role: user.role }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    });

// Register a new user
const register = async (req, res, next) => {
    const { name, email, password } = req.body;
    if (!allStrings(name, email, password)) {
        return res.status(400).json({ success: false, message: 'name, email and password are required.' });
    }
    if (!EMAIL_PATTERN.test(email)) {
        return res.status(400).json({ success: false, message: 'Please enter a valid email address.' });
    }
    if (password.length < MIN_PASSWORD_LENGTH || Buffer.byteLength(password) > MAX_PASSWORD_LENGTH) {
        return res.status(400).json({ success: false, message: `Password must be ${MIN_PASSWORD_LENGTH} to ${MAX_PASSWORD_LENGTH} characters.` });
    }
    if (name.trim().length > MAX_NAME_LENGTH) {
        return res.status(400).json({ success: false, message: `Name must be at most ${MAX_NAME_LENGTH} characters.` });
    }
    try {
        const normalizedEmail = email.trim().toLowerCase();
        if (await User.exists({ email: normalizedEmail })) {
            return res.status(409).json({ success: false, message: 'An account with this email already exists.' });
        }
        const user = await User.create({
            name: name.trim(),
            email: normalizedEmail,
            password: await bcrypt.hash(password, 10),
            role: adminEmails().includes(normalizedEmail) ? 'admin' : 'user',
        });
        res.status(201).json({ success: true, message: 'Account created successfully.', data: { user, token: createToken(user) } });
    } catch (err) {
        next(err);
    }
};

// Log in with email and password
const login = async (req, res, next) => {
    const { email, password } = req.body;
    if (!allStrings(email, password)) {
        return res.status(400).json({ success: false, message: 'email and password are required.' });
    }
    if (Buffer.byteLength(password) > MAX_PASSWORD_LENGTH) {
        return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }
    try {
        const user = await User.findOne({ email: email.trim().toLowerCase() }).select('+password');
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ success: false, message: 'Invalid email or password.' });
        }
        res.status(200).json({ success: true, message: 'Logged in successfully.', data: { user, token: createToken(user) } });
    } catch (err) {
        next(err);
    }
};

// Return the logged-in user
const me = (req, res) => {
    res.status(200).json({ success: true, data: req.user });
};

module.exports = { register, login, me };

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const { UPLOAD_DIR } = require('./config/uploads');
const errorHandler = require('./middleware/errorHandler');
const { securityHeaders, authLimiter, apiLimiter } = require('./middleware/security');

// The Express app on its own (no database connection or port), so tests can use it directly
const app = express();
const API_PREFIXES = ['/auth', '/books', '/orders', '/reports', '/uploads', '/me'];
// Behind a reverse proxy (nginx, a load balancer...) set TRUST_PROXY=1 so rate limits see the real client IP
if (process.env.TRUST_PROXY) app.set('trust proxy', Number(process.env.TRUST_PROXY) || process.env.TRUST_PROXY);

app.use(securityHeaders);

// CORS configuration (comma-separated list of allowed origins)
const corsOptions = {
    origin: (process.env.CORS_ORIGIN || 'http://localhost:5173').split(',').map((o) => o.trim()),
    methods: 'GET,POST,PUT,DELETE',
};
app.use(cors(corsOptions));

// parse JSON and urlencoded form data (small bodies only; images go through /uploads)
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: false, limit: '100kb' }));

// Is the server up and connected to the database? Used by Render's health check.
app.get('/health', (req, res) => {
    const dbConnected = mongoose.connection.readyState === 1;
    res.status(dbConnected ? 200 : 503).json({ status: dbConnected ? 'ok' : 'unavailable', database: dbConnected ? 'connected' : 'disconnected' });
});

app.use(API_PREFIXES, apiLimiter);
app.use(['/auth/login', '/auth/register'], authLimiter);
app.use('/auth', require('./routers/auth'));
app.use('/books', require('./routers/books'));
app.use('/orders', require('./routers/orders'));
app.use('/reports', require('./routers/reports'));
app.use('/uploads', require('./routers/uploads'));
app.use('/me', require('./routers/me'));
// Uploaded cover images; nosniff stops browsers from treating them as anything but images
app.use('/uploads', express.static(UPLOAD_DIR, {
    maxAge: '7d',
    setHeaders: (res) => res.setHeader('X-Content-Type-Options', 'nosniff'),
}));

// Unknown API addresses and missing uploads get a JSON 404, not the app's HTML page
app.use(API_PREFIXES, (req, res) => {
    res.status(404).json({ success: false, message: `No route for ${req.method} ${req.originalUrl}.` });
});

// Serve the built frontend in production (build it with `npm run build` in frontend/ first)
if (process.env.NODE_ENV === 'production') {
    const distPath = path.join(__dirname, '..', 'frontend', 'dist');
    // Vite gives built files unique names, so browsers can keep them for a year;
    // index.html must always be fresh so new deploys show up straight away
    app.use('/assets', express.static(path.join(distPath, 'assets'), { maxAge: '1y', immutable: true }));
    app.use(express.static(distPath, { index: false, maxAge: '1h' }));
    app.get('*', (req, res) => {
        res.set('Cache-Control', 'no-cache');
        res.sendFile(path.join(distPath, 'index.html'));
    });
}

app.use(errorHandler);

module.exports = app;

const express = require('express');
const cors = require('cors');
const path = require('path');
const { UPLOAD_DIR } = require('./config/uploads');
const errorHandler = require('./middleware/errorHandler');
const { securityHeaders, authLimiter, apiLimiter } = require('./middleware/security');

// The Express app on its own (no database connection or port), so tests can use it directly
const app = express();
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

app.use(['/auth', '/books', '/orders', '/reports', '/uploads'], apiLimiter);
app.use(['/auth/login', '/auth/register'], authLimiter);
app.use('/auth', require('./routers/auth'));
app.use('/books', require('./routers/books'));
app.use('/orders', require('./routers/orders'));
app.use('/reports', require('./routers/reports'));
app.use('/uploads', require('./routers/uploads'));
// Uploaded cover images; nosniff stops browsers from treating them as anything but images
app.use('/uploads', express.static(UPLOAD_DIR, {
    maxAge: '7d',
    setHeaders: (res) => res.setHeader('X-Content-Type-Options', 'nosniff'),
}));

// Serve the built frontend in production (run `npm run build` from the repo root first)
if (process.env.NODE_ENV === 'production') {
    const distPath = path.join(__dirname, '..', 'frontend', 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => res.sendFile(path.join(distPath, 'index.html')));
}

app.use(errorHandler);

module.exports = app;

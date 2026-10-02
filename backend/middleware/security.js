const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const isProduction = process.env.NODE_ENV === 'production';

// Security headers. The CSP matters when this server also serves the built frontend:
// scripts only from this site, inline styles allowed for Chakra UI, images from anywhere over HTTPS.
const securityHeaders = helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", 'data:', 'https:'],
            connectSrc: ["'self'"],
            objectSrc: ["'none'"],
            frameAncestors: ["'none'"],
            // Don't force HTTPS sub-requests: the app may be served over plain HTTP (e.g. Docker on a LAN)
            upgradeInsecureRequests: null,
        },
    },
    // The dev frontend (port 5173) and API (port 3333) are the same site, so images still load
    crossOriginResourcePolicy: { policy: 'same-site' },
    hsts: isProduction,
});

const limitMessage = (message) => ({ success: false, message });

// Slow down password guessing: 10 failed logins/sign-ups per 15 minutes per IP
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: Number(process.env.AUTH_RATE_LIMIT) || 10,
    skipSuccessfulRequests: true,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: limitMessage('Too many attempts. Please wait 15 minutes and try again.'),
});

// A generous overall limit per IP to blunt scripted abuse
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: Number(process.env.API_RATE_LIMIT) || 1000,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: limitMessage('Too many requests. Please slow down and try again later.'),
});

// Refuse to start in production with a weak or example JWT secret
const checkJwtSecret = () => {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        return 'JWT_SECRET is not set. Copy backend/.env.example to backend/.env and fill it in.';
    }
    if (isProduction && (secret.length < 32 || /change-me/i.test(secret))) {
        return 'JWT_SECRET must be a random string of at least 32 characters in production (e.g. `openssl rand -hex 32`).';
    }
    return null;
};

module.exports = { securityHeaders, authLimiter, apiLimiter, checkJwtSecret };

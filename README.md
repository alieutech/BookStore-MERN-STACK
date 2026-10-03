# BookStore — MERN Stack

[![CI](https://github.com/alieutech/BookStore-MERN-STACK/actions/workflows/ci.yml/badge.svg)](https://github.com/alieutech/BookStore-MERN-STACK/actions/workflows/ci.yml)

An online bookstore built with **MongoDB, Express, React and Node.js**. Customers browse and search the catalog, read and write reviews, and order books with cash on delivery. Admins manage books, stock, cover images and orders, and follow sales on a dashboard.

This project is open for collaboration — see [Contributing](#contributing).

## Contents
- [Features](#features)
- [Tech stack](#tech-stack)
- [Getting started](#getting-started)
- [Configuration](#configuration)
- [Running in production](#running-in-production)
- [Tests and CI](#tests-and-ci)
- [Project structure](#project-structure)
- [How it works](#how-it-works)
- [API reference](#api-reference)
- [Contributing](#contributing)

## Features

**For customers**
- Browse the catalog 24 books per page, search by title or author, filter by category and price, and sort by newest, price, title or rating. Filters and the page number live in the URL, so they survive reloads, work with the back button and can be shared.
- A page for every book with its description, stock status and reviews.
- Sign up and log in; leave one 1–5 star review per book (marked **Verified purchase** if you ordered it).
- Save books for later with the heart button. The **Wishlist** is kept with your account, so it follows you to any device.
- A cart saved in the browser that always uses the latest prices and never exceeds the stock.
- Checkout with a shipping address and **cash on delivery**; track orders under **My orders** and cancel them while they are still pending.
- Light and dark mode, and layouts that work on phones.

**For admins**
- Add, edit and delete books, including category, description, stock and a cover image (paste a URL or upload a file).
- Manage every order and move it through `pending` → `processing` → `shipped` → `delivered` (or `cancelled`).
- A **Dashboard** with revenue, orders, books sold, average order value, customers, a 30-day revenue chart, orders by status, best sellers and low-stock books.

**Under the hood**
- Order totals are calculated on the server from database prices, and stock is reserved so the same copy can never be sold twice.
- Passwords hashed with bcrypt, JWT logins, security headers, rate limits on logins and the API, and request size limits.
- 33 API tests, frontend unit tests, linting and a Docker build run on every pull request.

## Tech stack

| Part | Built with |
| --- | --- |
| Frontend | React 18, Vite, Chakra UI, React Router, Zustand |
| Backend | Node.js 22, Express, Mongoose, JSON Web Tokens, bcrypt, multer, helmet, express-rate-limit |
| Database | MongoDB |
| Testing | Node's test runner + supertest (API), Vitest (frontend), ESLint |
| Tooling | Docker Compose, GitHub Actions |

## Getting started

### Option 1: Docker Compose (easiest)
Requires Docker.

```bash
docker compose up --build
```

- App: http://localhost:5173
- API: http://localhost:3333
- MongoDB: localhost:27017 (data kept in the `mongo-data` volume; uploaded covers in the `uploads` volume)

Compose uses a development-only `JWT_SECRET` and makes **admin@example.com** an admin. To use your own email, start it with:

```bash
ADMIN_EMAILS=you@example.com JWT_SECRET=$(openssl rand -hex 32) docker compose up --build
```

### Option 2: Run locally
Requires **Node.js 22+** and a running MongoDB (for example `docker run -d -p 27017:27017 mongo`).

Backend:
```bash
cd backend
cp .env.example .env    # then edit DATABASE_URI, JWT_SECRET and ADMIN_EMAILS
npm install
npm run dev             # http://localhost:3333
```

Frontend, in a second terminal:
```bash
cd frontend
npm install
npm run dev             # http://localhost:5173
```

The Vite dev server forwards API requests (`/auth`, `/books`, `/me`, `/orders`, `/reports`, `/uploads`) to the backend, so the browser only talks to port 5173.

### Create your admin account
Put your email in `ADMIN_EMAILS` **before** signing up, then sign up in the app with that email. Accounts get their role when they are created, so an account made before its email was added stays a normal user.

## Configuration

Backend settings are read from environment variables (or `backend/.env`; see [`backend/.env.example`](backend/.env.example)).

| Variable | Default | Description |
| --- | --- | --- |
| `DATABASE_URI` | **required** | MongoDB connection string |
| `JWT_SECRET` | **required** | Secret used to sign login tokens. In production it must be at least 32 random characters (`openssl rand -hex 32`) or the server won't start |
| `ADMIN_EMAILS` | (none) | Comma-separated emails that get the admin role when they sign up |
| `PORT` | `3333` | Port the API listens on |
| `CORS_ORIGIN` | `http://localhost:5173` | Comma-separated origins allowed to call the API |
| `JWT_EXPIRES_IN` | `7d` | How long a login lasts |
| `UPLOAD_DIR` | `backend/uploads` | Folder for uploaded cover images |
| `TRUST_PROXY` | (off) | Set to `1` behind a reverse proxy so rate limits see the real client IP |
| `AUTH_RATE_LIMIT` | `10` | Failed logins/sign-ups allowed per IP per 15 minutes |
| `API_RATE_LIMIT` | `1000` | API requests allowed per IP per 15 minutes |

Frontend settings (optional, at build time):

| Variable | Default | Description |
| --- | --- | --- |
| `VITE_API_URL` | (empty) | Call the API at this URL instead of through the dev proxy / same origin |
| `API_PROXY_TARGET` | `http://localhost:3333` | Where the Vite dev server forwards API requests |

## Running in production

The backend can serve the built frontend itself, so the whole app runs on one port:

```bash
cd frontend && npm ci && npm run build      # creates frontend/dist
cd ../backend && npm ci --omit=dev
NODE_ENV=production npm start               # serves the app and API on PORT (3333)
```

Before going live:
- Set a strong `JWT_SECRET` (`openssl rand -hex 32`) and a real `DATABASE_URI`.
- Set `CORS_ORIGIN` to your site's address, and `TRUST_PROXY=1` if you run behind nginx or a load balancer.
- Keep `UPLOAD_DIR` on persistent storage so cover images survive redeploys.
- Serve the site over HTTPS (HSTS is switched on in production).

> **Upgrading an existing database:** books created before inventory tracking start with a stock of 0 (the server sets this on startup and logs how many). Edit each book to set its stock, or orders for it will be refused.

## Tests and CI

```bash
# Backend API tests (needs MongoDB; each test file uses its own bookstore-test-* database, dropped afterwards)
cd backend
npm test
TEST_DATABASE_URI=mongodb://other-host:27017 npm test   # use another MongoDB

# Frontend
cd frontend
npm run lint     # fails on any warning
npm test         # unit tests
npm run build
```

[GitHub Actions](.github/workflows/ci.yml) runs the backend tests (against a MongoDB service), the frontend lint, tests and build, and `docker compose build` on every pull request and every push to `main`.

## Project structure

```
backend/
  app.js            Express app: middleware and routes
  server.js         Startup: checks settings, connects to MongoDB, starts listening
  config/           Database connection and upload folder
  controllers/      Request handlers (auth, books, reviews, orders, reports, uploads)
  middleware/       Login/admin checks, security headers and rate limits, error handler
  models/           Mongoose models: User, Books, Review, Order
  routers/          URL routes
  tests/            API tests
frontend/
  src/
    api/            Request helper (adds the login token)
    components/     NavBar, BookCard, filters, forms, charts, ...
    pages/          Home, book details, cart, checkout, orders, dashboard, login, ...
    store/          Zustand stores: auth, books, cart, orders
    hooks/ utils/   Shared helpers
    __tests__/      Unit tests
.github/workflows/  CI pipeline
docker-compose.yml  Frontend, backend and MongoDB for local use
```

## How it works

**Accounts and roles.** Anyone can browse. Logging in returns a JWT that the frontend stores and sends as `Authorization: Bearer <token>`. Admins (emails in `ADMIN_EMAILS` at sign-up) can manage books, orders and reviews and see the dashboard.

**Cart and orders.** The cart only stores book IDs and quantities, so titles and prices always come from the latest catalog. When an order is placed, the server looks up current prices, merges duplicate lines, and reserves stock with conditional updates: if any book doesn't have enough copies, nothing is reserved and the customer is told how many are left. Each order keeps a copy of the title and price at the time it was placed. Cancelling (by the customer while `pending`, or by an admin at any time) puts the stock back; cancelled orders can't be reopened.

**Reviews.** One review per user per book (submitting again updates it). Each book stores its average rating and review count, which are recalculated whenever a review changes; deleting a book deletes its reviews.

**Cover images.** Uploads are admin-only, limited to 2 MB, and accepted only if their contents are a real JPEG, PNG, GIF or WebP (SVG is refused). They're saved under a random name and served from `/uploads/...`. Replacing or deleting a book's cover removes the old file.

**Security.** bcrypt password hashing; helmet security headers including a Content-Security-Policy; rate limits on failed logins/sign-ups and on the API overall; 100 KB request bodies; user input in searches is matched literally and query operators are ignored.

**Payments.** Checkout is cash on delivery only. Card payments would need a payment provider account (e.g. Stripe) and are not built yet.

## API reference

All responses look like `{ "success": true, "message": "...", "data": ... }` (or `"success": false` with a `message` on errors). Protected routes need `Authorization: Bearer <token>`.

### Auth
| Method | Route | Access | Description |
| --- | --- | --- | --- |
| POST | `/auth/register` | Public | Create an account: `name`, `email`, `password` (8–72 characters). Returns `{ user, token }` |
| POST | `/auth/login` | Public | Log in with `email` and `password`. Returns `{ user, token }` |
| GET | `/auth/me` | Logged in | The current user |

### Books and reviews
| Method | Route | Access | Description |
| --- | --- | --- | --- |
| GET | `/books` | Public | List books, one page at a time. Optional query: `q` (title or author), `category`, `minPrice`, `maxPrice`, `sort` = `newest` (default), `oldest`, `price_asc`, `price_desc`, `title`, `rating`; `page` (default 1) and `limit` (default 24, max 100); `ids` (comma-separated, up to 100) to fetch specific books. The response includes `pagination: { page, limit, total, totalPages }` |
| GET | `/books/categories` | Public | Categories that have at least one book |
| GET | `/books/:id` | Public | One book |
| POST | `/books` | Admin | Create a book: `title`, `author`, `publishYear`, `price`, `image`, and optional `category`, `description`, `stock` |
| PUT | `/books/:id` | Admin | Update the fields sent |
| DELETE | `/books/:id` | Admin | Delete a book (and its reviews and uploaded cover) |
| GET | `/books/:id/reviews` | Public | Reviews of a book, newest first |
| POST | `/books/:id/reviews` | Logged in | Add or update your review: `rating` (1–5), optional `comment` (up to 1000 characters) |
| DELETE | `/books/:id/reviews/:reviewId` | Author or admin | Delete a review |

### Orders
| Method | Route | Access | Description |
| --- | --- | --- | --- |
| POST | `/orders` | Logged in | Place an order: `items: [{ book, quantity }]`, `shippingAddress: { fullName, phone, address, city, country }` |
| GET | `/orders/mine` | Logged in | Your orders, newest first |
| GET | `/orders/:id` | Owner or admin | One order |
| PUT | `/orders/:id/cancel` | Owner | Cancel a `pending` order |
| GET | `/orders` | Admin | All orders, with the customer's name and email |
| PUT | `/orders/:id/status` | Admin | Set `status` to `pending`, `processing`, `shipped`, `delivered` or `cancelled` |

### Wishlist
| Method | Route | Access | Description |
| --- | --- | --- | --- |
| GET | `/me/wishlist` | Logged in | Your saved books, most recently saved first |
| PUT | `/me/wishlist/:bookId` | Logged in | Save a book (saving it again does nothing). Returns the saved book IDs. Up to 200 books |
| DELETE | `/me/wishlist/:bookId` | Logged in | Remove a book from your wishlist. Returns the saved book IDs |

### Admin tools
| Method | Route | Access | Description |
| --- | --- | --- | --- |
| POST | `/uploads` | Admin | Upload a cover image (multipart field `image`; JPEG, PNG, GIF or WebP, up to 2 MB). Returns `{ url }` to use as a book's `image` |
| GET | `/reports/sales` | Admin | Dashboard data: totals, orders by status, daily revenue for 30 days, best sellers, low stock |

## Contributing

Contributions are welcome — UI and UX improvements, new features (card payments, wishlists, password reset...), performance, more tests, or DevOps.

1. Fork the repository and create a branch from `main`.
2. Make your change and run the checks from [Tests and CI](#tests-and-ci).
3. Open a pull request describing what changed and how you tested it. CI must pass before merging.

Have an idea or found a bug? [Open an issue](https://github.com/alieutech/BookStore-MERN-STACK/issues).

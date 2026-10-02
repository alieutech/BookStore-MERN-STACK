
# BookStore - MERN Stack Project Summary
Description:
The BookStore application is a full-stack web platform built using the MERN stack (MongoDB, Express.js, React.js, and Node.js). It allows users to browse, purchase, and manage books online, with features tailored for both customers and administrators.

This project is open for collaboration! Developers, designers, and tech enthusiasts are welcome to contribute and enhance the platform together.



# Key Features
# # Frontend (React.js):
User Authentication: Secure login and signup functionality using JWT or session-based authentication.
Book Browsing: Browse books by categories, genres, or authors.
Search and Filter: Real-time search bar with sorting and filtering options (e.g., price, rating).
Book Details Page: Detailed descriptions, reviews, and ratings for each book.
Cart Management: Add, remove, and view items in the shopping cart.
Checkout Flow: A user-friendly interface for placing orders, including address and payment information.

# # Backend (Node.js + Express.js):
API Development: RESTful APIs for handling book data, user management, and orders.
Admin Features: Manage books, inventory, and view sales reports.
Order Processing: Handle order creation, updates, and status tracking.
Security: Hashing of passwords and secure data transfer.
Database (MongoDB):
Data Models:
Users: Stores user profiles, authentication credentials, and order history.
Books: Manages book details such as title, author, publishYear, price
Orders: Tracks orders placed by users, including items, payment status, and delivery updates.

# # Getting Started

## Run everything with Docker Compose
```
docker compose up --build
```
- Frontend: http://localhost:5173
- Backend API: http://localhost:3333/books
- MongoDB: localhost:27017 (data kept in the `mongo-data` volume)

The frontend dev server proxies `/books` to the backend, so the browser only talks to port 5173.

## Run locally without Docker
Requires Node.js 20+ and a running MongoDB.

Backend:
```
cd backend
cp .env.example .env   # then set DATABASE_URI
npm install
npm run dev
```

Frontend (in a second terminal):
```
cd frontend
npm install
npm run dev
```

## Environment variables (backend)
| Variable | Default | Description |
| --- | --- | --- |
| `DATABASE_URI` | (required) | MongoDB connection string |
| `PORT` | `3333` | Port the API listens on |
| `CORS_ORIGIN` | `http://localhost:5173` | Comma-separated origins allowed to call the API |
| `JWT_SECRET` | (required) | Secret used to sign login tokens — use a long random string |
| `JWT_EXPIRES_IN` | `7d` | How long a login lasts |
| `ADMIN_EMAILS` | (empty) | Comma-separated emails that get the admin role when they register |

## Users and admins
Anyone can browse books. Only admins can add, edit or delete them.

To become an admin, put your email in `ADMIN_EMAILS` **before** you sign up (Docker Compose uses `admin@example.com` unless you set `ADMIN_EMAILS`). Everyone else gets the normal `user` role.

## Shopping
- Anyone can add books to the cart (it is saved in the browser and always uses the latest prices).
- Checking out needs an account. Customers enter a shipping address and pay cash on delivery.
- Customers see their orders under **My orders** and can cancel an order while it is still `pending`.
- Admins see every order under **Orders** and move it through `pending` → `processing` → `shipped` → `delivered` (or `cancelled`).
- Order totals are calculated on the server from the database prices, and each order keeps a copy of the title and price at the time it was placed.

## API
| Method | Route | Access | Description |
| --- | --- | --- | --- |
| POST | `/auth/register` | Public | Create an account (`name`, `email`, `password` of 8+ characters) |
| POST | `/auth/login` | Public | Log in with `email` and `password` |
| GET | `/auth/me` | Logged in | Get the current user |
| GET | `/books` | Public | List all books |
| GET | `/books/:id` | Public | Get one book |
| POST | `/books` | Admin | Create a book (`title`, `author`, `publishYear`, `price`, `image`) |
| PUT | `/books/:id` | Admin | Update the fields sent in the body |
| DELETE | `/books/:id` | Admin | Delete a book |
| POST | `/orders` | Logged in | Place an order: `items: [{ book, quantity }]`, `shippingAddress: { fullName, phone, address, city, country }` |
| GET | `/orders/mine` | Logged in | Your orders, newest first |
| GET | `/orders/:id` | Owner or admin | Get one order |
| PUT | `/orders/:id/cancel` | Owner | Cancel a `pending` order |
| GET | `/orders` | Admin | All orders, with the customer's name and email |
| PUT | `/orders/:id/status` | Admin | Set `status` to `pending`, `processing`, `shipped`, `delivered` or `cancelled` |

Register and login return `data: { user, token }`. Send the token on protected routes as `Authorization: Bearer <token>`.

Responses look like `{ "success": true, "message": "...", "data": ... }`.


# # Collaboration Opportunities
This project is open for collaboration! Contributions are welcome in the following areas:

Frontend Development: Enhancing UI/UX, adding animations, or improving responsiveness.
Backend Development: Optimizing APIs, adding new features, or improving performance.
Database Management: Structuring and optimizing database schemas.
Testing: Writing unit, integration, or end-to-end tests.
DevOps: Improving Docker configurations or CI/CD pipelines.
If you're interested, feel free to fork the repository, submit pull requests, or propose new features via issues. Let’s build something amazing together!

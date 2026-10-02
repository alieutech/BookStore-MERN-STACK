
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

## API
| Method | Route | Description |
| --- | --- | --- |
| GET | `/books` | List all books |
| POST | `/books` | Create a book (`title`, `author`, `publishYear`, `price`, `image`) |
| GET | `/books/:id` | Get one book |
| PUT | `/books/:id` | Update the fields sent in the body |
| DELETE | `/books/:id` | Delete a book |

Responses look like `{ "success": true, "message": "...", "data": ... }`.


# # Collaboration Opportunities
This project is open for collaboration! Contributions are welcome in the following areas:

Frontend Development: Enhancing UI/UX, adding animations, or improving responsiveness.
Backend Development: Optimizing APIs, adding new features, or improving performance.
Database Management: Structuring and optimizing database schemas.
Testing: Writing unit, integration, or end-to-end tests.
DevOps: Improving Docker configurations or CI/CD pipelines.
If you're interested, feel free to fork the repository, submit pull requests, or propose new features via issues. Let’s build something amazing together!

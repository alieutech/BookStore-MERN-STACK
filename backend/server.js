require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/config');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3333;

// CORS configuration (comma-separated list of allowed origins)
const corsOptions = {
    origin: (process.env.CORS_ORIGIN || 'http://localhost:5173').split(',').map((o) => o.trim()),
    methods: 'GET,POST,PUT,DELETE',
};
app.use(cors(corsOptions));

// parse JSON and urlencoded form data
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/books', require('./routers/books'));

// Serve the built frontend in production (run `npm run build` from the repo root first)
if (process.env.NODE_ENV === 'production') {
    const distPath = path.join(__dirname, '..', 'frontend', 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => res.sendFile(path.join(distPath, 'index.html')));
}

app.use(errorHandler);

connectDB()
    .then(() => {
        app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    })
    .catch((err) => {
        console.error('Failed to connect to MongoDB:', err.message);
        process.exit(1);
    });

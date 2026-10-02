const mongoose = require('mongoose');

const connectDB = async () => {
    if (!process.env.DATABASE_URI) {
        throw new Error('DATABASE_URI is not set. Copy backend/.env.example to backend/.env and fill it in.');
    }
    await mongoose.connect(process.env.DATABASE_URI);
    console.log('Connected to MongoDB');
};

module.exports = connectDB;

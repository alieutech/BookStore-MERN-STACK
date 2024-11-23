require('dotenv').config()
const express = require('express');
const app = express();
const mongoDB = require('./config/config')
const cors = require('cors')
const mongoose = require('mongoose');
const errorHandler = require('./middleware/errorHandler')
const PORT = process.env.PORT || 3333

// connect to mongoDB
mongoDB()

// to enable fronted and backend interaction
app.use(cors({
    origin: 'http://localhost:3333/',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type']
})) 

// post Json data
app.use(express.json())
// build in middleware to handle urlencoded form data
app.use(express.urlencoded({extended: false}));

app.use('/books', require('./routers/books'))

app.use(errorHandler);

mongoose.connection.once('open', () => {
    console.log('Connected to the mongoDB');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
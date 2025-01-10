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

// CORS configuration
const corsOptions = {
    origin: "http://localhost:5173", 
    methods: "GET,POST,PUT,DELETE", 
  };
  
  app.use(cors(corsOptions)); 

// post Json data
app.use(express.json())
// build in middleware to handle urlencoded form data
app.use(express.urlencoded({extended: false}));

app.use('/books', require('./routers/books'))

app.use(errorHandler);

if (process.env.NODE_ENV === "production") {
	app.use(express.static(path.join(__dirname, "/frontend/dist")));
	app.get("*", (req, res) => {
		res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"));
	});
}

mongoose.connection.once('open', () => {
    console.log('Connected to the mongoDB');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
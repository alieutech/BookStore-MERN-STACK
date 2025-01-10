const mongoose = require('mongoose');


const books = new mongoose.Schema({
    title: {
        type: String,
        require: true
    },
    author: {
        type: String,
        require: true
    },
    publishYear: {
        type: Number,
        require: true
    },
    price: {
        type: Number,
        require: true
    },
    image: {
        type: String,
        require: true
    }
})


module.exports = mongoose.model('Books', books);
const express = require('express');
const router = express.Router();
const Bookscontroller = require('../controllers/books');

// Routes for all books
router.route('/')
  .get(Bookscontroller.getBooks)
  .post(Bookscontroller.createNewBook);


router.route('/:id')
  .get(Bookscontroller.getBook)
  .put(Bookscontroller.updateBooks)
  .delete(Bookscontroller.deleteBook); 

  
module.exports = router;

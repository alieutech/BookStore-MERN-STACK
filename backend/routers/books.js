const express = require('express');
const router = express.Router();
const Bookscontroller = require('../controllers/books');


router.route('/')
      .get(Bookscontroller.getBooks)
      .post(Bookscontroller.createNewBook)
      .put(Bookscontroller.updateBooks)
      .delete(Bookscontroller.deleteBook)

router.route('/:id')
      .get(Bookscontroller.getBook)      

module.exports = router;
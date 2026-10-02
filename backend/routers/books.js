const express = require('express');
const router = express.Router();
const Bookscontroller = require('../controllers/books');
const { requireAuth, requireAdmin } = require('../middleware/auth');

// Anyone can browse books; only admins can change them
router.route('/')
  .get(Bookscontroller.getBooks)
  .post(requireAuth, requireAdmin, Bookscontroller.createNewBook);

router.route('/:id')
  .get(Bookscontroller.getBook)
  .put(requireAuth, requireAdmin, Bookscontroller.updateBooks)
  .delete(requireAuth, requireAdmin, Bookscontroller.deleteBook);

module.exports = router;

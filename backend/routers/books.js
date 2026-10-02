const express = require('express');
const router = express.Router();
const Bookscontroller = require('../controllers/books');
const ReviewsController = require('../controllers/reviews');
const { requireAuth, requireAdmin } = require('../middleware/auth');

// Anyone can browse books; only admins can change them
router.route('/')
  .get(Bookscontroller.getBooks)
  .post(requireAuth, requireAdmin, Bookscontroller.createNewBook);

router.get('/categories', Bookscontroller.getCategories);

router.route('/:id')
  .get(Bookscontroller.getBook)
  .put(requireAuth, requireAdmin, Bookscontroller.updateBooks)
  .delete(requireAuth, requireAdmin, Bookscontroller.deleteBook);

// Reviews: anyone can read them, logged-in users can write one per book
router.route('/:id/reviews')
  .get(ReviewsController.getReviews)
  .post(requireAuth, ReviewsController.saveReview);

router.delete('/:id/reviews/:reviewId', requireAuth, ReviewsController.deleteReview);

module.exports = router;

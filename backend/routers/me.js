const express = require('express');
const router = express.Router();
const WishlistController = require('../controllers/wishlist');
const { requireAuth } = require('../middleware/auth');

// Everything here belongs to the logged-in user
router.use(requireAuth);

router.get('/wishlist', WishlistController.getWishlist);
router.route('/wishlist/:bookId')
  .put(WishlistController.addToWishlist)
  .delete(WishlistController.removeFromWishlist);

module.exports = router;

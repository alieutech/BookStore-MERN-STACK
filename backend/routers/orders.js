const express = require('express');
const router = express.Router();
const OrdersController = require('../controllers/orders');
const { requireAuth, requireAdmin } = require('../middleware/auth');

// Every order route needs a logged-in user
router.use(requireAuth);

router.route('/')
  .get(requireAdmin, OrdersController.getAllOrders)
  .post(OrdersController.createOrder);

router.get('/mine', OrdersController.getMyOrders);

router.get('/:id', OrdersController.getOrder);
router.put('/:id/cancel', OrdersController.cancelOrder);
router.put('/:id/status', requireAdmin, OrdersController.updateOrderStatus);

module.exports = router;

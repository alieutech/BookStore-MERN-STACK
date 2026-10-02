const express = require('express');
const router = express.Router();
const ReportsController = require('../controllers/reports');
const { requireAuth, requireAdmin } = require('../middleware/auth');

router.get('/sales', requireAuth, requireAdmin, ReportsController.getSalesReport);

module.exports = router;

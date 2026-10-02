const express = require('express');
const router = express.Router();
const UploadsController = require('../controllers/uploads');
const { requireAuth, requireAdmin } = require('../middleware/auth');

router.post('/', requireAuth, requireAdmin, UploadsController.uploadImage);

module.exports = router;

const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/auth');
const { requireAuth } = require('../middleware/auth');

router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.get('/me', requireAuth, AuthController.me);

module.exports = router;

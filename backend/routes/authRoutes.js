// routes/authRoutes.js
const express = require('express');
const { login, changePassword, forgotPassword, resetPassword, getCurrentUser } = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.post('/login', login);
router.post('/change-password', authMiddleware, changePassword);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/me', authMiddleware, getCurrentUser);

module.exports = router;

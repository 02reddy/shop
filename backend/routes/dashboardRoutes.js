// routes/dashboardRoutes.js
const express = require('express');
const { getDashboardStats, getSummary } = require('../controllers/dashboardController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware); // All dashboard routes require authentication

router.get('/stats', getDashboardStats);
router.get('/summary', getSummary);

module.exports = router;

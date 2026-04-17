// routes/accountRoutes.js
const express = require('express');
const {
  getAllAccounts,
  getPendingAccounts,
  getAccountByCustomer,
  searchCustomers,
  closeAccount,
  getAccountStats,
} = require('../controllers/accountController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware); // All account routes require authentication

// Define specific routes BEFORE parameterized routes
router.get('/pending', getPendingAccounts);
router.get('/customers', getAllAccounts); // For getting customer list
router.get('/stats/overview', getAccountStats);
router.post('/close', closeAccount);
router.get('/search/:query', searchCustomers);
router.get('/:customerId', getAccountByCustomer);

module.exports = router;

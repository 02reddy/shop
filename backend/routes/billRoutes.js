// routes/billRoutes.js
const express = require('express');
const {
  createBill,
  getAllBills,
  getBillById,
  updateBill,
  deleteBill,
  getBillsByCustomer,
} = require('../controllers/billController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware); // All bill routes require authentication

router.post('/', createBill);
router.get('/customer/:customerId', getBillsByCustomer); // Specific route before generic :id
router.get('/', getAllBills);
router.get('/:id', getBillById);
router.put('/:id', updateBill);
router.delete('/:id', deleteBill);

module.exports = router;

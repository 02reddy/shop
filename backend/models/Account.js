// models/Account.js
const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema({
  customerName: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  village: {
    type: String,
    required: true,
  },
  totalBillAmount: {
    type: Number,
    default: 0,
  },
  paidAmount: {
    type: Number,
    default: 0,
  },
  pendingBalance: {
    type: Number,
    default: 0,
  },
  lastPurchaseDate: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ['OPEN', 'PAID', 'CLOSED'],
    default: 'OPEN',
  },
  bills: [
    {
      billId: mongoose.Schema.Types.ObjectId,
      billNumber: String,
      amount: Number,
    },
  ],
  payments: [
    {
      amount: Number,
      date: Date,
      paymentDate: Date, // the date when payment was made
    },
  ],
  notes: {
    type: String,
    default: '',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Account', accountSchema);

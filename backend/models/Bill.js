// models/Bill.js
const mongoose = require('mongoose');

const billItemSchema = new mongoose.Schema({
  product: {
    type: String,
    required: true,
  },
  company: {
    type: String,
    default: '',
  },
  unit: {
    type: String,
    enum: ['ML', 'KG', 'L', 'Pieces', 'Box', 'Bottle', 'Dozen', 'Gram'],
    default: 'ML',
  },
  packageSize: {
    type: String,
    default: '',
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  total: {
    type: Number,
    required: true,
  },
});

const billSchema = new mongoose.Schema({
  billNumber: {
    type: String,
    unique: true,
    required: true,
  },
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
  purchaseDate: {
    type: Date,
    default: Date.now,
  },
  items: [billItemSchema],
  subtotal: {
    type: Number,
    required: true,
    default: 0,
  },
  grandTotal: {
    type: Number,
    required: true,
  },
  paidAmount: {
    type: Number,
    required: true,
    default: 0,
  },
  pendingAmount: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['PAID', 'PENDING', 'PARTIAL'],
    default: 'PENDING',
  },
  billDate: {
    type: Date,
    default: Date.now,
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

module.exports = mongoose.model('Bill', billSchema);

// controllers/billController.js
const Bill = require('../models/Bill');
const Account = require('../models/Account');

// Generate unique bill number
const generateBillNumber = async () => {
  const count = await Bill.countDocuments();
  const billNumber = `BILL-${Date.now()}-${count + 1}`;
  return billNumber;
};

// @desc    Create new bill
// @route   POST /api/bills
// @access  Private
exports.createBill = async (req, res) => {
  try {
    const { customerName, phone, village, items, paidAmount } = req.body;

    console.log('=== BILL CREATE DEBUG ===');
    console.log('Received data:', req.body);
    console.log('customerName:', customerName);
    console.log('phone:', phone);
    console.log('village:', village);
    console.log('items:', items);
    console.log('paidAmount:', paidAmount);

    // Validation
    if (!customerName || !phone || !village || !items || items.length === 0) {
      console.log('VALIDATION FAILED - Missing required fields');
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    // Calculate totals
    let subtotal = 0;
    items.forEach((item) => {
      item.total = item.price * item.quantity;
      subtotal += item.total;
    });

    const grandTotal = subtotal;
    const pendingAmount = grandTotal - (paidAmount || 0);

    // Create bill
    const billNumber = await generateBillNumber();

    const bill = new Bill({
      billNumber,
      customerName,
      phone,
      village,
      items,
      subtotal,
      grandTotal,
      paidAmount: paidAmount || 0,
      pendingAmount,
      status: paidAmount === grandTotal ? 'PAID' : paidAmount > 0 ? 'PARTIAL' : 'PENDING',
    });

    await bill.save();

    // Update or create account
    let account = await Account.findOne({ customerName, phone });

    if (!account) {
      account = new Account({
        customerName,
        phone,
        village,
        totalBillAmount: grandTotal,
        paidAmount: paidAmount || 0,
        pendingBalance: pendingAmount,
        lastPurchaseDate: new Date(),
        status: pendingAmount === 0 ? 'PAID' : 'OPEN',
        bills: [{ billId: bill._id, billNumber: bill.billNumber, amount: grandTotal }],
      });
    } else {
      account.totalBillAmount += grandTotal;
      account.paidAmount += paidAmount || 0;
      account.pendingBalance = account.totalBillAmount - account.paidAmount;
      account.lastPurchaseDate = new Date();
      account.status = account.pendingBalance === 0 ? 'PAID' : 'OPEN';
      account.bills.push({ billId: bill._id, billNumber: bill.billNumber, amount: grandTotal });
    }

    await account.save();

    res.status(201).json({
      success: true,
      message: 'Bill created successfully',
      bill,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all bills
// @route   GET /api/bills
// @access  Private
exports.getAllBills = async (req, res) => {
  try {
    const bills = await Bill.find().sort({ billDate: -1 });

    res.status(200).json({
      success: true,
      count: bills.length,
      bills,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get bill by ID
// @route   GET /api/bills/:id
// @access  Private
exports.getBillById = async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id);

    if (!bill) {
      return res.status(404).json({ message: 'Bill not found' });
    }

    res.status(200).json({
      success: true,
      bill,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update bill
// @route   PUT /api/bills/:id
// @access  Private
exports.updateBill = async (req, res) => {
  try {
    const { items, paidAmount } = req.body;

    const bill = await Bill.findById(req.params.id);

    if (!bill) {
      return res.status(404).json({ message: 'Bill not found' });
    }

    // Calculate new totals
    let subtotal = 0;
    if (items) {
      items.forEach((item) => {
        item.total = item.price * item.quantity;
        subtotal += item.total;
      });
      bill.items = items;
    }

    bill.subtotal = subtotal || bill.subtotal;
    bill.grandTotal = bill.subtotal;
    bill.paidAmount = paidAmount !== undefined ? paidAmount : bill.paidAmount;
    bill.pendingAmount = bill.grandTotal - bill.paidAmount;
    bill.status =
      bill.paidAmount === bill.grandTotal
        ? 'PAID'
        : bill.paidAmount > 0
        ? 'PARTIAL'
        : 'PENDING';
    bill.updatedAt = new Date();

    await bill.save();

    // Update account
    const account = await Account.findOne({ customerName: bill.customerName, phone: bill.phone });
    if (account) {
      // Recalculate account balance
      const allBills = await Bill.find({ customerName: bill.customerName, phone: bill.phone });
      account.totalBillAmount = allBills.reduce((sum, b) => sum + b.grandTotal, 0);
      account.paidAmount = allBills.reduce((sum, b) => sum + b.paidAmount, 0);
      account.pendingBalance = account.totalBillAmount - account.paidAmount;
      account.status = account.pendingBalance === 0 ? 'PAID' : 'OPEN';
      await account.save();
    }

    res.status(200).json({
      success: true,
      message: 'Bill updated successfully',
      bill,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete bill
// @route   DELETE /api/bills/:id
// @access  Private
exports.deleteBill = async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id);

    if (!bill) {
      return res.status(404).json({ message: 'Bill not found' });
    }

    const customerName = bill.customerName;
    const phone = bill.phone;

    await Bill.findByIdAndDelete(req.params.id);

    // Update account
    const account = await Account.findOne({ customerName, phone });
    if (account) {
      account.bills = account.bills.filter((b) => b.billId.toString() !== req.params.id);

      const remainingBills = await Bill.find({ customerName, phone });
      account.totalBillAmount = remainingBills.reduce((sum, b) => sum + b.grandTotal, 0);
      account.paidAmount = remainingBills.reduce((sum, b) => sum + b.paidAmount, 0);
      account.pendingBalance = account.totalBillAmount - account.paidAmount;

      if (account.bills.length === 0) {
        await Account.findByIdAndDelete(account._id);
      } else {
        account.status = account.pendingBalance === 0 ? 'PAID' : 'OPEN';
        await account.save();
      }
    }

    res.status(200).json({
      success: true,
      message: 'Bill deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get bills by customer
// @route   GET /api/bills/customer/:customerId
// @access  Private
exports.getBillsByCustomer = async (req, res) => {
  try {
    const { customerId } = req.params;

    // If customerId is provided, get account first to get customer name
    let bills = [];
    
    if (customerId && customerId !== 'undefined') {
      const account = await Account.findById(customerId);
      if (account) {
        bills = await Bill.find({ customerName: account.customerName, phone: account.phone }).sort({ createdAt: -1 });
      }
    }

    res.status(200).json({
      success: true,
      count: bills.length,
      bills,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

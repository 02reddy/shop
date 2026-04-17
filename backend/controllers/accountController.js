// controllers/accountController.js
const Account = require('../models/Account');
const Bill = require('../models/Bill');

// @desc    Get all accounts with pending balance
// @route   GET /api/accounts
// @access  Private
exports.getAllAccounts = async (req, res) => {
  try {
    const accounts = await Account.find().sort({ lastPurchaseDate: -1 });

    res.status(200).json({
      success: true,
      count: accounts.length,
      accounts,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get pending accounts only
// @route   GET /api/accounts/pending
// @access  Private
exports.getPendingAccounts = async (req, res) => {
  try {
    const accounts = await Account.find({ status: 'OPEN' }).sort({ lastPurchaseDate: -1 });

    res.status(200).json({
      success: true,
      count: accounts.length,
      accounts,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get account by customer ID
// @route   GET /api/accounts/:customerId
// @access  Private
exports.getAccountByCustomer = async (req, res) => {
  try {
    const { customerId } = req.params;

    const account = await Account.findById(customerId);

    if (!account) {
      return res.status(404).json({ message: 'Account not found' });
    }

    // Fetch bills for this customer
    const bills = await Bill.find({ customerName: account.customerName, phone: account.phone }).sort({ purchaseDate: 1 });

    res.status(200).json({
      success: true,
      account,
      bills,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Search customers
// @route   GET /api/accounts/search/:query
// @access  Private
exports.searchCustomers = async (req, res) => {
  try {
    const { query } = req.params;

    const customers = await Account.find({
      $or: [
        { customerName: { $regex: query, $options: 'i' } },
        { phone: { $regex: query, $options: 'i' } },
        { village: { $regex: query, $options: 'i' } },
      ],
    });

    res.status(200).json({
      success: true,
      count: customers.length,
      customers,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Close account (settle pending balance)
// @route   POST /api/accounts/close
// @access  Private
exports.closeAccount = async (req, res) => {
  try {
    const { customerId, interestPercentage, paymentAmount, partialPayment, paymentDate, remainingBalance } = req.body;

    if (!customerId || paymentAmount === undefined) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const account = await Account.findById(customerId);

    if (!account) {
      return res.status(404).json({ message: 'Account not found' });
    }

    // Calculate interest if applicable
    const bills = await Bill.find({ customerName: account.customerName, phone: account.phone });
    let interestAmount = 0;
    const paymentDateObj = paymentDate ? new Date(paymentDate) : new Date();

    if (interestPercentage && interestPercentage > 0) {
      const billsWithDays = bills.map((bill) => {
        const daysDifference = Math.floor((paymentDateObj - bill.purchaseDate) / (1000 * 60 * 60 * 24));
        return { ...bill.toObject(), daysDifference };
      });

      interestAmount = billsWithDays.reduce((sum, bill) => {
        const billInterest = (bill.pendingAmount * interestPercentage * bill.daysDifference) / (365 * 100);
        return sum + billInterest;
      }, 0);
    }

    const totalPending = account.pendingBalance + interestAmount;

    if (paymentAmount > totalPending) {
      return res.status(400).json({ message: 'Payment amount exceeds total pending' });
    }

    if (!partialPayment && paymentAmount !== totalPending) {
      return res.status(400).json({ message: 'Payment amount must equal total pending for full payment' });
    }

    // Update bills proportionally if partial payment
    if (paymentAmount > 0) {
      const paymentRatio = paymentAmount / totalPending;

      for (let bill of bills) {
        const billPayment = bill.pendingAmount * paymentRatio;
        const updatedPaidAmount = bill.paidAmount + billPayment;
        const updatedPendingAmount = bill.grandTotal - updatedPaidAmount;
        const updatedStatus = updatedPendingAmount === 0 ? 'PAID' : updatedPaidAmount > 0 ? 'PARTIAL' : 'PENDING';

        await Bill.updateOne(
          { _id: bill._id },
          {
            $set: {
              paidAmount: updatedPaidAmount,
              pendingAmount: updatedPendingAmount,
              status: updatedStatus,
              updatedAt: new Date(),
            },
          },
          { runValidators: false }
        );
      }

      account.paidAmount += paymentAmount;
      account.pendingBalance = account.totalBillAmount - account.paidAmount;

      // If there's a remaining balance with interest, store it
      if (remainingBalance && remainingBalance > 0 && partialPayment) {
        account.pendingBalance = remainingBalance;
      }

      if (account.pendingBalance <= 0) {
        account.status = 'PAID';
      } else if (partialPayment) {
        account.status = 'OPEN';
      }

      // Add payment record
      account.payments.push({
        amount: paymentAmount,
        date: new Date(),
        paymentDate: paymentDateObj,
      });
    }

    account.updatedAt = new Date();
    await account.save();

    res.status(200).json({
      success: true,
      message: 'Account settled successfully',
      account,
      interestAmount,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get account statistics
// @route   GET /api/accounts/stats/overview
// @access  Private
exports.getAccountStats = async (req, res) => {
  try {
    const accounts = await Account.find();

    const totalAccounts = accounts.length;
    const paidAccounts = accounts.filter((a) => a.status === 'PAID').length;
    const openAccounts = accounts.filter((a) => a.status === 'OPEN').length;
    const totalPending = accounts.reduce((sum, a) => sum + a.pendingBalance, 0);
    const totalReceived = accounts.reduce((sum, a) => sum + a.paidAmount, 0);

    res.status(200).json({
      success: true,
      stats: {
        totalAccounts,
        paidAccounts,
        openAccounts,
        totalPending,
        totalReceived,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

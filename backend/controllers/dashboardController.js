// controllers/dashboardController.js
const Bill = require('../models/Bill');
const Account = require('../models/Account');

// @desc    Get dashboard statistics
// @route   GET /api/dashboard/stats
// @access  Private
exports.getDashboardStats = async (req, res) => {
  try {
    const bills = await Bill.find();
    const accounts = await Account.find();

    // Calculate stats
    const totalSales = bills.reduce((sum, bill) => sum + bill.grandTotal, 0);
    const totalPending = accounts.reduce((sum, acc) => sum + acc.pendingBalance, 0);
    const totalCustomers = accounts.length;
    const totalPaid = bills.reduce((sum, bill) => sum + bill.paidAmount, 0);
    const totalBills = bills.length;

    // Recent bills
    const recentBills = bills.sort((a, b) => new Date(b.billDate) - new Date(a.billDate)).slice(0, 5);

    // Top customers
    const topCustomers = accounts
      .sort((a, b) => b.totalBillAmount - a.totalBillAmount)
      .slice(0, 5);

    res.status(200).json({
      success: true,
      stats: {
        totalSales,
        totalPending,
        totalCustomers,
        totalPaid,
        totalBills,
      },
      recentBills,
      topCustomers,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get summary by date range
// @route   GET /api/dashboard/summary
// @access  Private
exports.getSummary = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const query = {};
    if (startDate && endDate) {
      query.billDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const bills = await Bill.find(query);

    const totalSales = bills.reduce((sum, bill) => sum + bill.grandTotal, 0);
    const totalPaid = bills.reduce((sum, bill) => sum + bill.paidAmount, 0);
    const totalPending = bills.reduce((sum, bill) => sum + bill.pendingAmount, 0);
    const billCount = bills.length;

    res.status(200).json({
      success: true,
      summary: {
        totalSales,
        totalPaid,
        totalPending,
        billCount,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

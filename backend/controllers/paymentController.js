import { PaymentTransaction } from '../models/PaymentTransaction.js';
import { Seller } from '../models/Seller.js';
import { DeliveryAgent } from '../models/DeliveryAgent.js';
import { Warehouse } from '../models/Warehouse.js';
import { Order } from '../models/Order.js';
import { emitToUser } from '../services/socketService.js';

// Helper to generate authentic Bank UTR Reference Number
const generateUTR = () => {
  const prefix = 'UTR';
  const timestamp = Date.now().toString().slice(-8);
  const rand = Math.floor(100000 + Math.random() * 900000);
  return `${prefix}${timestamp}${rand}`;
};

// @desc    Get Treasury Master Liquidity Overview
// @route   GET /api/payments/treasury-stats
// @access  Private (Finance, Admin)
export const getTreasuryOverview = async (req, res, next) => {
  try {
    const transactions = await PaymentTransaction.find().sort({ createdAt: -1 });

    let totalInboundReceived = 0;
    let totalOutboundDisbursed = 0;
    let totalPendingDisbursals = 0;
    let pendingVerificationCount = 0;
    let sellerDisbursedTotal = 0;
    let riderDisbursedTotal = 0;
    let warehouseSalariesTotal = 0;

    const methodCounts = {
      'UPI': 0,
      'Credit Card': 0,
      'Net Banking': 0,
      'Cash on Delivery': 0,
      'IMPS / NEFT Payout': 0
    };

    transactions.forEach(tx => {
      if (tx.type === 'INBOUND_CUSTOMER_PAYMENT' && tx.status === 'SUCCESS') {
        totalInboundReceived += tx.amount;
        if (tx.paymentMethod?.includes('UPI')) methodCounts['UPI'] += tx.amount;
        else if (tx.paymentMethod?.includes('Card')) methodCounts['Credit Card'] += tx.amount;
        else if (tx.paymentMethod?.includes('Banking')) methodCounts['Net Banking'] += tx.amount;
        else if (tx.paymentMethod?.includes('Cash')) methodCounts['Cash on Delivery'] += tx.amount;
      } else if (tx.status === 'DISBURSED') {
        totalOutboundDisbursed += tx.netDisbursedAmount || tx.amount;
        methodCounts['IMPS / NEFT Payout'] += (tx.netDisbursedAmount || tx.amount);

        if (tx.type === 'SELLER_SETTLEMENT') sellerDisbursedTotal += (tx.netDisbursedAmount || tx.amount);
        else if (tx.type === 'RIDER_PAYOUT') riderDisbursedTotal += (tx.netDisbursedAmount || tx.amount);
        else if (tx.type === 'WAREHOUSE_SALARY') warehouseSalariesTotal += (tx.netDisbursedAmount || tx.amount);
      } else if (tx.status === 'PENDING_VERIFICATION' || tx.status === 'ON_HOLD') {
        totalPendingDisbursals += (tx.netDisbursedAmount || tx.amount);
        pendingVerificationCount++;
      }
    });

    const escrowReserve = Math.max(0, totalInboundReceived - totalOutboundDisbursed);

    res.json({
      success: true,
      stats: {
        totalInboundReceived,
        totalOutboundDisbursed,
        totalPendingDisbursals,
        pendingVerificationCount,
        escrowReserve,
        sellerDisbursedTotal,
        riderDisbursedTotal,
        warehouseSalariesTotal,
        totalTransactionsCount: transactions.length,
        methodCounts,
        recentTransactions: transactions.slice(0, 10)
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get All Transactions with Search and Filter
// @route   GET /api/payments/transactions
// @access  Private (Finance, Admin)
export const getAllTransactions = async (req, res, next) => {
  try {
    const { type, status, search, page = 1, limit = 50 } = req.query;

    const query = {};
    if (type && type !== 'ALL') query.type = type;
    if (status && status !== 'ALL') query.status = status;
    if (search) {
      query.$or = [
        { transactionId: { $regex: search, $options: 'i' } },
        { utrNumber: { $regex: search, $options: 'i' } },
        { orderNumber: { $regex: search, $options: 'i' } },
        { 'recipient.name': { $regex: search, $options: 'i' } },
        { 'recipient.storeOrHubName': { $regex: search, $options: 'i' } }
      ];
    }

    const total = await PaymentTransaction.countDocuments(query);
    const transactions = await PaymentTransaction.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({
      success: true,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / limit),
      transactions
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Pending Disbursals Queue (Sellers, Riders, Warehouse Staff)
// @route   GET /api/payments/pending-disbursals
// @access  Private (Finance, Admin)
export const getPendingDisbursals = async (req, res, next) => {
  try {
    const pendingTransactions = await PaymentTransaction.find({
      status: { $in: ['PENDING_VERIFICATION', 'ON_HOLD'] }
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: pendingTransactions.length,
      disbursals: pendingTransactions
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve and Disburse Payout (Execute Bank Transfer via IMPS/NEFT)
// @route   POST /api/payments/disburse/:id
// @access  Private (Finance, Admin)
export const verifyAndDisbursePayout = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    const tx = await PaymentTransaction.findById(id);
    if (!tx) {
      return res.status(404).json({ success: false, message: 'Transaction record not found' });
    }

    if (tx.status === 'DISBURSED') {
      return res.status(400).json({ success: false, message: 'Transaction has already been disbursed' });
    }

    const utrNumber = generateUTR();
    tx.status = 'DISBURSED';
    tx.verificationStatus = 'VERIFIED';
    tx.utrNumber = utrNumber;
    tx.disbursedAt = new Date();
    tx.processedBy = req.user?._id || null;
    tx.verificationNotes = notes || 'Approved & verified by Treasury. IMPS payment settled.';
    await tx.save();

    // Update Seller or Rider Wallet balances
    if (tx.type === 'SELLER_SETTLEMENT') {
      const seller = await Seller.findOne({ storeName: tx.recipient?.storeOrHubName });
      if (seller) {
        seller.wallet.totalWithdrawn = (seller.wallet.totalWithdrawn || 0) + (tx.netDisbursedAmount || tx.amount);
        seller.wallet.pendingEscrowBalance = Math.max(0, (seller.wallet.pendingEscrowBalance || 0) - (tx.netDisbursedAmount || tx.amount));
        await seller.save();
      }
    } else if (tx.type === 'RIDER_PAYOUT') {
      const rider = await DeliveryAgent.findOne({ fullName: tx.recipient?.name });
      if (rider) {
        rider.wallet.totalWithdrawn = (rider.wallet.totalWithdrawn || 0) + (tx.netDisbursedAmount || tx.amount);
        rider.wallet.pendingVerificationBalance = Math.max(0, (rider.wallet.pendingVerificationBalance || 0) - (tx.netDisbursedAmount || tx.amount));
        await rider.save();
      }
    }

    res.json({
      success: true,
      message: `Disbursal executed successfully. Bank UTR: ${utrNumber}`,
      transaction: tx
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Put Disbursal on Compliance Hold
// @route   POST /api/payments/hold/:id
// @access  Private (Finance, Admin)
export const holdDisbursal = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const tx = await PaymentTransaction.findById(id);
    if (!tx) return res.status(404).json({ success: false, message: 'Transaction not found' });

    tx.status = 'ON_HOLD';
    tx.verificationStatus = 'FLAGGED_FOR_REVIEW';
    tx.verificationNotes = reason || 'Disbursal placed on audit hold by Treasury Compliance.';
    await tx.save();

    res.json({
      success: true,
      message: 'Transaction has been flagged and placed on hold',
      transaction: tx
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Release Disbursal Hold
// @route   POST /api/payments/release-hold/:id
// @access  Private (Finance, Admin)
export const releaseDisbursalHold = async (req, res, next) => {
  try {
    const { id } = req.params;

    const tx = await PaymentTransaction.findById(id);
    if (!tx) return res.status(404).json({ success: false, message: 'Transaction not found' });

    tx.status = 'PENDING_VERIFICATION';
    tx.verificationStatus = 'RELEASED_FOR_PAYOUT';
    tx.verificationNotes = 'Hold released. Approved for disbursement processing.';
    await tx.save();

    res.json({
      success: true,
      message: 'Hold released. Transaction is ready for payout.',
      transaction: tx
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Seller-specific settlements and wallet
// @route   GET /api/payments/seller-wallet
// @access  Private (Seller)
export const getSellerWalletAndSettlements = async (req, res, next) => {
  try {
    const seller = await Seller.findOne({ userId: req.user._id });
    if (!seller) {
      return res.status(404).json({ success: false, message: 'Seller profile not found' });
    }

    const settlements = await PaymentTransaction.find({
      type: 'SELLER_SETTLEMENT',
      'recipient.storeOrHubName': seller.storeName
    }).sort({ createdAt: -1 });

    const totalGross = settlements.reduce((sum, s) => sum + s.subtotal, 0);
    const totalDeductions = settlements.reduce((sum, s) => sum + s.totalDeductions, 0);
    const totalEarned = settlements.reduce((sum, s) => sum + s.netDisbursedAmount, 0);
    const totalDisbursed = settlements.filter(s => s.status === 'DISBURSED').reduce((sum, s) => sum + s.netDisbursedAmount, 0);
    const pendingVerification = settlements.filter(s => s.status !== 'DISBURSED').reduce((sum, s) => sum + s.netDisbursedAmount, 0);

    res.json({
      success: true,
      wallet: {
        storeName: seller.storeName,
        bankDetails: seller.bankDetails,
        totalGross,
        totalDeductions,
        totalEarned,
        totalDisbursed,
        pendingVerification,
        availableForWithdrawal: pendingVerification
      },
      settlements
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update Seller Bank Details
// @route   PUT /api/payments/seller-bank-details
// @access  Private (Seller)
export const updateSellerBankDetails = async (req, res, next) => {
  try {
    const { accountHolderName, bankName, accountNumber, ifscCode, upiId } = req.body;
    const seller = await Seller.findOne({ userId: req.user._id });
    if (!seller) return res.status(404).json({ success: false, message: 'Seller not found' });

    seller.bankDetails = {
      accountHolderName: accountHolderName || seller.bankDetails.accountHolderName,
      bankName: bankName || seller.bankDetails.bankName,
      accountNumber: accountNumber || seller.bankDetails.accountNumber,
      ifscCode: ifscCode || seller.bankDetails.ifscCode,
      upiId: upiId || seller.bankDetails.upiId,
      isVerified: true
    };
    await seller.save();

    res.json({
      success: true,
      message: 'Bank details updated successfully',
      bankDetails: seller.bankDetails
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Rider Earnings and Cashout History
// @route   GET /api/payments/rider-wallet
// @access  Private (Delivery Agent)
export const getRiderWalletAndPayouts = async (req, res, next) => {
  try {
    const rider = await DeliveryAgent.findOne({ userId: req.user._id });
    if (!rider) return res.status(404).json({ success: false, message: 'Rider profile not found' });

    const payouts = await PaymentTransaction.find({
      type: 'RIDER_PAYOUT',
      'recipient.name': rider.fullName
    }).sort({ createdAt: -1 });

    const totalEarned = payouts.reduce((sum, p) => sum + p.netDisbursedAmount, 0);
    const totalDisbursed = payouts.filter(p => p.status === 'DISBURSED').reduce((sum, p) => sum + p.netDisbursedAmount, 0);
    const pendingVerification = payouts.filter(p => p.status !== 'DISBURSED').reduce((sum, p) => sum + p.netDisbursedAmount, 0);

    res.json({
      success: true,
      wallet: {
        riderName: rider.fullName,
        vehicleNumber: rider.vehicleNumber,
        bankDetails: rider.bankDetails,
        totalEarned,
        totalDisbursed,
        pendingVerification,
        availableBalance: pendingVerification
      },
      payouts
    });
  } catch (error) {
    next(error);
  }
};

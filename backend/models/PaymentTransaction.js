import mongoose from 'mongoose';

const paymentTransactionSchema = new mongoose.Schema({
  transactionId: { 
    type: String, 
    required: true, 
    unique: true, 
    index: true 
  },
  utrNumber: { 
    type: String, 
    default: null,
    index: true 
  },
  type: {
    type: String,
    enum: [
      'INBOUND_CUSTOMER_PAYMENT',
      'SELLER_SETTLEMENT',
      'RIDER_PAYOUT',
      'WAREHOUSE_SALARY',
      'REFUND'
    ],
    required: true,
    index: true
  },
  amount: { 
    type: Number, 
    required: true 
  },
  subtotal: { 
    type: Number, 
    default: 0 
  },
  tax: { 
    type: Number, 
    default: 0 
  },
  deliveryFee: { 
    type: Number, 
    default: 0 
  },
  platformCommissionCut: { 
    type: Number, 
    default: 0 
  },
  gatewayFee: { 
    type: Number, 
    default: 0 
  },
  totalDeductions: { 
    type: Number, 
    default: 0 
  },
  netDisbursedAmount: { 
    type: Number, 
    default: 0 
  },
  sender: {
    name: { type: String, default: 'Customer / Buyer' },
    role: { type: String, default: 'customer' },
    accountOrVpa: { type: String, default: 'Razorpay / UPI Gateway' }
  },
  recipient: {
    name: { type: String, required: true },
    role: { type: String, required: true }, // 'seller', 'delivery', 'warehouse_manager', 'platform'
    storeOrHubName: { type: String, default: '' },
    accountNumber: { type: String, default: '' },
    bankName: { type: String, default: '' },
    ifscCode: { type: String, default: '' },
    upiId: { type: String, default: '' }
  },
  paymentMethod: { 
    type: String, 
    default: 'UPI' 
  },
  status: {
    type: String,
    enum: ['SUCCESS', 'PENDING_VERIFICATION', 'ON_HOLD', 'DISBURSED', 'FAILED'],
    default: 'PENDING_VERIFICATION',
    index: true
  },
  verificationStatus: {
    type: String,
    enum: ['VERIFIED', 'PENDING_AUDIT', 'RELEASED_FOR_PAYOUT', 'FLAGGED_FOR_REVIEW'],
    default: 'PENDING_AUDIT'
  },
  verificationNotes: { 
    type: String, 
    default: '' 
  },
  orderId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Order', 
    default: null 
  },
  orderNumber: { 
    type: String, 
    default: null 
  },
  processedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    default: null 
  },
  disbursedAt: { 
    type: Date, 
    default: null 
  },
  receivedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

export const PaymentTransaction = mongoose.models.PaymentTransaction || mongoose.model('PaymentTransaction', paymentTransactionSchema);

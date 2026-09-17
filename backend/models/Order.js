import mongoose from 'mongoose';
import { ORDER_STATUSES, PAYMENT_METHODS, PAYMENT_STATUSES } from '../config/constants.js';

const orderSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Seller' },
  orderNumber: { type: String, unique: true },
  items: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true },
    image: { type: String, default: '' },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Seller', required: true }
  }],
  logisticsRoute: {
    originWarehouse: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse', default: null },
    destinationBranch: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse', default: null },
    transitStage: { 
      type: String, 
      enum: ['AT_STORE', 'DISPATCHED_TO_HUB', 'IN_REGIONAL_HUB', 'IN_TRANSIT_TO_BRANCH', 'AT_DELIVERY_BRANCH', 'OUT_FOR_DELIVERY', 'DELIVERED'],
      default: 'AT_STORE'
    },
    estimatedTransitDays: { type: Number, default: 2 },
    notes: { type: String, default: '' }
  },
  deliveryAddress: {
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, default: 'India' },
    coordinates: {
      lat: { type: Number, default: 28.6139 },
      lng: { type: Number, default: 77.2090 }
    }
  },
  subtotal: { type: Number, required: true },
  tax: { type: Number, default: 0 },
  shippingFee: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  convenienceFee: { type: Number, default: 0 },
  totalAmount: { type: Number, required: true },
  paymentMethod: { type: String, enum: Object.values(PAYMENT_METHODS), default: PAYMENT_METHODS.COD },
  paymentStatus: { type: String, enum: Object.values(PAYMENT_STATUSES), default: PAYMENT_STATUSES.PENDING },
  transactionId: { type: String, default: '' },
  orderStatus: { type: String, enum: Object.values(ORDER_STATUSES), default: ORDER_STATUSES.PENDING },
  deliveryAgentId: { type: mongoose.Schema.Types.ObjectId, ref: 'DeliveryAgent', default: null },
  deliveryOtp: { type: String, default: '1234' },
  proofOfDelivery: {
    verifiedMethod: { type: String, enum: ['BARCODE_SCAN', 'MANUAL_CODE_ENTRY', 'DIRECT_OVERRIDE', 'NONE'], default: 'NONE' },
    scannedCode: { type: String, default: '' },
    verifiedAt: { type: Date, default: null },
    handoverNotes: { type: String, default: '' },
    cashCollected: { type: Number, default: 0 }
  },
  cancellationReason: { type: String, default: '' },
  timeline: [{
    status: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    note: { type: String, default: '' },
    updatedBy: { type: String, default: 'System' }
  }]
}, { timestamps: true });

orderSchema.pre('save', function (next) {
  if (!this.orderNumber) {
    this.orderNumber = 'ORD-' + Date.now().toString().slice(-6) + '-' + Math.floor(1000 + Math.random() * 9000);
  }
  if (!this.timeline || this.timeline.length === 0) {
    this.timeline = [{
      status: this.orderStatus,
      timestamp: new Date(),
      note: `Order status updated to ${this.orderStatus}`,
      updatedBy: 'System'
    }];
  }
  next();
});

export const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);

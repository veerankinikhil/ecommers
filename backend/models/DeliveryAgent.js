import mongoose from 'mongoose';

const deliveryAgentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  fullName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  vehicleType: { type: String, required: true },
  vehicleNumber: { type: String, required: true },
  drivingLicense: { type: String, required: true },
  profileImage: { type: String },
  vehicleImage: { type: String },
  bankDetails: {
    accountName: { type: String, default: '' },
    accountNumber: { type: String, default: '309204918204' },
    bankName: { type: String, default: 'State Bank of India' },
    ifscCode: { type: String, default: 'SBIN0004521' },
    upiId: { type: String, default: '' },
    isVerified: { type: Boolean, default: true }
  },
  wallet: {
    availableBalance: { type: Number, default: 0 },
    pendingVerificationBalance: { type: Number, default: 0 },
    totalWithdrawn: { type: Number, default: 0 }
  },
  currentLocation: {
    lat: { type: Number, default: 28.6139 },
    lng: { type: Number, default: 77.2090 },
    address: { type: String, default: 'Connaught Place, New Delhi' }
  },
  status: { type: String, enum: ['pending', 'pending_approval', 'approved', 'rejected', 'suspended', 'blocked', 'active'], default: 'pending_approval' },
  isApproved: { type: Boolean, default: false },
  isOnline: { type: Boolean, default: false },
  isAvailable: { type: Boolean, default: false },
  todayDeliveries: { type: Number, default: 0 },
  completedDeliveries: { type: Number, default: 0 },
  totalEarnings: { type: Number, default: 0 },
  activeOrderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', default: null },
  activeOrderIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Order' }],
  maxConcurrentOrders: { type: Number, default: 5 },
  assignedWarehouse: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse' },
  onboardedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  mustChangePassword: { type: Boolean, default: false },
  emergencyContact: {
    name: { type: String, default: '' },
    phone: { type: String, default: '' },
    relation: { type: String, default: '' }
  }
}, { timestamps: true });

export const DeliveryAgent = mongoose.models.DeliveryAgent || mongoose.model('DeliveryAgent', deliveryAgentSchema);

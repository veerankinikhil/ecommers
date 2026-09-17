import mongoose from 'mongoose';

const giftCardSchema = new mongoose.Schema({
  code: { type: String, unique: true, required: true },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, default: 50 },
  isActive: { type: Boolean, default: true },
  isUsed: { type: Boolean, default: false },
  expiryDate: { type: Date, required: true },
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', default: null },
  usedAt: { type: Date, default: null }
}, { timestamps: true });

giftCardSchema.pre('validate', function(next) {
  if (!this.code) {
    this.code = 'GC-' + Math.random().toString(36).substring(2, 8).toUpperCase() + '-' + Math.floor(100 + Math.random() * 900);
  }
  if (!this.expiryDate) {
    // Expires in 30 days
    this.expiryDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  }
  next();
});

export const GiftCard = mongoose.models.GiftCard || mongoose.model('GiftCard', giftCardSchema);

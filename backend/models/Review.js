import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, required: true, min: 1, max: 5, default: 5 },
  comment: { type: String, default: '' }
}, { timestamps: true });

export const Review = mongoose.models.Review || mongoose.model('Review', reviewSchema);

import mongoose from 'mongoose';

const wishlistSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }]
}, { timestamps: true });

export const Wishlist = mongoose.models.Wishlist || mongoose.model('Wishlist', wishlistSchema);

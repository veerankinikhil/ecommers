import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Seller', required: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  oldPrice: { type: Number, default: 0 },
  discount: { type: String, default: '' },
  brand: { type: String, default: 'Generic' },
  stock: { type: Number, default: 10 },
  images: [{ type: String, default: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80' }],
  videos: [{ type: String }],
  weight: { type: String, default: '500g' },
  category: { type: String, required: true }, // slug or category ID
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  location: {
    lat: { type: Number, default: 28.6139 },
    lng: { type: Number, default: 77.2090 },
    address: { type: String, default: 'Seller Hub, Warehouse 4' }
  },
  ratingsAverage: { type: Number, default: 4.8 },
  ratingsCount: { type: Number, default: 12 }
}, { timestamps: true });

export const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

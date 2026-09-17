import { Product } from '../models/Product.js';
import { Seller } from '../models/Seller.js';
import { Category } from '../models/Category.js';
import { Review } from '../models/Review.js';
import { emitToAdmin } from '../services/socketService.js';

// @desc    Get all active products with Search, Category Filter, and Sorting
// @route   GET /api/products
// @access  Public (Customer Storefront)
export const getAllProducts = async (req, res, next) => {
  try {
    const { query, category, minPrice, maxPrice, sortBy, brand } = req.query;
    let filter = { status: 'active' };

    // Search query
    if (query) {
      filter.$or = [
        { name: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { brand: { $regex: query, $options: 'i' } }
      ];
    }

    // Category filter
    if (category && category !== 'all') {
      filter.category = { $regex: new RegExp(`^${category}$`, 'i') };
    }

    // Brand filter
    if (brand) {
      filter.brand = { $regex: new RegExp(`^${brand}$`, 'i') };
    }

    // Price range
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    // Sorting
    let sortQuery = { createdAt: -1 };
    if (sortBy === 'low-high') sortQuery = { price: 1 };
    if (sortBy === 'high-low') sortQuery = { price: -1 };
    if (sortBy === 'rating') sortQuery = { ratingsAverage: -1 };

    const products = await Product.find(filter)
      .populate('sellerId', 'storeName ownerName businessAddress location ratingsAverage')
      .sort(sortQuery);

    res.json({
      success: true,
      count: products.length,
      products
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Single Product Details + Reviews
// @route   GET /api/products/:id
// @access  Public
export const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('sellerId', 'storeName ownerName email phone location ratingsAverage isApproved');

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    const reviews = await Review.find({ productId: product._id }).sort({ createdAt: -1 });

    res.json({
      success: true,
      product,
      reviews
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Seller Add Product (Immediately available on Customer Website)
// @route   POST /api/products/seller
// @access  Private (Seller only)
export const createSellerProduct = async (req, res, next) => {
  try {
    const seller = await Seller.findOne({ userId: req.user._id });
    if (!seller) {
      return res.status(404).json({ success: false, message: 'Seller profile not found.' });
    }

    if (!seller.isApproved) {
      return res.status(403).json({
        success: false,
        message: 'Your seller account is awaiting Admin approval. You cannot list products yet.'
      });
    }

    const { name, description, category, brand, price, oldPrice, stock, images, videos, weight } = req.body;

    const discountStr = oldPrice && Number(oldPrice) > Number(price)
      ? `SAVE ${Math.round(((oldPrice - price) / oldPrice) * 100)}%`
      : '';

    // Sanitize and limit images (up to 10)
    let cleanedImages = [];
    if (Array.isArray(images) && images.length > 0) {
      cleanedImages = images.filter(img => typeof img === 'string' && img.trim() !== '').slice(0, 10);
    }
    if (cleanedImages.length === 0) {
      cleanedImages = ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80'];
    }

    // Sanitize and limit videos (up to 2)
    let cleanedVideos = [];
    if (Array.isArray(videos) && videos.length > 0) {
      cleanedVideos = videos.filter(vid => typeof vid === 'string' && vid.trim() !== '').slice(0, 2);
    }

    const product = await Product.create({
      sellerId: seller._id,
      name,
      description,
      category,
      brand: brand || 'Generic',
      price: Number(price),
      oldPrice: oldPrice ? Number(oldPrice) : Number(price) * 1.25,
      discount: discountStr,
      stock: Number(stock) || 10,
      images: cleanedImages,
      videos: cleanedVideos,
      weight: weight || '500g',
      status: 'active',
      location: {
        lat: seller.location?.lat || 28.6139,
        lng: seller.location?.lng || 77.2090,
        address: seller.businessAddress
      }
    });

    emitToAdmin('product_created_by_seller', {
      productId: product._id,
      productName: product.name,
      sellerStoreName: seller.storeName
    });

    res.status(201).json({
      success: true,
      message: 'Product listed successfully and is now active on the Customer Storefront!',
      product
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Seller Get Their Own Products
// @route   GET /api/products/seller/my-products
// @access  Private (Seller only)
export const getSellerProducts = async (req, res, next) => {
  try {
    const seller = await Seller.findOne({ userId: req.user._id });
    if (!seller) {
      return res.status(404).json({ success: false, message: 'Seller profile not found.' });
    }

    const products = await Product.find({ sellerId: seller._id }).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: products.length,
      products
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Seller Update Product / Stock
// @route   PUT /api/products/seller/:id
// @access  Private (Seller only)
export const updateSellerProduct = async (req, res, next) => {
  try {
    const seller = await Seller.findOne({ userId: req.user._id });
    let product = await Product.findOne({ _id: req.params.id, sellerId: seller._id });

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found or not owned by your store.' });
    }

    const updateData = { ...req.body };
    if (Array.isArray(updateData.images)) {
      updateData.images = updateData.images.filter(img => typeof img === 'string' && img.trim() !== '').slice(0, 10);
      if (updateData.images.length === 0) {
        updateData.images = product.images;
      }
    }
    if (Array.isArray(updateData.videos)) {
      updateData.videos = updateData.videos.filter(vid => typeof vid === 'string' && vid.trim() !== '').slice(0, 2);
    }

    const price = updateData.price !== undefined ? Number(updateData.price) : product.price;
    const oldPrice = updateData.oldPrice !== undefined ? Number(updateData.oldPrice) : product.oldPrice;
    if (oldPrice && oldPrice > price) {
      updateData.discount = `SAVE ${Math.round(((oldPrice - price) / oldPrice) * 100)}%`;
    } else {
      updateData.discount = '';
    }

    product = await Product.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true
    });

    res.json({
      success: true,
      message: 'Product updated successfully.',
      product
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Seller Delete Product
// @route   DELETE /api/products/seller/:id
// @access  Private (Seller only)
export const deleteSellerProduct = async (req, res, next) => {
  try {
    const seller = await Seller.findOne({ userId: req.user._id });
    const product = await Product.findOneAndDelete({ _id: req.params.id, sellerId: seller._id });

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found or not owned by your store.' });
    }

    res.json({
      success: true,
      message: 'Product deleted from catalog.'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin / Public Categories list
// @route   GET /api/categories
// @access  Public
export const getCategories = async (req, res, next) => {
  try {
    let categories = await Category.find({ isActive: true });
    if (!categories || categories.length === 0) {
      categories = [
        { name: 'Electronics & Gadgets', slug: 'electronics', icon: 'fa-laptop', description: 'Headphones, watches, computing and audio' },
        { name: 'Fashion & Apparel', slug: 'fashion', icon: 'fa-shirt', description: 'Clothing, athletic footwear and accessories' },
        { name: 'Home & Office', slug: 'home', icon: 'fa-couch', description: 'Furniture, desk accessories and smart decor' },
        { name: 'Beauty & Personal Care', slug: 'beauty', icon: 'fa-spa', description: 'Skincare, health and wellness' },
        { name: 'Sports & Fitness', slug: 'sports', icon: 'fa-baseball-bat-ball', description: 'Gym equipment, water bottles and wear' },
        { name: 'Books & Stationery', slug: 'books', icon: 'fa-book', description: 'Textbooks, notebooks and college essentials' }
      ];
    }
    res.json({ success: true, categories });
  } catch (error) {
    next(error);
  }
};

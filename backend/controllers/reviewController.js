import { Review } from '../models/Review.js';
import { Product } from '../models/Product.js';

// @desc    Add Review for a Product
// @route   POST /api/reviews
// @access  Private (Customer)
export const addProductReview = async (req, res, next) => {
  try {
    const { productId, rating, comment, title } = req.body;

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    const review = await Review.create({
      productId: product._id,
      customerId: req.user._id,
      customerName: req.user.name,
      rating: Number(rating),
      title: title || 'Verified Customer Review',
      comment
    });

    // Update Product Ratings Average
    const allReviews = await Review.find({ productId: product._id });
    const avg = allReviews.reduce((acc, item) => item.rating + acc, 0) / allReviews.length;
    product.ratingsAverage = parseFloat(avg.toFixed(1));
    product.ratingsCount = allReviews.length;
    await product.save();

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully!',
      review
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Reviews for a Product
// @route   GET /api/reviews/product/:productId
// @access  Public
export const getProductReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ productId: req.params.productId }).sort({ createdAt: -1 });
    res.json({ success: true, count: reviews.length, reviews });
  } catch (error) {
    next(error);
  }
};

import { Seller } from '../models/Seller.js';
import { Product } from '../models/Product.js';
import { Order } from '../models/Order.js';
import { ORDER_STATUSES } from '../config/constants.js';

// @desc    Get Seller Dashboard Statistics
// @route   GET /api/sellers/dashboard-stats
// @access  Private (Seller)
export const getSellerDashboardStats = async (req, res, next) => {
  try {
    const seller = await Seller.findOne({ userId: req.user._id });
    if (!seller) return res.status(404).json({ success: false, message: 'Seller not found' });

    const totalProducts = await Product.countDocuments({ sellerId: seller._id });
    const totalOrders = await Order.countDocuments({ sellerId: seller._id });
    const pendingOrders = await Order.countDocuments({ sellerId: seller._id, orderStatus: ORDER_STATUSES.PENDING });
    const completedOrders = await Order.countDocuments({ sellerId: seller._id, orderStatus: ORDER_STATUSES.DELIVERED });

    // Recent orders
    const recentOrders = await Order.find({ sellerId: seller._id })
      .populate('customerId', 'name phone')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      success: true,
      stats: {
        storeName: seller.storeName,
        isApproved: seller.isApproved,
        status: seller.status,
        revenue: seller.revenue,
        totalProducts,
        totalOrders,
        pendingOrders,
        completedOrders
      },
      recentOrders
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update Store Profile & Location
// @route   PUT /api/sellers/profile
// @access  Private (Seller)
export const updateSellerProfile = async (req, res, next) => {
  try {
    const { storeName, phone, businessAddress, lat, lng } = req.body;
    let seller = await Seller.findOne({ userId: req.user._id });
    if (!seller) return res.status(404).json({ success: false, message: 'Seller not found' });

    if (storeName) seller.storeName = storeName;
    if (phone) seller.phone = phone;
    if (businessAddress) seller.businessAddress = businessAddress;
    if (lat && lng) {
      seller.location.lat = parseFloat(lat);
      seller.location.lng = parseFloat(lng);
    }

    await seller.save();
    res.json({ success: true, message: 'Seller profile updated', seller });
  } catch (error) {
    next(error);
  }
};

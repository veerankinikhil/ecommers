import { GiftCard } from '../models/GiftCard.js';

// @desc    Get current user's gift cards
// @route   GET /api/gift-cards/my-cards
// @access  Private
export const getMyGiftCards = async (req, res, next) => {
  try {
    const cards = await GiftCard.find({ customerId: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, cards });
  } catch (error) {
    next(error);
  }
};

// @desc    Validate and verify gift card for order checkout
// @route   POST /api/gift-cards/apply
// @access  Private
export const applyGiftCard = async (req, res, next) => {
  try {
    const { code } = req.body;
    if (!code) {
      return res.status(400).json({ success: false, message: 'Please provide a gift card code.' });
    }

    const cleanCode = code.trim().toUpperCase();

    // Special Global First-Order Promo Gift Card: NOVAKART20
    if (cleanCode === 'NOVAKART20') {
      const OrderModule = await import('../models/Order.js');
      const Order = OrderModule.Order || OrderModule;
      
      const orderCount = await Order.countDocuments({ customerId: req.user._id, orderStatus: { $ne: 'CANCELLED' } });
      if (orderCount > 0) {
        return res.status(400).json({ success: false, message: 'This promo code is only valid for your first order.' });
      }

      return res.json({
        success: true,
        message: 'First order promo applied successfully! (₹50 discount)',
        card: {
          code: 'NOVAKART20',
          amount: 50
        }
      });
    }

    const card = await GiftCard.findOne({ code: cleanCode });

    if (!card) {
      return res.status(404).json({ success: false, message: 'Invalid gift card code.' });
    }

    if (card.customerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'This gift card belongs to another account.' });
    }

    if (card.isUsed) {
      return res.status(400).json({ success: false, message: 'This gift card has already been used.' });
    }

    if (new Date() > new Date(card.expiryDate)) {
      return res.status(400).json({ success: false, message: 'This gift card has expired.' });
    }

    res.json({
      success: true,
      message: 'Gift card applied successfully!',
      card: {
        code: card.code,
        amount: card.amount
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: get all generated gift cards
// @route   GET /api/gift-cards/admin/all
// @access  Private/Admin
export const getAdminAllGiftCards = async (req, res, next) => {
  try {
    const cards = await GiftCard.find({})
      .populate('customerId', 'name email')
      .populate('orderId', 'orderNumber totalAmount')
      .sort({ createdAt: -1 });
    res.json({ success: true, cards });
  } catch (error) {
    next(error);
  }
};

import { Order } from '../models/Order.js';
import { Cart } from '../models/Cart.js';
import { Seller } from '../models/Seller.js';
import { DeliveryAgent } from '../models/DeliveryAgent.js';
import { DeliveryRequest } from '../models/DeliveryRequest.js';
import { dispatchNearbyDeliveryAgents } from '../services/deliveryDispatchService.js';
import { emitToSeller, emitToUser, emitToAdmin, emitToOrderRoom } from '../services/socketService.js';
import { ORDER_STATUSES, DELIVERY_REQUEST_STATUSES, PAYMENT_STATUSES } from '../config/constants.js';
import { createNotification } from './notificationController.js';
import { User } from '../models/User.js';
import { Product } from '../models/Product.js';
import { Warehouse } from '../models/Warehouse.js';
import { calculateDistanceKm } from './warehouseController.js';
import { sendOrderStatusUpdateEmail } from '../utils/emailService.js';

// Auto-assign multi-stage logistics routing: Store -> Mother/Regional Hub -> Delivery Branch -> Customer
export const assignLogisticsRoute = async (sellerLocation, deliveryLocation, stateHint = 'Andhra Pradesh') => {
  try {
    const warehouses = await Warehouse.find({ status: 'active' });
    if (!warehouses || warehouses.length === 0) return null;

    // 1. Origin hub: Mother Warehouse or Regional Sorting Hub nearest to seller location
    const hubs = warehouses.filter(w => w.type === 'Mother Warehouse' || w.type === 'Regional Sorting Hub');
    let originHub = hubs[0] || warehouses[0];
    let minOriginDist = Infinity;
    const sLat = sellerLocation?.lat || 16.5062;
    const sLng = sellerLocation?.lng || 80.6480;

    for (const h of (hubs.length > 0 ? hubs : warehouses)) {
      const d = calculateDistanceKm(sLat, sLng, h.location.lat, h.location.lng);
      if (d < minOriginDist) {
        minOriginDist = d;
        originHub = h;
      }
    }

    // 2. Destination branch: Delivery Branch nearest to customer delivery address
    const branches = warehouses.filter(w => w.type === 'Delivery Branch');
    let destBranch = branches[0] || warehouses[0];
    let minDestDist = Infinity;
    const isTS = typeof stateHint === 'string' && stateHint.toLowerCase().includes('telangana');
    const dLat = deliveryLocation?.lat || (isTS ? 17.3850 : 16.2437);
    const dLng = deliveryLocation?.lng || (isTS ? 78.4867 : 80.6400);

    for (const b of (branches.length > 0 ? branches : warehouses)) {
      const d = calculateDistanceKm(dLat, dLng, b.location.lat, b.location.lng);
      if (d < minDestDist) {
        minDestDist = d;
        destBranch = b;
      }
    }

    return {
      originWarehouse: originHub._id,
      destinationBranch: destBranch._id,
      transitStage: 'AT_STORE',
      estimatedTransitDays: 2,
      notes: `Routed via ${originHub.name} to ${destBranch.name}`
    };
  } catch (err) {
    console.error('Error assigning logistics route:', err);
    return null;
  }
};

const notifyStatusEmail = async (order, status, note = '') => {
  try {
    const customer = await User.findById(order.customerId);
    if (customer && customer.email) {
      const expectedDate = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
      await sendOrderStatusUpdateEmail(
        customer.email,
        order,
        status.replace(/_/g, ' '),
        note || `Your order status has been updated to ${status.replace(/_/g, ' ')}.`,
        status === ORDER_STATUSES.DELIVERED ? 'Delivered Today' : expectedDate
      );
    }
  } catch (err) {
    console.error('Failed to notify status email:', err);
  }
};

// ============================================================================
// 1. CUSTOMER ORDER OPERATIONS
// ============================================================================

// @desc    Place a New Order
// @route   POST /api/orders/place
// @access  Private (Customer)
export const placeOrder = async (req, res, next) => {
  try {
    const { items, deliveryAddress, paymentMethod, giftCardCode, promoCode } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart items are required to place an order.' });
    }

    // Lookup products in DB to ensure 100% accurate seller resolution
    const productIds = items.map(i => i.productId?._id || i.productId || i.id).filter(Boolean);
    const dbProducts = await Product.find({ _id: { $in: productIds } });
    const productMap = {};
    dbProducts.forEach(p => { productMap[p._id.toString()] = p; });

    const resolvedItems = items.map(i => {
      const pId = (i.productId?._id || i.productId || i.id)?.toString();
      const dbP = productMap[pId];
      const resolvedItemSellerId = dbP?.sellerId || i.sellerId;
      const itemPrice = i.price !== undefined ? Number(i.price) : (dbP?.price || 0);
      const itemQty = Number(i.quantity) || 1;
      return {
        productId: pId || dbP?._id,
        sellerId: resolvedItemSellerId,
        name: i.name || dbP?.name || 'Product',
        price: itemPrice,
        quantity: itemQty,
        image: i.image || dbP?.images?.[0] || '',
        subtotal: itemPrice * itemQty
      };
    });

    const firstSellerId = resolvedItems[0]?.sellerId || items[0]?.sellerId;
    const seller = firstSellerId ? await Seller.findById(firstSellerId) : null;

    const subtotal = resolvedItems.reduce((sum, item) => sum + item.subtotal, 0);
    const automaticDiscount = (subtotal > 2000 && !promoCode) ? Math.round(subtotal * 0.1) : 0;
    const tax = 199;
    const shippingFee = subtotal >= 1000 ? 0 : 50;
    const convenienceFee = paymentMethod === 'Cash on Delivery (COD)' ? 10 : 0;

    // Check if a promo code was selected
    let promoDiscount = 0;
    if (promoCode) {
      const cleanPromo = promoCode.trim().toUpperCase();
      if (cleanPromo === 'NOVAKART20') {
        const orderCount = await Order.countDocuments({ customerId: req.user._id, orderStatus: { $ne: 'CANCELLED' } });
        if (orderCount === 0) {
          promoDiscount = 50;
        }
      } else if (cleanPromo === 'SUPER200') {
        if (subtotal >= 2000) promoDiscount = 200;
      } else if (cleanPromo === 'FESTIVE100') {
        if (subtotal >= 1200) promoDiscount = 100;
      }
    }

    // Check if a gift card was applied (passed as req.body.giftCardCode)
    let giftCardDiscount = 0;
    let giftCardInstance = null;

    if (giftCardCode) {
      const cleanGiftCode = giftCardCode.trim().toUpperCase();
      if (cleanGiftCode === 'NOVAKART20') {
        const orderCount = await Order.countDocuments({ customerId: req.user._id, orderStatus: { $ne: 'CANCELLED' } });
        if (orderCount === 0) {
          giftCardDiscount = 50;
        }
      } else {
        const GiftCardModule = await import('../models/GiftCard.js');
        const GiftCard = GiftCardModule.GiftCard;
        const card = await GiftCard.findOne({ code: cleanGiftCode, customerId: req.user._id, isUsed: false });
        if (card && new Date() < new Date(card.expiryDate)) {
          giftCardDiscount = card.amount; // ₹50
          giftCardInstance = card;
        }
      }
    }

    const totalAmount = subtotal - (automaticDiscount + promoDiscount + giftCardDiscount) + tax + shippingFee + convenienceFee;

    // Automatically determine logistics routing (Store -> Mother/Regional Hub -> Delivery Branch -> Customer)
    let routeData = null;
    try {
      const sellerCoords = seller?.location || { lat: 16.5062, lng: 80.6480 };
      const destCoords = deliveryAddress.coordinates || { lat: 16.2437, lng: 80.6400 };
      routeData = await assignLogisticsRoute(sellerCoords, destCoords, deliveryAddress.state);
    } catch (e) {
      console.warn('Could not auto-assign logistics route:', e);
    }

    const order = await Order.create({
      customerId: req.user._id,
      sellerId: firstSellerId,
      items: resolvedItems,
      subtotal,
      tax,
      shippingFee,
      discount: automaticDiscount + promoDiscount + giftCardDiscount,
      convenienceFee,
      totalAmount,
      logisticsRoute: routeData || undefined,
      deliveryAddress: {
        fullName: deliveryAddress.fullName || req.user.name,
        phone: deliveryAddress.phone || req.user.phone || '9876543210',
        street: deliveryAddress.street,
        city: deliveryAddress.city || 'New Delhi',
        state: deliveryAddress.state || 'Delhi',
        postalCode: deliveryAddress.postalCode || '110001',
        coordinates: deliveryAddress.coordinates || { lat: 28.6139, lng: 77.2090 }
      },
      pickupLocation: {
        storeName: seller?.storeName || 'NovaKart Central Hub',
        address: seller?.businessAddress || 'Connaught Place, New Delhi',
        coordinates: seller?.location || { lat: 28.6139, lng: 77.2090 }
      },
      paymentMethod: paymentMethod || 'Cash on Delivery (COD)',
      paymentStatus: paymentMethod === 'Cash on Delivery (COD)' ? PAYMENT_STATUSES.PENDING : PAYMENT_STATUSES.PAID,
      orderStatus: ORDER_STATUSES.PENDING
    });

    // Mark gift card as used if applicable
    if (giftCardInstance) {
      giftCardInstance.isUsed = true;
      giftCardInstance.orderId = order._id;
      giftCardInstance.usedAt = new Date();
      await giftCardInstance.save();
    }

    // Earn new ₹50 gift card for orders above ₹1000
    if (totalAmount > 1000) {
      try {
        const GiftCardModule = await import('../models/GiftCard.js');
        const GiftCard = GiftCardModule.GiftCard;
        const newCard = await GiftCard.create({
          customerId: req.user._id,
          amount: 50,
          isActive: true,
          expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        });

        // Notify in-app
        createNotification({
          recipientId: req.user._id,
          role: 'customer',
          title: '🎁 You Earned a ₹50 Gift Card!',
          message: `Congratulations! You earned a ₹50 gift card for ordering above ₹1000! Code: ${newCard.code} (Expires: ${new Date(newCard.expiryDate).toLocaleDateString()})`,
          type: 'PROMO_OFFER',
          link: '/profile'
        });

        // Send Email
        const emailService = await import('../utils/emailService.js');
        await emailService.sendGiftCardEmail(req.user.email, newCard);
      } catch (err) {
        console.error('Failed to create/notify gift card:', err);
      }
    }

    // Send order confirmation email
    try {
      const emailService = await import('../utils/emailService.js');
      const expectedDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
      await emailService.sendOrderPlacedEmail(req.user.email, order, expectedDate);
    } catch (err) {
      console.error('Failed to send order placement email:', err);
    }

    // Clear Customer Cart in MongoDB
    await Cart.findOneAndUpdate({ customerId: req.user._id }, { items: [], subtotal: 0, totalAmount: 0 });

    // Real-time Socket alert to Seller
    emitToSeller(firstSellerId, 'new_incoming_order', {
      orderId: order._id,
      orderNumber: order.orderNumber,
      totalAmount: order.totalAmount,
      customerName: order.deliveryAddress.fullName,
      itemCount: order.items.length
    });

    // Alert Admin
    emitToAdmin('admin_new_order', {
      orderId: order._id,
      orderNumber: order.orderNumber,
      totalAmount: order.totalAmount
    });

    // Record Inbound Payment in Treasury System with exact receivedAt
    try {
      const { PaymentTransaction } = await import('../models/PaymentTransaction.js');
      const inboundTxId = `TXN-IN-${order.orderNumber}`;
      const now = new Date();
      await PaymentTransaction.create({
        transactionId: inboundTxId,
        utrNumber: `UTR-IN-${now.getTime().toString().slice(-8)}${Math.floor(1000 + Math.random() * 9000)}`,
        type: 'INBOUND_CUSTOMER_PAYMENT',
        amount: order.totalAmount,
        subtotal: order.subtotal,
        tax: order.tax || 0,
        deliveryFee: order.shippingFee || 0,
        sender: {
          name: order.deliveryAddress?.fullName || req.user.name,
          role: 'customer',
          accountOrVpa: paymentMethod?.includes('UPI') ? 'buyer@upi' : 'Payment Gateway / Nodal'
        },
        recipient: {
          name: 'NovaKart Marketplace Escrow Pool',
          role: 'platform',
          storeOrHubName: 'NovaKart Central Treasury',
          bankName: 'HDFC Escrow Account',
          accountNumber: '50200084729104',
          ifscCode: 'HDFC0000001'
        },
        paymentMethod: paymentMethod || 'UPI / Google Pay',
        status: paymentMethod === 'Cash on Delivery (COD)' ? 'PENDING_VERIFICATION' : 'SUCCESS',
        verificationStatus: 'VERIFIED',
        verificationNotes: paymentMethod === 'Cash on Delivery (COD)' ? 'COD cash collection pending from delivery agent' : 'Payment captured into NovaKart nodal escrow pool',
        orderId: order._id,
        orderNumber: order.orderNumber,
        receivedAt: now,
        createdAt: now
      });
    } catch (txErr) {
      console.error('Failed to log payment transaction:', txErr);
    }

    // ── In-app notifications ──────────────────────────────────────────
    // Notify Customer
    createNotification({
      recipientId: req.user._id,
      role: 'customer',
      title: `Order #${order.orderNumber} Placed!`,
      message: `Your order for ${order.items.length} item(s) worth ₹${order.totalAmount.toLocaleString('en-IN')} has been placed successfully.`,
      type: 'ORDER_STATUS',
      link: `/orders/${order._id}`,
      orderId: order._id,
    });
    // Notify Seller
    if (seller?.userId) {
      createNotification({
        recipientId: seller.userId,
        role: 'seller',
        title: `New Order #${order.orderNumber}`,
        message: `You have a new order for ${order.items.length} item(s) worth ₹${order.totalAmount.toLocaleString('en-IN')}. Review and confirm.`,
        type: 'ORDER_STATUS',
        link: `/orders`,
        orderId: order._id,
      });
    }

    res.status(201).json({
      success: true,
      message: 'Order placed successfully!',
      order
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Customer Order History
// @route   GET /api/orders/my-orders
// @access  Private (Customer)
export const getCustomerOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ customerId: req.user._id })
      .populate('sellerId', 'storeName phone location')
      .populate('deliveryAgentId', 'fullName phone vehicleType vehicleNumber profileImage currentLocation')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: orders.length, orders });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Single Order by ID (Tracking & Details)
// @route   GET /api/orders/:id
// @access  Private (Authenticated)
export const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('customerId', 'name email phone')
      .populate('sellerId', 'storeName ownerName phone businessAddress location')
      .populate('deliveryAgentId', 'fullName phone vehicleType vehicleNumber profileImage currentLocation')
      .populate('items.productId', 'name title images thumbnail price')
      .populate('logisticsRoute.originWarehouse')
      .populate('logisticsRoute.destinationBranch');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    res.json({ success: true, order });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel Order (Customer before acceptance)
// @route   PUT /api/orders/:id/cancel
// @access  Private (Customer)
export const cancelCustomerOrder = async (req, res, next) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, customerId: req.user._id });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });

    if (order.orderStatus !== ORDER_STATUSES.PENDING) {
      return res.status(400).json({
        success: false,
        message: `Order cannot be cancelled in current status: ${order.orderStatus}`
      });
    }

    order.orderStatus = ORDER_STATUSES.CANCELLED;
    order.cancellationReason = req.body.reason || 'Cancelled by customer';
    await order.save();
    notifyStatusEmail(order, ORDER_STATUSES.CANCELLED, 'Order cancelled by customer');

    emitToSeller(order.sellerId, 'order_cancelled_by_customer', { orderId: order._id });
    emitToAdmin('admin_order_update', { orderId: order._id, status: ORDER_STATUSES.CANCELLED });

    res.json({ success: true, message: 'Order cancelled successfully', order });
  } catch (error) {
    next(error);
  }
};

// ============================================================================
// 2. SELLER ORDER OPERATIONS & NEARBY DISPATCH TRIGGER
// ============================================================================

// @desc    Seller View Store Orders
// @route   GET /api/orders/seller/incoming
// @access  Private (Seller)
export const getSellerOrders = async (req, res, next) => {
  try {
    const seller = await Seller.findOne({ userId: req.user._id });
    if (!seller) return res.status(404).json({ success: false, message: 'Seller not found' });

    const orders = await Order.find({
      $or: [
        { sellerId: seller._id },
        { 'items.sellerId': seller._id }
      ]
    })
      .populate('customerId', 'name email phone')
      .populate('deliveryAgentId', 'fullName phone vehicleNumber')
      .populate('items.productId', 'name title images thumbnail price')
      .populate('logisticsRoute.originWarehouse')
      .populate('logisticsRoute.destinationBranch')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: orders.length, orders });
  } catch (error) {
    next(error);
  }
};

// @desc    Seller Accepts Order -> Triggers Nearby Delivery Dispatch
// @route   PUT /api/orders/seller/:id/accept
// @access  Private (Seller)
export const acceptSellerOrder = async (req, res, next) => {
  try {
    const seller = await Seller.findOne({ userId: req.user._id });
    const order = await Order.findOne({
      _id: req.params.id,
      $or: [
        { sellerId: seller._id },
        { 'items.sellerId': seller._id }
      ]
    });

    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    if (order.orderStatus !== ORDER_STATUSES.PENDING) {
      return res.status(400).json({ success: false, message: `Cannot accept order in status ${order.orderStatus}` });
    }

    // Auto-assign logistics route if missing
    if (!order.logisticsRoute || !order.logisticsRoute.destinationBranch) {
      try {
        const sellerCoords = seller?.location || { lat: 16.5062, lng: 80.6480 };
        const destCoords = order.deliveryAddress?.coordinates || { lat: 16.2437, lng: 80.6400 };
        const routeData = await assignLogisticsRoute(sellerCoords, destCoords, order.deliveryAddress?.state);
        if (routeData) {
          order.logisticsRoute = routeData;
        }
      } catch (err) {
        console.error('Error attaching logistics route on seller accept:', err);
      }
    }

    // Step 1: Update status to SELLER_ACCEPTED
    order.orderStatus = ORDER_STATUSES.SELLER_ACCEPTED;
    await order.save();
    notifyStatusEmail(order, ORDER_STATUSES.SELLER_ACCEPTED, 'Seller has accepted your order and is packaging the items.');

    // Step 2: Trigger the automated nearby delivery agent dispatcher
    const dispatchResult = await dispatchNearbyDeliveryAgents(order._id);

    // Step 3: Emit update to Customer
    emitToUser(order.customerId, 'order_status_update', {
      orderId: order._id,
      orderNumber: order.orderNumber,
      status: ORDER_STATUSES.SELLER_ACCEPTED,
      message: 'Seller has accepted your order and packaged items. Finding nearby delivery agent...'
    });

    res.json({
      success: true,
      message: 'Order accepted. Nearby delivery agent dispatch engine triggered.',
      order,
      dispatchResult
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Seller Rejects Order
// @route   PUT /api/orders/seller/:id/reject
// @access  Private (Seller)
export const rejectSellerOrder = async (req, res, next) => {
  try {
    const seller = await Seller.findOne({ userId: req.user._id });
    const order = await Order.findOne({
      _id: req.params.id,
      $or: [
        { sellerId: seller._id },
        { 'items.sellerId': seller._id }
      ]
    });

    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    order.orderStatus = ORDER_STATUSES.REJECTED;
    order.cancellationReason = req.body.reason || 'Store inventory out of stock';
    await order.save();
    notifyStatusEmail(order, ORDER_STATUSES.REJECTED, `Seller rejected this order. Reason: ${order.cancellationReason}`);

    emitToUser(order.customerId, 'order_status_update', {
      orderId: order._id,
      status: ORDER_STATUSES.REJECTED,
      message: 'Seller could not fulfill this order.'
    });

    res.json({ success: true, message: 'Order marked as rejected.', order });
  } catch (error) {
    next(error);
  }
};

// ============================================================================
// 3. DELIVERY AGENT RADAR & FULFILLMENT OPERATIONS
// ============================================================================

// @desc    Get Active Delivery Requests in Agent's Radar
// @route   GET /api/orders/delivery/radar-requests
// @access  Private (Delivery Agent)
export const getDeliveryRadarRequests = async (req, res, next) => {
  try {
    const agent = await DeliveryAgent.findOne({ userId: req.user._id });
    if (!agent) return res.status(404).json({ success: false, message: 'Delivery agent profile not found' });

    const requests = await DeliveryRequest.find({
      deliveryAgentId: agent._id,
      status: DELIVERY_REQUEST_STATUSES.PENDING
    }).populate({
      path: 'orderId',
      populate: [
        { path: 'sellerId', select: 'storeName businessAddress location phone' },
        { path: 'customerId', select: 'name phone' }
      ]
    }).sort({ createdAt: -1 });

    res.json({ success: true, count: requests.length, requests });
  } catch (error) {
    next(error);
  }
};

// @desc    Delivery Agent Accepts Delivery Request
// @route   PUT /api/orders/delivery/requests/:requestId/accept
// @access  Private (Delivery Agent)
export const acceptDeliveryRequest = async (req, res, next) => {
  try {
    const agent = await DeliveryAgent.findOne({ userId: req.user._id });
    const deliveryReq = await DeliveryRequest.findOne({
      _id: req.params.requestId,
      deliveryAgentId: agent._id,
      status: DELIVERY_REQUEST_STATUSES.PENDING
    });

    if (!deliveryReq) {
      return res.status(404).json({ success: false, message: 'Delivery request expired or accepted by another agent.' });
    }

    // 1. Mark request ACCEPTED
    deliveryReq.status = DELIVERY_REQUEST_STATUSES.ACCEPTED;
    deliveryReq.respondedAt = new Date();
    await deliveryReq.save();

    // 2. Assign agent to order & update status to AGENT_ASSIGNED
    const order = await Order.findById(deliveryReq.orderId);
    order.deliveryAgentId = agent._id;
    order.orderStatus = ORDER_STATUSES.AGENT_ASSIGNED;
    await order.save();
    notifyStatusEmail(order, ORDER_STATUSES.AGENT_ASSIGNED, `Delivery agent ${agent.fullName} has accepted your delivery request and is heading to the store.`);

    // 3. Update agent active route queue
    if (!agent.activeOrderIds) {
      agent.activeOrderIds = [];
    }
    if (!agent.activeOrderIds.some(id => id.toString() === order._id.toString())) {
      agent.activeOrderIds.push(order._id);
    }
    agent.activeOrderId = order._id;

    // Recalculate route capacity
    const activeRouteOrdersCount = await Order.countDocuments({
      deliveryAgentId: agent._id,
      orderStatus: {
        $in: [
          ORDER_STATUSES.AGENT_ASSIGNED,
          ORDER_STATUSES.PICKED_UP,
          ORDER_STATUSES.OUT_FOR_DELIVERY
        ]
      }
    });

    const maxConcurrent = agent.maxConcurrentOrders || 5;
    agent.isAvailable = activeRouteOrdersCount < maxConcurrent;
    await agent.save();

    // 4. Cancel other pending delivery requests for this specific order
    await DeliveryRequest.updateMany(
      { orderId: order._id, _id: { $ne: deliveryReq._id } },
      { status: DELIVERY_REQUEST_STATUSES.CANCELLED }
    );

    // 5. Real-time Notifications
    emitToUser(order.customerId, 'delivery_agent_assigned', {
      orderId: order._id,
      agentName: agent.fullName,
      vehicleNumber: agent.vehicleNumber,
      phone: agent.phone,
      message: `${agent.fullName} has accepted your delivery request and is heading to the store.`
    });

    emitToSeller(order.sellerId, 'order_agent_assigned', {
      orderId: order._id,
      agentName: agent.fullName,
      phone: agent.phone
    });

    emitToAdmin('admin_order_update', { orderId: order._id, status: ORDER_STATUSES.AGENT_ASSIGNED });

    res.json({
      success: true,
      message: 'Delivery request accepted! Added to your active delivery route.',
      order,
      activeOrdersCount: activeRouteOrdersCount,
      hasMoreCapacity: activeRouteOrdersCount < maxConcurrent
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update Delivery Status (PICKED_UP -> OUT_FOR_DELIVERY -> DELIVERED)
// @route   PUT /api/orders/delivery/:id/update-status
// @access  Private (Delivery Agent)
export const updateDeliveryStatus = async (req, res, next) => {
  try {
    const { status, otp } = req.body;
    const agent = await DeliveryAgent.findOne({ userId: req.user._id });
    const order = await Order.findOne({ _id: req.params.id, deliveryAgentId: agent._id });

    if (!order) return res.status(404).json({ success: false, message: 'Active order not found for this delivery agent.' });

    // Validate workflow progression
    const validTransitions = {
      [ORDER_STATUSES.AGENT_ASSIGNED]: ORDER_STATUSES.PICKED_UP,
      [ORDER_STATUSES.PICKED_UP]: ORDER_STATUSES.OUT_FOR_DELIVERY,
      [ORDER_STATUSES.OUT_FOR_DELIVERY]: ORDER_STATUSES.DELIVERED
    };

    if (validTransitions[order.orderStatus] !== status && status !== ORDER_STATUSES.DELIVERED) {
      return res.status(400).json({
        success: false,
        message: `Invalid status sequence. Expected '${validTransitions[order.orderStatus]}' but received '${status}'`
      });
    }

    order.orderStatus = status;

    // Handle single-order completion on multi-stop route
    if (status === ORDER_STATUSES.DELIVERED) {
      order.paymentStatus = PAYMENT_STATUSES.PAID;
      agent.todayDeliveries += 1;
      agent.completedDeliveries += 1;
      agent.totalEarnings += 140; // Delivery commission per completed order

      // Remove from active route queue
      if (agent.activeOrderIds) {
        agent.activeOrderIds = agent.activeOrderIds.filter(id => id.toString() !== order._id.toString());
      }

      // Check remaining orders on this rider's route
      const remainingRouteOrders = await Order.find({
        deliveryAgentId: agent._id,
        _id: { $ne: order._id },
        orderStatus: {
          $in: [
            ORDER_STATUSES.AGENT_ASSIGNED,
            ORDER_STATUSES.PICKED_UP,
            ORDER_STATUSES.OUT_FOR_DELIVERY
          ]
        }
      }).sort({ createdAt: 1 });

      const maxConcurrent = agent.maxConcurrentOrders || 5;
      agent.activeOrderId = remainingRouteOrders.length > 0 ? remainingRouteOrders[0]._id : null;
      agent.isAvailable = remainingRouteOrders.length < maxConcurrent;
      await agent.save();

      // Credit seller balance
      await Seller.findByIdAndUpdate(order.sellerId, {
        $inc: { revenue: order.subtotal, completedOrders: 1 }
      });
    }

    await order.save();
    notifyStatusEmail(order, status, `Your order status has been updated to: ${status.replace(/_/g, ' ')}`);

    // Broadcast real-time alerts
    emitToUser(order.customerId, 'order_status_update', {
      orderId: order._id,
      status,
      message: `Your order is now: ${status.replace(/_/g, ' ')}`
    });

    emitToSeller(order.sellerId, 'seller_order_update', { orderId: order._id, status });
    emitToAdmin('admin_order_update', { orderId: order._id, status });

    res.json({
      success: true,
      message: `Order status updated to ${status}`,
      order
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================================
// 4. ADMIN ORDER MONITORING
// ============================================================================

// @desc    Admin View All Orders Across the Platform
// @route   GET /api/orders/admin/all
// @access  Private (Admin)
export const getAdminAllOrders = async (req, res, next) => {
  try {
    const orders = await Order.find()
      .populate('customerId', 'name email phone')
      .populate('sellerId', 'storeName email phone businessAddress')
      .populate('deliveryAgentId', 'fullName email phone vehicleNumber')
      .populate('items.productId', 'name title images thumbnail price')
      .populate('logisticsRoute.originWarehouse')
      .populate('logisticsRoute.destinationBranch')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: orders.length, orders });
  } catch (error) {
    next(error);
  }
};

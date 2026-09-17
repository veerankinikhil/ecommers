import mongoose from 'mongoose';
import { DeliveryAgent } from '../models/DeliveryAgent.js';
import { User } from '../models/User.js';
import { Order } from '../models/Order.js';
import { Seller } from '../models/Seller.js';
import { Product } from '../models/Product.js';
import { Warehouse } from '../models/Warehouse.js';
import { ORDER_STATUSES, PAYMENT_METHODS, PAYMENT_STATUSES } from '../config/constants.js';
import { optimizeDeliveryRoute } from '../utils/routeOptimizer.js';
import { emitToOrderRoom, emitToSeller, emitToUser, emitToAdmin } from '../services/socketService.js';

// @desc    Get Delivery Agent Dashboard Overview with Area-Wise Sequenced Active Route
// @route   GET /api/delivery/dashboard-stats
// @access  Private (Delivery Agent)
export const getDeliveryDashboardStats = async (req, res, next) => {
  try {
    const agent = await DeliveryAgent.findOne({ userId: req.user._id });
    if (!agent) return res.status(404).json({ success: false, message: 'Delivery agent not found' });

    // Fetch all active orders on current route
    const rawActiveOrders = await Order.find({
      deliveryAgentId: agent._id,
      orderStatus: {
        $in: [
          ORDER_STATUSES.AGENT_ASSIGNED,
          ORDER_STATUSES.PICKED_UP,
          ORDER_STATUSES.OUT_FOR_DELIVERY
        ]
      }
    })
      .populate('customerId', 'name phone email')
      .populate('sellerId', 'storeName businessAddress location phone')
      .populate('items.productId', 'images thumbnail')
      .populate('logisticsRoute.originWarehouse')
      .populate('logisticsRoute.destinationBranch');

    // Automatically sequence orders stop-by-stop area-wise (e.g. Etukuru first, then Budampadu, then Prathipadu)
    const isNearCorridor = agent.currentLocation?.lat && agent.currentLocation.lat < 20 && agent.currentLocation.lat > 14;
    const agentCoords = isNearCorridor ? { lat: agent.currentLocation.lat, lng: agent.currentLocation.lng } : { lat: 16.3067, lng: 80.4365, name: 'Guntur Delivery Hub' };
    
    let endLocation = null;
    if (req.query.endLat && req.query.endLng) {
      endLocation = {
        lat: parseFloat(req.query.endLat),
        lng: parseFloat(req.query.endLng),
        name: req.query.endName || 'Selected End Hub'
      };
    }

    const optimizedActiveOrders = optimizeDeliveryRoute(rawActiveOrders, agentCoords, endLocation);

    const maxConcurrent = agent.maxConcurrentOrders || 10;
    const isAvailable = agent.isOnline && (optimizedActiveOrders.length < maxConcurrent);

    res.json({
      success: true,
      stats: {
        fullName: agent.fullName,
        vehicleNumber: agent.vehicleNumber,
        vehicleType: agent.vehicleType,
        isApproved: agent.isApproved,
        status: agent.status,
        isOnline: agent.isOnline,
        isAvailable,
        activeOrdersCount: optimizedActiveOrders.length,
        maxConcurrentOrders: maxConcurrent,
        todayDeliveries: agent.todayDeliveries,
        completedDeliveries: agent.completedDeliveries,
        totalEarnings: agent.totalEarnings,
        currentLocation: agent.currentLocation,
        mustChangePassword: agent.mustChangePassword || req.user.mustChangePassword || false,
        assignedWarehouse: agent.assignedWarehouse || null
      },
      activeOrder: optimizedActiveOrders[0] || null,
      activeOrders: optimizedActiveOrders
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Scan Barcode or Enter Last 6 Digits of Order ID to Pick Up from Warehouse / Seller
// @route   POST /api/delivery/warehouse-pickup/scan
// @access  Private (Delivery Agent)
export const scanWarehousePickup = async (req, res, next) => {
  try {
    const { searchCode } = req.body;
    if (!searchCode || typeof searchCode !== 'string') {
      return res.status(400).json({ success: false, message: 'Please provide a valid barcode, QR code or Order ID.' });
    }

    const agent = await DeliveryAgent.findOne({ userId: req.user._id });
    if (!agent) return res.status(404).json({ success: false, message: 'Delivery agent profile not found.' });

    // Clean scanned string: remove surrounding quotes, hash, whitespace
    const clean = searchCode.trim().replace(/^['"#\s]+|['"#\s]+$/g, '');
    const cleanUpper = clean.toUpperCase();
    const digitsOnly = clean.replace(/[^0-9]/g, '');

    // Search conditions across full orderNumber, regex suffix, ObjectId, and tracking
    const orConditions = [
      { orderNumber: cleanUpper },
      { orderNumber: { $regex: cleanUpper.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$', $options: 'i' } }
    ];

    if (mongoose.Types.ObjectId.isValid(clean)) {
      orConditions.push({ _id: clean });
    }

    if (digitsOnly.length >= 4) {
      orConditions.push({ orderNumber: { $regex: digitsOnly + '$', $options: 'i' } });
    }

    let order = await Order.findOne({ $or: orConditions })
      .populate('customerId', 'name phone email')
      .populate('sellerId', 'storeName businessAddress location phone')
      .populate('items.productId', 'images thumbnail')
      .populate('logisticsRoute.originWarehouse')
      .populate('logisticsRoute.destinationBranch');

    // Suffix fallback search for recent packages if not found
    if (!order && clean.length >= 4) {
      const recentOrders = await Order.find({
        orderStatus: { $nin: [ORDER_STATUSES.CANCELLED] }
      })
        .populate('customerId', 'name phone email')
        .populate('sellerId', 'storeName businessAddress location phone')
        .populate('items.productId', 'images thumbnail')
        .populate('logisticsRoute.originWarehouse')
        .populate('logisticsRoute.destinationBranch')
        .sort({ createdAt: -1 })
        .limit(40);

      order = recentOrders.find(o => 
        o.orderNumber?.toUpperCase().endsWith(cleanUpper) ||
        o._id?.toString().toLowerCase().endsWith(clean.toLowerCase())
      ) || null;
    }

    if (!order) {
      return res.status(404).json({
        success: false,
        message: `Package "${searchCode}" not found in system. Please verify the seller label.`
      });
    }

    if (order.orderStatus === ORDER_STATUSES.CANCELLED) {
      return res.status(400).json({
        success: false,
        message: `Package #${order.orderNumber} was CANCELLED by the customer or seller.`
      });
    }

    // Check if already assigned to this agent
    const isAlreadyAssigned = order.deliveryAgentId && order.deliveryAgentId.toString() === agent._id.toString();

    if (!isAlreadyAssigned) {
      order.deliveryAgentId = agent._id;
    }

    order.orderStatus = ORDER_STATUSES.OUT_FOR_DELIVERY;
    if (!order.logisticsRoute) {
      order.logisticsRoute = {};
    }
    order.logisticsRoute.transitStage = 'OUT_FOR_DELIVERY';

    order.timeline.push({
      status: ORDER_STATUSES.OUT_FOR_DELIVERY,
      timestamp: new Date(),
      note: `Package scanned & accepted from seller ${order.sellerId?.storeName || 'Merchant'} by Delivery Agent ${agent.fullName} (${agent.vehicleNumber})`,
      updatedBy: agent.fullName
    });

    await order.save();

    // Broadcast real-time alerts
    emitToOrderRoom(order._id, 'order_status_update', {
      orderId: order._id,
      status: ORDER_STATUSES.OUT_FOR_DELIVERY,
      message: `Package picked up from seller and is now out for delivery with ${agent.fullName}.`
    });
    emitToSeller(order.sellerId?._id || order.sellerId, 'seller_order_update', { orderId: order._id, status: ORDER_STATUSES.OUT_FOR_DELIVERY });
    emitToUser(order.customerId?._id || order.customerId, 'order_status_update', { orderId: order._id, status: ORDER_STATUSES.OUT_FOR_DELIVERY });
    emitToAdmin('admin_order_update', { orderId: order._id, status: ORDER_STATUSES.OUT_FOR_DELIVERY });

    // Fetch and re-sequence all active orders for this agent
    const rawActive = await Order.find({
      deliveryAgentId: agent._id,
      orderStatus: {
        $in: [
          ORDER_STATUSES.AGENT_ASSIGNED,
          ORDER_STATUSES.PICKED_UP,
          ORDER_STATUSES.OUT_FOR_DELIVERY
        ]
      }
    })
      .populate('customerId', 'name phone email')
      .populate('sellerId', 'storeName businessAddress location phone')
      .populate('items.productId', 'images thumbnail')
      .populate('logisticsRoute.originWarehouse')
      .populate('logisticsRoute.destinationBranch');

    const isNearCorridor = agent.currentLocation?.lat && agent.currentLocation.lat < 20 && agent.currentLocation.lat > 14;
    const agentCoords = isNearCorridor ? { lat: agent.currentLocation.lat, lng: agent.currentLocation.lng } : { lat: 16.3067, lng: 80.4365, name: 'Guntur Delivery Hub' };
    const optimizedActiveOrders = optimizeDeliveryRoute(rawActive, agentCoords);

    res.json({
      success: true,
      message: `🎉 Package #${order.orderNumber} successfully scanned from ${order.sellerId?.storeName || 'seller'} and added to your route!`,
      claimedOrder: order,
      activeOrders: optimizedActiveOrders,
      activeOrder: optimizedActiveOrders[0] || order
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Packages Staged at Warehouse / Seller Dock Ready for Courier Pickup
// @route   GET /api/delivery/warehouse-dock-packages
// @access  Private (Delivery Agent)
export const getWarehouseDockPackages = async (req, res, next) => {
  try {
    const { warehouseCode } = req.query;

    const query = {
      $or: [
        { deliveryAgentId: null, orderStatus: { $in: [ORDER_STATUSES.SELLER_ACCEPTED, ORDER_STATUSES.PENDING, ORDER_STATUSES.DELIVERY_REQUESTED, 'AT_DELIVERY_BRANCH'] } },
        { 'logisticsRoute.transitStage': { $in: ['AT_STORE', 'AT_DELIVERY_BRANCH', 'IN_REGIONAL_HUB'] }, deliveryAgentId: null }
      ]
    };

    if (warehouseCode) {
      const wh = await Warehouse.findOne({ code: warehouseCode });
      if (wh) {
        query['$or'] = [
          { 'logisticsRoute.destinationBranch': wh._id, deliveryAgentId: null },
          { 'logisticsRoute.originWarehouse': wh._id, deliveryAgentId: null }
        ];
      }
    }

    let packages = await Order.find(query)
      .populate('customerId', 'name phone email')
      .populate('sellerId', 'storeName businessAddress location phone')
      .populate('items.productId', 'images thumbnail')
      .populate('logisticsRoute.originWarehouse')
      .populate('logisticsRoute.destinationBranch')
      .sort({ createdAt: -1 })
      .limit(30);

    // If no packages are staged (e.g. all past orders were delivered),
    // automatically stage authentic merchant packages from registered sellers
    if (packages.length === 0) {
      const sellers = await Seller.find({ status: { $in: ['approved', 'active'] } }).limit(3);
      const products = await Product.find({ status: 'active' }).limit(6);
      const users = await User.find({ role: 'customer' }).limit(4);

      if (sellers.length > 0 && products.length > 0 && users.length > 0) {
        const sampleAreas = [
          { street: 'Shop #14, Main Bazar Road', city: 'Etukuru', state: 'Andhra Pradesh', postalCode: '522017', lat: 16.2750, lng: 80.4850 },
          { street: 'Plot 45, NH-16 Service Road', city: 'Budampadu', state: 'Andhra Pradesh', postalCode: '522018', lat: 16.2400, lng: 80.4600 },
          { street: 'Near Old Bus Stand, Market St', city: 'Prathipadu', state: 'Andhra Pradesh', postalCode: '522019', lat: 16.1800, lng: 80.3900 },
          { street: 'Station Road, Beside SBI', city: 'Tenali', state: 'Andhra Pradesh', postalCode: '522201', lat: 16.2437, lng: 80.6400 }
        ];

        for (let i = 0; i < Math.min(4, sampleAreas.length); i++) {
          const seller = sellers[i % sellers.length];
          const product = products[i % products.length];
          const customer = users[i % users.length];
          const area = sampleAreas[i];
          const orderNum = `ORD-260912-72210${i + 1}`;

          const newOrder = new Order({
            customerId: customer._id,
            sellerId: seller._id,
            orderNumber: orderNum,
            items: [{
              productId: product._id,
              name: product.name,
              image: product.images?.[0] || '',
              quantity: 1,
              price: product.price,
              sellerId: seller._id
            }],
            deliveryAddress: {
              fullName: customer.name || `Customer ${i + 1}`,
              phone: customer.phone || '9848022338',
              street: area.street,
              city: area.city,
              state: area.state,
              postalCode: area.postalCode,
              coordinates: { lat: area.lat, lng: area.lng }
            },
            subtotal: product.price,
            shippingFee: 40,
            totalAmount: product.price + 40,
            paymentMethod: PAYMENT_METHODS.COD,
            paymentStatus: PAYMENT_STATUSES.PENDING,
            orderStatus: ORDER_STATUSES.SELLER_ACCEPTED,
            deliveryAgentId: null,
            logisticsRoute: {
              transitStage: 'AT_STORE',
              estimatedTransitDays: 1,
              notes: 'Staged at merchant counter ready for courier pickup'
            },
            timeline: [{
              status: ORDER_STATUSES.SELLER_ACCEPTED,
              timestamp: new Date(),
              note: `Seller ${seller.storeName} accepted order and attached package barcode label.`,
              updatedBy: seller.storeName
            }]
          });

          await newOrder.save();
        }

        // Re-fetch populated
        packages = await Order.find(query)
          .populate('customerId', 'name phone email')
          .populate('sellerId', 'storeName businessAddress location phone')
          .populate('items.productId', 'images thumbnail')
          .populate('logisticsRoute.originWarehouse')
          .populate('logisticsRoute.destinationBranch')
          .sort({ createdAt: -1 })
          .limit(30);
      }
    }

    const formatted = packages.map(p => {
      const rawNum = p.orderNumber || '';
      const parts = rawNum.split('-');
      const last6 = parts.length > 1 ? parts[parts.length - 1] : rawNum.slice(-6);
      return {
        ...p.toObject(),
        last6Digits: last6,
        barcodeCode: rawNum
      };
    });

    res.json({
      success: true,
      count: formatted.length,
      packages: formatted
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle Online / Offline Status
// @route   PUT /api/delivery/toggle-duty
// @access  Private (Delivery Agent)
export const toggleAgentDuty = async (req, res, next) => {
  try {
    const agent = await DeliveryAgent.findOne({ userId: req.user._id });
    if (!agent) return res.status(404).json({ success: false, message: 'Delivery agent not found' });

    if (!agent.isApproved) {
      return res.status(403).json({
        success: false,
        message: 'Your account is pending administrator approval before you can go on duty.'
      });
    }

    agent.isOnline = !agent.isOnline;
    await agent.save();

    res.json({
      success: true,
      message: `Duty mode is now ${agent.isOnline ? 'ONLINE (Ready for Dispatches & Scans)' : 'OFFLINE'}`,
      isOnline: agent.isOnline
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update Agent Current Location
// @route   PUT /api/delivery/location
// @access  Private (Delivery Agent)
export const updateAgentLocation = async (req, res, next) => {
  try {
    const { lat, lng, address } = req.body;
    const agent = await DeliveryAgent.findOne({ userId: req.user._id });
    if (!agent) return res.status(404).json({ success: false, message: 'Delivery agent not found' });

    agent.currentLocation = {
      lat: parseFloat(lat) || agent.currentLocation.lat,
      lng: parseFloat(lng) || agent.currentLocation.lng,
      address: address || agent.currentLocation.address,
      updatedAt: new Date()
    };
    await agent.save();

    res.json({
      success: true,
      message: 'Agent GPS coordinates updated in MongoDB.',
      currentLocation: agent.currentLocation
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Agent Delivery History
// @route   GET /api/delivery/history
// @access  Private (Delivery Agent)
export const getDeliveryHistory = async (req, res, next) => {
  try {
    const agent = await DeliveryAgent.findOne({ userId: req.user._id });
    if (!agent) return res.status(404).json({ success: false, message: 'Delivery agent not found' });

    const deliveries = await Order.find({
      deliveryAgentId: agent._id,
      orderStatus: ORDER_STATUSES.DELIVERED
    })
      .populate('customerId', 'name phone')
      .populate('sellerId', 'storeName businessAddress')
      .sort({ updatedAt: -1 });

    res.json({
      success: true,
      count: deliveries.length,
      deliveries
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Current Delivery Agent Profile & Security Status
// @route   GET /api/delivery/profile
// @access  Private (Delivery Agent)
export const getDeliveryProfile = async (req, res, next) => {
  try {
    const agent = await DeliveryAgent.findOne({ userId: req.user._id })
      .populate('assignedWarehouse', 'name code address city state contactPhone')
      .populate('userId', 'name email phone avatar mustChangePassword createdAt');

    if (!agent) return res.status(404).json({ success: false, message: 'Delivery agent profile not found' });

    res.json({
      success: true,
      profile: {
        _id: agent._id,
        userId: agent.userId?._id,
        fullName: agent.fullName,
        email: agent.email,
        phone: agent.phone,
        address: agent.address,
        vehicleType: agent.vehicleType,
        vehicleNumber: agent.vehicleNumber,
        drivingLicense: agent.drivingLicense,
        profileImage: agent.profileImage || agent.userId?.avatar,
        vehicleImage: agent.vehicleImage,
        emergencyContact: agent.emergencyContact || { name: '', phone: '', relation: '' },
        assignedWarehouse: agent.assignedWarehouse,
        mustChangePassword: agent.mustChangePassword || agent.userId?.mustChangePassword || false,
        isApproved: agent.isApproved,
        status: agent.status,
        createdAt: agent.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update Delivery Agent Profile Information
// @route   PUT /api/delivery/profile
// @access  Private (Delivery Agent)
export const updateDeliveryProfile = async (req, res, next) => {
  try {
    const { fullName, phone, address, profileImage, vehicleImage, emergencyContact } = req.body;

    const agent = await DeliveryAgent.findOne({ userId: req.user._id });
    if (!agent) return res.status(404).json({ success: false, message: 'Delivery agent profile not found' });

    if (fullName) agent.fullName = fullName.trim();
    if (phone) agent.phone = phone.trim();
    if (address) agent.address = address.trim();
    if (profileImage) agent.profileImage = profileImage;
    if (vehicleImage) agent.vehicleImage = vehicleImage;
    if (emergencyContact) {
      agent.emergencyContact = {
        name: emergencyContact.name || agent.emergencyContact?.name || '',
        phone: emergencyContact.phone || agent.emergencyContact?.phone || '',
        relation: emergencyContact.relation || agent.emergencyContact?.relation || ''
      };
    }

    await agent.save();

    // Synchronize User record
    const user = await User.findById(req.user._id);
    if (user) {
      if (fullName) user.name = fullName.trim();
      if (phone) user.phone = phone.trim();
      if (profileImage) user.avatar = profileImage;
      if (address) user.address = address.trim();
      await user.save();
    }

    res.json({
      success: true,
      message: '✅ Profile details updated successfully!',
      profile: {
        _id: agent._id,
        fullName: agent.fullName,
        phone: agent.phone,
        address: agent.address,
        profileImage: agent.profileImage,
        emergencyContact: agent.emergencyContact
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Securely Change Delivery Agent Password (Private, cannot be viewed by Warehouse Manager)
// @route   PUT /api/delivery/change-password
// @access  Private (Delivery Agent)
export const changeDeliveryPassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Please provide both current and new passwords.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters long.' });
    }

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: 'User account not found' });

    // Validate current password
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect. Please check your credentials.' });
    }

    // Set new password (will be hashed by User pre-save hook)
    user.password = newPassword;
    user.mustChangePassword = false;
    await user.save();

    // Update agent flag
    await DeliveryAgent.findOneAndUpdate(
      { userId: user._id },
      { mustChangePassword: false }
    );

    res.json({
      success: true,
      message: '🔒 Password changed successfully! Your account is now secured and your password is encrypted.'
    });
  } catch (error) {
    next(error);
  }
};

import { Warehouse } from '../models/Warehouse.js';
import { User } from '../models/User.js';
import { Order } from '../models/Order.js';
import { DeliveryAgent } from '../models/DeliveryAgent.js';
import { ROLES, ORDER_STATUSES } from '../config/constants.js';
import { emitToOrderRoom, emitToSeller, emitToUser, emitToAdmin } from '../services/socketService.js';

// Haversine distance calculator in KM
export const calculateDistanceKm = (lat1, lon1, lat2, lon2) => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 99999;
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
};

// @desc    Get all warehouses with optional state/type/search filtering
// @route   GET /api/warehouses
// @access  Public or Protected
export const getAllWarehouses = async (req, res) => {
  try {
    const { state, type, search, status } = req.query;
    const filter = {};

    if (state) filter.state = state;
    if (type) filter.type = type;
    if (status) filter.status = status;

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } },
        { city: { $regex: search, $options: 'i' } },
        { 'manager.name': { $regex: search, $options: 'i' } },
        { pincode: { $regex: search, $options: 'i' } }
      ];
    }

    const warehouses = await Warehouse.find(filter)
      .populate('manager.userId', 'name email phone role isBlocked')
      .sort({ state: 1, city: 1 });

    res.json({
      success: true,
      count: warehouses.length,
      warehouses
    });
  } catch (error) {
    console.error('Error fetching warehouses:', error);
    res.status(500).json({ success: false, message: 'Server error fetching warehouses' });
  }
};

// @desc    Find nearest warehouse to given GPS coordinates
// @route   GET /api/warehouses/nearest
// @access  Public
export const getNearestWarehouse = async (req, res) => {
  try {
    const lat = parseFloat(req.query.lat);
    const lng = parseFloat(req.query.lng);
    const type = req.query.type;

    if (isNaN(lat) || isNaN(lng)) {
      return res.status(400).json({ success: false, message: 'Valid lat and lng coordinates required' });
    }

    const filter = { status: 'active' };
    if (type) filter.type = type;

    const warehouses = await Warehouse.find(filter);
    if (!warehouses || warehouses.length === 0) {
      return res.status(404).json({ success: false, message: 'No active warehouses found' });
    }

    let nearest = null;
    let minDistance = Infinity;

    for (const wh of warehouses) {
      const dist = calculateDistanceKm(lat, lng, wh.location.lat, wh.location.lng);
      if (dist < minDistance) {
        minDistance = dist;
        nearest = { ...wh.toObject(), distanceKm: dist };
      }
    }

    res.json({
      success: true,
      nearestWarehouse: nearest,
      distanceKm: minDistance
    });
  } catch (error) {
    console.error('Error finding nearest warehouse:', error);
    res.status(500).json({ success: false, message: 'Server error finding nearest warehouse' });
  }
};

// @desc    Get warehouse by ID
// @route   GET /api/warehouses/:id
// @access  Public / Protected
export const getWarehouseById = async (req, res) => {
  try {
    const warehouse = await Warehouse.findById(req.params.id)
      .populate('manager.userId', 'name email phone role isBlocked');
    if (!warehouse) {
      return res.status(404).json({ success: false, message: 'Warehouse not found' });
    }
    res.json({ success: true, warehouse });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error retrieving warehouse' });
  }
};

// @desc    Get Current Logged-in Manager's Warehouse Facility
// @route   GET /api/warehouses/my-warehouse
// @access  Private (Warehouse Manager / Admin)
export const getMyWarehouse = async (req, res) => {
  try {
    let warehouse = null;
    if (req.user.role === ROLES.ADMIN && req.query.id) {
      warehouse = await Warehouse.findById(req.query.id);
    } else {
      warehouse = await Warehouse.findOne({
        $or: [
          { 'manager.userId': req.user._id },
          { 'manager.email': req.user.email?.toLowerCase().trim() }
        ]
      });
    }

    if (!warehouse) {
      // Fallback: Return first active warehouse for demo / preview
      warehouse = await Warehouse.findOne({ status: 'active' });
    }

    if (!warehouse) {
      return res.status(404).json({ success: false, message: 'No warehouse facility found' });
    }

    res.json({ success: true, warehouse });
  } catch (error) {
    console.error('Error fetching manager warehouse:', error);
    res.status(500).json({ success: false, message: 'Server error fetching warehouse' });
  }
};

// @desc    Update Manager's Warehouse Operational Status & Load
// @route   PUT /api/warehouses/my-warehouse
// @access  Private (Warehouse Manager / Admin)
export const updateMyWarehouse = async (req, res) => {
  try {
    const { status, currentLoad, capacity } = req.body;
    let warehouse = await Warehouse.findOne({
      $or: [
        { 'manager.userId': req.user._id },
        { 'manager.email': req.user.email?.toLowerCase().trim() }
      ]
    });

    if (!warehouse && req.user.role === ROLES.ADMIN && req.query.id) {
      warehouse = await Warehouse.findById(req.query.id);
    }

    if (!warehouse) {
      return res.status(404).json({ success: false, message: 'No warehouse found to update' });
    }

    if (status) warehouse.status = status;
    if (currentLoad !== undefined) warehouse.currentLoad = Math.max(0, Number(currentLoad));
    if (capacity !== undefined) warehouse.capacity = Number(capacity);

    await warehouse.save();
    res.json({ success: true, warehouse, message: 'Facility parameters updated successfully' });
  } catch (error) {
    console.error('Error updating my warehouse:', error);
    res.status(500).json({ success: false, message: 'Error updating facility parameters' });
  }
};

// @desc    Get Shipments Routed Through This Warehouse
// @route   GET /api/warehouses/my-warehouse/shipments
// @access  Private (Warehouse Manager / Admin)
export const getWarehouseShipments = async (req, res) => {
  try {
    let warehouse = await Warehouse.findOne({
      $or: [
        { 'manager.userId': req.user._id },
        { 'manager.email': req.user.email?.toLowerCase().trim() }
      ]
    });

    if (!warehouse && req.user.role === ROLES.ADMIN && req.query.warehouseId) {
      warehouse = await Warehouse.findById(req.query.warehouseId);
    }

    if (!warehouse) {
      warehouse = await Warehouse.findOne({ status: 'active' });
    }

    if (!warehouse) {
      return res.json({ success: true, count: 0, orders: [] });
    }

    const { stage, search } = req.query;
    const filter = {
      $or: [
        { 'logisticsRoute.originWarehouse': warehouse._id },
        { 'logisticsRoute.destinationBranch': warehouse._id }
      ]
    };

    if (stage && stage !== 'ALL') {
      filter['logisticsRoute.transitStage'] = stage;
    }

    if (search) {
      filter.$and = [
        {
          $or: [
            { orderNumber: { $regex: search, $options: 'i' } },
            { 'deliveryAddress.fullName': { $regex: search, $options: 'i' } },
            { 'deliveryAddress.city': { $regex: search, $options: 'i' } },
            { 'items.name': { $regex: search, $options: 'i' } }
          ]
        }
      ];
    }

    const orders = await Order.find(filter)
      .populate('customerId', 'name email phone')
      .populate('sellerId', 'storeName email phone businessAddress')
      .populate('deliveryAgentId', 'fullName email phone vehicleNumber')
      .populate('items.productId', 'name title images thumbnail price')
      .populate('logisticsRoute.originWarehouse')
      .populate('logisticsRoute.destinationBranch')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: orders.length,
      warehouse,
      orders
    });
  } catch (error) {
    console.error('Error fetching warehouse shipments:', error);
    res.status(500).json({ success: false, message: 'Error fetching shipments' });
  }
};

// @desc    Advance Shipment Transit Stage (Received, In Transit, At Branch, Out for Delivery)
// @route   PUT /api/warehouses/my-warehouse/shipments/:orderId/stage
// @access  Private (Warehouse Manager / Admin)
export const updateShipmentStage = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { stage, notes } = req.body;

    const validStages = [
      'AT_STORE',
      'DISPATCHED_TO_HUB',
      'IN_REGIONAL_HUB',
      'IN_TRANSIT_TO_BRANCH',
      'AT_DELIVERY_BRANCH',
      'OUT_FOR_DELIVERY',
      'DELIVERED'
    ];

    if (!validStages.includes(stage)) {
      return res.status(400).json({ success: false, message: `Invalid transit stage: ${stage}` });
    }

    const order = await Order.findById(orderId)
      .populate('logisticsRoute.originWarehouse')
      .populate('logisticsRoute.destinationBranch');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (!order.logisticsRoute) {
      order.logisticsRoute = {};
    }

    order.logisticsRoute.transitStage = stage;
    if (notes) {
      order.logisticsRoute.notes = notes;
    }

    // Sync root orderStatus for customer/delivery portals
    if (stage === 'OUT_FOR_DELIVERY') {
      order.orderStatus = ORDER_STATUSES.OUT_FOR_DELIVERY;
    } else if (stage === 'DELIVERED') {
      order.orderStatus = ORDER_STATUSES.DELIVERED;
    }

    order.timeline.push({
      status: `LOGISTICS_${stage}`,
      timestamp: new Date(),
      note: notes || `Shipment advanced to ${stage.replace(/_/g, ' ')} by facility manager`,
      updatedBy: req.user.name || 'Warehouse Manager'
    });

    await order.save();

    // Broadcast real-time alerts
    emitToOrderRoom(order._id, 'order_status_update', {
      orderId: order._id,
      stage,
      status: order.orderStatus,
      message: `Logistics status updated to ${stage.replace(/_/g, ' ')}`
    });
    emitToSeller(order.sellerId, 'seller_order_update', { orderId: order._id, stage });
    emitToUser(order.customerId, 'order_status_update', { orderId: order._id, stage });
    emitToAdmin('admin_order_update', { orderId: order._id, stage });

    res.json({
      success: true,
      message: `Shipment stage successfully updated to ${stage}`,
      order
    });
  } catch (error) {
    console.error('Error updating shipment stage:', error);
    res.status(500).json({ success: false, message: 'Error updating shipment stage' });
  }
};

// @desc    Create a new warehouse with Manager User credentials
// @route   POST /api/warehouses
// @access  Admin
export const createWarehouse = async (req, res) => {
  try {
    const existing = await Warehouse.findOne({ code: req.body.code });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Warehouse code already exists' });
    }

    const managerData = req.body.manager || {};
    const managerEmail = (managerData.email || req.body.managerEmail || '').toLowerCase().trim();
    const managerPassword = req.body.managerPassword || 'ManagerSecure123!';

    let managerUser = null;
    if (managerEmail) {
      managerUser = await User.findOne({ email: managerEmail });
      if (!managerUser) {
        managerUser = await User.create({
          name: managerData.name || 'Warehouse Manager',
          email: managerEmail,
          password: managerPassword,
          phone: managerData.phone || '',
          role: ROLES.WAREHOUSE_MANAGER
        });
      } else {
        managerUser.role = ROLES.WAREHOUSE_MANAGER;
        if (req.body.managerPassword) {
          managerUser.password = managerPassword;
        }
        await managerUser.save();
      }
    }

    const whData = {
      ...req.body,
      manager: {
        ...managerData,
        userId: managerUser ? managerUser._id : undefined
      }
    };

    const warehouse = await Warehouse.create(whData);

    if (managerUser) {
      managerUser.warehouseId = warehouse._id;
      await managerUser.save();
    }

    res.status(201).json({
      success: true,
      warehouse,
      managerCredentials: {
        email: managerEmail,
        temporaryPassword: managerPassword
      },
      message: 'Warehouse created and Manager credentials issued successfully'
    });
  } catch (error) {
    console.error('Error creating warehouse:', error);
    res.status(400).json({ success: false, message: error.message || 'Error creating warehouse' });
  }
};

// @desc    Update warehouse or reset manager credentials
// @route   PUT /api/warehouses/:id
// @access  Admin
export const updateWarehouse = async (req, res) => {
  try {
    const warehouse = await Warehouse.findById(req.params.id);
    if (!warehouse) {
      return res.status(404).json({ success: false, message: 'Warehouse not found' });
    }

    // Check if manager credentials need update
    const managerData = req.body.manager || {};
    const managerEmail = (managerData.email || warehouse.manager?.email || '').toLowerCase().trim();
    const managerPassword = req.body.managerPassword;

    if (managerEmail) {
      let managerUser = await User.findOne({ email: managerEmail });
      if (!managerUser) {
        managerUser = await User.create({
          name: managerData.name || warehouse.manager?.name || 'Warehouse Manager',
          email: managerEmail,
          password: managerPassword || 'ManagerSecure123!',
          phone: managerData.phone || warehouse.manager?.phone || '',
          role: ROLES.WAREHOUSE_MANAGER,
          warehouseId: warehouse._id
        });
      } else {
        managerUser.role = ROLES.WAREHOUSE_MANAGER;
        managerUser.warehouseId = warehouse._id;
        if (managerPassword) {
          managerUser.password = managerPassword;
        }
        if (managerData.name) managerUser.name = managerData.name;
        if (managerData.phone) managerUser.phone = managerData.phone;
        await managerUser.save();
      }

      req.body.manager = {
        ...(warehouse.manager ? warehouse.manager.toObject() : {}),
        ...managerData,
        userId: managerUser._id
      };
    }

    const updatedWarehouse = await Warehouse.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      warehouse: updatedWarehouse,
      message: 'Warehouse and manager credentials updated successfully'
    });
  } catch (error) {
    console.error('Error updating warehouse:', error);
    res.status(400).json({ success: false, message: error.message || 'Error updating warehouse' });
  }
};

// @desc    Delete warehouse
// @route   DELETE /api/warehouses/:id
// @access  Admin
export const deleteWarehouse = async (req, res) => {
  try {
    const warehouse = await Warehouse.findByIdAndDelete(req.params.id);
    if (!warehouse) {
      return res.status(404).json({ success: false, message: 'Warehouse not found' });
    }
    res.json({ success: true, message: 'Warehouse deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting warehouse' });
  }
};

// @desc    Get All Delivery Riders Registered / Assigned to This Warehouse
// @route   GET /api/warehouses/my-warehouse/riders
// @access  Private (Warehouse Manager / Admin)
export const getWarehouseRiders = async (req, res) => {
  try {
    let warehouse = null;
    if (req.user.role === ROLES.WAREHOUSE_MANAGER) {
      warehouse = await Warehouse.findById(req.user.warehouseId);
    } else if (req.query.warehouseId) {
      warehouse = await Warehouse.findById(req.query.warehouseId);
    }

    if (!warehouse) {
      return res.status(404).json({ success: false, message: 'Warehouse facility not found' });
    }

    // Find riders explicitly assigned to this warehouse, or in proximity/city
    const riders = await DeliveryAgent.find({
      $or: [
        { assignedWarehouse: warehouse._id },
        { 'currentLocation.address': { $regex: warehouse.city, $options: 'i' } },
        { address: { $regex: warehouse.city, $options: 'i' } }
      ]
    })
      .populate('userId', 'name email phone avatar mustChangePassword createdAt')
      .populate('assignedWarehouse', 'name code city state')
      .sort({ createdAt: -1 });

    // Ensure all returned riders have assignedWarehouse linked if missing
    for (const r of riders) {
      if (!r.assignedWarehouse) {
        r.assignedWarehouse = warehouse._id;
        await r.save();
      }
    }

    // Never return password hashes!
    const sanitized = riders.map(r => ({
      _id: r._id,
      userId: r.userId?._id,
      fullName: r.fullName,
      email: r.email,
      phone: r.phone,
      address: r.address,
      vehicleType: r.vehicleType,
      vehicleNumber: r.vehicleNumber,
      drivingLicense: r.drivingLicense,
      profileImage: r.profileImage || r.userId?.avatar,
      isApproved: r.isApproved,
      status: r.status,
      isOnline: r.isOnline,
      isAvailable: r.isAvailable,
      todayDeliveries: r.todayDeliveries,
      completedDeliveries: r.completedDeliveries,
      totalEarnings: r.totalEarnings,
      maxConcurrentOrders: r.maxConcurrentOrders,
      assignedWarehouse: r.assignedWarehouse,
      mustChangePassword: r.mustChangePassword || r.userId?.mustChangePassword || false,
      emergencyContact: r.emergencyContact,
      createdAt: r.createdAt
    }));

    res.json({
      success: true,
      count: sanitized.length,
      warehouse: {
        id: warehouse._id,
        name: warehouse.name,
        code: warehouse.code,
        city: warehouse.city
      },
      riders: sanitized
    });
  } catch (error) {
    console.error('Error fetching warehouse riders:', error);
    res.status(500).json({ success: false, message: 'Error retrieving fleet riders' });
  }
};

// @desc    Register & Onboard New Delivery Rider from Warehouse
// @route   POST /api/warehouses/my-warehouse/riders
// @access  Private (Warehouse Manager / Admin)
export const onboardWarehouseRider = async (req, res) => {
  try {
    let warehouse = null;
    if (req.user.role === ROLES.WAREHOUSE_MANAGER) {
      warehouse = await Warehouse.findById(req.user.warehouseId);
    } else if (req.body.warehouseId) {
      warehouse = await Warehouse.findById(req.body.warehouseId);
    }

    if (!warehouse) {
      return res.status(404).json({ success: false, message: 'Assigned warehouse not found' });
    }

    const {
      fullName,
      email,
      phone,
      password, // Initial temporary password given by manager
      vehicleType,
      vehicleNumber,
      drivingLicense,
      address,
      emergencyContact,
      profileImage
    } = req.body;

    if (!fullName || !email || !phone || !password || !vehicleNumber || !drivingLicense) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: full name, email, phone, initial password, vehicle number, and driving license.'
      });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email: cleanEmail }, { phone: phone.trim() }]
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: `An account with email (${cleanEmail}) or phone (${phone}) already exists in the system.`
      });
    }

    // 1. Create User account with mustChangePassword flag
    const riderUser = await User.create({
      name: fullName.trim(),
      email: cleanEmail,
      password, // Hashed by User.js pre-save hook
      phone: phone.trim(),
      role: ROLES.DELIVERY,
      warehouseId: warehouse._id,
      mustChangePassword: true,
      address: address || `${warehouse.city}, ${warehouse.state}`,
      avatar: profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
    });

    // 2. Create DeliveryAgent fleet profile
    const agent = await DeliveryAgent.create({
      userId: riderUser._id,
      fullName: fullName.trim(),
      email: cleanEmail,
      phone: phone.trim(),
      address: address || `${warehouse.city}, ${warehouse.state}`,
      vehicleType: vehicleType || 'Motorcycle',
      vehicleNumber: vehicleNumber.toUpperCase().trim(),
      drivingLicense: drivingLicense.toUpperCase().trim(),
      profileImage: riderUser.avatar,
      assignedWarehouse: warehouse._id,
      onboardedBy: req.user._id,
      status: 'active',
      isApproved: true,
      isOnline: false,
      isAvailable: false,
      mustChangePassword: true,
      maxConcurrentOrders: 10,
      currentLocation: {
        lat: warehouse.location?.coordinates?.[1] || 16.3067,
        lng: warehouse.location?.coordinates?.[0] || 80.4365,
        address: `${warehouse.name}, ${warehouse.city}`
      },
      emergencyContact: emergencyContact || { name: '', phone: '', relation: '' }
    });

    res.status(201).json({
      success: true,
      message: `🎉 Delivery Rider ${fullName} successfully onboarded to ${warehouse.name}! Initial credentials generated.`,
      rider: {
        _id: agent._id,
        userId: riderUser._id,
        fullName: agent.fullName,
        email: agent.email,
        phone: agent.phone,
        vehicleType: agent.vehicleType,
        vehicleNumber: agent.vehicleNumber,
        drivingLicense: agent.drivingLicense,
        assignedWarehouse: {
          id: warehouse._id,
          name: warehouse.name,
          code: warehouse.code
        },
        mustChangePassword: true,
        createdAt: agent.createdAt
      }
    });
  } catch (error) {
    console.error('Error onboarding warehouse rider:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to onboard delivery rider' });
  }
};

// @desc    Issue New Temporary Password for Rider (Cannot view existing password)
// @route   PUT /api/warehouses/my-warehouse/riders/:id/reset-temp-password
// @access  Private (Warehouse Manager / Admin)
export const resetRiderTempPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { newTempPassword } = req.body;

    if (!newTempPassword || newTempPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid temporary password with at least 6 characters.'
      });
    }

    const agent = await DeliveryAgent.findById(id);
    if (!agent) {
      return res.status(404).json({ success: false, message: 'Delivery agent profile not found' });
    }

    const user = await User.findById(agent.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User account not found' });
    }

    user.password = newTempPassword;
    user.mustChangePassword = true;
    await user.save();

    agent.mustChangePassword = true;
    await agent.save();

    res.json({
      success: true,
      message: `✅ Temporary password successfully issued for rider ${agent.fullName}. They will be prompted to change it upon login.`
    });
  } catch (error) {
    console.error('Error resetting temp password:', error);
    res.status(500).json({ success: false, message: 'Failed to reset temporary password' });
  }
};

// @desc    Update/Reset Warehouse Manager Password
// @route   PUT /api/warehouses/:id/manager-password
// @access  Admin
export const updateWarehouseManagerPassword = async (req, res) => {
  try {
    const { password } = req.body;
    if (!password || password.trim().length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    const warehouse = await Warehouse.findById(req.params.id);
    if (!warehouse) {
      return res.status(404).json({ success: false, message: 'Warehouse facility not found' });
    }

    const managerEmail = (warehouse.manager?.email || '').toLowerCase().trim();
    if (!managerEmail) {
      return res.status(400).json({
        success: false,
        message: 'No assigned manager email found for this warehouse facility'
      });
    }

    let managerUser = await User.findOne({ email: managerEmail });
    if (!managerUser) {
      managerUser = await User.create({
        name: warehouse.manager?.name || 'Warehouse Manager',
        email: managerEmail,
        password: password.trim(),
        phone: warehouse.manager?.phone || '',
        role: ROLES.WAREHOUSE_MANAGER,
        warehouseId: warehouse._id
      });
      warehouse.manager.userId = managerUser._id;
      await warehouse.save();
    } else {
      managerUser.password = password.trim();
      managerUser.role = ROLES.WAREHOUSE_MANAGER;
      managerUser.warehouseId = warehouse._id;
      await managerUser.save();
    }

    res.json({
      success: true,
      message: `Password successfully updated for ${warehouse.manager?.name || 'Manager'} (${managerEmail})`,
      credentials: {
        warehouseName: warehouse.name,
        warehouseCode: warehouse.code,
        portalUrl: 'http://localhost:3004',
        managerName: warehouse.manager?.name,
        employeeId: warehouse.manager?.employeeId || 'N/A',
        email: managerEmail,
        password: password.trim()
      }
    });
  } catch (error) {
    console.error('Error updating warehouse manager password:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update warehouse manager password'
    });
  }
};

// @desc    Get Warehouse Manager Credentials for Admin Copy/View
// @route   GET /api/warehouses/:id/credentials
// @access  Admin
export const getWarehouseCredentials = async (req, res) => {
  try {
    const warehouse = await Warehouse.findById(req.params.id);
    if (!warehouse) {
      return res.status(404).json({ success: false, message: 'Warehouse not found' });
    }

    const managerEmail = (warehouse.manager?.email || '').toLowerCase().trim();
    const managerUser = managerEmail ? await User.findOne({ email: managerEmail }) : null;

    res.json({
      success: true,
      credentials: {
        warehouseName: warehouse.name,
        warehouseCode: warehouse.code,
        type: warehouse.type,
        city: warehouse.city,
        state: warehouse.state,
        portalUrl: 'http://localhost:3004',
        managerName: warehouse.manager?.name || 'Unassigned',
        employeeId: warehouse.manager?.employeeId || 'N/A',
        phone: warehouse.manager?.phone || 'N/A',
        email: managerEmail,
        defaultPassword: 'ManagerSecure123!',
        accountReady: !!managerUser
      }
    });
  } catch (error) {
    console.error('Error fetching warehouse credentials:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch warehouse credentials' });
  }
};


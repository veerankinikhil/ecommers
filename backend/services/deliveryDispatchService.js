import { DeliveryAgent } from '../models/DeliveryAgent.js';
import { DeliveryRequest } from '../models/DeliveryRequest.js';
import { Order } from '../models/Order.js';
import { calculateHaversineDistanceKm } from '../utils/haversineDistance.js';
import { emitToDeliveryRadar, emitToUser, emitToAdmin, emitToSeller } from './socketService.js';
import { ORDER_STATUSES, DELIVERY_REQUEST_STATUSES, ACCOUNT_STATUSES } from '../config/constants.js';

export const dispatchNearbyDeliveryAgents = async (orderId) => {
  try {
    const order = await Order.findById(orderId).populate('sellerId');
    if (!order) {
      console.warn(`[Dispatch Warning]: Order ${orderId} not found.`);
      return { success: false, message: 'Order not found' };
    }

    const pickupLat = order.pickupLocation?.coordinates?.lat || order.sellerId?.location?.lat || 28.6139;
    const pickupLng = order.pickupLocation?.coordinates?.lng || order.sellerId?.location?.lng || 77.2090;
    const maxRadiusKm = parseFloat(process.env.DELIVERY_MAX_RADIUS_KM || '15');

    // 1. Find all online and approved delivery agents with route capacity
    const onlineAgents = await DeliveryAgent.find({
      status: ACCOUNT_STATUSES.APPROVED,
      isApproved: true,
      isOnline: true
    }).populate('userId');

    const eligibleAgents = [];
    for (const agent of onlineAgents) {
      const activeCount = await Order.countDocuments({
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
      if (activeCount < maxConcurrent) {
        eligibleAgents.push(agent);
      }
    }

    if (!eligibleAgents || eligibleAgents.length === 0) {
      console.log(`[Dispatch]: No online delivery agents with route capacity currently available.`);
      return { success: false, message: 'No online delivery agents currently available' };
    }

    // 2. Compute Haversine distance for each agent
    const agentsWithDistance = eligibleAgents.map(agent => {
      const agentLat = agent.currentLocation?.lat || 28.6139;
      const agentLng = agent.currentLocation?.lng || 77.2090;
      const distance = calculateHaversineDistanceKm(pickupLat, pickupLng, agentLat, agentLng);
      return {
        agent,
        distance
      };
    });

    // 3. Filter within radius and sort nearest first
    const nearbyAgents = agentsWithDistance
      .filter(item => item.distance <= maxRadiusKm)
      .sort((a, b) => a.distance - b.distance);

    if (nearbyAgents.length === 0) {
      console.log(`[Dispatch]: No agents found within ${maxRadiusKm} km radius.`);
      return { success: false, message: `No delivery agents within ${maxRadiusKm} km` };
    }

    console.log(`[Dispatch]: Found ${nearbyAgents.length} nearby agents within radius. Nearest is ${nearbyAgents[0].distance} km away.`);

    // 4. Create Delivery Request for the nearest candidate
    const primaryCandidate = nearbyAgents[0];
    const newRequest = await DeliveryRequest.create({
      orderId: order._id,
      sellerId: order.sellerId._id,
      deliveryAgentId: primaryCandidate.agent._id,
      distanceKm: primaryCandidate.distance,
      status: DELIVERY_REQUEST_STATUSES.PENDING,
      payoutAmount: 120 + Math.round(primaryCandidate.distance * 8) // Base + per km incentive in ₹
    });

    // Update order status to DELIVERY_REQUESTED
    order.orderStatus = ORDER_STATUSES.DELIVERY_REQUESTED;
    await order.save();

    // 5. Emit real-time Socket.IO notification to delivery radar
    const requestPayload = {
      requestId: newRequest._id,
      orderId: order._id,
      orderNumber: order.orderNumber,
      sellerStoreName: order.sellerId.storeName,
      pickupAddress: order.pickupLocation.address || order.sellerId.businessAddress,
      deliveryAddress: order.deliveryAddress.street + ', ' + order.deliveryAddress.city,
      distanceKm: primaryCandidate.distance,
      payoutAmount: newRequest.payoutAmount,
      totalItems: order.items.length,
      customerName: order.deliveryAddress.fullName,
      customerPhone: order.deliveryAddress.phone
    };

    emitToDeliveryRadar('new_delivery_request', requestPayload);
    emitToUser(primaryCandidate.agent.userId._id, 'targeted_delivery_offer', requestPayload);
    emitToAdmin('admin_order_update', { orderId: order._id, status: ORDER_STATUSES.DELIVERY_REQUESTED });
    emitToSeller(order.sellerId._id, 'seller_order_update', { orderId: order._id, status: ORDER_STATUSES.DELIVERY_REQUESTED });

    return {
      success: true,
      nearbyCount: nearbyAgents.length,
      nearestDistanceKm: primaryCandidate.distance,
      requestId: newRequest._id
    };
  } catch (error) {
    console.error(`[Dispatch Error]:`, error);
    return { success: false, error: error.message };
  }
};

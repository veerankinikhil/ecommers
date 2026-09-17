import { DeliveryAgent } from '../models/DeliveryAgent.js';

export const configureSockets = (io) => {
  io.on('connection', (socket) => {
    console.log(`[Socket Connected]: ${socket.id}`);

    // User / Portal joining their specific room
    socket.on('join_user_room', (userId) => {
      if (userId) {
        socket.join(`user_${userId}`);
        console.log(`Socket ${socket.id} joined room user_${userId}`);
      }
    });

    // Seller joining their store notification channel
    socket.on('join_seller_room', (sellerId) => {
      if (sellerId) {
        socket.join(`seller_${sellerId}`);
        console.log(`Socket ${socket.id} joined seller_${sellerId}`);
      }
    });

    // Delivery agent joining the live delivery radar
    socket.on('join_delivery_radar', (agentId) => {
      socket.join('delivery_radar');
      if (agentId) {
        socket.join(`user_${agentId}`);
      }
      console.log(`Agent ${agentId || socket.id} joined delivery_radar`);
    });

    // Admin joining the platform monitoring channel
    socket.on('join_admin_room', () => {
      socket.join('admin_monitoring');
      console.log(`Admin joined admin_monitoring channel`);
    });

    // Real-time GPS coordinate stream from Delivery Agent
    socket.on('update_agent_location', async ({ agentId, lat, lng, address }) => {
      try {
        if (agentId && lat && lng) {
          await DeliveryAgent.findOneAndUpdate(
            { userId: agentId },
            {
              'currentLocation.lat': lat,
              'currentLocation.lng': lng,
              'currentLocation.address': address || 'Live GPS Position',
              'currentLocation.lastUpdated': new Date()
            }
          );
          // Broadcast live location to subscribers
          io.to('admin_monitoring').emit('agent_location_stream', { agentId, lat, lng, address });
        }
      } catch (err) {
        console.error('Failed to update live agent coordinates:', err.message);
      }
    });

    socket.on('disconnect', () => {
      console.log(`[Socket Disconnected]: ${socket.id}`);
    });
  });
};

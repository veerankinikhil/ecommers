let ioInstance = null;

export const setSocketIO = (io) => {
  ioInstance = io;
};

export const getSocketIO = () => {
  return ioInstance;
};

// Emit real-time message to specific user
export const emitToUser = (userId, eventName, payload) => {
  if (ioInstance) {
    ioInstance.to(`user_${userId}`).emit(eventName, payload);
  }
};

// Emit to a specific seller's channel
export const emitToSeller = (sellerId, eventName, payload) => {
  if (ioInstance) {
    ioInstance.to(`seller_${sellerId}`).emit(eventName, payload);
  }
};

// Emit to the active delivery radar channel
export const emitToDeliveryRadar = (eventName, payload) => {
  if (ioInstance) {
    ioInstance.to('delivery_radar').emit(eventName, payload);
  }
};

// Emit to specific order subscribers
export const emitToOrderRoom = (orderId, eventName, payload) => {
  if (ioInstance) {
    ioInstance.to(`order_${orderId}`).emit(eventName, payload);
  }
};

// Emit to administrative portal
export const emitToAdmin = (eventName, payload) => {
  if (ioInstance) {
    ioInstance.to('admin_monitoring').emit(eventName, payload);
  }
};

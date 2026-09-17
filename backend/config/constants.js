export const ROLES = {
  CUSTOMER: 'customer',
  SELLER: 'seller',
  DELIVERY: 'delivery',
  ADMIN: 'admin',
  WAREHOUSE_MANAGER: 'warehouse_manager',
  FINANCE: 'finance'
};

export const ORDER_STATUSES = {
  PENDING: 'PENDING',
  SELLER_ACCEPTED: 'SELLER_ACCEPTED',
  DELIVERY_REQUESTED: 'DELIVERY_REQUESTED',
  AGENT_ASSIGNED: 'AGENT_ASSIGNED',
  PICKED_UP: 'PICKED_UP',
  OUT_FOR_DELIVERY: 'OUT_FOR_DELIVERY',
  DELIVERED: 'DELIVERED',
  COMPLETED: 'COMPLETED',
  REJECTED: 'REJECTED',
  CANCELLED: 'CANCELLED'
};

export const DELIVERY_REQUEST_STATUSES = {
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
  REJECTED: 'REJECTED',
  EXPIRED: 'EXPIRED',
  CANCELLED: 'CANCELLED'
};

export const ACCOUNT_STATUSES = {
  PENDING: 'pending_approval',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  BLOCKED: 'blocked',
  ACTIVE: 'active'
};

export const PAYMENT_METHODS = {
  COD: 'Cash on Delivery (COD)',
  ONLINE: 'Online Payment (Credit/Debit/UPI)',
  WALLET: 'Store Wallet / Balance'
};

export const PAYMENT_STATUSES = {
  PENDING: 'PENDING',
  PAID: 'PAID',
  REFUNDED: 'REFUNDED',
  FAILED: 'FAILED'
};

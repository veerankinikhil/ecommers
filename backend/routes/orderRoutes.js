import express from 'express';
import {
  placeOrder,
  getCustomerOrders,
  getOrderById,
  cancelCustomerOrder,
  getSellerOrders,
  acceptSellerOrder,
  rejectSellerOrder,
  getDeliveryRadarRequests,
  acceptDeliveryRequest,
  updateDeliveryStatus,
  getAdminAllOrders
} from '../controllers/orderController.js';
import { authenticateUser } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';
import { ROLES } from '../config/constants.js';

const router = express.Router();

// Customer Endpoints
router.post('/place', authenticateUser, authorizeRoles(ROLES.CUSTOMER), placeOrder);
router.get('/my-orders', authenticateUser, authorizeRoles(ROLES.CUSTOMER), getCustomerOrders);
router.put('/:id/cancel', authenticateUser, authorizeRoles(ROLES.CUSTOMER), cancelCustomerOrder);

// Seller Endpoints
router.get('/seller/incoming', authenticateUser, authorizeRoles(ROLES.SELLER), getSellerOrders);
router.put('/seller/:id/accept', authenticateUser, authorizeRoles(ROLES.SELLER), acceptSellerOrder);
router.put('/seller/:id/reject', authenticateUser, authorizeRoles(ROLES.SELLER), rejectSellerOrder);

// Delivery Agent Endpoints
router.get('/delivery/radar-requests', authenticateUser, authorizeRoles(ROLES.DELIVERY), getDeliveryRadarRequests);
router.put('/delivery/requests/:requestId/accept', authenticateUser, authorizeRoles(ROLES.DELIVERY), acceptDeliveryRequest);
router.put('/delivery/:id/update-status', authenticateUser, authorizeRoles(ROLES.DELIVERY), updateDeliveryStatus);

// Admin Monitoring Endpoints
router.get('/admin/all', authenticateUser, authorizeRoles(ROLES.ADMIN), getAdminAllOrders);

// Generic Order Detail (Authenticated for participants)
router.get('/:id', authenticateUser, getOrderById);

export default router;

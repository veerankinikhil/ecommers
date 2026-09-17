import express from 'express';
import {
  getAdminDashboardStats,
  getAllSellers,
  approveSeller,
  rejectSeller,
  toggleBlockSeller,
  getAllDeliveryAgents,
  approveDeliveryAgent,
  rejectDeliveryAgent,
  toggleBlockDeliveryAgent,
  getAllCustomers,
  toggleBlockCustomer,
  toggleProductStatus
} from '../controllers/adminController.js';
import { authenticateUser } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';
import { ROLES } from '../config/constants.js';

const router = express.Router();

// Strict Admin-only middleware
router.use(authenticateUser, authorizeRoles(ROLES.ADMIN));

router.get('/dashboard-stats', getAdminDashboardStats);

// Seller Moderation
router.get('/sellers', getAllSellers);
router.put('/sellers/:id/approve', approveSeller);
router.put('/sellers/:id/reject', rejectSeller);
router.put('/sellers/:id/block', toggleBlockSeller);

// Delivery Agent Moderation
router.get('/delivery-agents', getAllDeliveryAgents);
router.put('/delivery-agents/:id/approve', approveDeliveryAgent);
router.put('/delivery-agents/:id/reject', rejectDeliveryAgent);
router.put('/delivery-agents/:id/block', toggleBlockDeliveryAgent);

// Customer Management
router.get('/customers', getAllCustomers);
router.put('/customers/:id/block', toggleBlockCustomer);

// Product Moderation
router.put('/products/:id/toggle-status', toggleProductStatus);

export default router;

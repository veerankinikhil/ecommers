import express from 'express';
import {
  getDeliveryDashboardStats,
  scanWarehousePickup,
  getWarehouseDockPackages,
  toggleAgentDuty,
  updateAgentLocation,
  getDeliveryHistory,
  getDeliveryProfile,
  updateDeliveryProfile,
  changeDeliveryPassword
} from '../controllers/deliveryController.js';
import { authenticateUser } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';
import { ROLES } from '../config/constants.js';

const router = express.Router();

router.use(authenticateUser, authorizeRoles(ROLES.DELIVERY));

router.get('/dashboard-stats', getDeliveryDashboardStats);
router.post('/warehouse-pickup/scan', scanWarehousePickup);
router.get('/warehouse-dock-packages', getWarehouseDockPackages);
router.put('/toggle-duty', toggleAgentDuty);
router.put('/location', updateAgentLocation);
router.get('/history', getDeliveryHistory);

// Rider Profile & Private Security
router.get('/profile', getDeliveryProfile);
router.put('/profile', updateDeliveryProfile);
router.put('/change-password', changeDeliveryPassword);

export default router;

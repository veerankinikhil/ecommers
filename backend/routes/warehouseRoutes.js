import express from 'express';
import {
  getAllWarehouses,
  getNearestWarehouse,
  getWarehouseById,
  getMyWarehouse,
  updateMyWarehouse,
  getWarehouseShipments,
  updateShipmentStage,
  getWarehouseRiders,
  onboardWarehouseRider,
  resetRiderTempPassword,
  createWarehouse,
  updateWarehouse,
  deleteWarehouse,
  updateWarehouseManagerPassword,
  getWarehouseCredentials
} from '../controllers/warehouseController.js';
import { authenticateUser } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';
import { ROLES } from '../config/constants.js';

const router = express.Router();

// 1. Manager Dedicated Endpoints (Before /:id)
router.get('/my-warehouse', authenticateUser, getMyWarehouse);
router.put('/my-warehouse', authenticateUser, updateMyWarehouse);
router.get('/my-warehouse/shipments', authenticateUser, getWarehouseShipments);
router.put('/my-warehouse/shipments/:orderId/stage', authenticateUser, updateShipmentStage);

// Fleet & Rider Onboarding Management
router.get('/my-warehouse/riders', authenticateUser, getWarehouseRiders);
router.post('/my-warehouse/riders', authenticateUser, onboardWarehouseRider);
router.put('/my-warehouse/riders/:id/reset-temp-password', authenticateUser, resetRiderTempPassword);

// 2. Public & General Queries
router.get('/', getAllWarehouses);
router.get('/nearest', getNearestWarehouse);
router.get('/:id', getWarehouseById);

// 3. Admin-Only Management
router.post('/', authenticateUser, authorizeRoles(ROLES.ADMIN), createWarehouse);
router.get('/:id/credentials', authenticateUser, authorizeRoles(ROLES.ADMIN), getWarehouseCredentials);
router.put('/:id/manager-password', authenticateUser, authorizeRoles(ROLES.ADMIN), updateWarehouseManagerPassword);
router.put('/:id', authenticateUser, authorizeRoles(ROLES.ADMIN), updateWarehouse);
router.delete('/:id', authenticateUser, authorizeRoles(ROLES.ADMIN), deleteWarehouse);

export default router;

import express from 'express';
import { getSellerDashboardStats, updateSellerProfile } from '../controllers/sellerController.js';
import { authenticateUser } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';
import { ROLES } from '../config/constants.js';

const router = express.Router();

router.use(authenticateUser, authorizeRoles(ROLES.SELLER));

router.get('/dashboard-stats', getSellerDashboardStats);
router.put('/profile', updateSellerProfile);

export default router;

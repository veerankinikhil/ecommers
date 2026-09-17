import express from 'express';
import { getMyGiftCards, applyGiftCard, getAdminAllGiftCards } from '../controllers/giftCardController.js';
import { authenticateUser } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';
import { ROLES } from '../config/constants.js';

const router = express.Router();

router.get('/my-cards', authenticateUser, authorizeRoles(ROLES.CUSTOMER), getMyGiftCards);
router.post('/apply', authenticateUser, authorizeRoles(ROLES.CUSTOMER), applyGiftCard);
router.get('/admin/all', authenticateUser, authorizeRoles(ROLES.ADMIN), getAdminAllGiftCards);

export default router;

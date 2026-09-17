import express from 'express';
import {
  getCustomerCart,
  addToCart,
  updateCartItemQuantity,
  removeFromCart
} from '../controllers/cartController.js';
import { authenticateUser } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';
import { ROLES } from '../config/constants.js';

const router = express.Router();

router.use(authenticateUser, authorizeRoles(ROLES.CUSTOMER));

router.get('/', getCustomerCart);
router.post('/', addToCart);
router.put('/:itemId', updateCartItemQuantity);
router.delete('/:itemId', removeFromCart);

export default router;

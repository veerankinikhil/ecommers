import express from 'express';
import {
  getAllProducts,
  getProductById,
  createSellerProduct,
  getSellerProducts,
  updateSellerProduct,
  deleteSellerProduct,
  getCategories
} from '../controllers/productController.js';
import { authenticateUser } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';
import { ROLES } from '../config/constants.js';

const router = express.Router();

// Public Storefront Endpoints
router.get('/', getAllProducts);
router.get('/categories', getCategories);
router.get('/:id', getProductById);

// Seller Product Inventory Endpoints (Role-gated)
router.post('/seller', authenticateUser, authorizeRoles(ROLES.SELLER), createSellerProduct);
router.get('/seller/my-products', authenticateUser, authorizeRoles(ROLES.SELLER), getSellerProducts);
router.put('/seller/:id', authenticateUser, authorizeRoles(ROLES.SELLER), updateSellerProduct);
router.delete('/seller/:id', authenticateUser, authorizeRoles(ROLES.SELLER), deleteSellerProduct);

export default router;

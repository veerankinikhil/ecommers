import express from 'express';
import { addProductReview, getProductReviews } from '../controllers/reviewController.js';
import { authenticateUser } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';
import { ROLES } from '../config/constants.js';

const router = express.Router();

router.get('/product/:productId', getProductReviews);
router.post('/', authenticateUser, authorizeRoles(ROLES.CUSTOMER), addProductReview);

export default router;

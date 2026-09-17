import express from 'express';
import {
  getTreasuryOverview,
  getAllTransactions,
  getPendingDisbursals,
  verifyAndDisbursePayout,
  holdDisbursal,
  releaseDisbursalHold,
  getSellerWalletAndSettlements,
  updateSellerBankDetails,
  getRiderWalletAndPayouts
} from '../controllers/paymentController.js';
import { authenticateUser } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';
import { ROLES } from '../config/constants.js';

const router = express.Router();

// Treasury & Finance routes (Finance Officers & Admin)
router.get(
  '/treasury-stats',
  authenticateUser,
  authorizeRoles(ROLES.ADMIN, ROLES.FINANCE),
  getTreasuryOverview
);

router.get(
  '/transactions',
  authenticateUser,
  authorizeRoles(ROLES.ADMIN, ROLES.FINANCE),
  getAllTransactions
);

router.get(
  '/pending-disbursals',
  authenticateUser,
  authorizeRoles(ROLES.ADMIN, ROLES.FINANCE),
  getPendingDisbursals
);

router.post(
  '/disburse/:id',
  authenticateUser,
  authorizeRoles(ROLES.ADMIN, ROLES.FINANCE),
  verifyAndDisbursePayout
);

router.post(
  '/hold/:id',
  authenticateUser,
  authorizeRoles(ROLES.ADMIN, ROLES.FINANCE),
  holdDisbursal
);

router.post(
  '/release-hold/:id',
  authenticateUser,
  authorizeRoles(ROLES.ADMIN, ROLES.FINANCE),
  releaseDisbursalHold
);

// Seller routes
router.get(
  '/seller-wallet',
  authenticateUser,
  authorizeRoles(ROLES.SELLER),
  getSellerWalletAndSettlements
);

router.put(
  '/seller-bank-details',
  authenticateUser,
  authorizeRoles(ROLES.SELLER),
  updateSellerBankDetails
);

// Rider routes
router.get(
  '/rider-wallet',
  authenticateUser,
  authorizeRoles(ROLES.DELIVERY),
  getRiderWalletAndPayouts
);

export default router;

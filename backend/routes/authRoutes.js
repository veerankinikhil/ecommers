import express from 'express';
import {
  registerCustomer,
  registerSeller,
  registerDeliveryAgent,
  loginUser,
  getMe,
  sendOTP,
  verifyOTP,
  loginWithOTP,
  socialLogin,
  updateUserProfile,
  resetPassword
} from '../controllers/authController.js';
import { authenticateUser } from '../middleware/authMiddleware.js';

const router = express.Router();

// OTP Endpoints (Email & Mobile)
router.post('/send-otp', sendOTP);
router.post('/verify-otp', verifyOTP);
router.post('/login-otp', loginWithOTP);
router.post('/reset-password', resetPassword);

// Social Auth (Google & Facebook)
router.post('/social-login', socialLogin);

// Standard Registration & Login
router.post('/customer/register', registerCustomer);
router.post('/seller/register', registerSeller);
router.post('/delivery/register', registerDeliveryAgent);
router.post('/login', loginUser);
router.get('/me', authenticateUser, getMe);
router.put('/profile', authenticateUser, updateUserProfile);

export default router;


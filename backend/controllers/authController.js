import { User } from '../models/User.js';
import { Seller } from '../models/Seller.js';
import { DeliveryAgent } from '../models/DeliveryAgent.js';
import { Warehouse } from '../models/Warehouse.js';
import { generateToken } from '../utils/tokenHelper.js';
import { ROLES, ACCOUNT_STATUSES } from '../config/constants.js';
import { generateOTP, sendOTPEmail, sendOTPSMS, storeOTP, verifyStoredOTP } from '../services/otpService.js';
import crypto from 'crypto';

// @desc    Send Registration or Login OTP to Email and/or Mobile Phone
// @route   POST /api/auth/send-otp
// @access  Public
export const sendOTP = async (req, res, next) => {
  try {
    const { email, phone, purpose = 'registration' } = req.body;

    if (!email && !phone) {
      return res.status(400).json({ success: false, message: 'Please provide either an email address or mobile phone number.' });
    }

    const otp = generateOTP();
    let sentChannels = [];
    let emailResult = null;
    let smsResult = null;

    // Send to Email
    if (email) {
      const emailNormalized = email.toLowerCase().trim();
      await storeOTP(emailNormalized, otp, 'email', purpose);
      emailResult = await sendOTPEmail(emailNormalized, otp, purpose);
      sentChannels.push(`email (${emailNormalized})`);
    }

    // Send to Mobile Phone
    if (phone) {
      const phoneNormalized = phone.trim();
      await storeOTP(phoneNormalized, otp, 'phone', purpose);
      smsResult = await sendOTPSMS(phoneNormalized, otp, purpose);
      sentChannels.push(`mobile (${phoneNormalized})`);
    }

    // Determine if any used channel fell back to mock/dev mode due to failure or missing config
    const hasEmailMock = email && emailResult && emailResult.mode === 'dev_mock';
    const hasSMSMock = phone && smsResult && smsResult.mode === 'dev_mock';

    const isLiveSMS = !!(process.env.FAST2SMS_API_KEY || process.env.TWILIO_ACCOUNT_SID);
    const isLiveEmail = !!(process.env.GMAIL_USER || process.env.SMTP_HOST);
    const provideDemoOtp = (!isLiveSMS && !isLiveEmail) || hasEmailMock || hasSMSMock;

    res.json({
      success: true,
      message: `6-digit verification OTP sent successfully to ${sentChannels.join(' and ')}. Valid for 10 minutes.`,
      // Provide demoOtp if email/SMS is in mock mode or keys aren't configured
      demoOtp: provideDemoOtp ? otp : undefined,
      expiresInMinutes: 10
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify OTP for Registration or Login
// @route   POST /api/auth/verify-otp
// @access  Public
export const verifyOTP = async (req, res, next) => {
  try {
    const { identifier, otp, purpose = 'registration' } = req.body;

    if (!identifier || !otp) {
      return res.status(400).json({ success: false, message: 'Please provide identifier (email or phone) and 6-digit OTP.' });
    }

    const result = await verifyStoredOTP(identifier, otp, purpose);

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json({
      success: true,
      message: 'OTP verified successfully. You may proceed.'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Passwordless Login via Mobile Phone / Email OTP
// @route   POST /api/auth/login-otp
// @access  Public
export const loginWithOTP = async (req, res, next) => {
  try {
    const { identifier, otp, expectedRole = 'customer' } = req.body;

    if (!identifier || !otp) {
      return res.status(400).json({ success: false, message: 'Please provide mobile/email and 6-digit OTP.' });
    }

    const verification = await verifyStoredOTP(identifier, otp, 'login');
    if (!verification.success) {
      return res.status(400).json(verification);
    }

    const cleanIdentifier = identifier.toLowerCase().trim();
    const phoneDigits = identifier.replace(/[^0-9]/g, '').slice(-10);

    // Search user by email or phone (handles formats like +91 9177850108, 9177850108)
    const user = await User.findOne({
      $or: [
        { email: cleanIdentifier },
        { phone: identifier.trim() },
        ...(phoneDigits ? [{ phone: { $regex: phoneDigits } }] : [])
      ]
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account found with this email or phone number. Please register first.'
      });
    }

    if (user.isBlocked) {
      return res.status(403).json({ success: false, message: 'Your account has been suspended by system administrator.' });
    }

    // Multi-role compatibility validation
    let extraMeta = {};
    if (expectedRole) {
      if (expectedRole === ROLES.SELLER) {
        const sellerProfile = await Seller.findOne({ userId: user._id });
        if (!sellerProfile) {
          return res.status(403).json({
            success: false,
            message: "Unauthorized portal access: You do not have a Seller business profile registered. Please register as a Seller first."
          });
        }
        extraMeta = {
          sellerId: sellerProfile._id,
          storeName: sellerProfile.storeName,
          status: sellerProfile.status,
          isApproved: sellerProfile.isApproved
        };
      } else if (expectedRole === ROLES.DELIVERY) {
        const agentProfile = await DeliveryAgent.findOne({ userId: user._id });
        if (!agentProfile) {
          return res.status(403).json({
            success: false,
            message: "Unauthorized portal access: You do not have a Delivery Agent profile registered. Please register as an Agent first."
          });
        }
        extraMeta = {
          agentId: agentProfile._id,
          vehicleNumber: agentProfile.vehicleNumber,
          status: agentProfile.status,
          isApproved: agentProfile.isApproved
        };
      } else if (expectedRole === ROLES.ADMIN && user.role !== ROLES.ADMIN) {
        return res.status(403).json({
          success: false,
          message: "Unauthorized portal access: Strictly restricted to System Administrators."
        });
      }
    }

    const token = generateToken({ id: user._id, role: expectedRole || user.role });

    res.json({
      success: true,
      message: 'Logged in successfully via OTP.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: expectedRole || user.role,
        avatar: user.avatar,
        ...extraMeta
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Social Authentication (Google & Facebook Login / Register)
// @route   POST /api/auth/social-login
// @access  Public
export const socialLogin = async (req, res, next) => {
  try {
    const { provider, name, email, avatar, socialId, role = ROLES.CUSTOMER } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required from social identity provider.' });
    }

    const emailNormalized = email.toLowerCase().trim();
    let user = await User.findOne({ email: emailNormalized });

    if (!user) {
      // Auto-register user with random secure password
      const randomPassword = crypto.randomBytes(16).toString('hex') + '!2026Aa';
      user = await User.create({
        name: name || `${provider.toUpperCase()} User`,
        email: emailNormalized,
        password: randomPassword,
        role: role,
        avatar: avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'
      });
      console.log(`🌐 [Social Auth]: Created new account for ${emailNormalized} via ${provider}`);
    } else {
      if (user.isBlocked) {
        return res.status(403).json({ success: false, message: 'Account is blocked by administrator.' });
      }
      if (avatar && (!user.avatar || user.avatar.includes('unsplash'))) {
        user.avatar = avatar;
        await user.save();
      }
    }

    const token = generateToken({ id: user._id, role: user.role });

    res.json({
      success: true,
      message: `Signed in successfully with ${provider.charAt(0).toUpperCase() + provider.slice(1)}.`,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar
      }
    });
  } catch (error) {
    next(error);
  }
};

// firebasePhoneLogin has been removed in pure MongoDB migration


export const registerCustomer = async (req, res, next) => {
  try {
    const { name, email, password, phone, acceptedTerms } = req.body;

    if (!acceptedTerms) {
      return res.status(400).json({ success: false, message: 'You must accept the terms and conditions.' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
    }

    const user = await User.create({
      name,
      email,
      password,
      phone,
      role: ROLES.CUSTOMER
    });

    const token = generateToken({ id: user._id, role: user.role });

    res.status(201).json({
      success: true,
      message: 'Customer account created successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Register a Seller (Requires Admin Approval)
// @route   POST /api/auth/seller/register
// @access  Public
export const registerSeller = async (req, res, next) => {
  try {
    const { storeName, ownerName, email, password, phone, businessAddress, lat, lng, businessLicenseImage, acceptedTerms } = req.body;

    if (!acceptedTerms) {
      return res.status(400).json({ success: false, message: 'You must accept the terms and conditions.' });
    }

    let user = await User.findOne({ email });
    if (user) {
      const sellerExists = await Seller.findOne({ userId: user._id });
      if (sellerExists) {
        return res.status(400).json({ success: false, message: 'You have already registered a Seller account with this email address.' });
      }
    } else {
      // 1. Create Base User
      user = await User.create({
        name: ownerName,
        email,
        password,
        phone,
        role: ROLES.SELLER
      });
    }

    // 2. Create Seller Profile in pending_approval state
    const seller = await Seller.create({
      userId: user._id,
      storeName,
      ownerName,
      email,
      phone,
      businessAddress,
      businessLicenseImage,
      acceptedTerms,
      location: {
        lat: parseFloat(lat) || 28.6139,
        lng: parseFloat(lng) || 77.2090,
        city: 'New Delhi',
        state: 'Delhi',
        postalCode: '110001'
      },
      status: ACCOUNT_STATUSES.PENDING,
      isApproved: false
    });

    const token = generateToken({ id: user._id, role: user.role });

    res.status(201).json({
      success: true,
      message: 'Seller registration submitted. Awaiting administrator KYC approval.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        sellerId: seller._id,
        storeName: seller.storeName,
        status: seller.status,
        isApproved: seller.isApproved
      }
    });
  } catch (error) {
    next(error);
  }
};

export const registerDeliveryAgent = async (req, res, next) => {
  try {
    const { fullName, email, password, phone, address, vehicleType, vehicleNumber, drivingLicense, lat, lng, bankDetails, acceptedTerms, profileImage, vehicleImage } = req.body;

    if (!acceptedTerms) {
      return res.status(400).json({ success: false, message: 'You must accept the terms and conditions.' });
    }
    if (!profileImage) {
      return res.status(400).json({ success: false, message: 'Please upload or provide your profile photo.' });
    }
    if (!vehicleImage) {
      return res.status(400).json({ success: false, message: 'Please upload or provide a photo of your vehicle.' });
    }

    let user = await User.findOne({ email });
    if (user) {
      const agentExists = await DeliveryAgent.findOne({ userId: user._id });
      if (agentExists) {
        return res.status(400).json({ success: false, message: 'You have already registered a Delivery Agent account with this email address.' });
      }
    } else {
      // 1. Create User
      user = await User.create({
        name: fullName,
        email,
        password,
        phone,
        role: ROLES.DELIVERY
      });
    }

    // 2. Create Delivery Agent Profile in pending_approval state
    const agent = await DeliveryAgent.create({
      userId: user._id,
      fullName,
      email,
      phone,
      address,
      vehicleType: vehicleType || 'Motorcycle',
      vehicleNumber,
      drivingLicense,
      profileImage,
      vehicleImage,
      bankDetails,
      currentLocation: {
        lat: parseFloat(lat) || 28.6139,
        lng: parseFloat(lng) || 77.2090,
        address: address || 'New Delhi'
      },
      status: ACCOUNT_STATUSES.PENDING,
      isApproved: false,
      isOnline: false
    });

    const token = generateToken({ id: user._id, role: user.role });

    res.status(201).json({
      success: true,
      message: 'Delivery agent registered successfully. Awaiting admin vehicle & license approval.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        agentId: agent._id,
        vehicleNumber: agent.vehicleNumber,
        status: agent.status,
        isApproved: agent.isApproved
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Unified Login for all Portals (Validates Role)
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res, next) => {
  try {
    const { email, password, expectedRole } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password.' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password credentials.' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password credentials.' });
    }

    if (user.isBlocked) {
      return res.status(403).json({ success: false, message: 'Your account has been suspended by system administrator.' });
    }

    // Multi-role compatibility validation
    let extraMeta = {};
    if (expectedRole) {
      if (expectedRole === ROLES.SELLER) {
        const sellerProfile = await Seller.findOne({ userId: user._id });
        if (!sellerProfile) {
          return res.status(403).json({
            success: false,
            message: "Unauthorized portal access: You do not have a Seller business profile registered. Please register as a Seller first."
          });
        }
        extraMeta = {
          sellerId: sellerProfile._id,
          storeName: sellerProfile.storeName,
          status: sellerProfile.status,
          isApproved: sellerProfile.isApproved,
          revenue: sellerProfile.revenue || 0
        };
      } else if (expectedRole === ROLES.DELIVERY) {
        const agentProfile = await DeliveryAgent.findOne({ userId: user._id });
        if (!agentProfile) {
          return res.status(403).json({
            success: false,
            message: "Unauthorized portal access: You do not have a Delivery Agent profile registered. Please register as an Agent first."
          });
        }
        extraMeta = {
          agentId: agentProfile._id,
          vehicleNumber: agentProfile.vehicleNumber,
          isOnline: agentProfile.isOnline,
          status: agentProfile.status,
          isApproved: agentProfile.isApproved,
          totalEarnings: agentProfile.totalEarnings || 0
        };
      } else if (expectedRole === ROLES.ADMIN && user.role !== ROLES.ADMIN) {
        return res.status(403).json({
          success: false,
          message: "Unauthorized portal access: Strictly restricted to System Administrators."
        });
      } else if (expectedRole === ROLES.WAREHOUSE_MANAGER) {
        if (user.role !== ROLES.WAREHOUSE_MANAGER && user.role !== ROLES.ADMIN) {
          return res.status(403).json({
            success: false,
            message: "Unauthorized portal access: Strictly restricted to Warehouse Facility Managers."
          });
        }
        const warehouse = await Warehouse.findOne({
          $or: [
            { 'manager.userId': user._id },
            { 'manager.email': user.email }
          ]
        });
        if (!warehouse) {
          return res.status(404).json({
            success: false,
            message: "No assigned warehouse facility found for your manager account."
          });
        }
        extraMeta = {
          warehouseId: warehouse._id,
          warehouseName: warehouse.name,
          warehouseCode: warehouse.code,
          warehouseType: warehouse.type,
          warehouseCity: warehouse.city,
          warehouseState: warehouse.state,
          employeeId: warehouse.manager?.employeeId
        };
      }
    }

    const token = generateToken({ id: user._id, role: expectedRole || user.role });

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: expectedRole || user.role,
        phone: user.phone,
        avatar: user.avatar,
        ...extraMeta
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Current User Profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    let extraMeta = {};

    if (user.role === ROLES.SELLER) {
      const seller = await Seller.findOne({ userId: user._id });
      if (seller) extraMeta = { seller };
    } else if (user.role === ROLES.DELIVERY) {
      const agent = await DeliveryAgent.findOne({ userId: user._id });
      if (agent) extraMeta = { deliveryAgent: agent };
    }

    res.json({
      success: true,
      user,
      ...extraMeta
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update Current User Profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateUserProfile = async (req, res, next) => {
  try {
    const { name, phone, avatar, gender, dob, address } = req.body;
    // req.user._id is populated by authenticateUser middleware
    const user = await User.findById(req.user._id || req.user.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (name !== undefined) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (avatar !== undefined) user.avatar = avatar;
    if (gender !== undefined) user.gender = gender;
    if (dob !== undefined) user.dob = dob;
    if (address !== undefined) user.address = address;

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar,
        gender: user.gender,
        dob: user.dob,
        address: user.address
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reset user password (used in OTP / Forgot Password flow)
// @route   POST /api/auth/reset-password
// @access  Public
export const resetPassword = async (req, res, next) => {
  try {
    const { email, newPassword } = req.body;
    if (!email || !newPassword) {
      return res.status(400).json({ success: false, message: 'Please provide email and new password.' });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    user.password = newPassword;
    await user.save();
    res.json({ success: true, message: 'Password updated successfully.' });
  } catch (error) {
    next(error);
  }
};


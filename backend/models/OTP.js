import mongoose from 'mongoose';

const otpSchema = new mongoose.Schema({
  identifier: { type: String, required: true },
  otp: { type: String, required: true },
  type: { type: String, enum: ['email', 'phone'], default: 'email' },
  purpose: { type: String, enum: ['registration', 'login', 'reset-password'], default: 'registration' },
  isVerified: { type: Boolean, default: false },
  expiresAt: { type: Date, required: true }
}, { timestamps: true });

// TTL Index to automatically delete expired OTPs
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const OTP = mongoose.models.OTP || mongoose.model('OTP', otpSchema);

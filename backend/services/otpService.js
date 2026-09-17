import { OTP } from '../models/OTP.js';

// Generate 6-digit OTP
export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Create Nodemailer Transporter safely
const createEmailTransporter = async () => {
  try {
    const nodemailerModule = await import('nodemailer');
    const nodemailer = nodemailerModule.default || nodemailerModule;

    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      return nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587', 10),
        secure: process.env.SMTP_SECURE === 'true' || process.env.SMTP_PORT === '465',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });
    } else if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
      return nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_APP_PASSWORD
        }
      });
    }
  } catch (err) {
    // Nodemailer not installed or not configured
  }
  return null;
};

// Send OTP via Email
export const sendOTPEmail = async (email, otp, purpose = 'registration') => {
  const transporter = await createEmailTransporter();
  const purposeText = purpose === 'registration' 
    ? 'Account Registration Verification' 
    : (purpose === 'login' ? 'Passwordless Login Verification' : 'Password Reset');

  const htmlContent = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 540px; margin: 0 auto; background: #ffffff; border: 1px solid #e0e0e0; border-radius: 12px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #131921 0%, #232F3E 100%); padding: 24px; text-align: center; color: #ffffff;">
        <h1 style="margin: 0; font-size: 24px; font-weight: 800; letter-spacing: 0.5px;">
          <span style="color: #FF9900;">Nova</span>Kart
        </h1>
        <p style="margin: 6px 0 0 0; font-size: 13px; color: #d1d5db;">Multi-Vendor E-Commerce Platform</p>
      </div>
      <div style="padding: 32px 28px; color: #333333;">
        <h2 style="margin: 0 0 12px 0; font-size: 18px; color: #111827;">${purposeText}</h2>
        <p style="font-size: 14px; line-height: 1.6; color: #4b5563; margin-bottom: 24px;">
          Please use the following 6-digit One-Time Password (OTP) to complete your ${purpose === 'registration' ? 'registration' : 'verification'}. This code is valid for <strong>10 minutes</strong>.
        </p>
        <div style="text-align: center; margin: 28px 0;">
          <div style="display: inline-block; background: #FFF8E7; border: 2px dashed #FF9900; border-radius: 10px; padding: 14px 32px; font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #131921;">
            ${otp}
          </div>
        </div>
        <p style="font-size: 12px; color: #9ca3af; text-align: center; margin: 20px 0 0 0;">
          If you did not request this verification code, please ignore this email or contact support.
        </p>
      </div>
      <div style="background: #f9fafb; padding: 14px; text-align: center; font-size: 12px; color: #6b7280; border-top: 1px solid #e5e7eb;">
        &copy; ${new Date().getFullYear()} NovaKart Marketplace. All rights reserved.
      </div>
    </div>
  `;

  if (transporter) {
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_FROM || `"NovaKart Security" <${process.env.SMTP_USER || process.env.GMAIL_USER}>`,
        to: email,
        subject: `[${otp}] Your NovaKart Verification Code`,
        html: htmlContent
      });
      console.log(`✉️ [Email Service]: Real OTP email sent successfully to ${email}`);
      return { success: true, mode: 'live_smtp' };
    } catch (err) {
      console.warn(`⚠️ [Email Service]: Failed sending real email: ${err.message}. Falling back to dev logger.`);
    }
  }

  // Development Logger
  console.log('===========================================================');
  console.log(`✉️ [DEV EMAIL OTP DISPATCH]`);
  console.log(`🎯 Recipient:  ${email}`);
  console.log(`🔑 OTP Code:   ${otp}`);
  console.log(`⏱️ Validity:   10 Minutes`);
  console.log('===========================================================');
  return { success: true, mode: 'dev_mock' };
};

// Send OTP via SMS (Fast2SMS for India / Twilio Global / Console Logger)
export const sendOTPSMS = async (phone, otp, purpose = 'registration') => {
  const cleanPhone10 = phone.replace(/[^0-9]/g, '').slice(-10);
  const formattedE164 = phone.startsWith('+') ? phone.replace(/\s+/g, '') : `+91${cleanPhone10}`;

  // 1. Fast2SMS Integration (Fastest for Indian numbers like +91 9177850108)
  if (process.env.FAST2SMS_API_KEY) {
    const apiKey = process.env.FAST2SMS_API_KEY.trim();
    const smsMessage = `Your NovaKart verification OTP is ${otp}. Valid for 10 minutes.`;

    try {
      console.log(`📱 [Fast2SMS]: Sending real OTP SMS to ${cleanPhone10}...`);
      
      // Method A: Quick SMS GET API
      const getUrl = `https://www.fast2sms.com/dev/bulkV2?authorization=${encodeURIComponent(apiKey)}&route=q&message=${encodeURIComponent(smsMessage)}&language=english&flash=0&numbers=${cleanPhone10}`;
      let res = await fetch(getUrl, { method: 'GET' });
      let data = await res.json();

      if (data.return) {
        console.log(`✅ [Fast2SMS]: Real SMS delivered successfully to ${cleanPhone10}! Request ID:`, data.request_id);
        return { success: true, mode: 'live_fast2sms' };
      }

      // Method B: OTP Route POST API Fallback
      console.log(`📱 [Fast2SMS]: Attempting OTP route POST fallback for ${cleanPhone10}...`);
      res = await fetch('https://www.fast2sms.com/dev/bulkV2', {
        method: 'POST',
        headers: {
          'authorization': apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          route: 'otp',
          variables_values: otp,
          numbers: cleanPhone10
        })
      });
      data = await res.json();
      if (data.return) {
        console.log(`✅ [Fast2SMS]: Real SMS delivered via OTP route to ${cleanPhone10}! Request ID:`, data.request_id);
        return { success: true, mode: 'live_fast2sms' };
      } else {
        console.warn(`⚠️ [Fast2SMS API Response]:`, data.message);
      }
    } catch (err) {
      console.warn(`⚠️ [SMS Service Fast2SMS Error]:`, err.message);
    }
  }

  // 2. Twilio REST API (Global Delivery via native fetch)
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromPhone = process.env.TWILIO_PHONE_NUMBER;

  if (accountSid && authToken && fromPhone) {
    try {
      console.log(`📱 [Twilio]: Dispatching real SMS to ${formattedE164}...`);
      const authHeader = 'Basic ' + Buffer.from(`${accountSid.trim()}:${authToken.trim()}`).toString('base64');
      const params = new URLSearchParams();
      params.append('To', formattedE164);
      params.append('From', fromPhone.trim());
      params.append('Body', `Your NovaKart verification OTP is: ${otp}. Valid for 10 minutes.`);

      const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid.trim()}/Messages.json`, {
        method: 'POST',
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: params
      });
      const data = await res.json();
      if (res.ok) {
        console.log(`✅ [Twilio]: Real SMS sent successfully! SID: ${data.sid}`);
        return { success: true, mode: 'live_twilio' };
      } else {
        console.warn(`⚠️ [Twilio Error]:`, data.message);
      }
    } catch (err) {
      console.warn(`⚠️ [Twilio Send Error]:`, err.message);
    }
  }

  // 3. Development Fallback Logger
  console.log('===========================================================');
  console.log(`📱 [SMS OTP DISPATCH - DEV MODE]`);
  console.log(`🎯 Recipient Mobile: ${formattedE164} (${cleanPhone10})`);
  console.log(`🔑 Real OTP Code:    ${otp}`);
  console.log(`⏱️ Validity:         10 Minutes`);
  console.log(`💡 To receive real SMS on your phone: add FAST2SMS_API_KEY or TWILIO credentials in backend/.env`);
  console.log('===========================================================');
  return { success: true, mode: 'dev_mock' };
};

// In-memory fallback cache
const inMemoryOTPs = new Map();

// Store or Update OTP in Database (with in-memory fallback)
export const storeOTP = async (identifier, otp, type = 'email', purpose = 'registration') => {
  const normalized = identifier.toLowerCase().trim();
  const key = `${normalized}_${purpose}`;
  
  // Store in memory
  inMemoryOTPs.set(key, {
    otp: otp.trim(),
    expiresAt: Date.now() + 10 * 60 * 1000,
    isVerified: false
  });

  try {
    // Also persist to MongoDB
    await OTP.deleteMany({ identifier: normalized, purpose });
    return await OTP.create({
      identifier: normalized,
      otp: otp.trim(),
      type,
      purpose,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000)
    });
  } catch (err) {
    console.warn(`⚠️ [OTP DB]: MongoDB save bypassed, using active in-memory OTP cache.`);
    return { identifier: normalized, otp, type, purpose };
  }
};

// Verify OTP
export const verifyStoredOTP = async (identifier, otp, purpose = 'registration') => {
  const normalized = identifier.toLowerCase().trim();
  const key = `${normalized}_${purpose}`;

  // 1. Check in-memory cache
  const memRecord = inMemoryOTPs.get(key);
  if (memRecord && memRecord.otp === otp.trim() && memRecord.expiresAt > Date.now() && !memRecord.isVerified) {
    memRecord.isVerified = true;
    return { success: true, message: 'OTP verified successfully.' };
  }

  // 2. Check MongoDB
  try {
    const otpRecord = await OTP.findOne({
      identifier: normalized,
      otp: otp.trim(),
      purpose,
      isVerified: false,
      expiresAt: { $gt: new Date() }
    });

    if (otpRecord) {
      otpRecord.isVerified = true;
      await otpRecord.save();
      return { success: true, message: 'OTP verified successfully.' };
    }
  } catch (err) {
    console.warn(`⚠️ [OTP Verify DB Error]:`, err.message);
  }

  return { success: false, message: 'Invalid or expired OTP. Please check the code or request a new one.' };
};

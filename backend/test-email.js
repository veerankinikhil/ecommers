import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

console.log('🔍 Testing Gmail Email Configuration...');
console.log(`📧 GMAIL_USER: ${process.env.GMAIL_USER}`);
console.log(`🔑 GMAIL_APP_PASSWORD: ${process.env.GMAIL_APP_PASSWORD ? '✅ Set (' + process.env.GMAIL_APP_PASSWORD.length + ' chars)' : '❌ Missing'}`);

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD
  }
});

const testOTP = Math.floor(100000 + Math.random() * 900000);

try {
  console.log('\n📤 Sending test OTP email...');
  const info = await transporter.sendMail({
    from: `"NovaKart Security" <${process.env.GMAIL_USER}>`,
    to: process.env.GMAIL_USER, // sends to itself
    subject: `[${testOTP}] Your NovaKart Verification Code`,
    html: `
      <div style="font-family: 'Segoe UI', sans-serif; max-width: 500px; margin: 0 auto; background: #ffffff; border: 1px solid #e0e0e0; border-radius: 12px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #131921 0%, #232F3E 100%); padding: 24px; text-align: center; color: #fff;">
          <h1 style="margin:0; font-size:24px; font-weight:800;">
            <span style="color:#FF9900;">Nova</span>Kart
          </h1>
          <p style="margin:6px 0 0 0; font-size:13px; color:#d1d5db;">Email OTP System — Test</p>
        </div>
        <div style="padding: 32px 28px;">
          <h2 style="margin:0 0 12px; font-size:18px;">✅ Email OTP is Working!</h2>
          <p style="font-size:14px; color:#4b5563; line-height:1.6;">
            Your NovaKart Email OTP system is configured correctly. Here is your test OTP:
          </p>
          <div style="text-align:center; margin: 28px 0;">
            <div style="display:inline-block; background:#FFF8E7; border:2px dashed #FF9900; border-radius:10px; padding:14px 32px; font-size:32px; font-weight:800; letter-spacing:8px; color:#131921;">
              ${testOTP}
            </div>
          </div>
          <p style="font-size:12px; color:#9ca3af; text-align:center;">
            This is a test email. No action needed.
          </p>
        </div>
        <div style="background:#f9fafb; padding:14px; text-align:center; font-size:12px; color:#6b7280; border-top:1px solid #e5e7eb;">
          © ${new Date().getFullYear()} NovaKart Marketplace
        </div>
      </div>
    `
  });

  console.log('\n✅ SUCCESS! Email sent!');
  console.log(`📬 Message ID: ${info.messageId}`);
  console.log(`📥 Check inbox: ${process.env.GMAIL_USER}`);
  console.log(`🔑 Test OTP was: ${testOTP}`);
  console.log('\n🎉 Gmail OTP is fully working for NovaKart!');
} catch (err) {
  console.error('\n❌ EMAIL FAILED:', err.message);
  if (err.message.includes('Invalid login')) {
    console.log('\n💡 Fix: The App Password is wrong or 2-Step Verification is not enabled.');
    console.log('   → Go to: https://myaccount.google.com/apppasswords');
    console.log('   → Generate a new 16-char App Password');
  } else if (err.message.includes('Username and Password')) {
    console.log('\n💡 Fix: Gmail credentials rejected. Re-generate App Password.');
  }
}

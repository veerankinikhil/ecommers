import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

const apiKey = process.env.FAST2SMS_API_KEY?.trim();
const testOTP = Math.floor(100000 + Math.random() * 900000);

console.log('========================================================');
console.log('📱 Fast2SMS OTP — Live Test');
console.log('========================================================');
console.log(`🔑 API Key: ${apiKey ? '✅ Found (' + apiKey.length + ' chars)' : '❌ Missing'}`);

if (!apiKey) {
  console.error('❌ FAST2SMS_API_KEY not set in backend/.env');
  process.exit(1);
}

// Ask for phone number via argument or use default test
const phoneArg = process.argv[2];
if (!phoneArg) {
  console.log('\n⚠️  Usage: node test-sms.js <10-digit-indian-number>');
  console.log('   Example: node test-sms.js 9177850108\n');
  console.log('Running API key validity check only...\n');
}

const testPhone = phoneArg ? phoneArg.replace(/[^0-9]/g, '').slice(-10) : null;

// ── Test 1: Check account balance / validity ───────────────────────────────
console.log('🔍 Step 1: Checking Fast2SMS API key validity...');
try {
  const balanceRes = await fetch(
    `https://www.fast2sms.com/dev/wallet`,
    {
      method: 'GET',
      headers: { authorization: apiKey }
    }
  );
  const balData = await balanceRes.json();
  if (balData.return) {
    console.log(`✅ API Key is VALID!`);
    console.log(`💰 Wallet Balance: ₹${balData.wallet}`);
  } else {
    console.warn('⚠️  Balance check response:', JSON.stringify(balData));
  }
} catch (err) {
  console.warn('⚠️  Could not fetch balance:', err.message);
}

// ── Test 2: Send real SMS ──────────────────────────────────────────────────
if (testPhone) {
  console.log(`\n📤 Step 2: Sending test OTP [${testOTP}] to +91${testPhone}...`);

  // Method A: Quick SMS (bulkV2 GET)
  try {
    const smsMsg = `Your NovaKart verification OTP is ${testOTP}. Valid for 10 minutes. Do not share.`;
    const url = `https://www.fast2sms.com/dev/bulkV2?authorization=${encodeURIComponent(apiKey)}&route=q&message=${encodeURIComponent(smsMsg)}&language=english&flash=0&numbers=${testPhone}`;
    const res = await fetch(url, { method: 'GET' });
    const data = await res.json();

    if (data.return) {
      console.log('\n✅ SUCCESS! SMS sent via Quick SMS route!');
      console.log(`📲 Phone:      +91${testPhone}`);
      console.log(`🔑 OTP sent:   ${testOTP}`);
      console.log(`📋 Request ID: ${data.request_id}`);
      console.log('\n🎉 Fast2SMS is fully working for NovaKart OTP!');
      process.exit(0);
    } else {
      console.warn('⚠️  Quick SMS route failed:', data.message);
    }
  } catch (err) {
    console.warn('⚠️  Quick SMS error:', err.message);
  }

  // Method B: OTP Route (POST fallback)
  console.log('\n🔄 Trying OTP route fallback...');
  try {
    const res = await fetch('https://www.fast2sms.com/dev/bulkV2', {
      method: 'POST',
      headers: {
        'authorization': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        route: 'otp',
        variables_values: String(testOTP),
        numbers: testPhone
      })
    });
    const data = await res.json();

    if (data.return) {
      console.log('\n✅ SUCCESS! SMS sent via OTP route!');
      console.log(`📲 Phone:      +91${testPhone}`);
      console.log(`🔑 OTP sent:   ${testOTP}`);
      console.log(`📋 Request ID: ${data.request_id}`);
      console.log('\n🎉 Fast2SMS is fully working for NovaKart OTP!');
    } else {
      console.error('\n❌ BOTH routes failed.');
      console.log('API Response:', JSON.stringify(data, null, 2));
      console.log('\n💡 Possible fixes:');
      console.log('   → Check wallet balance at: https://www.fast2sms.com/dashboard');
      console.log('   → Ensure your account is active and verified');
    }
  } catch (err) {
    console.error('\n❌ OTP route error:', err.message);
  }
} else {
  console.log('\n📌 To actually send a test SMS, run:');
  console.log('   node test-sms.js <your-10-digit-number>');
  console.log('   Example: node test-sms.js 9177850108');
}

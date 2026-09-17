import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

const accountSid = process.env.TWILIO_ACCOUNT_SID?.trim();
const authToken  = process.env.TWILIO_AUTH_TOKEN?.trim();
const fromPhone  = process.env.TWILIO_PHONE_NUMBER?.trim();
const toPhone    = process.argv[2] || '+919177850108';

const testOTP = Math.floor(100000 + Math.random() * 900000);

console.log('========================================================');
console.log('📱 Twilio SMS OTP — Live Test');
console.log('========================================================');
console.log(`🔑 Account SID : ${accountSid ? accountSid : '❌ Missing'}`);
console.log(`🔐 Auth Token  : ${authToken  ? '✅ Set'     : '❌ Missing'}`);
console.log(`📞 From Number : ${fromPhone  ? fromPhone   : '❌ Missing'}`);
console.log(`📲 To Number   : ${toPhone}`);
console.log(`🔢 Test OTP    : ${testOTP}`);
console.log('========================================================\n');

if (!accountSid || !authToken || !fromPhone) {
  console.error('❌ Missing Twilio credentials in backend/.env');
  process.exit(1);
}

console.log('📤 Sending SMS via Twilio...\n');

try {
  const authHeader = 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64');
  const params = new URLSearchParams();
  params.append('To',   toPhone);
  params.append('From', fromPhone);
  params.append('Body', `Your NovaKart OTP is: ${testOTP}. Valid for 10 minutes. Do not share.`);

  const res  = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
    { method: 'POST', headers: { 'Authorization': authHeader, 'Content-Type': 'application/x-www-form-urlencoded' }, body: params }
  );
  const data = await res.json();

  if (res.ok) {
    console.log('✅ SUCCESS! SMS sent via Twilio!');
    console.log(`📲 Sent to  : ${toPhone}`);
    console.log(`🔑 OTP Code : ${testOTP}`);
    console.log(`📋 SID      : ${data.sid}`);
    console.log(`📊 Status   : ${data.status}`);
    console.log('\n🎉 Twilio SMS OTP is fully working for NovaKart!');
  } else {
    console.error('❌ Twilio Error:', data.message || data.code);
    console.log('\nFull Response:', JSON.stringify(data, null, 2));

    if (data.code === 21608 || data.message?.includes('unverified')) {
      console.log('\n💡 Fix: Your number is not verified on Twilio trial.');
      console.log('   → Go to: https://console.twilio.com/us1/develop/phone-numbers/manage/verified');
      console.log('   → Click "Add a new Caller ID" → Enter +919177850108 → Verify');
    } else if (data.code === 20003) {
      console.log('\n💡 Fix: Auth Token is incorrect. Re-copy from Twilio dashboard.');
    }
  }
} catch (err) {
  console.error('❌ Request failed:', err.message);
}

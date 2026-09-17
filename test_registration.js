// test_registration.js
// Run this script using Node.js: node test_registration.js

const API_BASE_URL = process.env.API_URL || 'http://localhost:5050/api/auth';

async function testSellerRegistration() {
  console.log('--- Testing Seller Registration ---');
  try {
    const response = await fetch(`${API_BASE_URL}/seller/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        storeName: 'Test Store',
        ownerName: 'Jane Doe',
        email: `seller${Date.now()}@example.com`,
        password: 'Password123!',
        phone: '1234567890',
        businessAddress: '123 Test St',
        businessLicenseImage: 'https://example.com/license.jpg',
        acceptedTerms: true
      })
    });
    const data = await response.json();
    console.log('Response:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error:', error);
  }
}

async function testDeliveryAgentRegistration() {
  console.log('\n--- Testing Delivery Agent Registration ---');
  try {
    const response = await fetch(`${API_BASE_URL}/delivery/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'John Doe',
        email: `agent${Date.now()}@example.com`,
        password: 'Password123!',
        phone: '0987654321',
        address: '456 Delivery Ave',
        vehicleType: 'Motorcycle',
        vehicleNumber: 'DL-12-AB-3456',
        drivingLicense: 'DL-987654321',
        profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
        vehicleImage: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=600&q=80',
        acceptedTerms: true,
        bankDetails: {
          accountName: 'John Doe',
          accountNumber: '123456789012',
          bankName: 'Test Bank',
          ifscCode: 'TEST0001234'
        }
      })
    });
    const data = await response.json();
    console.log('Response:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error:', error);
  }
}

async function runTests() {
  await testSellerRegistration();
  await testDeliveryAgentRegistration();
}

runTests();

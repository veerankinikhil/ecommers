import { db } from './config/firebase.js';

const emailToFind = '241fa07004@gmail.com';

const checkUser = async () => {
  try {
    console.log(`🔍 Checking Firestore collection 'users' for email: ${emailToFind}...`);
    const snapshot = await db.collection('users').where('email', '==', emailToFind).get();
    
    if (snapshot.empty) {
      console.log(`❌ No user found in Firestore with email: ${emailToFind}`);
      console.log(`💡 Creating a new customer account in Firestore for this email...`);
      
      const newUser = {
        name: 'Gandu Bhargav',
        email: emailToFind,
        phone: '+919177850108',
        role: 'customer',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
        isBlocked: false,
        createdAt: new Date().toISOString()
      };
      
      const docRef = await db.collection('users').add(newUser);
      console.log(`✅ Success! Created new customer account with ID: ${docRef.id}`);
    } else {
      const doc = snapshot.docs[0];
      const user = doc.data();
      
      console.log('=============================================');
      console.log('👤 USER FOUND IN FIRESTORE:');
      console.log('=============================================');
      console.log(`🆔 ID    : ${doc.id}`);
      console.log(`Name    : ${user.name}`);
      console.log(`Email   : ${user.email}`);
      console.log(`Phone   : ${user.phone}`);
      console.log(`🔑 Role : ${user.role} (Expected: customer)`);
      console.log(`Blocked : ${user.isBlocked}`);
      console.log('=============================================');

      if (user.role !== 'customer') {
        console.log(`\n⚙️ Modifying user role to 'customer' in Firestore...`);
        await db.collection('users').doc(doc.id).update({ role: 'customer' });
        console.log(`✅ Success! Role updated to 'customer'. Try logging in again!`);
      } else {
        console.log(`\nℹ️ Role is already 'customer'. Ready for login!`);
      }
    }
  } catch (err) {
    console.error('❌ Error during Firestore operations:', err.message);
  } finally {
    process.exit(0);
  }
};

checkUser();

// scripts/setup-firebase.js
// Run this script to initialize your Firestore database with default settings

const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc, serverTimestamp } = require('firebase/firestore');

const firebaseConfig = {
  // Add your Firebase configuration here
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function setupFirestore() {
  try {
    console.log('Setting up Firestore database...');

    // Create default settings document
    const settingsRef = doc(db, 'settings', 'general');
    await setDoc(settingsRef, {
      seatPrice: 500, // Default seat price in INR
      eventName: 'Sacred Havan Ceremony',
      eventDescription: '5-day spiritual ceremony with morning and afternoon sessions',
      discountThreshold: 5, // Number of seats for bulk discount
      discountPercentage: 10, // Percentage discount for bulk booking
      refundDaysThreshold: 15, // Days before event for full refund
      updatedAt: serverTimestamp()
    });

    console.log('✅ Settings document created successfully');

    // Create sample blocked seats (optional)
    // This is just for demonstration - you can remove or modify as needed
    const sampleDate = new Date();
    sampleDate.setDate(sampleDate.getDate() + 1); // Tomorrow
    const dateKey = sampleDate.toISOString().split('T')[0];
    
    // Block some VIP seats as an example
    const sampleAvailabilityRef = doc(db, 'seatAvailability', `${dateKey}_morning`);
    await setDoc(sampleAvailabilityRef, {
      seats: {
        'A-1-K1-S1': {
          blocked: true,
          blockedBy: 'system',
          blockedAt: serverTimestamp(),
          reason: 'VIP Reserved'
        },
        'A-1-K1-S2': {
          blocked: true,
          blockedBy: 'system',
          blockedAt: serverTimestamp(),
          reason: 'VIP Reserved'
        }
      },
      updatedAt: serverTimestamp()
    });

    console.log('✅ Sample seat availability created');
    console.log('🎉 Firestore setup completed successfully!');
    console.log('');
    console.log('Next steps:');
    console.log('1. Update your .env.local file with Firebase credentials');
    console.log('2. Run: npm run dev');
    console.log('3. Visit http://localhost:3000 to test the application');

  } catch (error) {
    console.error('❌ Error setting up Firestore:', error);
  }
}

// Run the setup
setupFirestore().then(() => {
  process.exit(0);
}).catch(error => {
  console.error('Setup failed:', error);
  process.exit(1);
});

module.exports = { setupFirestore };

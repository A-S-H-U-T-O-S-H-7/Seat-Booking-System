// Script to update stall event dates in Firebase
// Run this with: node update-stall-dates.js

const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

// Initialize Firebase Admin (you'll need your service account key)
// For now, let's just show the command you need to run

console.log(`
🔧 TO UPDATE STALL EVENT DATES:

1. Go to Firebase Console: https://console.firebase.google.com
2. Select your project
3. Go to Firestore Database
4. Navigate to: settings > stalls
5. Update the eventDates field with:

{
  "eventDates": {
    "startDate": "2025-12-03",
    "endDate": "2025-12-07", 
    "isActive": true
  }
}

OR use the Firebase Admin panel to run this update directly.

The current data shows June 15-20, 2026, but it should be December 3-7, 2025.

🔍 Current issue: Firebase has wrong dates
✅ Solution: Update Firebase settings/stalls document
`);

// If you have Firebase Admin setup, you can uncomment and use this:
/*
async function updateStallDates() {
  try {
    const db = getFirestore();
    
    await db.collection('settings').doc('stalls').update({
      eventDates: {
        startDate: '2025-12-03',
        endDate: '2025-12-07',
        isActive: true
      }
    });
    
    console.log('✅ Stall dates updated successfully!');
  } catch (error) {
    console.error('❌ Error updating dates:', error);
  }
}

// Uncomment to run
// updateStallDates();
*/

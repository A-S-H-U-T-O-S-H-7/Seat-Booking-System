// Demo admin setup script
// Run with: node scripts/setup-admin.js

const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json'); // You'll need to add your Firebase service account key

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://your-project-id.firebaseio.com' // Replace with your Firebase database URL
});

const db = admin.firestore();
const auth = admin.auth();

async function createAdminUser() {
  try {
    // Create user in Firebase Auth
    const userRecord = await auth.createUser({
      email: 'admin@havanseats.com',
      password: 'admin123456', // Change this password
      displayName: 'Super Admin',
      emailVerified: true
    });

    console.log('✅ Created Firebase Auth user:', userRecord.uid);

    // Add admin document to Firestore
    await db.collection('admins').doc(userRecord.uid).set({
      name: 'Super Admin',
      email: 'admin@havanseats.com',
      role: 'super_admin',
      permissions: [], // Super admin has all permissions
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      isActive: true,
      createdBy: 'system'
    });

    console.log('✅ Created admin document in Firestore');

    // Create initial settings
    await db.collection('settings').doc('general').set({
      seatPrice: 500,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    await db.collection('settings').doc('pricing').set({
      defaultSeatPrice: 500,
      currency: 'INR',
      taxRate: 0,
      bulkDiscounts: [
        { minSeats: 5, discountPercent: 10, isActive: true },
        { minSeats: 10, discountPercent: 15, isActive: true },
        { minSeats: 20, discountPercent: 20, isActive: true }
      ],
      earlyBirdDiscount: {
        isActive: true,
        discountPercent: 15,
        daysBeforeEvent: 7
      },
      seasonalPricing: [],
      cancellationPolicy: {
        fullRefundDays: 7,
        partialRefundDays: 3,
        partialRefundPercent: 50,
        processingFee: 50
      },
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    console.log('✅ Created initial settings');

    // Create demo event
    await db.collection('events').doc('demo_event_' + Date.now()).set({
      title: 'Demo Havan Event',
      description: 'A demo havan event for testing the booking system',
      date: admin.firestore.Timestamp.fromDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)), // 7 days from now
      shifts: [
        { id: 'morning', name: 'Morning', startTime: '06:00', endTime: '12:00', isActive: true },
        { id: 'evening', name: 'Evening', startTime: '16:00', endTime: '22:00', isActive: true }
      ],
      maxCapacity: 400,
      pricePerSeat: 500,
      isActive: true,
      registrationDeadline: null,
      specialInstructions: 'Please arrive 30 minutes before the scheduled time.',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    console.log('✅ Created demo event');

    console.log('\n🎉 Admin setup completed successfully!');
    console.log('\n📧 Admin Email: admin@havanseats.com');
    console.log('🔑 Admin Password: admin123456');
    console.log('\n⚠️  IMPORTANT: Change the admin password after first login!');
    console.log('🌐 Access admin panel at: /admin/login');

  } catch (error) {
    console.error('❌ Error setting up admin:', error);
  } finally {
    process.exit();
  }
}

// Add a second admin with limited permissions
async function createDemoAdmin() {
  try {
    const userRecord = await auth.createUser({
      email: 'demo@havanseats.com',
      password: 'demo123456',
      displayName: 'Demo Admin',
      emailVerified: true
    });

    await db.collection('admins').doc(userRecord.uid).set({
      name: 'Demo Admin',
      email: 'demo@havanseats.com',
      role: 'admin',
      permissions: ['view_events', 'manage_seats', 'view_bookings', 'view_users', 'manage_pricing'],
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      isActive: true,
      createdBy: 'system'
    });

    console.log('✅ Created demo admin user');
  } catch (error) {
    console.error('❌ Error creating demo admin:', error);
  }
}

// Run the setup
async function main() {
  console.log('🚀 Starting admin setup...\n');
  
  await createAdminUser();
  await createDemoAdmin();
}

main();

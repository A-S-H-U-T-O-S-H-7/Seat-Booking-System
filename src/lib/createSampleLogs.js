import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

/**
 * Create sample admin activity logs for demonstration
 * Run this function once to populate the logs collection with sample data
 */

const createSampleLogs = async () => {
  const sampleLogs = [
    {
      adminId: 'admin_demo_1',
      adminName: 'Super Admin',
      adminRole: 'super_admin',
      action: 'login',
      entityType: 'admin_session',
      entityId: 'admin_demo_1',
      details: 'Admin logged into the system',
      timestamp: serverTimestamp(),
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      sessionId: 'sess_demo_1'
    },
    {
      adminId: 'admin_demo_1',
      adminName: 'Super Admin',
      adminRole: 'super_admin',
      action: 'create',
      entityType: 'event',
      entityId: 'event_demo_123',
      details: 'Created new Havan event for December 2024',
      timestamp: serverTimestamp(),
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      sessionId: 'sess_demo_1'
    },
    {
      adminId: 'admin_demo_2',
      adminName: 'Demo Admin',
      adminRole: 'admin',
      action: 'update',
      entityType: 'booking',
      entityId: 'booking_abc123',
      details: 'Updated booking status to confirmed',
      timestamp: serverTimestamp(),
      ipAddress: '192.168.1.105',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      sessionId: 'sess_demo_2'
    },
    {
      adminId: 'admin_demo_1',
      adminName: 'Super Admin',
      adminRole: 'super_admin',
      action: 'delete',
      entityType: 'user',
      entityId: 'user_xyz789',
      details: 'Deleted user account due to policy violation',
      timestamp: serverTimestamp(),
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      sessionId: 'sess_demo_3'
    },
    {
      adminId: 'admin_demo_2',
      adminName: 'Demo Admin',
      adminRole: 'admin',
      action: 'update',
      entityType: 'settings',
      entityId: 'pricing',
      details: 'Updated seat pricing from ₹400 to ₹500',
      timestamp: serverTimestamp(),
      ipAddress: '192.168.1.105',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      sessionId: 'sess_demo_4'
    },
    {
      adminId: 'admin_demo_1',
      adminName: 'Super Admin',
      adminRole: 'super_admin',
      action: 'create',
      entityType: 'admin',
      entityId: 'admin_new_001',
      details: 'Created new admin user with limited permissions',
      timestamp: serverTimestamp(),
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      sessionId: 'sess_demo_5'
    },
    {
      adminId: 'admin_demo_2',
      adminName: 'Demo Admin',
      adminRole: 'admin',
      action: 'view',
      entityType: 'booking',
      entityId: 'booking_def456',
      details: 'Viewed booking details for customer support',
      timestamp: serverTimestamp(),
      ipAddress: '192.168.1.105',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      sessionId: 'sess_demo_6'
    },
    {
      adminId: 'admin_demo_1',
      adminName: 'Super Admin',
      adminRole: 'super_admin',
      action: 'update',
      entityType: 'seat',
      entityId: 'seat_block_a_01',
      details: 'Changed seat status from available to maintenance',
      timestamp: serverTimestamp(),
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      sessionId: 'sess_demo_7'
    },
    {
      adminId: 'admin_demo_2',
      adminName: 'Demo Admin',
      adminRole: 'admin',
      action: 'create',
      entityType: 'booking',
      entityId: 'booking_manual_001',
      details: 'Manually created booking for walk-in customer',
      timestamp: serverTimestamp(),
      ipAddress: '192.168.1.105',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      sessionId: 'sess_demo_8'
    },
    {
      adminId: 'admin_demo_1',
      adminName: 'Super Admin',
      adminRole: 'super_admin',
      action: 'logout',
      entityType: 'admin_session',
      entityId: 'admin_demo_1',
      details: 'Admin logged out of the system',
      timestamp: serverTimestamp(),
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      sessionId: 'sess_demo_9'
    }
  ];

  try {
    console.log('Creating sample admin activity logs...');
    
    for (let i = 0; i < sampleLogs.length; i++) {
      const log = sampleLogs[i];
      await addDoc(collection(db, 'adminLogs'), log);
      console.log(`Created log ${i + 1}/${sampleLogs.length}: ${log.action} ${log.entityType}`);
      
      // Add a small delay to ensure different timestamps
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log('✅ Sample logs created successfully!');
    console.log('You can now view them in the Activity Logs section of the admin dashboard.');
    
    return { success: true, count: sampleLogs.length };
  } catch (error) {
    console.error('❌ Error creating sample logs:', error);
    return { success: false, error: error.message };
  }
};

export default createSampleLogs;

// Additional utility functions for testing
export const createCustomLog = async (logData) => {
  try {
    const logEntry = {
      timestamp: serverTimestamp(),
      ...logData
    };
    
    await addDoc(collection(db, 'adminLogs'), logEntry);
    console.log('Custom log created:', logData);
    return true;
  } catch (error) {
    console.error('Error creating custom log:', error);
    return false;
  }
};

export const clearAllLogs = async () => {
  try {
    // Note: This is a dangerous operation and should only be used in development
    console.warn('⚠️ This will delete all admin logs. Use with caution!');
    
    // In a real implementation, you'd need to fetch all logs and delete them
    // or use Firebase Admin SDK batch operations
    console.log('Please use Firebase Console or Admin SDK to clear logs in production');
    
    return false;
  } catch (error) {
    console.error('Error clearing logs:', error);
    return false;
  }
};

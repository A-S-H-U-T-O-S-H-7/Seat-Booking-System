import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

/**
 * Admin Activity Logger Utility
 * Automatically logs all admin activities including CRUD operations
 */

class AdminLogger {
  constructor() {
    this.collectionName = 'adminLogs';
  }

  /**
   * Log an admin activity
   * @param {Object} params - Logging parameters
   * @param {string} params.adminId - The admin user's ID
   * @param {string} params.adminName - The admin user's name
   * @param {string} params.adminRole - The admin user's role (admin/super_admin)
   * @param {string} params.action - The action performed (create/read/update/delete)
   * @param {string} params.entityType - Type of entity affected (booking/user/admin/event/etc)
   * @param {string} params.entityId - ID of the affected entity
   * @param {Object|string} params.details - Additional details about the action
   * @param {string} params.ipAddress - User's IP address (optional)
   * @param {string} params.userAgent - User's browser info (optional)
   */
  async log({
    adminId,
    adminName,
    adminRole,
    action,
    entityType,
    entityId,
    details = null,
    ipAddress = null,
    userAgent = null
  }) {
    try {
      const logEntry = {
        adminId,
        adminName,
        adminRole,
        action: action.toLowerCase(),
        entityType,
        entityId,
        details,
        timestamp: serverTimestamp(),
        ipAddress,
        userAgent: userAgent ? userAgent.substring(0, 200) : null, // Limit user agent length
        sessionId: this.generateSessionId()
      };

      // Remove null values to keep the document clean
      Object.keys(logEntry).forEach(key => {
        if (logEntry[key] === null) {
          delete logEntry[key];
        }
      });

      await addDoc(collection(db, this.collectionName), logEntry);
      
      console.log('Admin activity logged:', {
        admin: adminName,
        action,
        entityType,
        entityId: entityId?.substring(0, 8) + '...'
      });
      
      return true;
    } catch (error) {
      console.error('Error logging admin activity:', error);
      // Don't throw error to avoid breaking the main functionality
      return false;
    }
  }

  /**
   * Log admin login activity
   */
  async logLogin(adminId, adminName, adminRole, ipAddress = null, userAgent = null) {
    return this.log({
      adminId,
      adminName,
      adminRole,
      action: 'login',
      entityType: 'admin_session',
      entityId: adminId,
      details: 'Admin logged into the system',
      ipAddress,
      userAgent
    });
  }

  /**
   * Log admin logout activity
   */
  async logLogout(adminId, adminName, adminRole, ipAddress = null, userAgent = null) {
    return this.log({
      adminId,
      adminName,
      adminRole,
      action: 'logout',
      entityType: 'admin_session',
      entityId: adminId,
      details: 'Admin logged out of the system',
      ipAddress,
      userAgent
    });
  }

  /**
   * Log booking-related activities
   */
  async logBookingActivity(adminUser, action, bookingId, details = null, ipAddress = null, userAgent = null) {
    if (action === 'cancel') {
      console.log('🔍 ADMIN LOGGER: Cancel action detected!');
      console.log('🔍 Called from:', new Error().stack);
      console.log('🔍 Admin user:', adminUser);
      console.log('🔍 Booking ID:', bookingId);
      console.log('🔍 Details:', details);
    }
    return this.log({
      adminId: adminUser.uid,
      adminName: adminUser.name,
      adminRole: adminUser.role,
      action,
      entityType: 'booking',
      entityId: bookingId,
      details,
      ipAddress,
      userAgent
    });
  }

  /**
   * Log user-related activities
   */
  async logUserActivity(adminUser, action, userId, details = null, ipAddress = null, userAgent = null) {
    return this.log({
      adminId: adminUser.uid,
      adminName: adminUser.name,
      adminRole: adminUser.role,
      action,
      entityType: 'user',
      entityId: userId,
      details,
      ipAddress,
      userAgent
    });
  }

  /**
   * Log admin management activities
   */
  async logAdminActivity(adminUser, action, targetAdminId, details = null, ipAddress = null, userAgent = null) {
    return this.log({
      adminId: adminUser.uid,
      adminName: adminUser.name,
      adminRole: adminUser.role,
      action,
      entityType: 'admin',
      entityId: targetAdminId,
      details,
      ipAddress,
      userAgent
    });
  }

  /**
   * Log event-related activities
   */
  async logEventActivity(adminUser, action, eventId, details = null, ipAddress = null, userAgent = null) {
    return this.log({
      adminId: adminUser.uid,
      adminName: adminUser.name,
      adminRole: adminUser.role,
      action,
      entityType: 'event',
      entityId: eventId,
      details,
      ipAddress,
      userAgent
    });
  }

  /**
   * Log seat management activities
   */
  async logSeatActivity(adminUser, action, seatId, details = null, ipAddress = null, userAgent = null) {
    return this.log({
      adminId: adminUser.uid,
      adminName: adminUser.name,
      adminRole: adminUser.role,
      action,
      entityType: 'seat',
      entityId: seatId,
      details,
      ipAddress,
      userAgent
    });
  }

  /**
   * Log pricing/settings activities
   */
  async logSettingsActivity(adminUser, action, settingType, details = null, ipAddress = null, userAgent = null) {
    return this.log({
      adminId: adminUser.uid,
      adminName: adminUser.name,
      adminRole: adminUser.role,
      action,
      entityType: 'settings',
      entityId: settingType,
      details,
      ipAddress,
      userAgent
    });
  }

  /**
   * Log payment-related activities
   */
  async logPaymentActivity(adminUser, action, paymentId, details = null, ipAddress = null, userAgent = null) {
    return this.log({
      adminId: adminUser.uid,
      adminName: adminUser.name,
      adminRole: adminUser.role,
      action,
      entityType: 'payment',
      entityId: paymentId,
      details,
      ipAddress,
      userAgent
    });
  }

  /**
   * Log system configuration activities
   */
  async logSystemActivity(adminUser, action, systemComponent, details = null, ipAddress = null, userAgent = null) {
    return this.log({
      adminId: adminUser.uid,
      adminName: adminUser.name,
      adminRole: adminUser.role,
      action,
      entityType: 'system',
      entityId: systemComponent,
      details,
      ipAddress,
      userAgent
    });
  }

  /**
   * Generate a simple session ID for tracking related activities
   */
  generateSessionId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  /**
   * Get client IP address (for browser environment)
   */
  async getClientIP() {
    try {
      // This will only work if you have a service to get IP
      // For local development, this might not work
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch (error) {
      console.log('Could not fetch IP address:', error);
      return null;
    }
  }

  /**
   * Get user agent string
   */
  getUserAgent() {
    if (typeof window !== 'undefined' && window.navigator) {
      return window.navigator.userAgent;
    }
    return null;
  }

  /**
   * Log with automatic IP and user agent detection
   */
  async logWithContext(adminUser, action, entityType, entityId, details = null) {
    const ipAddress = await this.getClientIP();
    const userAgent = this.getUserAgent();

    return this.log({
      adminId: adminUser.uid,
      adminName: adminUser.name,
      adminRole: adminUser.role,
      action,
      entityType,
      entityId,
      details,
      ipAddress,
      userAgent
    });
  }

  /**
   * Batch log multiple activities (useful for bulk operations)
   */
  async logBatch(activities) {
    const promises = activities.map(activity => this.log(activity));
    try {
      const results = await Promise.allSettled(promises);
      const successful = results.filter(result => result.status === 'fulfilled').length;
      const failed = results.filter(result => result.status === 'rejected').length;
      
      console.log(`Batch logging completed: ${successful} successful, ${failed} failed`);
      return { successful, failed };
    } catch (error) {
      console.error('Error in batch logging:', error);
      return { successful: 0, failed: activities.length };
    }
  }
}

// Create and export a singleton instance
const adminLogger = new AdminLogger();

export default adminLogger;

// Export individual methods for convenience
export const {
  log,
  logLogin,
  logLogout,
  logBookingActivity,
  logUserActivity,
  logAdminActivity,
  logEventActivity,
  logSeatActivity,
  logSettingsActivity,
  logPaymentActivity,
  logSystemActivity,
  logWithContext,
  logBatch
} = adminLogger;

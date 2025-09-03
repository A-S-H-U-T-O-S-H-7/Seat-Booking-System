import { db } from '@/lib/firebase';
import { doc, updateDoc, serverTimestamp, getDoc } from 'firebase/firestore';

/**
 * Mark a booking as participated
 * @param {string} bookingId - The booking ID
 * @param {string} bookingType - Type of booking ('havan', 'show', 'stall', 'delegate')
 * @param {string} markedBy - User ID who marked participation
 * @returns {Promise<{success: boolean, message: string}>}
 */
export const markAsParticipated = async (bookingId, bookingType, markedBy) => {
  try {
    const collectionName = getCollectionName(bookingType);
    const bookingRef = doc(db, collectionName, bookingId);
    
    // Check if booking exists
    const bookingDoc = await getDoc(bookingRef);
    if (!bookingDoc.exists()) {
      return {
        success: false,
        message: 'Booking not found'
      };
    }
    
    const bookingData = bookingDoc.data();
    
    // Check if already participated
    if (bookingData.participated) {
      return {
        success: false,
        message: 'This booking has already been marked as participated'
      };
    }
    
    // Check if booking is confirmed
    if (bookingData.status !== 'confirmed') {
      return {
        success: false,
        message: 'Only confirmed bookings can be marked as participated'
      };
    }
    
    // Update the booking with participation data
    await updateDoc(bookingRef, {
      participated: true,
      participatedAt: serverTimestamp(),
      participatedBy: markedBy,
      updatedAt: serverTimestamp()
    });
    
    console.log(`✅ Booking ${bookingId} marked as participated by ${markedBy}`);
    
    return {
      success: true,
      message: 'Successfully marked as participated'
    };
    
  } catch (error) {
    console.error('❌ Error marking participation:', error);
    return {
      success: false,
      message: 'Failed to mark participation: ' + error.message
    };
  }
};

/**
 * Undo participation (Super Admin only)
 * @param {string} bookingId - The booking ID
 * @param {string} bookingType - Type of booking
 * @param {string} undoneBy - Super admin user ID
 * @returns {Promise<{success: boolean, message: string}>}
 */
export const undoParticipation = async (bookingId, bookingType, undoneBy) => {
  try {
    const collectionName = getCollectionName(bookingType);
    const bookingRef = doc(db, collectionName, bookingId);
    
    // Check if booking exists
    const bookingDoc = await getDoc(bookingRef);
    if (!bookingDoc.exists()) {
      return {
        success: false,
        message: 'Booking not found'
      };
    }
    
    const bookingData = bookingDoc.data();
    
    // Check if participated
    if (!bookingData.participated) {
      return {
        success: false,
        message: 'This booking has not been marked as participated'
      };
    }
    
    // Update the booking to remove participation
    await updateDoc(bookingRef, {
      participated: false,
      participatedAt: null,
      participatedBy: null,
      participationUndoneAt: serverTimestamp(),
      participationUndoneBy: undoneBy,
      updatedAt: serverTimestamp()
    });
    
    console.log(`✅ Participation undone for booking ${bookingId} by super admin ${undoneBy}`);
    
    return {
      success: true,
      message: 'Participation successfully undone'
    };
    
  } catch (error) {
    console.error('❌ Error undoing participation:', error);
    return {
      success: false,
      message: 'Failed to undo participation: ' + error.message
    };
  }
};

/**
 * Get collection name based on booking type
 */
const getCollectionName = (bookingType) => {
  switch (bookingType) {
    case 'havan':
      return 'bookings';
    case 'show':
      return 'showBookings';
    case 'stall':
      return 'stallBookings';
    case 'delegate':
      return 'delegateBookings';
    default:
      return 'bookings';
  }
};

/**
 * Check if user can undo participation (Super Admin only)
 * @param {Object} user - Current user object
 * @returns {boolean}
 */
export const canUndoParticipation = (user) => {
  if (!user) return false;
  
  // Only allow super admin to undo participation
  return (
    user.role === 'super_admin' ||
    user.role === 'superadmin' ||
    user.isSuperAdmin === true ||
    user.customClaims?.role === 'super_admin'
  );
};

export default {
  markAsParticipated,
  undoParticipation,
  canUndoParticipation
};

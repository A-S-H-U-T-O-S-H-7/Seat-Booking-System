import { db } from '@/lib/firebase';
import { 
  doc, 
  updateDoc, 
  serverTimestamp, 
  getDoc,
  collection,
  setDoc,
  getDocs,
  query,
  writeBatch 
} from 'firebase/firestore';

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

/**
 * Get seats/units array from booking based on booking type
 */
const getSeatsArray = (bookingData, bookingType) => {
  if (!bookingData) return [];
  
  try {
    switch (bookingType) {
      case 'havan':
        return bookingData?.seats || bookingData?.selectedSeats || [];
      case 'show':
        return bookingData?.showDetails?.selectedSeats || [];
      case 'stall':
        return bookingData?.stallIds || []; // Stalls use stallIds array
      case 'delegate':
        return []; // Delegates don't have multiple units for attendance
      default:
        return bookingData?.seats || [];
    }
  } catch (error) {
    console.error('Error getting seats array for booking type', bookingType, ':', error);
    return [];
  }
};

/**
 * Initialize seat/unit subcollection from booking's array
 * @param {string} bookingId - The booking ID
 * @param {string} bookingType - Type of booking
 * @param {Array} unitsArray - Array of seat/stall IDs from booking
 * @returns {Promise<{success: boolean, message: string}>}
 */
export const initializeSeatSubcollection = async (bookingId, bookingType, unitsArray) => {
  try {
    if (!unitsArray || unitsArray.length === 0) {
      return {
        success: false,
        message: 'No units found for this booking'
      };
    }

    const collectionName = getCollectionName(bookingType);
    const batch = writeBatch(db);

    // Create seat/unit documents in subcollection
    unitsArray.forEach((unitId) => {
      const unitRef = doc(db, collectionName, bookingId, 'seats', unitId);
      batch.set(unitRef, {
        seatId: unitId, // Keep seatId field name for consistency
        unitId: unitId, // Also store as unitId for clarity
        status: 'pending', // pending, present, absent
        checkedInAt: null,
        checkedInBy: null,
        notes: '',
        createdAt: serverTimestamp()
      });
    });

    await batch.commit();

    console.log(`✅ Initialized ${unitsArray.length} ${bookingType === 'stall' ? 'stalls' : 'seats'} for booking ${bookingId}`);
    
    return {
      success: true,
      message: `Initialized ${unitsArray.length} ${bookingType === 'stall' ? 'stalls' : 'seats'} for participation tracking`
    };
  } catch (error) {
    console.error('❌ Error initializing seat subcollection:', error);
    return {
      success: false,
      message: 'Failed to initialize tracking: ' + error.message
    };
  }
};

/**
 * Get attendance status for a booking's seats/units
 * @param {string} bookingId - The booking ID
 * @param {string} bookingType - Type of booking
 * @returns {Promise<{success: boolean, data?: Object, message: string}>}
 */
export const getSeatAttendanceStatus = async (bookingId, bookingType) => {
  try {
    const collectionName = getCollectionName(bookingType);
    const seatsRef = collection(db, collectionName, bookingId, 'seats');
    const seatsSnapshot = await getDocs(seatsRef);
    
    if (seatsSnapshot.empty) {
      return {
        success: false,
        message: 'No attendance data found'
      };
    }

    const seats = {};
    const summary = {
      total: 0,
      present: 0,
      absent: 0,
      pending: 0
    };

    seatsSnapshot.forEach((doc) => {
      const seatData = doc.data();
      seats[doc.id] = seatData;
      summary.total++;
      summary[seatData.status]++;
    });

    const unitType = bookingType === 'stall' ? 'stalls' : 'seats';
    
    return {
      success: true,
      data: {
        seats,
        summary,
        attendanceRate: summary.total > 0 ? (summary.present / summary.total * 100).toFixed(1) : 0,
        unitType
      },
      message: `${unitType} attendance status retrieved`
    };
  } catch (error) {
    console.error('❌ Error getting seat attendance status:', error);
    return {
      success: false,
      message: 'Failed to get attendance status: ' + error.message
    };
  }
};

/**
 * Mark individual seat/unit attendance
 * @param {string} bookingId - The booking ID
 * @param {string} bookingType - Type of booking
 * @param {string} unitId - The seat/stall ID
 * @param {string} status - 'present' or 'absent'
 * @param {string} markedBy - User ID who marked attendance
 * @param {string} notes - Optional notes
 * @returns {Promise<{success: boolean, message: string}>}
 */
export const markSeatAttendance = async (bookingId, bookingType, unitId, status, markedBy, notes = '') => {
  try {
    if (!['present', 'absent', 'pending'].includes(status)) {
      return {
        success: false,
        message: 'Invalid status. Must be "present", "absent", or "pending"'
      };
    }

    const collectionName = getCollectionName(bookingType);
    const seatRef = doc(db, collectionName, bookingId, 'seats', unitId);
    
    // Check if unit document exists
    const seatDoc = await getDoc(seatRef);
    if (!seatDoc.exists()) {
      return {
        success: false,
        message: `${bookingType === 'stall' ? 'Stall' : 'Seat'} not found in attendance tracking`
      };
    }

    await updateDoc(seatRef, {
      status: status,
      checkedInAt: serverTimestamp(),
      checkedInBy: markedBy,
      notes: notes,
      updatedAt: serverTimestamp()
    });

    const unitType = bookingType === 'stall' ? 'Stall' : 'Seat';
    console.log(`✅ ${unitType} ${unitId} marked as ${status} for booking ${bookingId} by ${markedBy}`);
    
    return {
      success: true,
      message: `${unitType} ${unitId} marked as ${status}`
    };
  } catch (error) {
    console.error('❌ Error marking attendance:', error);
    return {
      success: false,
      message: 'Failed to mark attendance: ' + error.message
    };
  }
};

/**
 * Mark multiple seats/units attendance in batch
 * @param {string} bookingId - The booking ID
 * @param {string} bookingType - Type of booking
 * @param {Array} unitUpdates - Array of {unitId, status, notes}
 * @param {string} markedBy - User ID who marked attendance
 * @returns {Promise<{success: boolean, message: string}>}
 */
export const markMultipleSeatsAttendance = async (bookingId, bookingType, unitUpdates, markedBy) => {
  try {
    if (!unitUpdates || unitUpdates.length === 0) {
      return {
        success: false,
        message: 'No updates provided'
      };
    }

    const collectionName = getCollectionName(bookingType);
    const batch = writeBatch(db);
    
    unitUpdates.forEach(({ unitId, status, notes = '' }) => {
      if (['present', 'absent', 'pending'].includes(status)) {
        const seatRef = doc(db, collectionName, bookingId, 'seats', unitId);
        batch.update(seatRef, {
          status: status,
          checkedInAt: serverTimestamp(),
          checkedInBy: markedBy,
          notes: notes,
          updatedAt: serverTimestamp()
        });
      }
    });

    await batch.commit();

    const unitType = bookingType === 'stall' ? 'stalls' : 'seats';
    console.log(`✅ Updated ${unitUpdates.length} ${unitType} for booking ${bookingId} by ${markedBy}`);
    
    return {
      success: true,
      message: `Updated attendance for ${unitUpdates.length} ${unitType}`
    };
  } catch (error) {
    console.error('❌ Error marking multiple units attendance:', error);
    return {
      success: false,
      message: 'Failed to update attendance: ' + error.message
    };
  }
};

/**
 * Auto-initialize seat subcollection if it doesn't exist and booking has seats/units
 * @param {string} bookingId - The booking ID
 * @param {string} bookingType - Type of booking
 * @returns {Promise<{success: boolean, data?: Object, message: string}>}
 */
export const ensureSeatSubcollectionExists = async (bookingId, bookingType) => {
  try {
    // First check if subcollection already exists
    const attendanceStatus = await getSeatAttendanceStatus(bookingId, bookingType);
    if (attendanceStatus.success) {
      return attendanceStatus; // Already exists
    }

    // Get the main booking to extract array
    const collectionName = getCollectionName(bookingType);
    const bookingRef = doc(db, collectionName, bookingId);
    const bookingDoc = await getDoc(bookingRef);
    
    if (!bookingDoc.exists()) {
      return {
        success: false,
        message: 'Booking not found'
      };
    }

    const bookingData = bookingDoc.data();
    const unitsArray = getSeatsArray(bookingData, bookingType);

    if (unitsArray.length === 0) {
      const unitType = bookingType === 'stall' ? 'stalls' : 
                      bookingType === 'delegate' ? 'delegates' : 'seats';
      return {
        success: false,
        message: `This ${bookingType} booking does not have ${unitType} for attendance tracking`
      };
    }

    // Initialize the subcollection
    const initResult = await initializeSeatSubcollection(bookingId, bookingType, unitsArray);
    if (!initResult.success) {
      return initResult;
    }

    // Return the attendance status
    return await getSeatAttendanceStatus(bookingId, bookingType);
  } catch (error) {
    console.error('❌ Error ensuring seat subcollection exists:', error);
    return {
      success: false,
      message: 'Failed to initialize tracking: ' + error.message
    };
  }
};

export default {
  markAsParticipated,
  undoParticipation,
  canUndoParticipation,
  // New seat-level functions
  initializeSeatSubcollection,
  getSeatAttendanceStatus,
  markSeatAttendance,
  markMultipleSeatsAttendance,
  ensureSeatSubcollectionExists
};

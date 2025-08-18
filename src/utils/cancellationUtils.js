import { db } from '@/lib/firebase';
import { doc, updateDoc, getDoc, serverTimestamp, collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { formatDateKey } from './dateUtils';
import adminLogger from '@/lib/adminLogger';
import { toast } from 'react-hot-toast';

// Cancellation status types
export const CANCELLATION_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved', 
  REJECTED: 'rejected',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded'
};

// Booking types
export const BOOKING_TYPES = {
  HAVAN: 'havan',
  STALL: 'stall', 
  SHOW: 'show'
};

// Collections mapping
export const COLLECTIONS = {
  [BOOKING_TYPES.HAVAN]: 'bookings',
  [BOOKING_TYPES.STALL]: 'stallBookings',
  [BOOKING_TYPES.SHOW]: 'showBookings'
};

// Availability collections mapping
export const AVAILABILITY_COLLECTIONS = {
  [BOOKING_TYPES.HAVAN]: 'seatAvailability',
  [BOOKING_TYPES.STALL]: 'stallAvailability', 
  [BOOKING_TYPES.SHOW]: 'showSeatAvailability'
};

/**
 * Create a cancellation record in the centralized cancellations collection
 */
export const createCancellationRecord = async (bookingData, reason, cancelledBy, refundAmount = 0) => {
  try {
    const cancellationData = {
      bookingId: bookingData.id,
      bookingType: getBookingType(bookingData),
      status: CANCELLATION_STATUS.CANCELLED,
      refundStatus: refundAmount > 0 ? CANCELLATION_STATUS.REFUNDED : CANCELLATION_STATUS.PENDING,
      
      // Booking details
      originalAmount: getBookingAmount(bookingData),
      refundAmount,
      cancellationReason: reason,
      
      // User details
      userDetails: getUserDetails(bookingData),
      
      // Event details
      eventDetails: getEventDetails(bookingData),
      
      // Booking items (seats/stalls)
      bookingItems: getBookingItems(bookingData),
      
      // Cancellation metadata
      cancelledBy: {
        type: cancelledBy.isAdmin ? 'admin' : 'user',
        uid: cancelledBy.uid || null,
        name: cancelledBy.name || cancelledBy.email || 'Unknown',
        email: cancelledBy.email || null
      },
      cancelledAt: serverTimestamp(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    const cancellationRef = await addDoc(collection(db, 'cancellations'), cancellationData);
    
    return {
      success: true,
      cancellationId: cancellationRef.id,
      data: cancellationData
    };
  } catch (error) {
    console.error('Error creating cancellation record:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Cancel a booking and handle all related updates
 */
export const cancelBooking = async (bookingData, reason, cancelledBy, releaseSeats = true) => {
  try {
    const bookingType = getBookingType(bookingData);
    
    if (!COLLECTIONS[bookingType]) {
      throw new Error(`Unknown booking type: ${bookingType}`);
    }

    // Update booking status
    const bookingRef = doc(db, COLLECTIONS[bookingType], bookingData.id);
    const updates = {
      status: 'cancelled',
      cancellationReason: reason,
      cancellationDate: serverTimestamp(),
      updatedAt: serverTimestamp(),
      cancelledBy: {
        type: cancelledBy.isAdmin ? 'admin' : 'user',
        uid: cancelledBy.uid,
        name: cancelledBy.name || cancelledBy.email
      }
    };

    await updateDoc(bookingRef, updates);

    // Create cancellation record
    const cancellationResult = await createCancellationRecord(bookingData, reason, cancelledBy);
    
    if (!cancellationResult.success) {
      console.error('Failed to create cancellation record:', cancellationResult.error);
    }

    // Release seats/stalls if requested
    if (releaseSeats) {
      const releaseResult = await releaseBookingItems(bookingData, bookingType);
      if (!releaseResult.success) {
        console.error('Failed to release booking items:', releaseResult.error);
        // Don't fail the whole cancellation if release fails
      }
    }

    // Log the activity
    if (cancelledBy.isAdmin) {
      await adminLogger.logBookingActivity(
        cancelledBy,
        'cancel',
        bookingData.id,
        `Admin cancelled ${bookingType} booking${reason ? `: ${reason}` : ''}`
      );
    }

    return {
      success: true,
      message: `${bookingType} booking cancelled successfully`,
      cancellationId: cancellationResult.cancellationId
    };
  } catch (error) {
    console.error('Error cancelling booking:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Release seats or stalls back to availability
 */
export const releaseBookingItems = async (bookingData, bookingType) => {
  try {
    const availabilityCollection = AVAILABILITY_COLLECTIONS[bookingType];
    
    if (!availabilityCollection) {
      throw new Error(`No availability collection for booking type: ${bookingType}`);
    }

    switch (bookingType) {
      case BOOKING_TYPES.HAVAN:
        return await releaseHavanSeats(bookingData);
      case BOOKING_TYPES.STALL:
        return await releaseStalls(bookingData);
      case BOOKING_TYPES.SHOW:
        return await releaseShowSeats(bookingData);
      default:
        throw new Error(`Unknown booking type: ${bookingType}`);
    }
  } catch (error) {
    console.error('Error releasing booking items:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Release Havan seats
 */
const releaseHavanSeats = async (bookingData) => {
  try {
    const seats = bookingData.eventDetails?.seats || bookingData.seats || bookingData.selectedSeats || bookingData.seatNumbers || [];
    
    if (seats.length === 0) {
      return { success: true, message: 'No seats to release' };
    }

    // Get event date and shift for availability document
    const eventDate = bookingData.eventDetails?.date || bookingData.eventDate;
    const eventShift = bookingData.eventDetails?.shift || bookingData.shift;
    
    if (!eventDate || !eventShift) {
      throw new Error('No event date or shift found for havan booking');
    }

    // Handle different date formats properly
    let dateFormatted;
    
    if (eventDate && typeof eventDate === 'object' && eventDate.toDate) {
      // Firestore Timestamp
      dateFormatted = formatDateKey(eventDate.toDate());
    } else if (eventDate instanceof Date) {
      // JavaScript Date object
      dateFormatted = formatDateKey(eventDate);
    } else if (typeof eventDate === 'string') {
      // String date
      const parsedDate = new Date(eventDate);
      if (isNaN(parsedDate.getTime())) {
        throw new Error(`Invalid date string: ${eventDate}`);
      }
      dateFormatted = formatDateKey(parsedDate);
    } else if (typeof eventDate === 'number') {
      // Unix timestamp
      dateFormatted = formatDateKey(new Date(eventDate));
    } else {
      throw new Error(`Unknown date format: ${typeof eventDate}`);
    }
    
    const docKey = `${dateFormatted}_${eventShift}`;
    const availabilityRef = doc(db, 'seatAvailability', docKey);
    const availabilityDoc = await getDoc(availabilityRef);

    if (availabilityDoc.exists()) {
      const currentSeats = availabilityDoc.data().seats || {};
      const updatedSeats = { ...currentSeats };

      // Remove the seats from availability (make them available again)
      let releasedCount = 0;
      seats.forEach(seatId => {
        if (updatedSeats[seatId]) {
          delete updatedSeats[seatId];
          releasedCount++;
        }
      });

      await updateDoc(availabilityRef, {
        seats: updatedSeats,
        lastUpdated: serverTimestamp(),
        lastOperation: 'seat_release_from_cancellation'
      });

      return {
        success: true,
        message: `Released ${releasedCount} havan seats`,
        releasedItems: seats,
        releasedCount,
        docKey
      };
    }

    return { success: true, message: 'No availability document found', docKey };
  } catch (error) {
    console.error('Error releasing havan seats:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Release stalls
 */
const releaseStalls = async (bookingData) => {
  try {
    const stallIds = bookingData.stallIds || [bookingData.stallId].filter(Boolean);
    if (stallIds.length === 0) {
      return { success: true, message: 'No stalls to release' };
    }

    // Update stall availability in the stallAvailability collection
    const availabilityRef = doc(db, 'stallAvailability', 'current');
    const availabilityDoc = await getDoc(availabilityRef);
    
    if (availabilityDoc.exists()) {
      const currentAvailability = availabilityDoc.data().stalls || {};
      const updatedAvailability = { ...currentAvailability };
      
      // Remove stalls from availability to make them available again
      stallIds.forEach(stallId => {
        if (updatedAvailability[stallId] && updatedAvailability[stallId].bookingId === bookingData.bookingId) {
          delete updatedAvailability[stallId];
        }
      });
      
      await updateDoc(availabilityRef, {
        stalls: updatedAvailability,
        lastUpdated: serverTimestamp()
      });
      
      return {
        success: true,
        message: `Released ${stallIds.length} stalls`,
        releasedItems: stallIds
      };
    }
    
    return { success: true, message: 'No stall availability document found' };
  } catch (error) {
    console.error('Error releasing stalls:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Release show seats
 */
const releaseShowSeats = async (bookingData) => {
  try {
    const seats = bookingData.showDetails?.selectedSeats || [];
    if (seats.length === 0) {
      console.log('No show seats to release for booking:', bookingData.id);
      return { success: true, message: 'No show seats to release' };
    }

    // Get show date - try multiple possible date fields
    const showDate = bookingData.showDetails?.date || 
                    bookingData.eventDate || 
                    bookingData.showDetails?.eventDate;
    
    if (!showDate) {
      console.error('No show date found in booking data:', bookingData);
      throw new Error('No show date found for show booking');
    }

    // Ensure we format the date properly
    let dateKey;
    try {
      const dateObj = new Date(showDate);
      if (isNaN(dateObj.getTime())) {
        throw new Error('Invalid show date format');
      }
      dateKey = formatDateKey(dateObj);
    } catch (dateError) {
      console.error('Error formatting show date:', showDate, dateError);
      throw new Error('Invalid show date format');
    }

    console.log(`Releasing ${seats.length} show seats for date: ${dateKey}`);
    
    const availabilityRef = doc(db, 'showSeatAvailability', dateKey);
    const availabilityDoc = await getDoc(availabilityRef);

    if (availabilityDoc.exists()) {
      const currentSeats = availabilityDoc.data().seats || {};
      const updatedSeats = { ...currentSeats };
      let releasedCount = 0;

      seats.forEach(seatId => {
        const seatKey = String(seatId); // Ensure string format
        
        if (updatedSeats[seatKey]) {
          // Only release if this booking owns the seat
          if (updatedSeats[seatKey].bookingId === bookingData.id || 
              updatedSeats[seatKey].bookingId === bookingData.bookingId) {
            
            // Clear booking data and mark as released
            updatedSeats[seatKey] = {
              ...updatedSeats[seatKey],
              booked: false,
              blocked: false,
              bookingId: null,
              userId: null,
              userEmail: null,
              userName: null,
              userPhone: null,
              releasedAt: serverTimestamp(),
              releasedFrom: 'cancellation',
              originalBookingId: bookingData.id || bookingData.bookingId
            };
            releasedCount++;
            console.log(`Released seat: ${seatKey}`);
          } else {
            console.warn(`Seat ${seatKey} not owned by booking ${bookingData.id}, skipping release`);
          }
        } else {
          console.warn(`Seat ${seatKey} not found in availability data`);
          // Create the seat entry as available
          updatedSeats[seatKey] = {
            booked: false,
            blocked: false,
            bookingId: null,
            userId: null,
            releasedAt: serverTimestamp(),
            releasedFrom: 'cancellation'
          };
          releasedCount++;
        }
      });

      await updateDoc(availabilityRef, {
        seats: updatedSeats,
        lastUpdated: serverTimestamp(),
        lastOperation: 'seat_release'
      });

      console.log(`Successfully released ${releasedCount} show seats`);
      
      return {
        success: true,
        message: `Released ${releasedCount} show seats for ${dateKey}`,
        releasedItems: seats,
        releasedCount,
        dateKey
      };
    } else {
      console.log(`No availability document found for date: ${dateKey}`);
      return { 
        success: true, 
        message: `No show availability document found for date: ${dateKey}`,
        releasedItems: seats
      };
    }
  } catch (error) {
    console.error('Error releasing show seats:', error);
    return { 
      success: false, 
      error: error.message,
      details: `Failed to release show seats: ${error.message}`
    };
  }
};

/**
 * Update refund status for a cancellation
 */
export const updateRefundStatus = async (cancellationId, refundData, updatedBy) => {
  try {
    const cancellationRef = doc(db, 'cancellations', cancellationId);
    const updates = {
      refundStatus: refundData.status,
      refundAmount: refundData.amount,
      refundMethod: refundData.method,
      refundReference: refundData.reference,
      refundNotes: refundData.notes,
      refundProcessedBy: {
        uid: updatedBy.uid,
        name: updatedBy.name,
        email: updatedBy.email
      },
      refundProcessedAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    await updateDoc(cancellationRef, updates);

    // Log the activity
    if (updatedBy.isAdmin) {
      await adminLogger.logActivity(
        updatedBy,
        'refund',
        `Updated refund status to ${refundData.status} for cancellation ${cancellationId}`
      );
    }

    return { success: true, message: 'Refund status updated successfully' };
  } catch (error) {
    console.error('Error updating refund status:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get all cancellations with optional filtering
 */
export const getCancellations = async (filters = {}) => {
  try {
    let cancellationsQuery = collection(db, 'cancellations');
    const queryConstraints = [];

    if (filters.bookingType) {
      queryConstraints.push(where('bookingType', '==', filters.bookingType));
    }

    if (filters.status) {
      queryConstraints.push(where('status', '==', filters.status));
    }

    if (filters.refundStatus) {
      queryConstraints.push(where('refundStatus', '==', filters.refundStatus));
    }

    if (queryConstraints.length > 0) {
      cancellationsQuery = query(cancellationsQuery, ...queryConstraints);
    }

    const snapshot = await getDocs(cancellationsQuery);
    const cancellations = [];

    snapshot.forEach(doc => {
      cancellations.push({
        id: doc.id,
        ...doc.data(),
        cancelledAt: doc.data().cancelledAt?.toDate(),
        refundProcessedAt: doc.data().refundProcessedAt?.toDate(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate()
      });
    });

    return {
      success: true,
      data: cancellations
    };
  } catch (error) {
    console.error('Error fetching cancellations:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Helper functions
const getBookingType = (bookingData) => {
  // Determine booking type based on data structure
  if (bookingData.showDetails) return BOOKING_TYPES.SHOW;
  if (bookingData.stallIds || bookingData.stallId) return BOOKING_TYPES.STALL;
  return BOOKING_TYPES.HAVAN;
};

const getBookingAmount = (bookingData) => {
  return bookingData.totalAmount || 
         bookingData.showDetails?.totalPrice || 
         bookingData.payment?.amount || 
         0;
};

const getUserDetails = (bookingData) => {
  return {
    uid: bookingData.userId || bookingData.userUid || null,
    name: bookingData.customerDetails?.name || bookingData.userDetails?.name || bookingData.vendorDetails?.name || 'Unknown User',
    email: bookingData.customerDetails?.email || bookingData.userDetails?.email || bookingData.vendorDetails?.email || bookingData.userEmail || 'No Email',
    phone: bookingData.customerDetails?.phone || bookingData.userDetails?.phone || bookingData.vendorDetails?.phone || null
  };
};

const getEventDetails = (bookingData) => {
  const bookingType = getBookingType(bookingData);
  
  switch (bookingType) {
    case BOOKING_TYPES.SHOW:
      return {
        date: bookingData.showDetails?.date || null,
        time: bookingData.showDetails?.time || null,
        shift: bookingData.showDetails?.shift || null
      };
    case BOOKING_TYPES.HAVAN:
      return {
        date: bookingData.eventDetails?.date || bookingData.eventDate || null,
        shift: bookingData.eventDetails?.shift || bookingData.shift || null
      };
    case BOOKING_TYPES.STALL:
      return {
        startDate: bookingData.eventDetails?.startDate || null,
        endDate: bookingData.eventDetails?.endDate || null
      };
    default:
      return {
        date: null,
        shift: null
      };
  }
};

const getBookingItems = (bookingData) => {
  const bookingType = getBookingType(bookingData);
  
  switch (bookingType) {
    case BOOKING_TYPES.SHOW:
      return {
        type: 'seats',
        items: bookingData.showDetails?.selectedSeats || [],
        count: bookingData.showDetails?.selectedSeats?.length || 0
      };
    case BOOKING_TYPES.HAVAN:
      return {
        type: 'seats',
        items: bookingData.seats || bookingData.selectedSeats || [],
        count: bookingData.seatCount || (bookingData.seats || bookingData.selectedSeats || []).length
      };
    case BOOKING_TYPES.STALL:
      return {
        type: 'stalls',
        items: bookingData.stallIds || [bookingData.stallId].filter(Boolean),
        count: (bookingData.stallIds || [bookingData.stallId].filter(Boolean)).length
      };
    default:
      return { type: 'unknown', items: [], count: 0 };
  }
};

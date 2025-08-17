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
        uid: cancelledBy.uid,
        name: cancelledBy.name || cancelledBy.email,
        email: cancelledBy.email
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
    const collection_name = COLLECTIONS[bookingType];
    
    if (!collection_name) {
      throw new Error(`Unknown booking type: ${bookingType}`);
    }

    // Update booking status
    const bookingRef = doc(db, collection_name, bookingData.id);
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
    const seats = bookingData.eventDetails?.seats || bookingData.seats || bookingData.selectedSeats || [];
    if (seats.length === 0) {
      return { success: true, message: 'No seats to release' };
    }

    // Get event date and shift for availability document
    const eventDate = bookingData.eventDetails?.date || bookingData.eventDate;
    const eventShift = bookingData.eventDetails?.shift || bookingData.shift;
    
    if (!eventDate || !eventShift) {
      throw new Error('No event date or shift found for havan booking');
    }

    // Use the correct format with shift
    const dateKey = formatDateKey(new Date(eventDate));
    const docKey = `${dateKey}_${eventShift}`;
    const availabilityRef = doc(db, 'seatAvailability', docKey);
    const availabilityDoc = await getDoc(availabilityRef);

    if (availabilityDoc.exists()) {
      const currentSeats = availabilityDoc.data().seats || {};
      const updatedSeats = { ...currentSeats };

      // Remove the seats from availability (make them available again)
      seats.forEach(seatId => {
        // Delete the seat record to make it available
        delete updatedSeats[seatId];
      });

      await updateDoc(availabilityRef, {
        seats: updatedSeats,
        lastUpdated: serverTimestamp()
      });

      return {
        success: true,
        message: `Released ${seats.length} havan seats`,
        releasedItems: seats
      };
    }

    return { success: true, message: 'No availability document found' };
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

    // Update each stall's availability
    const updates = stallIds.map(async (stallId) => {
      try {
        const stallRef = doc(db, 'stalls', stallId);
        await updateDoc(stallRef, {
          isBooked: false,
          bookingId: null,
          userId: null,
          releasedAt: serverTimestamp(),
          lastUpdated: serverTimestamp()
        });
        return stallId;
      } catch (error) {
        console.error(`Error releasing stall ${stallId}:`, error);
        return null;
      }
    });

    const releasedStalls = await Promise.all(updates);
    const successfulReleases = releasedStalls.filter(Boolean);

    return {
      success: true,
      message: `Released ${successfulReleases.length} stalls`,
      releasedItems: successfulReleases
    };
  } catch (error) {
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
      return { success: true, message: 'No show seats to release' };
    }

    // Get show date
    const showDate = bookingData.showDetails?.date;
    if (!showDate) {
      throw new Error('No show date found');
    }

    const dateKey = formatDateKey(new Date(showDate));
    const availabilityRef = doc(db, 'showSeatAvailability', dateKey);
    const availabilityDoc = await getDoc(availabilityRef);

    if (availabilityDoc.exists()) {
      const currentSeats = availabilityDoc.data().seats || {};
      const updatedSeats = { ...currentSeats };

      seats.forEach(seatId => {
        if (updatedSeats[seatId]) {
          updatedSeats[seatId] = {
            ...updatedSeats[seatId],
            booked: false,
            bookingId: null,
            userId: null,
            releasedAt: serverTimestamp()
          };
        }
      });

      await updateDoc(availabilityRef, {
        seats: updatedSeats,
        lastUpdated: serverTimestamp()
      });

      return {
        success: true,
        message: `Released ${seats.length} show seats`,
        releasedItems: seats
      };
    }

    return { success: true, message: 'No show availability document found' };
  } catch (error) {
    return { success: false, error: error.message };
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
    uid: bookingData.userId || bookingData.userUid,
    name: bookingData.customerDetails?.name || bookingData.userDetails?.name || bookingData.vendorDetails?.name,
    email: bookingData.customerDetails?.email || bookingData.userDetails?.email || bookingData.vendorDetails?.email || bookingData.userEmail,
    phone: bookingData.customerDetails?.phone || bookingData.userDetails?.phone || bookingData.vendorDetails?.phone
  };
};

const getEventDetails = (bookingData) => {
  const bookingType = getBookingType(bookingData);
  
  switch (bookingType) {
    case BOOKING_TYPES.SHOW:
      return {
        date: bookingData.showDetails?.date,
        time: bookingData.showDetails?.time,
        shift: bookingData.showDetails?.shift
      };
    case BOOKING_TYPES.HAVAN:
      return {
        date: bookingData.eventDetails?.date || bookingData.eventDate,
        shift: bookingData.eventDetails?.shift || bookingData.shift
      };
    case BOOKING_TYPES.STALL:
      return {
        startDate: bookingData.eventDetails?.startDate,
        endDate: bookingData.eventDetails?.endDate
      };
    default:
      return {};
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

import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, updateDoc, deleteDoc, writeBatch, serverTimestamp } from 'firebase/firestore';

/**
 * Clean up expired blocked seats and failed/cancelled bookings
 */
export async function cleanupExpiredSeats() {
  console.log('🧹 Starting seat cleanup service...');
  
  try {
    const batch = writeBatch(db);
    let cleanupCount = 0;
    
    // Get all seat availability documents
    const availabilityQuery = query(collection(db, 'seatAvailability'));
    const availabilitySnap = await getDocs(availabilityQuery);
    
    for (const availabilityDoc of availabilitySnap.docs) {
      const availabilityData = availabilityDoc.data();
      const seats = availabilityData.seats || {};
      let hasExpiredSeats = false;
      const updatedSeats = { ...seats };
      
      for (const [seatId, seatData] of Object.entries(seats)) {
        // Check if seat is blocked and has expired
        if (seatData.blocked && seatData.expiryTime) {
          const expiryTime = seatData.expiryTime instanceof Date 
            ? seatData.expiryTime 
            : new Date(seatData.expiryTime);
          
          if (expiryTime < new Date()) {
            console.log(`🗑️ Releasing expired blocked seat: ${seatId}`);
            delete updatedSeats[seatId];
            hasExpiredSeats = true;
            cleanupCount++;
          }
        }
      }
      
      if (hasExpiredSeats) {
        batch.update(availabilityDoc.ref, {
          seats: updatedSeats,
          updatedAt: serverTimestamp()
        });
      }
    }
    
    // Also clean up expired pending bookings
    const expiredBookingsQuery = query(
      collection(db, 'bookings'),
      where('status', '==', 'pending_payment')
    );
    const expiredBookingsSnap = await getDocs(expiredBookingsQuery);
    
    for (const bookingDoc of expiredBookingsSnap.docs) {
      const booking = bookingDoc.data();
      
      if (booking.expiryTime) {
        const expiryTime = booking.expiryTime instanceof Date 
          ? booking.expiryTime 
          : new Date(booking.expiryTime);
        
        if (expiryTime < new Date()) {
          console.log(`🗑️ Cancelling expired booking: ${booking.id}`);
          batch.update(bookingDoc.ref, {
            status: 'cancelled',
            cancellationReason: 'Payment expired - auto-cancelled',
            cancelledAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          });
          cleanupCount++;
        }
      }
    }
    
    // Commit all changes
    if (cleanupCount > 0) {
      await batch.commit();
      console.log(`✅ Cleanup completed: ${cleanupCount} items processed`);
    } else {
      console.log('✅ No expired items found');
    }
    
    return { success: true, cleanupCount };
    
  } catch (error) {
    console.error('❌ Seat cleanup failed:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Clean up specific booking's blocked seats (for immediate release on cancel)
 */
export async function releaseBookingSeats(bookingId, seats, eventDate, shift) {
  console.log(`🧹 Releasing seats for booking: ${bookingId}`);
  
  try {
    const dateKey = eventDate.toISOString().split('T')[0];
    const availabilityRef = doc(db, 'seatAvailability', `${dateKey}_${shift}`);
    
    // Get current availability
    const availabilityDoc = await getDoc(availabilityRef);
    if (!availabilityDoc.exists()) {
      console.log('⚠️ Availability document not found');
      return { success: false, error: 'Availability document not found' };
    }
    
    const currentSeats = availabilityDoc.data().seats || {};
    const updatedSeats = { ...currentSeats };
    let releasedCount = 0;
    
    // Release seats belonging to this booking
    seats.forEach(seatId => {
      if (updatedSeats[seatId] && updatedSeats[seatId].bookingId === bookingId) {
        delete updatedSeats[seatId];
        releasedCount++;
        console.log(`✅ Released seat: ${seatId}`);
      }
    });
    
    // Update availability
    await updateDoc(availabilityRef, {
      seats: updatedSeats,
      updatedAt: serverTimestamp()
    });
    
    console.log(`✅ Released ${releasedCount} seats for booking ${bookingId}`);
    return { success: true, releasedCount };
    
  } catch (error) {
    console.error('❌ Failed to release booking seats:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Cancel pending booking and release seats
 */
export async function cancelPendingBooking(bookingId, reason = 'User cancelled') {
  console.log(`🚫 Cancelling booking: ${bookingId}`);
  
  try {
    const bookingRef = doc(db, 'bookings', bookingId);
    const bookingDoc = await getDoc(bookingRef);
    
    if (!bookingDoc.exists()) {
      return { success: false, error: 'Booking not found' };
    }
    
    const booking = bookingDoc.data();
    
    // Update booking status to cancelled
    await updateDoc(bookingRef, {
      status: 'cancelled',
      cancellationReason: reason,
      cancelledAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    // Release the seats
    const releaseResult = await releaseBookingSeats(
      bookingId, 
      booking.seats, 
      booking.eventDate, 
      booking.shift
    );
    
    console.log(`✅ Booking ${bookingId} cancelled successfully`);
    return { success: true, booking, releaseResult };
    
  } catch (error) {
    console.error('❌ Failed to cancel booking:', error);
    return { success: false, error: error.message };
  }
}

// Auto-cleanup function that can be called periodically
export function startSeatCleanupInterval() {
  console.log('🕐 Starting automatic seat cleanup interval (every 2 minutes)');
  
  // Clean up immediately
  cleanupExpiredSeats();
  
  // Then every 2 minutes
  const interval = setInterval(cleanupExpiredSeats, 2 * 60 * 1000);
  
  return interval;
}

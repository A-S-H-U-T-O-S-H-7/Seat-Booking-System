import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, getDoc, updateDoc, deleteDoc, writeBatch, serverTimestamp } from 'firebase/firestore';

/**
 * Clean up expired blocked seats and failed/cancelled bookings
 */
export async function cleanupExpiredSeats() {
  console.log('🧹 Starting seat cleanup service...');
  
  try {
    const batch = writeBatch(db);
    let cleanupCount = 0;
    let totalSeatsScanned = 0;
    let blockedSeatsFound = 0;
    let expiredSeatsFound = 0;
    
    // Get all seat availability documents
    const availabilityQuery = query(collection(db, 'seatAvailability'));
    const availabilitySnap = await getDocs(availabilityQuery);
    
    console.log(`📊 Found ${availabilitySnap.docs.length} seat availability documents`);
    
    for (const availabilityDoc of availabilitySnap.docs) {
      const availabilityData = availabilityDoc.data();
      const seats = availabilityData.seats || {};
      let hasExpiredSeats = false;
      const updatedSeats = { ...seats };
      
      console.log(`🔍 Checking document: ${availabilityDoc.id}`);
      console.log(`📋 Found ${Object.keys(seats).length} seats in document`);
      
      for (const [seatId, seatData] of Object.entries(seats)) {
        totalSeatsScanned++;
        
        // Enhanced debugging
        console.log(`🪑 Seat ${seatId}:`, {
          blocked: seatData.blocked,
          booked: seatData.booked,
          hasExpiryTime: !!seatData.expiryTime,
          expiryTime: seatData.expiryTime,
          expiryTimeType: typeof seatData.expiryTime,
          bookingId: seatData.bookingId
        });
        
        // Check if seat is blocked
        if (seatData.blocked) {
          blockedSeatsFound++;
          console.log(`🔒 Found blocked seat: ${seatId}`);
          
          if (seatData.expiryTime) {
            let expiryTime;
            
            try {
              // Handle different possible formats
              if (seatData.expiryTime instanceof Date) {
                expiryTime = seatData.expiryTime;
              } else if (seatData.expiryTime?.toDate) {
                // Firestore Timestamp
                expiryTime = seatData.expiryTime.toDate();
              } else if (seatData.expiryTime?.seconds) {
                // Firestore Timestamp object
                expiryTime = new Date(seatData.expiryTime.seconds * 1000);
              } else if (typeof seatData.expiryTime === 'string' || typeof seatData.expiryTime === 'number') {
                expiryTime = new Date(seatData.expiryTime);
              } else {
                throw new Error(`Unknown expiryTime format: ${typeof seatData.expiryTime}`);
              }
              
              // Validate the parsed date
              if (isNaN(expiryTime.getTime())) {
                throw new Error(`Invalid date value: ${seatData.expiryTime}`);
              }
              
              const now = new Date();
              console.log(`⏰ Expiry check for ${seatId}:`, {
                expiryTime: expiryTime.toISOString(),
                currentTime: now.toISOString(),
                isExpired: expiryTime < now,
                rawExpiryTime: seatData.expiryTime
              });
              
              if (expiryTime < now) {
                expiredSeatsFound++;
                console.log(`🗑️ Releasing expired blocked seat: ${seatId}`);
                delete updatedSeats[seatId];
                hasExpiredSeats = true;
                cleanupCount++;
              } else {
                const timeLeft = Math.round((expiryTime - now) / 1000 / 60);
                console.log(`⏳ Seat ${seatId} expires in ${timeLeft} minutes`);
              }
              
            } catch (dateError) {
              console.error(`❌ Error parsing expiryTime for seat ${seatId}:`, {
                error: dateError.message,
                expiryTime: seatData.expiryTime,
                type: typeof seatData.expiryTime
              });
              // Skip this seat's expiry check but continue with others
            }
          } else {
            console.log(`⚠️ Blocked seat ${seatId} has no expiry time`);
            // Clean up blocked seats without expiry time (they shouldn't exist)
            console.log(`🧹 Removing blocked seat without expiry: ${seatId}`);
            delete updatedSeats[seatId];
            hasExpiredSeats = true;
            cleanupCount++;
          }
        }
        
        // Also check for seats that are neither blocked nor booked (orphaned)
        if (!seatData.blocked && !seatData.booked && seatData.bookingId) {
          console.log(`🔍 Found orphaned seat data: ${seatId} - removing`);
          delete updatedSeats[seatId];
          hasExpiredSeats = true;
          cleanupCount++;
        }
      }
      
      if (hasExpiredSeats) {
        batch.update(availabilityDoc.ref, {
          seats: updatedSeats,
          updatedAt: serverTimestamp()
        });
      }
    }
    
    console.log(`📈 Cleanup summary:`, {
      documentsScanned: availabilitySnap.docs.length,
      totalSeatsScanned,
      blockedSeatsFound,
      expiredSeatsFound,
      cleanupCount
    });
    
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

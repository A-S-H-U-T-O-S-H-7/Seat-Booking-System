import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, getDoc, updateDoc, deleteDoc, writeBatch, serverTimestamp } from 'firebase/firestore';

/**
 * Clean up expired blocked show seats and failed/cancelled bookings
 */
export async function cleanupExpiredShowSeats() {
  try {
    const batch = writeBatch(db);
    let cleanupCount = 0;
    let totalSeatsScanned = 0;
    let blockedSeatsFound = 0;
    let expiredSeatsFound = 0;
    
    // Get all show seat availability documents
    const availabilityQuery = query(collection(db, 'showSeatAvailability'));
    const availabilitySnap = await getDocs(availabilityQuery);
    
    for (const availabilityDoc of availabilitySnap.docs) {
      const availabilityData = availabilityDoc.data();
      const seats = availabilityData.seats || {};
      let hasExpiredSeats = false;
      const updatedSeats = { ...seats };
      
      for (const [seatId, seatData] of Object.entries(seats)) {
        totalSeatsScanned++;
        
        // ONLY clean up seats that are BLOCKED, EXPIRED, and NOT admin-blocked
        // NEVER touch seats that are booked (payment successful)
        // NEVER touch admin-blocked seats (they don't have expiryTime and have blockedReason)
        if (seatData.blocked && !seatData.booked) {
          blockedSeatsFound++;
          console.log(`🔒 Found blocked show seat: ${seatId}`);
          
          // Check if this is an admin-blocked seat - NEVER clean these up!
          if (seatData.blockedReason === 'Blocked by admin') {
            console.log(`🚫 Show seat ${seatId} is admin-blocked - NEVER cleanup`);
            continue; // Skip this seat entirely
          }
          
          // Check if we should verify booking status before cleanup
          if (seatData.bookingId) {
            try {
              console.log(`🔎 Checking booking status for show seat ${seatId}, booking: ${seatData.bookingId}`);
              const bookingRef = doc(db, 'showBookings', seatData.bookingId);
              const bookingDoc = await getDoc(bookingRef);
              
              if (bookingDoc.exists()) {
                const booking = bookingDoc.data();
                console.log(`📋 Show booking ${seatData.bookingId} status: ${booking.status}`);
                
                // If booking is confirmed, this seat should be booked, not blocked!
                if (booking.status === 'confirmed') {
                  console.log(`⚠️ CRITICAL: Show seat ${seatId} is blocked but booking is confirmed! Fixing...`);
                  updatedSeats[seatId] = {
                    ...updatedSeats[seatId],
                    blocked: false,
                    booked: true,
                    confirmedAt: serverTimestamp()
                  };
                  hasExpiredSeats = true;
                  continue; // Don't delete this seat!
                }
                
                // If booking is still pending, check expiry
                if (booking.status === 'pending_payment' || booking.status === 'pending') {
                  console.log(`🕒 Show booking ${seatData.bookingId} is still pending payment`);
                  // Continue with expiry check below
                } else if (booking.status === 'cancelled') {
                  console.log(`🗑️ Show booking ${seatData.bookingId} is cancelled, releasing seat`);
                  delete updatedSeats[seatId];
                  hasExpiredSeats = true;
                  cleanupCount++;
                  continue;
                }
              } else {
                console.log(`⚠️ Show booking document ${seatData.bookingId} not found`);
              }
            } catch (bookingError) {
              console.error(`❌ Error checking show booking for seat ${seatId}:`, bookingError);
              // Continue with expiry check as fallback
            }
          }
          
          // Only process seats with expiry time (payment-blocked seats)
          if (seatData.expiryTime || seatData.blockedUntil) {
            let expiryTime;
            const rawExpiry = seatData.expiryTime || seatData.blockedUntil;
            
            try {
              // Handle different possible formats
              if (rawExpiry instanceof Date) {
                expiryTime = rawExpiry;
              } else if (rawExpiry?.toDate) {
                // Firestore Timestamp
                expiryTime = rawExpiry.toDate();
              } else if (rawExpiry?.seconds) {
                // Firestore Timestamp object
                expiryTime = new Date(rawExpiry.seconds * 1000);
              } else if (typeof rawExpiry === 'string' || typeof rawExpiry === 'number') {
                expiryTime = new Date(rawExpiry);
              } else {
                throw new Error(`Unknown expiryTime format: ${typeof rawExpiry}`);
              }
              
              // Validate the parsed date
              if (isNaN(expiryTime.getTime())) {
                throw new Error(`Invalid date value: ${rawExpiry}`);
              }
              
              const now = new Date();
              console.log(`⏰ Expiry check for show seat ${seatId}:`, {
                expiryTime: expiryTime.toISOString(),
                currentTime: now.toISOString(),
                isExpired: expiryTime < now,
                rawExpiryTime: rawExpiry
              });
              
              if (expiryTime < now) {
                expiredSeatsFound++;
                console.log(`🗑️ Releasing expired blocked show seat: ${seatId}`);
                delete updatedSeats[seatId];
                hasExpiredSeats = true;
                cleanupCount++;
              } else {
                const timeLeft = Math.round((expiryTime - now) / 1000 / 60);
                console.log(`⏳ Show seat ${seatId} expires in ${timeLeft} minutes`);
              }
              
            } catch (dateError) {
              console.error(`❌ Error parsing expiryTime for show seat ${seatId}:`, {
                error: dateError.message,
                expiryTime: rawExpiry,
                type: typeof rawExpiry
              });
              // Skip this seat's expiry check but continue with others
            }
          } else {
            console.log(`⚠️ Blocked show seat ${seatId} has no expiry time`);
            // For blocked seats without expiry time that are NOT admin-blocked,
            // only clean up if they have no booking ID (orphaned temporary blocks)
            if (!seatData.bookingId && seatData.blockedReason !== 'Blocked by admin') {
              console.log(`🧹 Removing orphaned blocked show seat without expiry or booking: ${seatId}`);
              delete updatedSeats[seatId];
              hasExpiredSeats = true;
              cleanupCount++;
            } else {
              console.log(`⏳ Show seat has booking ID or is admin-blocked, keeping for safety: ${seatId}`);
            }
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
    
    console.log(`📈 Show seat cleanup summary:`, {
      documentsScanned: availabilitySnap.docs.length,
      totalSeatsScanned,
      blockedSeatsFound,
      expiredSeatsFound,
      cleanupCount
    });
    
    // Also clean up expired pending show bookings
    const expiredBookingsQuery = query(
      collection(db, 'showBookings'),
      where('status', 'in', ['pending_payment', 'pending'])
    );
    const expiredBookingsSnap = await getDocs(expiredBookingsQuery);
    
    for (const bookingDoc of expiredBookingsSnap.docs) {
      const booking = bookingDoc.data();
      
      if (booking.expiryTime) {
        let expiryTime;
        
        try {
          // Handle different possible formats
          if (booking.expiryTime instanceof Date) {
            expiryTime = booking.expiryTime;
          } else if (booking.expiryTime?.toDate) {
            expiryTime = booking.expiryTime.toDate();
          } else if (booking.expiryTime?.seconds) {
            expiryTime = new Date(booking.expiryTime.seconds * 1000);
          } else {
            expiryTime = new Date(booking.expiryTime);
          }
          
          if (expiryTime < new Date()) {
            console.log(`🗑️ Cancelling expired show booking: ${booking.id}`);
            batch.update(bookingDoc.ref, {
              status: 'cancelled',
              cancellationReason: 'Payment expired - auto-cancelled',
              cancelledAt: serverTimestamp(),
              updatedAt: serverTimestamp()
            });
            cleanupCount++;
          }
        } catch (error) {
          console.error(`❌ Error processing expiry for show booking ${booking.id}:`, error);
        }
      }
    }
    
    // Commit all changes
    if (cleanupCount > 0) {
      await batch.commit();
      console.log(`✅ Show seat cleanup completed: ${cleanupCount} items processed`);
    } else {
      console.log('✅ No expired show seat items found');
    }
    
    return { success: true, cleanupCount };
    
  } catch (error) {
    console.error('❌ Show seat cleanup failed:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Clean up specific booking's blocked seats (for immediate release on cancel)
 */
export async function releaseShowBookingSeats(bookingId, seatIds, eventDate) {
  console.log(`🧹 Releasing show seats for booking: ${bookingId}`);
  
  try {
    // Format date key for show availability
    const dateKey = eventDate instanceof Date 
      ? eventDate.toISOString().split('T')[0]
      : new Date(eventDate).toISOString().split('T')[0];
    
    const availabilityRef = doc(db, 'showSeatAvailability', dateKey);
    
    // Get current availability
    const availabilityDoc = await getDoc(availabilityRef);
    if (!availabilityDoc.exists()) {
      console.log('⚠️ Show seat availability document not found');
      return { success: false, error: 'Show seat availability document not found' };
    }
    
    const currentSeats = availabilityDoc.data().seats || {};
    const updatedSeats = { ...currentSeats };
    let releasedCount = 0;
    
    // Release seats belonging to this booking
    seatIds.forEach(seatId => {
      if (updatedSeats[seatId] && updatedSeats[seatId].bookingId === bookingId) {
        delete updatedSeats[seatId];
        releasedCount++;
        console.log(`✅ Released show seat: ${seatId}`);
      }
    });
    
    // Update availability
    await updateDoc(availabilityRef, {
      seats: updatedSeats,
      updatedAt: serverTimestamp()
    });
    
    console.log(`✅ Released ${releasedCount} show seats for booking ${bookingId}`);
    return { success: true, releasedCount };
    
  } catch (error) {
    console.error('❌ Failed to release show booking seats:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Cancel pending booking and release seats
 */
export async function cancelPendingShowBooking(bookingId, reason = 'User cancelled') {
  console.log(`🚫 Cancelling show booking: ${bookingId}`);
  
  try {
    const bookingRef = doc(db, 'showBookings', bookingId);
    const bookingDoc = await getDoc(bookingRef);
    
    if (!bookingDoc.exists()) {
      return { success: false, error: 'Show booking not found' };
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
    const seatIds = booking.seats?.map(seat => seat.seatId) || 
                    booking.showDetails?.selectedSeats || 
                    [];
    
    const releaseResult = await releaseShowBookingSeats(
      bookingId,
      seatIds,
      booking.showDetails?.date || booking.eventDate
    );
    
    console.log(`✅ Show booking ${bookingId} cancelled successfully`);
    return { success: true, booking, releaseResult };
    
  } catch (error) {
    console.error('❌ Failed to cancel show booking:', error);
    return { success: false, error: error.message };
  }
}

// Auto-cleanup function that can be called periodically
export function startShowSeatCleanupInterval() {
  console.log('🕐 Starting automatic show seat cleanup interval (every 2 minutes)');
  
  // Clean up immediately
  cleanupExpiredShowSeats();
  
  // Then every 2 minutes
  const interval = setInterval(cleanupExpiredShowSeats, 2 * 60 * 1000);
  
  return interval;
}

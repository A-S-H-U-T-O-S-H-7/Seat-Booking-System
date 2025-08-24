import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, getDoc, updateDoc, deleteDoc, writeBatch, serverTimestamp } from 'firebase/firestore';

/**
 * Clean up expired blocked stalls and failed/cancelled bookings
 */
export async function cleanupExpiredStalls() {
  try {
    const batch = writeBatch(db);
    let cleanupCount = 0;
    let totalStallsScanned = 0;
    let blockedStallsFound = 0;
    let expiredStallsFound = 0;
    
    // Get stall availability document
    const availabilityRef = doc(db, 'stallAvailability', 'current');
    const availabilityDoc = await getDoc(availabilityRef);
    
    if (!availabilityDoc.exists()) {
      console.log('⚠️ Stall availability document not found');
      return { success: false, error: 'Stall availability document not found' };
    }

    const availabilityData = availabilityDoc.data();
    const stalls = availabilityData.stalls || {};
    let hasExpiredStalls = false;
    const updatedStalls = { ...stalls };
    
    for (const [stallId, stallData] of Object.entries(stalls)) {
      totalStallsScanned++;
      
      // ONLY clean up stalls that are BLOCKED, EXPIRED, and NOT admin-blocked
      // NEVER touch stalls that are booked (payment successful)
      // NEVER touch admin-blocked stalls (they don't have expiryTime and have blockedReason)
      if (stallData.blocked && !stallData.booked) {
        blockedStallsFound++;
        console.log(`🔒 Found blocked stall: ${stallId}`);
        
        // Check if this is an admin-blocked stall - NEVER clean these up!
        if (stallData.blockedReason === 'Blocked by admin') {
          console.log(`🚫 Stall ${stallId} is admin-blocked - NEVER cleanup`);
          continue; // Skip this stall entirely
        }
        
        // Check if we should verify booking status before cleanup
        if (stallData.bookingId) {
          try {
            console.log(`🔎 Checking booking status for stall ${stallId}, booking: ${stallData.bookingId}`);
            const bookingRef = doc(db, 'stallBookings', stallData.bookingId);
            const bookingDoc = await getDoc(bookingRef);
            
            if (bookingDoc.exists()) {
              const booking = bookingDoc.data();
              console.log(`📋 Booking ${stallData.bookingId} status: ${booking.status}`);
              
              // If booking is confirmed, this stall should be booked, not blocked!
              if (booking.status === 'confirmed') {
                console.log(`⚠️ CRITICAL: Stall ${stallId} is blocked but booking is confirmed! Fixing...`);
                updatedStalls[stallId] = {
                  ...updatedStalls[stallId],
                  blocked: false,
                  booked: true,
                  confirmedAt: serverTimestamp()
                };
                hasExpiredStalls = true;
                continue; // Don't delete this stall!
              }
              
              // If booking is still pending, check expiry
              if (booking.status === 'pending_payment') {
                console.log(`🕒 Booking ${stallData.bookingId} is still pending payment`);
                // Continue with expiry check below
              } else if (booking.status === 'cancelled') {
                console.log(`🗑️ Booking ${stallData.bookingId} is cancelled, releasing stall`);
                delete updatedStalls[stallId];
                hasExpiredStalls = true;
                cleanupCount++;
                continue;
              }
            } else {
              console.log(`⚠️ Booking document ${stallData.bookingId} not found`);
            }
          } catch (bookingError) {
            console.error(`❌ Error checking booking for stall ${stallId}:`, bookingError);
            // Continue with expiry check as fallback
          }
        }
        
        // Only process stalls with expiry time (payment-blocked stalls)
        if (stallData.expiryTime) {
          let expiryTime;
          
          try {
            // Handle different possible formats
            if (stallData.expiryTime instanceof Date) {
              expiryTime = stallData.expiryTime;
            } else if (stallData.expiryTime?.toDate) {
              // Firestore Timestamp
              expiryTime = stallData.expiryTime.toDate();
            } else if (stallData.expiryTime?.seconds) {
              // Firestore Timestamp object
              expiryTime = new Date(stallData.expiryTime.seconds * 1000);
            } else if (typeof stallData.expiryTime === 'string' || typeof stallData.expiryTime === 'number') {
              expiryTime = new Date(stallData.expiryTime);
            } else {
              throw new Error(`Unknown expiryTime format: ${typeof stallData.expiryTime}`);
            }
            
            // Validate the parsed date
            if (isNaN(expiryTime.getTime())) {
              throw new Error(`Invalid date value: ${stallData.expiryTime}`);
            }
            
            const now = new Date();
            console.log(`⏰ Expiry check for ${stallId}:`, {
              expiryTime: expiryTime.toISOString(),
              currentTime: now.toISOString(),
              isExpired: expiryTime < now,
              rawExpiryTime: stallData.expiryTime
            });
            
            if (expiryTime < now) {
              expiredStallsFound++;
              console.log(`🗑️ Releasing expired blocked stall: ${stallId}`);
              delete updatedStalls[stallId];
              hasExpiredStalls = true;
              cleanupCount++;
            } else {
              const timeLeft = Math.round((expiryTime - now) / 1000 / 60);
              console.log(`⏳ Stall ${stallId} expires in ${timeLeft} minutes`);
            }
            
          } catch (dateError) {
            console.error(`❌ Error parsing expiryTime for stall ${stallId}:`, {
              error: dateError.message,
              expiryTime: stallData.expiryTime,
              type: typeof stallData.expiryTime
            });
            // Skip this stall's expiry check but continue with others
          }
        } else {
          console.log(`⚠️ Blocked stall ${stallId} has no expiry time`);
          // For blocked stalls without expiry time that are NOT admin-blocked,
          // only clean up if they have no booking ID (orphaned temporary blocks)
          if (!stallData.bookingId && stallData.blockedReason !== 'Blocked by admin') {
            console.log(`🧹 Removing orphaned blocked stall without expiry or booking: ${stallId}`);
            delete updatedStalls[stallId];
            hasExpiredStalls = true;
            cleanupCount++;
          } else {
            console.log(`⏳ Stall has booking ID or is admin-blocked, keeping for safety: ${stallId}`);
          }
        }
      }
    }
    
    if (hasExpiredStalls) {
      batch.update(availabilityRef, {
        stalls: updatedStalls,
        updatedAt: serverTimestamp()
      });
    }
    
    console.log(`📈 Stall cleanup summary:`, {
      totalStallsScanned,
      blockedStallsFound,
      expiredStallsFound,
      cleanupCount
    });
    
    // Also clean up expired pending bookings
    const expiredBookingsQuery = query(
      collection(db, 'stallBookings'),
      where('status', '==', 'pending_payment')
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
            console.log(`🗑️ Cancelling expired stall booking: ${booking.id}`);
            batch.update(bookingDoc.ref, {
              status: 'cancelled',
              cancellationReason: 'Payment expired - auto-cancelled',
              cancelledAt: serverTimestamp(),
              updatedAt: serverTimestamp()
            });
            cleanupCount++;
          }
        } catch (error) {
          console.error(`❌ Error processing expiry for booking ${booking.id}:`, error);
        }
      }
    }
    
    // Commit all changes
    if (cleanupCount > 0) {
      await batch.commit();
      console.log(`✅ Stall cleanup completed: ${cleanupCount} items processed`);
    } else {
      console.log('✅ No expired stall items found');
    }
    
    return { success: true, cleanupCount };
    
  } catch (error) {
    console.error('❌ Stall cleanup failed:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Clean up specific booking's blocked stalls (for immediate release on cancel)
 */
export async function releaseBookingStalls(bookingId, stallIds) {
  console.log(`🧹 Releasing stalls for booking: ${bookingId}`);
  
  try {
    const availabilityRef = doc(db, 'stallAvailability', 'current');
    
    // Get current availability
    const availabilityDoc = await getDoc(availabilityRef);
    if (!availabilityDoc.exists()) {
      console.log('⚠️ Stall availability document not found');
      return { success: false, error: 'Stall availability document not found' };
    }
    
    const currentStalls = availabilityDoc.data().stalls || {};
    const updatedStalls = { ...currentStalls };
    let releasedCount = 0;
    
    // Release stalls belonging to this booking
    stallIds.forEach(stallId => {
      if (updatedStalls[stallId] && updatedStalls[stallId].bookingId === bookingId) {
        delete updatedStalls[stallId];
        releasedCount++;
        console.log(`✅ Released stall: ${stallId}`);
      }
    });
    
    // Update availability
    await updateDoc(availabilityRef, {
      stalls: updatedStalls,
      updatedAt: serverTimestamp()
    });
    
    console.log(`✅ Released ${releasedCount} stalls for booking ${bookingId}`);
    return { success: true, releasedCount };
    
  } catch (error) {
    console.error('❌ Failed to release booking stalls:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Cancel pending booking and release stalls
 */
export async function cancelPendingStallBooking(bookingId, reason = 'User cancelled') {
  console.log(`🚫 Cancelling stall booking: ${bookingId}`);
  
  try {
    const bookingRef = doc(db, 'stallBookings', bookingId);
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
    
    // Release the stalls
    const releaseResult = await releaseBookingStalls(
      bookingId, 
      booking.stallIds
    );
    
    console.log(`✅ Stall booking ${bookingId} cancelled successfully`);
    return { success: true, booking, releaseResult };
    
  } catch (error) {
    console.error('❌ Failed to cancel stall booking:', error);
    return { success: false, error: error.message };
  }
}

// Auto-cleanup function that can be called periodically
export function startStallCleanupInterval() {
  console.log('🕐 Starting automatic stall cleanup interval (every 2 minutes)');
  
  // Clean up immediately
  cleanupExpiredStalls();
  
  // Then every 2 minutes
  const interval = setInterval(cleanupExpiredStalls, 2 * 60 * 1000);
  
  return interval;
}

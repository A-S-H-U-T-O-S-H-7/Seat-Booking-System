import { db } from '@/lib/firebase';
import { doc, updateDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { toast } from 'react-hot-toast';
import { formatDateKey } from '@/utils/dateUtils';

/**
 * Update booking status after successful payment
 * @param {string} orderId - The booking/order ID
 * @param {object} paymentData - Payment information from CCAvenue
 * @param {string} bookingType - Type of booking ('havan', 'show', 'stall')
 * @returns {Promise<boolean>} - Success status
 */
export async function updateBookingAfterPayment(orderId, paymentData, bookingType = 'havan') {
  console.log('🔄 Updating booking status after payment:', {
    orderId,
    paymentStatus: paymentData.order_status,
    bookingType,
    purpose: paymentData.mer_param1 || paymentData.merchant_param1
  });

  try {
    // Determine the collection based on booking type
    const collectionName = getCollectionName(bookingType);
    const bookingRef = doc(db, collectionName, orderId);
    
    // Check if booking exists
    const bookingDoc = await getDoc(bookingRef);
    if (!bookingDoc.exists()) {
      console.error('❌ Booking not found:', orderId);
      return false;
    }
    
    const bookingData = bookingDoc.data();
    console.log('📄 Current booking data:', bookingData);
    
    // Prepare update data based on payment status
    const updateData = {
      updatedAt: serverTimestamp(),
      payment: {
        ...(bookingData.payment || {}),
        gateway: 'ccavenue',
        status: paymentData.order_status,
        transactionId: paymentData.tracking_id || paymentData.order_id,
        bankRefNo: paymentData.bank_ref_no,
        paymentMode: paymentData.payment_mode,
        amount: parseFloat(paymentData.amount) || bookingData.showDetails?.totalPrice || bookingData.totalAmount,
        currency: paymentData.currency || 'INR',
        processedAt: serverTimestamp(),
        ccavenueData: {
          orderId: paymentData.order_id,
          trackingId: paymentData.tracking_id,
          bankRefNo: paymentData.bank_ref_no,
          orderStatus: paymentData.order_status,
          failureMessage: paymentData.failure_message,
          statusMessage: paymentData.status_message,
          paymentMode: paymentData.payment_mode,
          cardName: paymentData.card_name,
          statusCode: paymentData.status_code,
          responseCode: paymentData.response_code
        }
      }
    };

    if (paymentData.order_status === 'Success') {
      // Payment successful - confirm booking
      updateData.status = 'confirmed';
      updateData.confirmedAt = serverTimestamp();
      
      // If it's a havan booking, update seat availability
      if (bookingType === 'havan' && bookingData.seats) {
        await updateSeatAvailabilityAfterPayment(bookingData, true);
      }
      
      // If it's a show booking, update seat availability
      if (bookingType === 'show' && (bookingData.showDetails?.selectedSeats || bookingData.selectedSeats)) {
        await updateShowSeatAvailabilityAfterPayment(bookingData, true);
      }
      
      // If it's a stall booking, update stall availability
      if (bookingType === 'stall' && bookingData.stallIds) {
        await updateStallAvailabilityAfterPayment(bookingData, true);
      }
      
      // If it's a delegate booking, no availability update needed
      if (bookingType === 'delegate') {
        console.log('✅ Delegate booking payment confirmed - no availability update required');
      }
      
      console.log('✅ Payment successful - confirming booking');
      
    } else {
      // Payment failed - cancel booking
      updateData.status = 'cancelled';
      updateData.cancellationReason = paymentData.failure_message || 'Payment failed';
      updateData.cancelledAt = serverTimestamp();
      
      // Release seats
      if (bookingType === 'havan' && bookingData.seats) {
        await updateSeatAvailabilityAfterPayment(bookingData, false);
      }
      
      if (bookingType === 'show' && (bookingData.showDetails?.selectedSeats || bookingData.selectedSeats)) {
        await updateShowSeatAvailabilityAfterPayment(bookingData, false);
      }
      
      // Release stalls
      if (bookingType === 'stall' && bookingData.stallIds) {
        await updateStallAvailabilityAfterPayment(bookingData, false);
      }
      
      // If it's a delegate booking, no availability update needed
      if (bookingType === 'delegate') {
        console.log('❌ Delegate booking payment failed - no availability release required');
      }
      
      console.log('❌ Payment failed - cancelling booking');
    }
    
    // Update the booking document
    await updateDoc(bookingRef, updateData);
    
    console.log('✅ Booking status updated successfully:', {
      orderId,
      newStatus: updateData.status,
      paymentStatus: paymentData.order_status
    });
    
    // Send confirmation email on successful payment
    if (paymentData.order_status === 'Success') {
      try {
        const enrichedBookingData = { ...bookingData, amount: paymentData.amount, order_id: orderId, payment_id: paymentData.tracking_id };
        
        if (bookingType === 'donation') {
          const { sendDonationConfirmationEmail } = await import('@/services/emailService');
          const emailResult = await sendDonationConfirmationEmail(enrichedBookingData);
          console.log('📧 Donation email sent:', emailResult.success ? 'Success' : emailResult.error);
        } else if (bookingType === 'delegate') {
          // Ensure numberOfPersons is properly set in enrichedBookingData
          console.log('📋 Delegate booking data before email:', {
            numberOfPersons: enrichedBookingData.eventDetails?.numberOfPersons,
            eventDetails: enrichedBookingData.eventDetails
          });
          const { sendDelegateConfirmationEmail } = await import('@/services/emailService');
          const emailResult = await sendDelegateConfirmationEmail(enrichedBookingData);
          console.log('📧 Delegate email sent:', emailResult.success ? 'Success' : emailResult.error);
          if (!emailResult.success) {
            console.error('❌ Email error details:', emailResult.error);
          }
        } else {
          const { sendBookingConfirmationEmail } = await import('@/services/emailService');
          const emailResult = await sendBookingConfirmationEmail(enrichedBookingData, bookingType);
          console.log('📧 Confirmation email sent:', emailResult.success ? 'Success' : emailResult.error);
        }
      } catch (emailError) {
        console.error('❌ Failed to send confirmation email:', emailError);
      }
    }
    
    return true;
    
  } catch (error) {
    console.error('❌ Error updating booking after payment:', error);
    return false;
  }
}



/**
 * Update seat availability after payment (for havan bookings)
 */
async function updateSeatAvailabilityAfterPayment(bookingData, isPaymentSuccessful) {
  try {
    const { eventDate, shift, seats } = bookingData;
    const dateKey = formatDateKey(eventDate);
    const availabilityRef = doc(db, 'seatAvailability', `${dateKey}_${shift}`);
    
    console.log('🔄 [HAVAN] Updating seat availability after payment:', {
      bookingId: bookingData.id || bookingData.bookingId,
      isPaymentSuccessful,
      dateKey,
      shift,
      seats,
      docPath: `${dateKey}_${shift}`
    });
    
    const availabilityDoc = await getDoc(availabilityRef);
    if (!availabilityDoc.exists()) {
      console.error('❌ [HAVAN] Seat availability document does not exist:', `${dateKey}_${shift}`);
      return;
    }
    
    const currentAvailability = availabilityDoc.data().seats || {};
    const updatedAvailability = { ...currentAvailability };
    
   // In updateSeatAvailabilityAfterPayment function:
if (isPaymentSuccessful) {
  // Payment successful - confirm seat bookings
  console.log('✅ [HAVAN] Processing successful payment for seats:', seats);
  seats.forEach(seatId => {
    if (updatedAvailability[seatId]) {
      console.log(`🔄 [HAVAN] Marking seat ${seatId} as booked`);
      updatedAvailability[seatId] = {
        ...updatedAvailability[seatId], // Preserve all existing data
        booked: true,
        blocked: false,
        confirmedAt: serverTimestamp()
        // Don't overwrite userId, customerName, bookingId, etc.
      };
    } else {
      console.warn(`⚠️ [HAVAN] Seat ${seatId} not found in current availability`);
      // Create new entry with all booking details
      updatedAvailability[seatId] = {
        booked: true,
        blocked: false,
        userId: bookingData.userId,
        customerName: bookingData.customerDetails?.name,
        bookingId: bookingData.bookingId || bookingData.id,
        bookedAt: serverTimestamp(),
        confirmedAt: serverTimestamp()
      };
    }
  });
} else {
      // Payment failed - release seats
      console.log('❌ [HAVAN] Processing failed payment, releasing seats:', seats);
      seats.forEach(seatId => {
        if (updatedAvailability[seatId] && updatedAvailability[seatId].bookingId === bookingData.bookingId) {
          console.log(`🗑️ [HAVAN] Releasing seat ${seatId}`);
          delete updatedAvailability[seatId];
        } else {
          console.warn(`⚠️ [HAVAN] Seat ${seatId} not found or booking ID mismatch`);
        }
      });
    }
    
    await updateDoc(availabilityRef, {
      seats: updatedAvailability,
      updatedAt: serverTimestamp()
    });
    
    console.log(`✅ Seat availability updated for ${seats.length} seats`);
    
  } catch (error) {
    console.error('❌ Error updating seat availability:', error);
  }
}

/**
 * Update stall availability after payment (for stall bookings)
 */
async function updateStallAvailabilityAfterPayment(bookingData, isPaymentSuccessful) {
  try {
    const { stallIds, bookingId } = bookingData;
    const availabilityRef = doc(db, 'stallAvailability', 'current');
    
    const availabilityDoc = await getDoc(availabilityRef);
    if (!availabilityDoc.exists()) {
      console.log('⚠️ Stall availability document not found');
      return;
    }
    
    const currentAvailability = availabilityDoc.data().stalls || {};
    const updatedAvailability = { ...currentAvailability };
    
    if (isPaymentSuccessful) {
      // Payment successful - confirm stall bookings
      stallIds.forEach(stallId => {
        if (updatedAvailability[stallId]) {
          updatedAvailability[stallId] = {
            ...updatedAvailability[stallId],
            booked: true,
            blocked: false,
            confirmedAt: serverTimestamp()
          };
        }
      });
      console.log(`✅ Marked ${stallIds.length} stalls as booked`);
    } else {
      // Payment failed - release stalls
      stallIds.forEach(stallId => {
        if (updatedAvailability[stallId] && updatedAvailability[stallId].bookingId === bookingId) {
          delete updatedAvailability[stallId];
        }
      });
      console.log(`✅ Released ${stallIds.length} stalls after payment failure`);
    }
    
    await updateDoc(availabilityRef, {
      stalls: updatedAvailability,
      updatedAt: serverTimestamp()
    });
    
    console.log(`✅ Stall availability updated for ${stallIds.length} stalls`);
    
  } catch (error) {
    console.error('❌ Error updating stall availability:', error);
  }
}

/**
 * Update show seat availability after payment
 */
async function updateShowSeatAvailabilityAfterPayment(bookingData, isPaymentSuccessful) {
  try {
    const selectedDate = bookingData.showDetails?.date || bookingData.selectedDate;
    const selectedSeats = bookingData.showDetails?.selectedSeats || bookingData.selectedSeats;
    const dateKey = formatDateKey(selectedDate);
    const availabilityRef = doc(db, 'showSeatAvailability', dateKey);
    
    const availabilityDoc = await getDoc(availabilityRef);
    if (!availabilityDoc.exists()) return;
    
    const currentAvailability = availabilityDoc.data().seats || {};
    const updatedAvailability = { ...currentAvailability };
    
    if (isPaymentSuccessful) {
      // Payment successful - confirm seat bookings
      selectedSeats.forEach(seatId => {
        if (updatedAvailability[seatId]) {
          updatedAvailability[seatId] = {
            ...updatedAvailability[seatId],
            booked: true,
            blocked: false,
            confirmedAt: serverTimestamp()
          };
        }
      });
    } else {
      // Payment failed - release seats
      selectedSeats.forEach(seatId => {
        if (updatedAvailability[seatId] && updatedAvailability[seatId].bookingId === bookingData.id) {
          delete updatedAvailability[seatId];
        }
      });
    }
    
    await updateDoc(availabilityRef, {
      seats: updatedAvailability,
      updatedAt: serverTimestamp()
    });
    
    console.log(`✅ Show seat availability updated for ${selectedSeats.length} seats`);
    
  } catch (error) {
    console.error('❌ Error updating show seat availability:', error);
  }
}

/**
 * Get collection name based on booking type
 */
function getCollectionName(bookingType) {
  switch (bookingType) {
    case 'havan':
      return 'bookings';
    case 'show':
      return 'showBookings';
    case 'stall':
      return 'stallBookings';
    case 'donation':
      return 'donations';
    case 'delegate':
      return 'delegateBookings';
    default:
      return 'bookings';
  }
}


/**
 * Get booking type from order ID or purpose
 */
export async function getBookingTypeFromOrderId(orderId, purpose) {
  console.log('🔍 Detecting booking type for:', { orderId, purpose });
  
  if (purpose) {
    if (purpose.includes('donation')) {
      console.log('✅ Detected donation from purpose');
      return 'donation';
    }
    if (purpose.includes('havan')) {
      console.log('✅ Detected havan from purpose');
      return 'havan';
    }
    if (purpose.includes('show')) {
      console.log('✅ Detected show from purpose');
      return 'show';
    }
    if (purpose.includes('stall')) {
      console.log('✅ Detected stall from purpose');
      return 'stall';
    }
    if (purpose.includes('delegate')) {
      console.log('✅ Detected delegate from purpose');
      return 'delegate';
    }
  }
  
  // Fallback to order ID pattern  
  if (orderId.startsWith('DN')) {
    console.log('✅ Detected donation from ID prefix');
    return 'donation';
  }
  if (orderId.startsWith('BK')) {
    console.log('✅ Detected havan from ID prefix');
    return 'havan';
  }
  if (orderId.startsWith('SHOW-') || orderId.includes('show')) {
    console.log('✅ Detected show from ID pattern');
    return 'show';
  }
  if (orderId.startsWith('STALL-') || orderId.includes('stall')) {
    console.log('✅ Detected stall from ID pattern');
    return 'stall';
  }
  if (orderId.startsWith('DELEGATE-') || orderId.includes('delegate')) {
    console.log('✅ Detected delegate from ID pattern');
    return 'delegate';
  }
  
  // For Firebase auto-generated IDs, try to check the actual collections
  console.log('🔍 Checking Firebase collections for ID:', orderId);
  
  try {
    // Check show bookings first (most likely for Firebase IDs)
    const showBookingRef = doc(db, 'showBookings', orderId);
    const showDoc = await getDoc(showBookingRef);
    if (showDoc.exists()) {
      console.log('✅ Found in showBookings collection');
      return 'show';
    }
    
    // Check havan bookings
    const havanBookingRef = doc(db, 'bookings', orderId);
    const havanDoc = await getDoc(havanBookingRef);
    if (havanDoc.exists()) {
      console.log('✅ Found in bookings collection');
      return 'havan';
    }
    
    // Check stall bookings
    const stallBookingRef = doc(db, 'stallBookings', orderId);
    const stallDoc = await getDoc(stallBookingRef);
    if (stallDoc.exists()) {
      console.log('✅ Found in stallBookings collection');
      return 'stall';
    }
    
    // Check donations
    const donationRef = doc(db, 'donations', orderId);
    const donationDoc = await getDoc(donationRef);
    if (donationDoc.exists()) {
      console.log('✅ Found in donations collection');
      return 'donation';
    }
    
    // Check delegate bookings
    const delegateBookingRef = doc(db, 'delegateBookings', orderId);
    const delegateDoc = await getDoc(delegateBookingRef);
    if (delegateDoc.exists()) {
      console.log('✅ Found in delegateBookings collection');
      return 'delegate';
    }
    
  } catch (error) {
    console.error('❌ Error checking Firebase collections:', error);
  }
  
  console.log('⚠️ Defaulting to havan booking type');
  return 'havan'; // Default
}

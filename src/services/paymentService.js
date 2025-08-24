import { db } from '@/lib/firebase';
import { doc, updateDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { toast } from 'react-hot-toast';

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
      
      console.log('❌ Payment failed - cancelling booking');
    }
    
    // Update the booking document
    await updateDoc(bookingRef, updateData);
    
    console.log('✅ Booking status updated successfully:', {
      orderId,
      newStatus: updateData.status,
      paymentStatus: paymentData.order_status
    });
    
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
    
    const availabilityDoc = await getDoc(availabilityRef);
    if (!availabilityDoc.exists()) return;
    
    const currentAvailability = availabilityDoc.data().seats || {};
    const updatedAvailability = { ...currentAvailability };
    
    if (isPaymentSuccessful) {
      // Payment successful - confirm seat bookings
      seats.forEach(seatId => {
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
      seats.forEach(seatId => {
        if (updatedAvailability[seatId] && updatedAvailability[seatId].bookingId === bookingData.bookingId) {
          delete updatedAvailability[seatId];
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
    default:
      return 'bookings';
  }
}

/**
 * Format date for Firebase document keys
 */
function formatDateKey(date) {
  if (!date) return '';
  
  const dateObj = date instanceof Date ? date : new Date(date);
  return dateObj.toISOString().split('T')[0];
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
    
  } catch (error) {
    console.error('❌ Error checking Firebase collections:', error);
  }
  
  console.log('⚠️ Defaulting to havan booking type');
  return 'havan'; // Default
}

import { decrypt } from "@/lib/ccavenueCrypto";
import { db } from "@/lib/firebase";
import { doc, updateDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { NextResponse } from "next/server";

// This API route uses Node.js runtime for crypto support
export const runtime = 'nodejs';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const encResp = formData.get('encResp');
    
    if (!encResp) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/payment/failed?error=no_response`);
    }

    // Try to decrypt with both working keys (India and Foreign)
    let decryptedData;
    try {
      decryptedData = decrypt(encResp, process.env.CCAVENUE_INDIA_WORKING_KEY);
    } catch {
      try {
        decryptedData = decrypt(encResp, process.env.CCAVENUE_FOREIGN_WORKING_KEY);
      } catch (error) {
        console.error('Decryption failed:', error);
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/payment/failed?error=decryption_failed`);
      }
    }

    // Parse the response data
    const responseData = {};
    decryptedData.split('&').forEach(param => {
      const [key, value] = param.split('=');
      responseData[key] = decodeURIComponent(value || '');
    });

    const {
      order_status,
      order_id,
      tracking_id,
      bank_ref_no,
      payment_mode,
      card_name,
      status_code,
      status_message,
      currency,
      amount,
      merchant_param1 // This contains our booking ID
    } = responseData;

    console.log('Payment response:', responseData);

    // Update booking based on payment status
    if (order_status === 'Success') {
      await updateBookingStatus(merchant_param1, {
        status: 'confirmed',
        payment: {
          paymentId: tracking_id,
          orderId: order_id,
          bankRefNo: bank_ref_no,
          amount: parseFloat(amount),
          currency,
          paymentMode: payment_mode,
          cardName: card_name,
          statusCode: status_code,
          statusMessage: status_message,
          gateway: 'ccavenue',
          paidAt: serverTimestamp()
        }
      });

      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/payment/success?booking_id=${merchant_param1}&order_id=${order_id}`);
    } else {
      await updateBookingStatus(merchant_param1, {
        status: 'payment_failed',
        payment: {
          orderId: order_id,
          statusCode: status_code,
          statusMessage: status_message,
          gateway: 'ccavenue',
          failedAt: serverTimestamp()
        }
      });

      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/payment/failed?booking_id=${merchant_param1}&reason=${status_message}`);
    }

  } catch (error) {
    console.error('Payment response error:', error);
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/payment/failed?error=server_error`);
  }
}

async function updateBookingStatus(bookingId, updateData) {
  try {
    const bookingRef = doc(db, 'bookings', bookingId);
    await updateDoc(bookingRef, {
      ...updateData,
      updatedAt: serverTimestamp()
    });

    // If payment successful, update seat availability to booked
    if (updateData.status === 'confirmed') {
      // Get booking details to update seat availability
      const bookingDoc = await getDoc(bookingRef);
      if (bookingDoc.exists()) {
        const booking = bookingDoc.data();
        await updateSeatAvailability(booking);
      }
      console.log(`Booking ${bookingId} confirmed successfully`);
    }
  } catch (error) {
    console.error('Error updating booking status:', error);
    throw error;
  }
}

async function updateSeatAvailability(booking) {
  try {
    const { eventDate, shift, seats, userId, customerDetails } = booking;
    const dateKey = eventDate.toDate ? eventDate.toDate().toISOString().split('T')[0] : eventDate;
    
    const availabilityRef = doc(db, 'seatAvailability', `${dateKey}_${shift}`);
    const availabilityDoc = await getDoc(availabilityRef);
    
    if (availabilityDoc.exists()) {
      const currentAvailability = availabilityDoc.data().seats || {};
      
      // Update seats to booked status
      seats.forEach(seatId => {
        currentAvailability[seatId] = {
          booked: true,
          blocked: false,
          userId: userId,
          customerName: customerDetails.name,
          bookingId: booking.id,
          bookedAt: serverTimestamp()
        };
      });

      await updateDoc(availabilityRef, {
        seats: currentAvailability,
        updatedAt: serverTimestamp()
      });
    }
  } catch (error) {
    console.error('Error updating seat availability:', error);
  }
}

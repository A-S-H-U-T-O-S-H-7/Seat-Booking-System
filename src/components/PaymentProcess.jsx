"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useBooking } from '@/context/BookingContext';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { doc, runTransaction, serverTimestamp } from 'firebase/firestore';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import { formatDateKey } from '@/utils/dateUtils';
import { useShifts } from '@/hooks/useShifts';

// Note: In a real implementation, you would load Razorpay script dynamically
// and handle the payment gateway integration properly

const PaymentProcess = ({ customerDetails }) => {
  const [processing, setProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [bookingId, setBookingId] = useState('');
  const [countdown, setCountdown] = useState(15);
  const router = useRouter();
  
  const { user } = useAuth();
  const {
    selectedDate,
    selectedShift,
    selectedSeats,
    getTotalAmount,
    clearSelection
  } = useBooking();

  const { getShiftLabel, getShiftTime } = useShifts();

  // Simulate Razorpay payment (replace with actual integration)
  const initiatePayment = async () => {
    setProcessing(true);
    
    try {
      // In real implementation, you would:
      // 1. Create order on your backend
      // 2. Initialize Razorpay with order details
      // 3. Handle payment success/failure
      
      // For demo purposes, simulate payment success after 2 seconds
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate successful payment
      const paymentId = 'pay_' + Math.random().toString(36).substr(2, 9);
      const orderId = 'order_' + Math.random().toString(36).substr(2, 9);
      
      await processBooking({
        paymentId,
        orderId,
        amount: getTotalAmount(),
        status: 'success'
      });
      
      setPaymentSuccess(true);
      
    } catch (error) {
      console.error('Payment failed:', error);
      toast.error('Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const processBooking = async (paymentData) => {
    const dateKey = formatDateKey(selectedDate);
    const bookingId = 'BK' + Date.now();
    
    try {
      await runTransaction(db, async (transaction) => {
        // Check seat availability one more time
        const availabilityRef = doc(db, 'seatAvailability', `${dateKey}_${selectedShift}`);
        const availabilityDoc = await transaction.get(availabilityRef);
        
        const currentAvailability = availabilityDoc.exists() 
          ? availabilityDoc.data().seats || {}
          : {};

        // Verify all seats are still available
        for (const seatId of selectedSeats) {
          if (currentAvailability[seatId]?.booked || currentAvailability[seatId]?.blocked) {
            throw new Error(`Seat ${seatId} is no longer available`);
          }
        }

        // Update seat availability
        const updatedAvailability = { ...currentAvailability };
        selectedSeats.forEach(seatId => {
          updatedAvailability[seatId] = {
            booked: true,
            blocked: false,
            userId: user.uid,
            customerName: customerDetails.name,
            bookingId: bookingId,
            bookedAt: serverTimestamp()
          };
        });

        transaction.set(availabilityRef, {
          seats: updatedAvailability,
          updatedAt: serverTimestamp(),
          date: dateKey,
          shift: selectedShift
        }, { merge: true });

        // Create booking record
        const bookingRef = doc(db, 'bookings', bookingId);
        transaction.set(bookingRef, {
          id: bookingId,
          bookingId,
          userId: user.uid,
          customerDetails,
          eventDate: selectedDate,
          shift: selectedShift,
          seats: selectedSeats,
          seatCount: selectedSeats.length,
          totalAmount: getTotalAmount(),
          payment: {
            ...paymentData,
            amount: getTotalAmount()
          },
          status: 'confirmed',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      });

      setBookingId(bookingId);
      
      // In real implementation, trigger email confirmation here
      toast.success('Booking confirmed! Confirmation email sent.');
      
    } catch (error) {
      console.error('Booking failed:', error);
      throw error;
    }
  };

  // Auto-redirect countdown effect
  useEffect(() => {
    if (paymentSuccess) {
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            router.push('/profile');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [paymentSuccess, router]);

  const handleNewBooking = () => {
    clearSelection();
    setPaymentSuccess(false);
    setBookingId('');
    // Redirect to booking page or refresh
    window.location.reload();
  };

  const goToProfile = () => {
    router.push('/profile');
  };

  if (paymentSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex flex-col justify-center items-center px-2 sm:px-4 py-3 sm:py-6">
        <div className="bg-white shadow-xl rounded-xl sm:rounded-2xl max-w-4xl w-full overflow-hidden border border-green-200">
          {/* Success Header - More Compact */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-3 sm:px-5 py-3 sm:py-4 text-center">
            <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-2 sm:mb-3 bg-white rounded-full flex items-center justify-center shadow-lg">
              <div className="w-8 h-8 sm:w-10 sm:h-10 text-green-500 text-2xl sm:text-3xl font-bold flex items-center justify-center">✓</div>
            </div>
            
            <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-1">
              🎉 Booking Confirmed!
            </h3>
            
            <p className="text-green-100 text-sm sm:text-base">
              Your Havan seats have been successfully reserved
            </p>
          </div>

          <div className="p-2 sm:p-4 space-y-3 sm:space-y-4">
            {/* Booking Details - More Compact */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg p-2 sm:p-3">
              <h4 className="text-base sm:text-lg font-bold text-green-800 mb-2 sm:mb-3 flex items-center">
                <div className="w-5 h-5 sm:w-6 sm:h-6 bg-green-500 rounded-full flex items-center justify-center mr-2">
                  <span className="text-white font-bold text-xs sm:text-sm">📋</span>
                </div>
                Booking Details
              </h4>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                <div className="bg-white rounded-md p-2 sm:p-3 shadow-sm border border-green-200">
                  <p className="text-xs text-gray-600 mb-1">Booking ID</p>
                  <p className="font-bold text-green-800 text-xs sm:text-sm break-all">{bookingId}</p>
                </div>
                
                <div className="bg-white rounded-md p-2 sm:p-3 shadow-sm border border-green-200 col-span-2 sm:col-span-1">
                  <p className="text-xs text-gray-600 mb-1">Event Date</p>
                  <p className="font-bold text-green-800 text-xs sm:text-sm">{format(selectedDate, 'MMM dd, yyyy')}</p>
                </div>
                
                <div className="bg-white rounded-md p-2 sm:p-3 shadow-sm border border-green-200 col-span-2 sm:col-span-1">
                  <p className="text-xs text-gray-600 mb-1">Shift</p>
                  <p className="font-bold text-green-800 text-xs sm:text-sm">{getShiftLabel(selectedShift)}</p>
                </div>
                
                <div className="bg-white rounded-md p-2 sm:p-3 shadow-sm border border-green-200">
                  <p className="text-xs text-gray-600 mb-1">Seats</p>
                  <p className="font-bold text-green-800 text-xs sm:text-sm break-all">{selectedSeats.join(', ')}</p>
                </div>
                
                <div className="bg-white rounded-md p-2 sm:p-3 shadow-sm border border-green-200">
                  <p className="text-xs text-gray-600 mb-1">Count</p>
                  <p className="font-bold text-green-800 text-xs sm:text-sm">{selectedSeats.length} seat{selectedSeats.length > 1 ? 's' : ''}</p>
                </div>
                
                <div className="bg-gradient-to-r from-amber-100 to-yellow-100 rounded-md p-2 sm:p-3 shadow-sm border border-amber-300">
                  <p className="text-xs text-amber-700 mb-1">Amount</p>
                  <p className="font-bold text-amber-800 text-sm sm:text-base">₹{getTotalAmount()}</p>
                </div>
              </div>
            </div>

            {/* Email Confirmation - More Compact with Proper Email Wrapping */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-2 sm:p-3">
              <div className="flex items-start">
                <div className="text-xl sm:text-2xl mr-2 sm:mr-3 flex-shrink-0">📧</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm sm:text-base font-semibold text-blue-800">Confirmation Email Sent</p>
                  <p className="text-xs sm:text-sm text-blue-600">
                    A detailed confirmation has been sent to
                  </p>
                  <p className="text-xs sm:text-sm text-blue-800 font-medium break-words break-all">
                    {customerDetails.email}
                  </p>
                </div>
              </div>
            </div>

            {/* Auto-redirect Countdown - More Compact */}
            <div className="bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-200 rounded-lg p-2 sm:p-3">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-orange-500 to-amber-600 rounded-full flex items-center justify-center text-white font-bold text-lg sm:text-xl shadow-lg">
                  {countdown}
                </div>
                <div className="text-center sm:text-left">
                  <p className="text-orange-800 font-bold text-sm sm:text-base">
                    Auto-redirecting to Profile
                  </p>
                  <p className="text-xs sm:text-sm text-orange-600">
                    Redirecting in {countdown} second{countdown > 1 ? 's' : ''}...
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons - More Compact */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
              <button
                onClick={goToProfile}
                className="bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white py-2 sm:py-3 rounded-md sm:rounded-lg font-bold text-sm sm:text-base transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center"
              >
                <span className="mr-1 sm:mr-2">🏠</span>
                Go to Profile Now
              </button>
              
              <button
                onClick={handleNewBooking}
                className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white py-2 sm:py-3 rounded-md sm:rounded-lg font-bold text-sm sm:text-base transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center"
              >
                <span className="mr-1 sm:mr-2">🎫</span>
                Book More Seats
              </button>
            </div>
            
            {/* Important Note - More Compact */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-2 sm:p-3">
              <p className="text-xs text-gray-600 text-center">
                💾 Please save this confirmation and bring a valid ID to the event.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50 flex flex-col justify-center items-center px-2 sm:px-4 py-4 sm:py-8">
      <div className="bg-white shadow-xl rounded-xl sm:rounded-2xl max-w-4xl w-full overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-amber-600 px-4 sm:px-6 py-4 sm:py-5">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white text-center">Complete Your Payment</h2>
          <p className="text-orange-100 text-center mt-1 sm:mt-2 text-sm sm:text-base">Secure your Havan seats now</p>
        </div>

        <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
          {/* Final Booking Summary */}
          <div className="bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-200 rounded-lg sm:rounded-xl p-3 sm:p-4">
            <h3 className="text-lg sm:text-xl font-bold text-orange-800 mb-3 sm:mb-4 flex items-center">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-orange-500 rounded-full flex items-center justify-center mr-2 sm:mr-3">
                <span className="text-white font-bold text-sm sm:text-base">📋</span>
              </div>
              Final Booking Summary
            </h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 mb-3 sm:mb-4">
              {/* Customer Details */}
              <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm border border-orange-200">
                <h4 className="font-semibold text-orange-700 mb-2 sm:mb-3 flex items-center text-sm sm:text-base">
                  <span className="text-base sm:text-lg mr-2">👤</span>
                  Customer Details
                </h4>
                <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm text-gray-700">
                  <p><span className="font-medium text-gray-900">Name:</span> {customerDetails.name}</p>
                  <p><span className="font-medium text-gray-900">Email:</span> {customerDetails.email}</p>
                  <p><span className="font-medium text-gray-900">Phone:</span> {customerDetails.phone}</p>
                  <p><span className="font-medium text-gray-900">Aadhar:</span> {customerDetails.aadhar}</p>
                </div>
              </div>

              {/* Event Details */}
              <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm border border-orange-200">
                <h4 className="font-semibold text-orange-700 mb-2 sm:mb-3 flex items-center text-sm sm:text-base">
                  <span className="text-base sm:text-lg mr-2">🏛️</span>
                  Event Details
                </h4>
                <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm text-gray-700">
                  <p><span className="font-medium text-gray-900">Date:</span> {format(selectedDate, 'EEEE, MMMM dd, yyyy')}</p>
                  <p><span className="font-medium text-gray-900">Shift:</span> {getShiftLabel(selectedShift)} ({getShiftTime(selectedShift)})</p>
                  <p><span className="font-medium text-gray-900">Seats:</span> {selectedSeats.join(', ')}</p>
                  <p><span className="font-medium text-gray-900">Seat Count:</span> {selectedSeats.length} seat{selectedSeats.length > 1 ? 's' : ''}</p>
                </div>
              </div>
            </div>
 
            {/* Total Amount - Highlighted */}
            <div className="bg-gradient-to-r from-amber-100 to-orange-100 border border-amber-300 rounded-lg sm:rounded-xl p-3 sm:p-4">
              <div className="flex flex-col sm:flex-row justify-between items-center text-center sm:text-left">
                <div className="mb-2 sm:mb-0">
                  <h4 className="text-base sm:text-lg font-semibold text-amber-800">Total Amount to Pay</h4>
                  <p className="text-xs max-w-lg mt-2 sm:text-sm text-amber-600">All payments made for Havan seats, stalls, and show seats will be considered <span className="font-bold text-sm">Donations</span> to <span className="font-bold text-sm">SVS</span>. With your contribution, you will become a valued member of SVS, and your donation will be eligible for exemption under <span className="font-bold text-sm">Section 80G</span> of the Income Tax Act.”</p>
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-amber-800 bg-white px-4 py-2 sm:px-6 sm:py-3 rounded-lg sm:rounded-xl shadow-md">
                  ₹{getTotalAmount()}
                </div>
              </div>
            </div>
          </div>

          {/* Payment Section */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg sm:rounded-xl p-3 sm:p-4">
            <h3 className="text-lg sm:text-xl font-bold text-blue-800 mb-3 sm:mb-4 flex items-center">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-500 rounded-full flex items-center justify-center mr-2 sm:mr-3">
                <span className="text-white font-bold text-sm sm:text-base">💳</span>
              </div>
              Secure Payment
            </h3>
            
            {/* Security Info */}
            <div className="mb-3 sm:mb-4">
              <div className="flex items-center p-3 bg-white rounded-lg shadow-sm border border-blue-200">
                <div className="text-blue-600 mr-3 text-xl sm:text-2xl">🔒</div>
                <div className="text-xs sm:text-sm">
                  <p className="font-semibold text-blue-800">SSL Secured Payment</p>
                  <p className="text-blue-600">Your payment information is protected with 256-bit SSL encryption</p>
                </div>
              </div>
            </div>

            {/* Payment Button */}
            <button
              onClick={initiatePayment}
              disabled={processing}
              className={`w-full py-3 sm:py-4 px-4 sm:px-6 rounded-lg sm:rounded-xl font-bold text-base sm:text-lg transition-all duration-300 transform ${
                processing
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 hover:scale-105 shadow-lg hover:shadow-xl'
              } text-white`}
            >
              {processing ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 sm:h-6 sm:w-6 text-white mr-2 sm:mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                  </svg>
                  Processing Payment...
                </span>
              ) : (
                <>🚀 Pay ₹{getTotalAmount()} - Complete Booking</>
              )}
            </button>

            <p className="text-xs text-gray-500 text-center mt-2 sm:mt-3">
              By clicking "Pay", you agree to our Terms of Service and Privacy Policy
            </p>
          </div>

          {/* Important Notes */}
          <div className="bg-gradient-to-br from-yellow-50 to-amber-50 border-l-4 border-yellow-400 rounded-r-lg sm:rounded-r-xl p-3 sm:p-4">
            <h4 className="font-bold text-yellow-800 mb-2 sm:mb-3 flex items-center text-sm sm:text-base">
              <span className="text-lg sm:text-xl mr-2">⚠️</span>
              Important Information
            </h4>
            <ul className="text-xs sm:text-sm text-yellow-700 space-y-1 sm:space-y-2">
              <li className="flex items-start">
                <span className="text-yellow-600 mr-2 mt-1">•</span>
                <span>Payment must be completed to confirm your booking</span>
              </li>
              <li className="flex items-start">
                <span className="text-yellow-600 mr-2 mt-1">•</span>
                <span>Seats will be released if payment is not completed within 10 minutes</span>
              </li>
              <li className="flex items-start">
                <span className="text-yellow-600 mr-2 mt-1">•</span>
                <span>Full refund available if canceled 15+ days before the event</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentProcess;

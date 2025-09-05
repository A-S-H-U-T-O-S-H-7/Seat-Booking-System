"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useBooking } from '@/context/BookingContext';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { doc, runTransaction, serverTimestamp } from 'firebase/firestore';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import { formatDateKey } from '@/utils/dateUtils';
import { useShifts } from '@/hooks/useShifts';
import { CheckCircle } from 'lucide-react'; 

const PaymentProcess = ({ customerDetails }) => {
  const [processing, setProcessing] = useState(false);
  const router = useRouter();

  const { user } = useAuth();
  const {
    selectedDate,
    selectedShift,
    selectedSeats,
    getTotalAmount,
    getPricingBreakdown,
  } = useBooking();

  const { getShiftLabel, getShiftTime } = useShifts();


  // CCAvenue Payment Integration
  const handlePayment = async () => {
    setProcessing(true);
    try {
      // Create booking with 'pending' status
      const bookingId = await createPendingBooking();

      // Prepare payment data for CCAvenue
      const paymentData = {
        order_id: bookingId,
        purpose: 'havan', // Required to identify payment type
        amount: getTotalAmount(),
        name: customerDetails.name,
        email: customerDetails.email,
        phone: customerDetails.phone,
        address: customerDetails.address || 'Delhi, India'
      };
      
      // Validate data before sending
      if (!customerDetails.name || customerDetails.name.trim().length < 2) {
        throw new Error('Customer name must be at least 2 characters');
      }
      if (!customerDetails.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerDetails.email)) {
        throw new Error('Valid email address is required');
      }
      if (!customerDetails.phone || !/^[0-9]{10}$/.test(customerDetails.phone.replace(/\D/g, ''))) {
        throw new Error('Valid 10-digit phone number is required');
      }
      if (!getTotalAmount() || getTotalAmount() <= 0) {
        throw new Error('Valid amount is required');
      }
      
      // Send request to our Next.js API route (which proxies to CCAvenue)
      const response = await fetch('/api/payment/ccavenue-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Check API response
      if (!data.status) {
        const errorMessage = data.errors ? data.errors.join(', ') : 'Payment request failed';
        throw new Error(errorMessage);
      }
      
      // Validate response data
      if (!data.encRequest || !data.access_code) {
        throw new Error('Invalid response from payment API');
      }
      
      // Redirect to CCAvenue
      submitToCCAvenue(data.encRequest, data.access_code, bookingId);
      
    } catch (error) {
      toast.error(error.message || "Failed to initiate payment. Please try again.");
      setProcessing(false);
    }
  };
  
  // Submit form to CCAvenue payment gateway
  const submitToCCAvenue = (encRequest, accessCode, bookingId) => {
    try {
      // Create form dynamically
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = 'https://secure.ccavenue.com/transaction/transaction.do?command=initiateTransaction';
      form.target = '_self';
      form.style.display = 'none';
      
      // Add encrypted request input
      const encInput = document.createElement('input');
      encInput.type = 'hidden';
      encInput.name = 'encRequest';
      encInput.value = encRequest;
      form.appendChild(encInput);
      
      // Add access code input
      const accInput = document.createElement('input');
      accInput.type = 'hidden';
      accInput.name = 'access_code';
      accInput.value = accessCode;
      form.appendChild(accInput);
      
      // Append form to body and submit
      document.body.appendChild(form);
      
      // Submit form
      form.submit();
      
      // Clean up
      setTimeout(() => {
        if (document.body.contains(form)) {
          document.body.removeChild(form);
        }
      }, 1000);
      
    } catch (error) {
      toast.error('Failed to redirect to payment gateway');
      setProcessing(false);
    }
  };
  
  // Handle payment response (to be called from payment status page)
  const handlePaymentResponse = async (encResp) => {
    try {
      // Send encrypted response to our API route (which proxies to CCAvenue)
      const response = await fetch('/api/payment/ccavenue-response', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          encResp: encResp
        })
      });
      
      const data = await response.json();
      
      if (data.status && data.data) {
        return data.data;
      } else {
        return null;
      }
      
    } catch (error) {
      return null;
    }
  };
  


  const createPendingBooking = async () => {
    const dateKey = formatDateKey(selectedDate);
    // Import the booking ID service
    const { generateSequentialBookingId } = await import('@/services/bookingIdService');
    const bookingId = await generateSequentialBookingId('havan');

    try {
      await runTransaction(db, async (transaction) => {
        // Check seat availability
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

        // Block seats temporarily (for 5 minutes)
        const updatedAvailability = { ...currentAvailability };
        const expiryTime = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now

        selectedSeats.forEach(seatId => {
          updatedAvailability[seatId] = {
            booked: false,
            blocked: true,
            userId: user.uid,
            customerName: customerDetails.name,
            bookingId: bookingId,
            blockedAt: serverTimestamp(),
            expiryTime: expiryTime
          };
        });

        transaction.set(availabilityRef, {
          seats: updatedAvailability,
          updatedAt: serverTimestamp(),
          date: dateKey,
          shift: selectedShift
        }, { merge: true });

        // Create pending booking record
        const bookingRef = doc(db, 'bookings', bookingId);
        
        const bookingData = {
          id: bookingId,
          bookingId,
          userId: user.uid,
          customerDetails,
          eventDate: selectedDate,
          shift: selectedShift,
          seats: selectedSeats,
          seatCount: selectedSeats.length,
          totalAmount: getTotalAmount(),
          status: 'pending_payment', // Important: pending status
          payment: {
            gateway: 'pending_integration',
            amount: getTotalAmount(),
            currency: 'INR'
          },
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          expiryTime: expiryTime // Auto-expire if payment not completed
        };
        
        transaction.set(bookingRef, bookingData);
      });

      toast.success('Booking created. Redirecting to payment...');
      return bookingId;

    } catch (error) {
      console.error('Booking creation failed:', error);
      throw error;
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50 flex flex-col justify-center items-center px-2 sm:px-4 py-4 sm:py-8">
     

      <div className="bg-white shadow-xl rounded-xl sm:rounded-2xl max-w-4xl w-full overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-amber-600 px-4 sm:px-6 py-4 sm:py-5">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white text-center">Complete Your Reservation</h2>
          <p className="text-orange-100 text-center mt-1 sm:mt-2 text-sm sm:text-base">Your contribution brings hope — in classrooms, homes, and communities😊</p>
        </div>

        <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
          {/* Final Booking Summary */}
          <div className="bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-200 rounded-lg sm:rounded-xl p-3 sm:p-4">
            <h3 className="text-lg sm:text-xl font-bold text-orange-800 mb-3 sm:mb-4 flex items-center">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-orange-500 rounded-full flex items-center justify-center mr-2 sm:mr-3">
                <span className="text-white font-bold text-sm sm:text-base">📋</span>
              </div>
              Final Summary
            </h3>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 mb-3 sm:mb-4">
              {/* Customer Details */}
              <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm border border-orange-200">
                <h4 className="font-semibold text-orange-700 mb-2 sm:mb-3 flex items-center text-sm sm:text-base">
                  <span className="text-base sm:text-lg mr-2">👤</span>
                  Your Details
                </h4>
                <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm text-gray-700">
                  <p><span className="font-medium text-gray-900">Name:</span> {customerDetails.name}</p>
                  <p><span className="font-medium text-gray-900">Email:</span> {customerDetails.email}</p>
                  <p><span className="font-medium text-gray-900">Phone:</span> {customerDetails.phone}</p>
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
                  <p><span className="font-medium text-gray-900">Seats:</span> <span className="font-bold text-gray-900">{selectedSeats.join(', ')}</span></p>
                  <p><span className="font-medium text-gray-900">Seat Count:</span> {selectedSeats.length} seat{selectedSeats.length > 1 ? 's' : ''}</p>
                </div>
              </div>
            </div>

            {/* Total Amount */}
            <div className="bg-gradient-to-r from-amber-100 to-orange-100 border border-amber-300 rounded-lg sm:rounded-xl p-3 sm:p-4">
              <div className="flex flex-col sm:flex-row justify-between items-center text-center sm:text-left">
                <div className="mb-2 sm:mb-0">
                  <h4 className="text-base sm:text-lg font-semibold text-amber-800">Total Amount to Pay</h4>
                  {(() => {
                    const pricingBreakdown = getPricingBreakdown();
                    const hasDiscount = pricingBreakdown.discounts.combined.applied;
                    
                    if (hasDiscount) {
                      return (
                        <div className="mb-2">
                          <p className="text-sm text-gray-600">
                            <span className="line-through">₹{pricingBreakdown.originalAmount.toLocaleString('en-IN')}</span>
                            <span className="ml-2 text-green-600 font-semibold">You saved ₹{pricingBreakdown.discountAmount.toLocaleString('en-IN')}!</span>
                          </p>
                        </div>
                      );
                    }
                    return null;
                  })()}
                  <p className="text-xs max-w-lg mt-2 sm:text-sm text-amber-600">All payments made for Havan seats, stalls, and show seats will be considered <span className="font-bold text-sm">Donations</span> to <span className="font-bold text-sm">SVS</span>. With your contribution, you will become a valued member of SVS, and your donation will be eligible for exemption under <span className="font-bold text-sm">Section 80G</span> of the Income Tax Act."</p>
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
                  <p className="font-semibold text-blue-800">Bank Grade Security</p>
                  <p className="text-blue-600">Secure payment gateway integration ready</p>
                </div>
              </div>
            </div>

            {/* Payment Button */}
            <button
              onClick={handlePayment}
              disabled={processing}
              className={`w-full py-3 sm:py-4 px-4 sm:px-6 rounded-lg sm:rounded-xl font-bold text-base sm:text-lg transition-all duration-300 transform ${processing
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 cursor-pointer shadow-lg hover:shadow-xl'
                } text-white`}
            >
              {processing ? (
                <span className="flex cursor-pointer items-center justify-center">
                  <svg className="animate-spin h-5 w-5 sm:h-6 sm:w-6 text-white mr-2 sm:mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                  </svg>
                  Processing Payment...
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 mr-2" />
                  Pay  ₹{getTotalAmount()}
                </span>
                
                 )}
            </button>

            <p className="text-xs text-gray-500 text-center mt-2 sm:mt-3">
              By clicking "Pay", you agree to our Terms of Service and Privacy Policy
            </p>
          </div>

          
        </div>
      </div>
    </div>
  );
};

export default PaymentProcess;
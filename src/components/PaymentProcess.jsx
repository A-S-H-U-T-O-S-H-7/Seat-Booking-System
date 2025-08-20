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

const PaymentProcess = ({ customerDetails }) => {
  const [processing, setProcessing] = useState(false);
  const [debugInfo, setDebugInfo] = useState(null);
  const [showDebugOverlay, setShowDebugOverlay] = useState(false);
  const [countdown, setCountdown] = useState(120); // 2 minutes in seconds
  const router = useRouter();

  const { user } = useAuth();
  const {
    selectedDate,
    selectedShift,
    selectedSeats,
    getTotalAmount,
  } = useBooking();

  const { getShiftLabel, getShiftTime } = useShifts();

  // Create booking first, then initiate payment
  const initiatePayment = async () => {
    setProcessing(true);

    try {
      // Step 1: Create booking with 'pending' status
      const bookingId = await createPendingBooking();

      // Step 2: Create payment request
      const paymentResponse = await fetch('/api/ccavenue/create-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: bookingId,
          amount: getTotalAmount().toString(),
          billingName: customerDetails.name,
          billingEmail: customerDetails.email,
          billingTel: customerDetails.phone,
          billingAddress: customerDetails.address || 'N/A',
          isIndia: true, // Set based on customer location
          currency: "INR", // 👈 IMPORTANT (or USD, etc.)
        }),
      });

      if (!paymentResponse.ok) {
        throw new Error('Failed to create payment request');
      }

      const responseData = await paymentResponse.json();
      const { encRequest, accessCode } = responseData;

      // Step 3: Create and submit hidden form to CCAvenue
      const form = document.createElement("form");
      form.method = "POST";
      form.action = "https://secure.ccavenue.com/transaction/transaction.do?command=initiateTransaction";

      const encField = document.createElement("input");
      encField.type = "hidden";
      encField.name = "encRequest";
      encField.value = encRequest;

      const accField = document.createElement("input");
      accField.type = "hidden";
      accField.name = "access_code";
      accField.value = accessCode;

      form.appendChild(encField);
      form.appendChild(accField);

      document.body.appendChild(form);
      form.submit();

      setProcessing(false);
    } catch (error) {
      console.error("Payment initiation failed:", error);
      toast.error("Failed to initiate payment. Please try again.");
      setProcessing(false);
    }
  };


  const createPendingBooking = async () => {
    const dateKey = formatDateKey(selectedDate);
    const bookingId = 'BK' + Date.now();

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

        // Block seats temporarily (for 15 minutes)
        const updatedAvailability = { ...currentAvailability };
        const expiryTime = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes from now

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
          status: 'pending_payment', // Important: pending status
          payment: {
            gateway: 'ccavenue',
            amount: getTotalAmount(),
            currency: 'INR'
          },
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          expiryTime: expiryTime // Auto-expire if payment not completed
        });
      });

      toast.success('Booking created. Redirecting to payment...');
      return bookingId;

    } catch (error) {
      console.error('Booking creation failed:', error);
      throw error;
    }
  };

  const redirectToCCAvenue = (encRequest, accessCode) => {
    console.log('\n=== CCAvenue Redirect Debug ===');
    console.log('🌐 Redirecting to CCAvenue...');
    console.log('📝 Form Details:');
    console.log('  Action URL: https://secure.ccavenue.com/transaction/transaction.do?command=initiateTransaction');
    console.log('  Method: POST');
    console.log('  Target: _self');
    console.log('🔑 Form Data:');
    console.log('  encRequest length:', encRequest?.length || 0);
    console.log('  encRequest preview:', encRequest?.substring(0, 50) + '...');
    console.log('  access_code:', accessCode);
    console.log('  access_code length:', accessCode?.length || 0);

    // Create form dynamically and submit to CCAvenue
    const form = document.createElement('form');
    form.method = 'post';
    form.action = 'https://secure.ccavenue.com/transaction/transaction.do?command=initiateTransaction';
    form.target = '_self'; // Ensure it opens in the same window

    const encInput = document.createElement('input');
    encInput.type = 'hidden';
    encInput.name = 'encRequest';
    encInput.value = encRequest;
    form.appendChild(encInput);

    const accInput = document.createElement('input');
    accInput.type = 'hidden';
    accInput.name = 'access_code';
    accInput.value = accessCode;
    form.appendChild(accInput);

    console.log('📋 Form created with', form.children.length, 'input fields');
    console.log('🚀 Submitting form to CCAvenue...');

    document.body.appendChild(form);
    form.submit();

    console.log('✅ Form submitted! User should be redirected to CCAvenue.');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50 flex flex-col justify-center items-center px-2 sm:px-4 py-4 sm:py-8">
      {/* Debug Overlay */}
      {showDebugOverlay && debugInfo && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-t-lg">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold flex items-center">
                  🔍 Payment Debug Information
                </h2>
                <div className="text-right">
                  <div className="text-2xl font-bold">{Math.floor(countdown / 60)}:{(countdown % 60).toString().padStart(2, '0')}</div>
                  <div className="text-sm opacity-90">Auto-redirect in</div>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Status */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-green-800 mb-2">✅ {debugInfo.status}</h3>
                <p className="text-green-700">Payment request created successfully! Page will redirect to CCAvenue automatically.</p>
              </div>

              {/* Quick Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-800">Payment Type</h4>
                  <p className="text-blue-600 text-lg">{debugInfo.paymentType}</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-purple-800">Merchant ID</h4>
                  <p className="text-purple-600 text-lg font-mono">{debugInfo.merchantId}</p>
                </div>
                <div className="bg-indigo-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-indigo-800">Booking ID</h4>
                  <p className="text-indigo-600 text-lg font-mono">{debugInfo.bookingId}</p>
                </div>
              </div>

              {/* Request Data */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">📤 Request Data Sent to API</h3>
                <pre className="text-sm bg-white p-3 rounded border overflow-x-auto">
                  {JSON.stringify(debugInfo.requestData, null, 2)}
                </pre>
              </div>

              {/* CCAvenue Details */}
              <div className="bg-orange-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-orange-800 mb-3">🏪 CCAvenue Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="font-medium">Access Code:</span>
                    <span className="font-mono text-orange-600">{debugInfo.accessCode}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Encrypted Data Length:</span>
                    <span className="text-orange-600">{debugInfo.encRequestLength} characters</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Encrypted Preview:</span>
                    <span className="font-mono text-orange-600 text-xs">{debugInfo.encRequestPreview}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Target URL:</span>
                    <span className="text-orange-600 text-xs break-all">{debugInfo.ccavenueUrl}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => {
                    window.location.href = '/api/test-ccavenue';
                  }}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  🔍 Check Environment Variables
                </button>
                <button
                  onClick={() => {
                    console.log('Manual redirect triggered');
                    redirectToCCAvenue(debugInfo.encRequest, debugInfo.accessCode);
                  }}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  🚀 Redirect Now (Don't Wait)
                </button>
                <button
                  onClick={() => {
                    setShowDebugOverlay(false);
                    setProcessing(false);
                  }}
                  className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  ❌ Cancel
                </button>
              </div>

              <div className="text-xs text-gray-500 border-t pt-4">
                <p><strong>Debug Timestamp:</strong> {debugInfo.timestamp}</p>
                <p><strong>Note:</strong> This debug overlay will disappear when redirecting to CCAvenue. Check browser console for detailed logs.</p>
              </div>
            </div>
          </div>
        </div>
      )}

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

            {/* Total Amount */}
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
                  <p className="font-semibold text-blue-800">Bank Grade Security</p>
                  <p className="text-blue-600">Powered by CCAvenue - India's leading payment gateway</p>
                </div>
              </div>
            </div>

            {/* Payment Button */}
            <button
              onClick={initiatePayment}
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
                  Creating Booking & Redirecting...
                </span>
              ) : (
                <>🚀 Pay ₹{getTotalAmount()} </>
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
                <span>Seats are temporarily blocked for 15 minutes during payment</span>
              </li>
              <li className="flex items-start">
                <span className="text-yellow-600 mr-2 mt-1">•</span>
                <span>Complete payment within 15 minutes to confirm booking</span>
              </li>
              <li className="flex items-start">
                <span className="text-yellow-600 mr-2 mt-1">•</span>
                <span>You'll receive email confirmation after successful payment</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentProcess;
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
  const [debugInfo, setDebugInfo] = useState(null);
  const [showDebugOverlay, setShowDebugOverlay] = useState(false);
  const [countdown, setCountdown] = useState(60); // 3 minutes for debug
  const [debugMode, setDebugMode] = useState(false);
  const [logs, setLogs] = useState([]);
  const router = useRouter();

  const { user } = useAuth();
  const {
    selectedDate,
    selectedShift,
    selectedSeats,
    getTotalAmount,
  } = useBooking();

  const { getShiftLabel, getShiftTime } = useShifts();

  // DEBUG: Add log capturing function
  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = `[${timestamp}] ${type.toUpperCase()}: ${message}`;
    setLogs(prev => [...prev, logEntry]);
    console.log(logEntry);
  };

  // DEBUG: Payment initiation function with 3-minute wait
  const initiatePayment = async () => {
    setProcessing(true);
    setDebugMode(true);
    setLogs([]);
    
    addLog('🚀 Payment initiation started');
    addLog(`Customer: ${customerDetails.name}`);
    addLog(`Amount: ₹${getTotalAmount()}`);
    addLog(`Seats: ${selectedSeats.join(', ')}`);

    try {
      // Step 1: Create booking with 'pending' status
      addLog('📝 Creating pending booking...');
      const bookingId = await createPendingBooking();
      addLog(`✅ Booking created: ${bookingId}`);

      // Step 2: Create payment request with FIXED payload
      const paymentPayload = {
        orderId: bookingId,
        amount: getTotalAmount(),
        billingName: customerDetails.name,
        billingEmail: customerDetails.email,
        billingTel: customerDetails.phone,
        billingAddress: customerDetails.address || 'Delhi, India',
        isIndia: true
      };

      addLog('💳 Creating payment request...');
      addLog(`Payload: ${JSON.stringify(paymentPayload, null, 2)}`);

      const paymentResponse = await fetch('/api/ccavenue/create-payment', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        },
        body: JSON.stringify(paymentPayload),
      });

      addLog(`API Response Status: ${paymentResponse.status}`);
      
      if (!paymentResponse.ok) {
        const errorData = await paymentResponse.json();
        addLog(`❌ Payment API error: ${JSON.stringify(errorData)}`, 'error');
        throw new Error(errorData.error || 'Failed to create payment request');
      }

      const responseData = await paymentResponse.json();
      addLog(`✅ API Response received: ${JSON.stringify(responseData.debug || {})}`);
      
      if (!responseData.success) {
        addLog('❌ Payment request creation failed', 'error');
        throw new Error('Payment request creation failed');
      }

      const { encRequest, accessCode } = responseData;

      if (!encRequest || !accessCode) {
        addLog('❌ Missing payment parameters from API', 'error');
        throw new Error('Missing payment parameters from API');
      }

      addLog(`🔐 Encryption successful: ${encRequest.length} chars`);
      addLog(`🔑 Access code: ${accessCode}`);
      
      // FIXED: Immediate redirect instead of debug countdown
      addLog('🚀 Proceeding to CCAvenue payment...');
      addLog('📖 Check browser console for detailed logs!');
      
      // Store data and submit immediately
      setDebugInfo({ encRequest, accessCode, bookingId });
      
      // Submit immediately instead of waiting
      setTimeout(() => {
        submitToCCAvenue(encRequest, accessCode, bookingId);
      }, 2000); // Small delay to capture logs, then redirect
      
    } catch (error) {
      addLog(`❌ Payment initiation failed: ${error.message}`, 'error');
      toast.error(error.message || "Failed to initiate payment. Please try again.");
      setProcessing(false);
      setDebugMode(false);
    }
  };
  
  // Submit to CCAvenue after debug period
  const submitToCCAvenue = (encRequest, accessCode, bookingId) => {
    addLog('🚀 Debug period complete, submitting to CCAvenue...');
    
    // FIXED: Use direct property assignment instead of setAttribute to prevent URL issues
    const form = document.createElement("form");
    form.method = "POST";  // Direct assignment
    form.action = "https://secure.ccavenue.com/transaction/transaction.do?command=initiateTransaction";  // Direct assignment
    form.target = "_self";
    form.style.display = "none";

    const encInput = document.createElement("input");
    encInput.type = "hidden";
    encInput.name = "encRequest";
    encInput.value = encRequest;

    const accInput = document.createElement("input");
    accInput.type = "hidden";
    accInput.name = "access_code";
    accInput.value = accessCode;

    form.appendChild(encInput);
    form.appendChild(accInput);
    document.body.appendChild(form);
    
    addLog('📋 FIXED: Form created with direct property assignment');
    addLog(`Form action: ${form.action}`);
    addLog(`Form method: ${form.method}`);
    addLog(`encRequest field: ${!!form.querySelector('input[name="encRequest"]')}`);
    addLog(`access_code field: ${!!form.querySelector('input[name="access_code"]')}`);
    addLog(`encRequest length: ${encRequest.length}`);
    addLog(`access_code value: ${accessCode}`);
    
    // FIXED: More lenient validation and better debugging
    addLog(`🔍 Form validation check:`);
    addLog(`  Action URL: ${form.action}`);
    addLog(`  Method: ${form.method}`);
    addLog(`  Contains ccavenue: ${form.action.includes('ccavenue.com')}`);
    addLog(`  Method is POST: ${form.method.toUpperCase() === 'POST'}`);
    
    // FIXED: More flexible validation
    if (form.action.includes('ccavenue.com') && form.method.toUpperCase() === 'POST') {
      addLog('✅ Form validation passed, submitting to CCAvenue...');
      addLog('⚠️ Note: If you get 10002 error, check merchant credentials');
      form.submit();
    } else {
      addLog('❌ Form validation failed!', 'error');
      addLog(`Expected action to contain 'ccavenue.com', got: ${form.action}`, 'error');
      addLog(`Expected method 'POST', got: ${form.method}`, 'error');
      
      // Try submitting anyway for debugging
      addLog('⚠️ Attempting submission anyway for debugging...', 'error');
      form.submit();
    }
  };
  
  // Skip debug and submit immediately
  const skipDebugAndSubmit = () => {
    if (debugInfo) {
      addLog('⚡ Skipping debug, submitting immediately...');
      submitToCCAvenue(debugInfo.encRequest, debugInfo.accessCode, debugInfo.bookingId);
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
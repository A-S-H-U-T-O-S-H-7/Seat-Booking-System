"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useStallBooking } from '@/context/StallBookingContext';
import { db } from '@/lib/firebase';
import { collection, addDoc, doc, runTransaction, serverTimestamp } from 'firebase/firestore';
import { toast } from 'react-hot-toast';
import { ShoppingBag, CreditCard, CheckCircle, Shield, Building, User, Phone, Mail, MapPin } from 'lucide-react';

const StallPaymentProcess = ({ vendorDetails }) => {
  const [processing, setProcessing] = useState(false);
  const [eventDetails, setEventDetails] = useState({
    startDate: null,
    endDate: null,
    duration: 'Loading...',
    formattedDuration: 'Loading...'
  });
  const router = useRouter();
  const { user } = useAuth();
  const { 
    selectedStalls, 
    getTotalAmount, 
    getBaseAmount, 
    getDiscountAmount, 
    getTaxAmount,
    priceSettings,
    clearSelection 
  } = useStallBooking();
  
  // Fetch event dates from system settings
  useEffect(() => {
    const fetchEventDates = async () => {
      try {
        const { getStallEventSettings, formatEventDuration, calculateEventDays } = await import('@/services/systemSettingsService');
        const stallSettings = await getStallEventSettings();
        
        const startDate = new Date(stallSettings.startDate);
        const endDate = new Date(stallSettings.endDate);
        const days = calculateEventDays(stallSettings.startDate, stallSettings.endDate);
        const formattedDuration = formatEventDuration(stallSettings.startDate, stallSettings.endDate);
        
        setEventDetails({
          startDate,
          endDate,
          duration: `${days} day${days > 1 ? 's' : ''}`,
          formattedDuration
        });
      } catch (error) {
        // Use fallback values if fetch fails
        const startDate = new Date('2025-11-15');
        const endDate = new Date('2025-11-20');
        setEventDetails({
          startDate,
          endDate,
          duration: '5 days',
          formattedDuration: 'Nov 15 - Nov 20, 2025 (5 Days)'
        });
      }
    };
    
    fetchEventDates();
  }, []);

  const generateBookingId = async () => {
    const { generateSequentialBookingId } = await import('@/services/bookingIdService');
    return await generateSequentialBookingId('stall');
  };

  const initiatePayment = async () => {
    // Validate vendor details
    const requiredFields = ['ownerName', 'email', 'phone', 'businessType', 'aadhar'];
    if (requiredFields.some(field => !vendorDetails[field])) {
      toast.error('Please fill all required vendor details before completing booking');
      return;
    }
    
    if (selectedStalls.length === 0) {
      toast.error('Please select at least one stall before proceeding');
      return;
    }
    
    setProcessing(true);
    
    try {
      // Create pending booking first
      const generatedBookingId = await generateBookingId();
      
      // Create pending booking in Firebase
      await processStallBooking({
        paymentId: 'pending_' + Date.now(),
        orderId: generatedBookingId,
        amount: getTotalAmount(),
        status: 'pending_payment'
      }, generatedBookingId);
      
      // Prepare payment data for CCAvenue
      const paymentData = {
        order_id: generatedBookingId,
        purpose: 'stall_booking', // Required to identify payment type
        amount: getTotalAmount().toString(),
        name: vendorDetails.ownerName,
        email: vendorDetails.email,
        phone: vendorDetails.phone,
        address: vendorDetails.address || 'Delhi, India'
      };
      
      // Send request to CCAvenue API
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
      
      if (!data.status) {
        const errorMessage = data.errors ? data.errors.join(', ') : 'Payment request failed';
        throw new Error(errorMessage);
      }
      
      if (!data.encRequest || !data.access_code) {
        throw new Error('Invalid response from payment API');
      }
      
      // Redirect to CCAvenue
      submitToCCAvenue(data.encRequest, data.access_code, generatedBookingId);
      
    } catch (error) {
      toast.error(error.message || 'Failed to initiate payment. Please try again.');
    } finally {
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

  const processStallBooking = async (paymentData, bookingId) => {
    const generatedBookingId = bookingId || generateBookingId();
    
    try {
      await runTransaction(db, async (transaction) => {
        // Check stall availability one more time
        const availabilityRef = doc(db, 'stallAvailability', 'current');
        const availabilityDoc = await transaction.get(availabilityRef);
        
        const currentAvailability = availabilityDoc.exists() 
          ? availabilityDoc.data().stalls || {}
          : {};

        // Verify all selected stalls are still available
        for (const stallId of selectedStalls) {
          if (currentAvailability[stallId]?.booked || currentAvailability[stallId]?.blocked) {
            throw new Error(`Stall ${stallId} is no longer available`);
          }
        }

        // Block stalls temporarily (for 5 minutes) during payment processing
        const updatedAvailability = { ...currentAvailability };
        const expiryTime = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now
        
        selectedStalls.forEach(stallId => {
          updatedAvailability[stallId] = {
            booked: false,
            blocked: true,
            userId: user.uid,
            vendorName: vendorDetails.ownerName,
            businessName: vendorDetails.businessType,
            bookingId: generatedBookingId,
            blockedAt: serverTimestamp(),
            expiryTime: expiryTime
          };
        });

        transaction.set(availabilityRef, {
          stalls: updatedAvailability,
          updatedAt: serverTimestamp()
        }, { merge: true });

        // Create a single booking record for all stalls
        const bookingRef = doc(db, 'stallBookings', generatedBookingId);
        transaction.set(bookingRef, {
          id: generatedBookingId,
          bookingId: generatedBookingId,
          userId: user.uid,
          vendorDetails,
          stallIds: selectedStalls, // Array of all selected stall IDs
          numberOfStalls: selectedStalls.length,
          duration: eventDetails.duration || '5 days',
          totalAmount: getTotalAmount(), // Total amount for all stalls
          payment: {
            ...paymentData,
            amount: getTotalAmount()
          },
          status: paymentData.status || 'pending_payment',
          type: 'stall',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          expiryTime: expiryTime, // Auto-expire if payment not completed
          eventDetails: {
            startDate: eventDetails.startDate || new Date('2025-11-15'),
            endDate: eventDetails.endDate || new Date('2025-11-20'),
            duration: eventDetails.duration || '5 days',
            type: 'vendor_stall'
          }
        });
      });
      
    } catch (error) {
      throw error;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex flex-col justify-center items-center px-2 sm:px-4 py-4 sm:py-8">
      <div className="bg-white shadow-xl rounded-xl sm:rounded-2xl max-w-4xl w-full overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-4 sm:px-6 py-4 sm:py-5">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white text-center">Complete Stall Payment</h2>
          <p className="text-blue-100 text-center mt-1 sm:mt-2 text-sm sm:text-base">Your contribution brings hope — in classrooms, homes, and communities😊</p>
        </div>

        <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
          {/* Final Booking Summary */}
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200 rounded-lg sm:rounded-xl p-3 sm:p-4">
            <h3 className="text-lg sm:text-xl font-bold text-blue-800 mb-3 sm:mb-4 flex items-center">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-500 rounded-full flex items-center justify-center mr-2 sm:mr-3">
                <span className="text-white font-bold text-sm sm:text-base">📋</span>
              </div>
              Final Summary
            </h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 mb-3 sm:mb-4">
              {/* Vendor Details */}
              <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm border border-blue-200">
                <h4 className="font-semibold text-blue-700 mb-2 sm:mb-3 flex items-center text-sm sm:text-base">
                  <span className="text-base sm:text-lg mr-2">👤</span>
                  Vendor Details
                </h4>
                <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm text-gray-700">
                  <p><span className="font-medium text-gray-900">Contact Person:</span> {vendorDetails.ownerName}</p>
                  <p><span className="font-medium text-gray-900">Email:</span> {vendorDetails.email}</p>
                  <p><span className="font-medium text-gray-900">Phone:</span> {vendorDetails.phone}</p>
                  <p><span className="font-medium text-gray-900">Business Type:</span> {vendorDetails.businessType}</p>
                  <p><span className="font-medium text-gray-900">Aadhar:</span> {vendorDetails.aadhar}</p>
                </div>
              </div>

              {/* Stall Details */}
              <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm border border-blue-200">
                <h4 className="font-semibold text-blue-700 mb-2 sm:mb-3 flex items-center text-sm sm:text-base">
                  <span className="text-base sm:text-lg mr-2">🏢</span>
                  Stall Details
                </h4>
                <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm text-gray-700">
                  <p><span className="font-medium text-gray-900">Stall IDs:</span> {selectedStalls && selectedStalls.length > 0 ? selectedStalls.join(', ') : 'N/A'}</p>
                  <p><span className="font-medium text-gray-900">Event Duration:</span> {eventDetails.formattedDuration}</p>
                  <p><span className="font-medium text-gray-900">Location:</span> Delhi NCR Noida Stadium</p>
                  <p><span className="font-medium text-gray-900">Facilities:</span> Electricity, Water, Loading Access</p>
                </div>
              </div>
            </div>

            {/* Total Amount - Highlighted */}
            <div className="bg-gradient-to-r from-purple-100 to-blue-100 border border-purple-300 rounded-lg sm:rounded-xl p-3 sm:p-4">
              <div className="flex flex-col sm:flex-row justify-between items-center text-center sm:text-left">
                <div className="mb-2 sm:mb-0">
                  <h4 className="text-base sm:text-lg font-semibold text-purple-800">Total Amount to Pay</h4>
                  <p className="text-xs max-w-lg mt-2 sm:text-sm text-orange-600">All payments made for Havan seats, stalls, and show seats will be considered <span className="font-bold text-sm">Donations</span> to <span className="font-bold text-sm">SVS</span>. With your contribution, you will become a valued member of SVS, and your donation will be eligible for exemption under <span className="font-bold text-sm">Section 80G</span> of the Income Tax Act."</p>
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-purple-800 bg-white px-4 py-2 sm:px-6 sm:py-3 rounded-lg sm:rounded-xl shadow-md">
                  ₹{getTotalAmount?.() || 0}
                </div>
              </div>
            </div>
          </div>

          {/* Payment Section */}
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-200 rounded-lg sm:rounded-xl p-3 sm:p-4">
            <h3 className="text-lg sm:text-xl font-bold text-indigo-800 mb-3 sm:mb-4 flex items-center">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-indigo-500 rounded-full flex items-center justify-center mr-2 sm:mr-3">
                <span className="text-white font-bold text-sm sm:text-base">💳</span>
              </div>
              Secure Payment
            </h3>
            
            {/* Security Info */}
            <div className="mb-3 sm:mb-4">
              <div className="flex items-center p-3 bg-white rounded-lg shadow-sm border border-indigo-200">
                <div className="text-indigo-600 mr-3 text-xl sm:text-2xl">🔒</div>
                <div className="text-xs sm:text-sm">
                  <p className="font-semibold text-indigo-800">Bank Grade Security</p>
                  <p className="text-indigo-600">Powered by CCAvenue - India's leading payment gateway</p>
                </div>
              </div>
            </div>

            {/* Payment Button */}
            <button
              onClick={initiatePayment}
              disabled={processing}
              className={`w-full py-3 cursor-pointer sm:py-4 px-4 sm:px-6 rounded-lg sm:rounded-xl font-bold text-base sm:text-lg transition-all duration-300 transform ${
                processing
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl'
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
                <span className="flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 mr-2" />
                  Pay ₹{getTotalAmount?.() || 0}
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

export default StallPaymentProcess;
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
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [bookingId, setBookingId] = useState('');
  const [countdown, setCountdown] = useState(15);
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

  const generateBookingId = () => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `STALL-${timestamp}-${random}`;
  };

  // Simulate payment processing (replace with actual payment gateway integration)
  const initiatePayment = async () => {
    setProcessing(true);
    
    try {
      // Simulate payment processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate successful payment
      const paymentId = 'pay_' + Math.random().toString(36).substr(2, 9);
      const orderId = 'order_' + Math.random().toString(36).substr(2, 9);
      
      await processStallBooking({
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

  const processStallBooking = async (paymentData) => {
    const generatedBookingId = generateBookingId();
    
    console.log('Processing stall booking for stalls:', selectedStalls);
    console.log('Total amount:', getTotalAmount());
    console.log('Number of stalls:', selectedStalls.length);
    
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
          if (currentAvailability[stallId]?.booked) {
            throw new Error(`Stall ${stallId} is no longer available`);
          }
        }

        // Update stall availability for all selected stalls
        const updatedAvailability = { ...currentAvailability };
        selectedStalls.forEach(stallId => {
          updatedAvailability[stallId] = {
            booked: true,
            userId: user.uid,
            vendorName: vendorDetails.ownerName,
            businessName: vendorDetails.businessType,
            bookingId: generatedBookingId,
            bookedAt: serverTimestamp()
          };
        });

        transaction.set(availabilityRef, {
          stalls: updatedAvailability,
          updatedAt: serverTimestamp()
        }, { merge: true });

        // Create a single booking record for all stalls
        console.log('Creating single booking record for stalls:', selectedStalls);
        const bookingRef = doc(db, 'stallBookings', generatedBookingId);
        transaction.set(bookingRef, {
          id: generatedBookingId,
          bookingId: generatedBookingId,
          userId: user.uid,
          vendorDetails,
          stallIds: selectedStalls, // Array of all selected stall IDs
          numberOfStalls: selectedStalls.length,
          duration: '5 days',
          totalAmount: getTotalAmount(), // Total amount for all stalls
          payment: {
            ...paymentData,
            amount: getTotalAmount()
          },
          status: 'confirmed',
          type: 'stall',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          eventDetails: {
            startDate: new Date('2025-11-15'),
            endDate: new Date('2025-11-20'),
            type: 'vendor_stall'
          }
        });
      });

      console.log('Transaction completed successfully for booking ID:', generatedBookingId);
      setBookingId(generatedBookingId);
      
      // In real implementation, trigger email confirmation here
      toast.success(`Stall booking confirmed! ${selectedStalls.length} stall(s) booked successfully. Confirmation email sent.`);
      
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
            // Use setTimeout to prevent setState during render
            setTimeout(() => {
              router.push('/profile');
            }, 100);
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
    // Use setTimeout to prevent setState during render
    setTimeout(() => {
      window.location.reload();
    }, 100);
  };

  const goToProfile = () => {
    // Use setTimeout to prevent setState during render
    setTimeout(() => {
      router.push('/profile');
    }, 100);
  };

  // Success screen
  if (paymentSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex flex-col justify-center items-center px-2 sm:px-4 py-3 sm:py-6">
        <div className="bg-white shadow-xl rounded-xl sm:rounded-2xl max-w-4xl w-full overflow-hidden border border-blue-200">
          {/* Success Header */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-3 sm:px-5 py-3 sm:py-4 text-center">
            <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-2 sm:mb-3 bg-white rounded-full flex items-center justify-center shadow-lg">
              <div className="w-8 h-8 sm:w-10 sm:h-10 text-blue-500 text-2xl sm:text-3xl font-bold flex items-center justify-center">✓</div>
            </div>
            
            <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-1">
              🎉 {selectedStalls.length > 1 ? 'Multi-Stall Reservation Confirmed!' : 'Stall Reservation Confirmed!'}
            </h3>
            
            <p className="text-blue-100 text-sm sm:text-base">
              Your {selectedStalls.length > 1 ? `${selectedStalls.length} vendor stalls have` : 'vendor stall has'} been successfully reserved
            </p>
          </div>

          <div className="p-2 sm:p-4 space-y-3 sm:space-y-4">
            {/* Booking Details */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-2 sm:p-3">
              <h4 className="text-base sm:text-lg font-bold text-blue-800 mb-2 sm:mb-3 flex items-center">
                <div className="w-5 h-5 sm:w-6 sm:h-6 bg-blue-500 rounded-full flex items-center justify-center mr-2">
                  <span className="text-white font-bold text-xs sm:text-sm">📋</span>
                </div>
                Stall Reservation Details
              </h4>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                <div className="bg-white rounded-md p-2 sm:p-3 shadow-sm border border-blue-200">
                  <p className="text-xs text-gray-600 mb-1">Reservation ID</p>
                  <p className="font-bold text-blue-800 text-xs sm:text-sm break-all">{bookingId}</p>
                </div>
                
                <div className="bg-white rounded-md p-2 sm:p-3 shadow-sm border border-blue-200">
                  <p className="text-xs text-gray-600 mb-1">Stall IDs</p>
                  <p className="font-bold text-blue-800 text-xs sm:text-sm">
                    {selectedStalls && selectedStalls.length > 0 
                      ? selectedStalls.slice(0, 3).join(', ') + (selectedStalls.length > 3 ? ` +${selectedStalls.length - 3} more` : '')
                      : 'N/A'
                    }
                  </p>
                </div>
                
                <div className="bg-white rounded-md p-2 sm:p-3 shadow-sm border border-blue-200 col-span-2 sm:col-span-1">
                  <p className="text-xs text-gray-600 mb-1">Duration</p>
                  <p className="font-bold text-blue-800 text-xs sm:text-sm">5 Days</p>
                </div>
                
                <div className="bg-white rounded-md p-2 sm:p-3 shadow-sm border border-blue-200">
                  <p className="text-xs text-gray-600 mb-1">Business Type</p>
                  <p className="font-bold text-blue-800 text-xs sm:text-sm break-all">{vendorDetails?.businessType}</p>
                </div>
                
                <div className="bg-white rounded-md p-2 sm:p-3 shadow-sm border border-blue-200">
                  <p className="text-xs text-gray-600 mb-1">Contact Person</p>
                  <p className="font-bold text-blue-800 text-xs sm:text-sm">{vendorDetails?.ownerName}</p>
                </div>
                
                <div className="bg-gradient-to-r from-purple-100 to-indigo-100 rounded-md p-2 sm:p-3 shadow-sm border border-purple-300">
                  <p className="text-xs text-purple-700 mb-1">Total Amount</p>
                  <p className="font-bold text-purple-800 text-sm sm:text-base">₹{getTotalAmount()}</p>
                </div>
              </div>
            </div>

            {/* Email Confirmation */}
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-200 rounded-lg p-2 sm:p-3">
              <div className="flex items-start">
                <div className="text-xl sm:text-2xl mr-2 sm:mr-3 flex-shrink-0">📧</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm sm:text-base font-semibold text-indigo-800">Confirmation Email Sent</p>
                  <p className="text-xs sm:text-sm text-indigo-600">
                    A detailed confirmation has been sent to
                  </p>
                  <p className="text-xs sm:text-sm text-indigo-800 font-medium break-words break-all">
                    {vendorDetails?.email}
                  </p>
                </div>
              </div>
            </div>

            {/* Auto-redirect Countdown */}
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-2 sm:p-3">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-purple-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg sm:text-xl shadow-lg">
                  {countdown}
                </div>
                <div className="text-center sm:text-left">
                  <p className="text-purple-800 font-bold text-sm sm:text-base">
                    Auto-redirecting to Profile
                  </p>
                  <p className="text-xs sm:text-sm text-purple-600">
                    Redirecting in {countdown} second{countdown > 1 ? 's' : ''}...
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
              <button
                onClick={goToProfile}
                className="bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white py-2 sm:py-3 rounded-md sm:rounded-lg font-bold text-sm sm:text-base transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center"
              >
                <span className="mr-1 sm:mr-2">🏠</span>
                Go to Profile Now
              </button>
              
              <button
                onClick={handleNewBooking}
                className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white py-2 sm:py-3 rounded-md sm:rounded-lg font-bold text-sm sm:text-base transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center"
              >
                <span className="mr-1 sm:mr-2">🏪</span>
                Reserve Another Stall
              </button>
            </div>
            
            {/* Important Note */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-2 sm:p-3">
              <p className="text-xs text-gray-600 text-center">
                💾 Please save this confirmation and bring valid business documents to the event setup.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
                  <p><span className="font-medium text-gray-900">Event Duration:</span> 5 Days (Nov 15-20, 2025)</p>
                  <p><span className="font-medium text-gray-900">Location:</span> Main Exhibition Area</p>
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
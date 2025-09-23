"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useShowSeatBooking } from '@/context/ShowSeatBookingContext';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import { CreditCard, Calendar, Users, Clock, CheckCircle, AlertCircle } from 'lucide-react';

const ShowPaymentProcess = () => {
  const [processing, setProcessing] = useState(false);
  const router = useRouter();
  
  const { user } = useAuth();
  const {
    selectedDate,
    selectedSeats,
    totalPrice,
    getTotalAmount,
    getDiscountAmount,
    getBaseAmount,
    getEarlyBirdDiscount,
    getBulkDiscount,
    getCurrentDiscountInfo,
    clearSelection,
    processBooking,
    bookingData
  } = useShowSeatBooking();
  
  const userDetails = bookingData.userDetails || {};

  const completeBooking = async () => {
    
    // Validate that all required user details are filled
    const requiredFields = ['name', 'email', 'phone', 'aadhar', 'address'];
    if (requiredFields.some(field => !userDetails[field])) {
      toast.error('Please fill all required details before completing booking');
      return;
    }
    
    setProcessing(true);
    
    try {
      
      // Create pending booking first
      const result = await processBooking(userDetails, {
        method: 'pending_payment',
        transactionId: 'pending_' + Date.now()
      });
        
      if (result.success) {
        const bookingId = result.bookingId;
        
        // Use discounted total amount for payment
        const finalAmount = getTotalAmount();
        
        // Prepare payment data for CCAvenue
        const paymentData = {
          order_id: bookingId,
          purpose: 'show', // Required to identify payment type
          amount: finalAmount.toString(),
          name: userDetails.name,
          email: userDetails.email,
          phone: userDetails.phone,
          address: userDetails.address || 'Delhi, India'
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
        submitToCCAvenue(data.encRequest, data.access_code, bookingId);
        
      } else {
        toast.error(result.error || 'Booking failed. Please try again.');
      }
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


  // Main payment screen
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50 flex flex-col justify-center items-center px-2 sm:px-4 py-4 sm:py-8">
      <div className="bg-white shadow-xl rounded-xl sm:rounded-2xl max-w-4xl w-full overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-pink-400 via-pink-400 to-rose-400 px-4 sm:px-6 py-4 sm:py-5">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white text-center">Complete Your Reservation</h2>
          <p className="text-pink-100 text-center mt-1 sm:mt-2 text-sm sm:text-base">Your contribution brings hope — in classrooms, homes, and communities😊</p>
        </div>

        <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
          {/* Final Booking Summary */}
          <div className="bg-gradient-to-br from-pink-50 via-white to-rose-50 border border-pink-200 rounded-lg sm:rounded-xl p-3 sm:p-4">
            <h3 className="text-lg sm:text-xl font-bold text-rose-800 mb-3 sm:mb-4 flex items-center">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-pink-400 to-rose-500 rounded-full flex items-center justify-center mr-2 sm:mr-3">
                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              Final Summary
            </h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 mb-3 sm:mb-4">
              {/* Customer Details */}
              <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm border border-pink-200">
                <h4 className="font-semibold text-rose-700 mb-2 sm:mb-3 flex items-center text-sm sm:text-base">
                  <Users className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-pink-500" />
                  Your Details
                </h4>
                <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm text-gray-700">
                  <p><span className="font-medium text-gray-900">Name:</span> {userDetails.name || 'N/A'}</p>
                  <p><span className="font-medium text-gray-900">Email:</span> {userDetails.email || 'N/A'}</p>
                  <p><span className="font-medium text-gray-900">Phone:</span> {userDetails.phone || 'N/A'}</p>
                </div>
              </div>

              {/* Show Details */}
              <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm border border-pink-200">
                <h4 className="font-semibold text-rose-700 mb-2 sm:mb-3 flex items-center text-sm sm:text-base">
                  <Calendar className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-pink-500" />
                  Show Details
                </h4>
                <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm text-gray-700">
                  <p><span className="font-medium text-gray-900">Date:</span> {selectedDate ? (
                    typeof selectedDate === 'string' 
                      ? format(new Date(selectedDate), 'MMM dd, yyyy')
                      : format(selectedDate, 'MMM dd, yyyy')
                  ) : 'N/A'}</p>
                  <p><span className="font-medium text-gray-900">Time:</span> 5:00 PM - 10:00 PM</p>
                  <p><span className="font-medium text-gray-900">Seats:</span> {selectedSeats.length} seat{selectedSeats.length > 1 ? 's' : ''}</p>
                  <p><span className="font-medium text-gray-900">Seat Numbers:</span><span className="font-bold text-gray-900">  {selectedSeats.slice(0, 5).join(', ')}{selectedSeats.length > 5 ? ` +${selectedSeats.length - 5} more` : ''}</span></p>
                </div>
              </div>
            </div>

            {/* Pricing Breakdown */}
            <div className="bg-gradient-to-r from-pink-100 via-white to-rose-100 border border-pink-300 rounded-lg sm:rounded-xl p-3 sm:p-4">
              <div className="flex flex-col sm:flex-row justify-between items-start text-center sm:text-left gap-4">
                <div className="flex-1">
                  
                 
                        
                       
                    
                    <div className="flex justify-between items-center font-bold text-lg">
                      <span className="text-rose-800">Total Amount:</span>
                      {/* <span className="text-rose-800">₹{getTotalAmount()?.toLocaleString('en-IN') || 0}</span> */}
                    </div>
                
                  
                  <p className="text-xs max-w-lg mt-3 text-orange-600">All payments made for Havan seats, stalls, and show seats will be considered <span className="font-bold text-sm">Donations</span> to <span className="font-bold text-sm">SVS</span>. With your contribution, you will become a valued member of SVS, and your donation will be eligible for exemption under <span className="font-bold text-sm">Section 80G</span> of the Income Tax Act.</p>
                </div>
                
                <div className="bg-white px-4 py-6 sm:px-6 rounded-lg sm:rounded-xl shadow-md border-2 border-rose-200">
                  <div className="text-center">
                    <p className="text-sm font-medium text-rose-600 mb-1">Final Amount</p>
                    <div className="text-2xl sm:text-3xl font-bold text-rose-800">
                      ₹{(getTotalAmount() || 0).toLocaleString('en-IN')}
                    </div>
                    {getDiscountAmount() > 0 && (
                      <div className="mt-2 space-y-1">
                        <p className="text-xs text-gray-500 line-through">
                          Price ₹{(getBaseAmount() || 0).toLocaleString('en-IN')}
                        </p>
                        <p className="text-sm text-green-600 font-semibold">
                          You saved ₹{(getDiscountAmount() || 0).toLocaleString('en-IN')}!
                        </p>
                        
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Section */}
          <div className="bg-gradient-to-br from-rose-50 via-white to-pink-50 border border-rose-200 rounded-lg sm:rounded-xl p-3 sm:p-4">
            <h3 className="text-lg sm:text-xl font-bold text-rose-800 mb-3 sm:mb-4 flex items-center">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-pink-400 to-rose-500 rounded-full flex items-center justify-center mr-2 sm:mr-3">
                <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              Secure Payment
            </h3>
            
            {/* Security Info */}
            <div className="mb-3 sm:mb-4">
              <div className="flex items-center p-3 bg-white rounded-lg shadow-sm border border-rose-200">
                <div className="text-blue-600 mr-3 text-xl sm:text-2xl">🔒</div>
                <div className="text-xs sm:text-sm">
                  <p className="font-semibold text-rose-800">Bank Grade Security</p>
                  <p className="text-rose-600">Powered by CCAvenue - India's leading payment gateway</p>
                </div>
              </div>
            </div>

            {/* Payment Button */}
            <button
              onClick={completeBooking}
              disabled={processing}
              className={`w-full py-3 sm:py-4 px-4 sm:px-6 rounded-lg sm:rounded-xl font-bold text-base sm:text-lg transition-all duration-300 transform ${
                processing
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-pink-400 via-pink-500 to-rose-500 hover:from-pink-500 hover:via-pink-600 hover:to-rose-600 cursor-pointer shadow-lg hover:shadow-xl'
              } text-white`}
            >
              {processing ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 sm:h-6 sm:w-6 text-white mr-2 sm:mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                  </svg>
                  Processing Booking...
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 mr-2" />
                  Pay ₹{(getTotalAmount() || 0).toLocaleString('en-IN')}
                </span>
              )}
            </button>

            <p className="text-xs text-gray-500 text-center mt-2 sm:mt-3">
              By clicking "Complete Booking", you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShowPaymentProcess;
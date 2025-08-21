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
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [bookingId, setBookingId] = useState('');
  const [countdown, setCountdown] = useState(15);
  const router = useRouter();
  
  const { user } = useAuth();
  const {
    selectedDate,
    selectedSeats,
    totalPrice,  
    clearSelection,
    processBooking,
    bookingData
  } = useShowSeatBooking();
  
  const userDetails = bookingData.userDetails || {};

  const completeBooking = async () => {
    console.log('completeBooking called with userDetails:', userDetails);
    
    // Validate that all required user details are filled
    const requiredFields = ['name', 'email', 'phone', 'aadhar', 'address'];
    if (requiredFields.some(field => !userDetails[field])) {
      toast.error('Please fill all required details before completing booking');
      return;
    }
    
    setProcessing(true);
    
    try {
      console.log('Processing booking...');
      
      const result = await processBooking(userDetails, {
        method: 'cash',
        transactionId: 'simulated_' + Math.random().toString(36).substr(2, 9)
      });
      
      console.log('processBooking result:', result);
        
      if (result.success) {
        setBookingId(result.bookingId);
        setPaymentSuccess(true);
        toast.success('Booking completed successfully!');
      } else {
        console.error('Booking failed:', result.error);
        toast.error(result.error || 'Booking failed. Please try again.');
      }
    } catch (error) {
      console.error('Booking failed:', error);
      toast.error('Booking failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  // Auto-redirect countdown effect
  useEffect(() => {
    if (paymentSuccess) {
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
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
    setTimeout(() => {
      window.location.reload();
    }, 100);
  };

  const goToProfile = () => {
    setTimeout(() => {
      router.push('/profile');
    }, 100);
  };

  // Success screen
  if (paymentSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50 flex flex-col justify-center items-center px-2 sm:px-4 py-3 sm:py-6">
        <div className="bg-white shadow-xl rounded-xl sm:rounded-2xl max-w-4xl w-full overflow-hidden border border-pink-200">
          {/* Success Header */}
          <div className="bg-gradient-to-r from-pink-400 via-pink-500 to-rose-500 px-3 sm:px-5 py-3 sm:py-4 text-center">
            <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-2 sm:mb-3 bg-white rounded-full flex items-center justify-center shadow-lg">
              <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-pink-500" />
            </div>
            
            <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-1">
              Show Seats Reservation Confirmed!
            </h3>
            
            <p className="text-pink-100 text-sm sm:text-base">
              Your show seat{selectedSeats.length > 1 ? 's have' : ' has'} been successfully reserved
            </p>
          </div>

          <div className="p-2 sm:p-4 space-y-3 sm:space-y-4">
            {/* Booking Details */}
            <div className="bg-gradient-to-br from-pink-50 via-white to-rose-50 border border-pink-200 rounded-lg p-2 sm:p-3">
              <h4 className="text-base sm:text-lg font-bold text-rose-800 mb-2 sm:mb-3 flex items-center">
                <div className="w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-r from-pink-400 to-rose-500 rounded-full flex items-center justify-center mr-2">
                  <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                </div>
                Show Reservation Details
              </h4>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                <div className="bg-white rounded-md p-2 sm:p-3 shadow-sm border border-pink-200">
                  <p className="text-xs text-gray-600 mb-1">Reservation ID</p>
                  <p className="font-bold text-rose-800 text-xs sm:text-sm break-all">{bookingId}</p>
                </div>
                
                <div className="bg-white rounded-md p-2 sm:p-3 shadow-sm border border-pink-200">
                  <p className="text-xs text-gray-600 mb-1">Seat Numbers</p>
                  <p className="font-bold text-rose-800 text-xs sm:text-sm">
                    {selectedSeats.length > 0 
                      ? selectedSeats.slice(0, 3).join(', ') + (selectedSeats.length > 3 ? ` +${selectedSeats.length - 3}` : '')
                      : 'N/A'
                    }
                  </p>
                </div>
                
                <div className="bg-white rounded-md p-2 sm:p-3 shadow-sm border border-pink-200 col-span-2 sm:col-span-1">
                  <p className="text-xs text-gray-600 mb-1">Show Date</p>
                  <p className="font-bold text-rose-800 text-xs sm:text-sm">
                    {selectedDate ? (
                      typeof selectedDate === 'string' 
                        ? format(new Date(selectedDate), 'MMM dd, yyyy')
                        : format(selectedDate, 'MMM dd, yyyy')
                    ) : 'N/A'}
                  </p>
                </div>
                
                <div className="bg-white rounded-md p-2 sm:p-3 shadow-sm border border-pink-200">
                  <p className="text-xs text-gray-600 mb-1">Show Time</p>
                  <p className="font-bold text-rose-800 text-xs sm:text-sm">5:00 PM - 10:00 PM</p>
                </div>
                
                <div className="bg-white rounded-md p-2 sm:p-3 shadow-sm border border-pink-200">
                  <p className="text-xs text-gray-600 mb-1">Customer Name</p>
                  <p className="font-bold text-rose-800 text-xs sm:text-sm">{userDetails.name || 'N/A'}</p>
                </div>
                
                <div className="bg-gradient-to-r from-pink-100 via-white to-rose-100 rounded-md p-2 sm:p-3 shadow-sm border border-pink-300">
                  <p className="text-xs text-pink-700 mb-1">Total Amount</p>
                  <p className="font-bold text-rose-800 text-sm sm:text-base">₹{totalPrice?.toLocaleString('en-IN') || 0}</p>
                </div>
              </div>
            </div>

            {/* Email Confirmation */}
            <div className="bg-gradient-to-br from-rose-50 via-white to-pink-50 border border-rose-200 rounded-lg p-2 sm:p-3">
              <div className="flex items-start">
                <div className="text-xl sm:text-2xl mr-2 sm:mr-3 flex-shrink-0">📧</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm sm:text-base font-semibold text-rose-800">Confirmation Email Sent</p>
                  <p className="text-xs sm:text-sm text-rose-600">
                    A detailed confirmation has been sent to
                  </p>
                  <p className="text-xs sm:text-sm text-rose-800 font-medium break-words break-all">
                    {userDetails.email || 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            {/* Auto-redirect Countdown */}
            <div className="bg-gradient-to-br from-pink-50 via-white to-rose-50 border border-pink-200 rounded-lg p-2 sm:p-3">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-pink-400 to-rose-500 rounded-full flex items-center justify-center text-white font-bold text-lg sm:text-xl shadow-lg">
                  {countdown}
                </div>
                <div className="text-center sm:text-left">
                  <p className="text-rose-600 font-bold text-sm sm:text-base">
                    Auto-redirecting to Profile
                  </p>
                  <p className="text-xs sm:text-sm text-rose-400">
                    Redirecting in {countdown} second{countdown > 1 ? 's' : ''}...
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
              <button
                onClick={goToProfile}
                className="bg-gradient-to-r from-pink-400 via-pink-500 to-rose-400 hover:from-pink-500 hover:via-pink-600 hover:to-rose-600 text-white py-2 sm:py-3 rounded-md sm:rounded-lg font-bold text-sm sm:text-base transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center"
              >
                <span className="mr-1 sm:mr-2">🏠</span>
                Go to Profile Now
              </button>
              
              <button
                onClick={handleNewBooking}
                className="bg-gradient-to-r from-rose-400 to-rose-500 hover:from-rose-600 hover:to-rose-700 text-white py-2 sm:py-3 rounded-md sm:rounded-lg font-bold text-sm sm:text-base transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center"
              >
                <span className="mr-1 sm:mr-2">🎭</span>
                Book More Seats
              </button>
            </div>
            
            {/* Important Note */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-2 sm:p-3">
              <p className="text-xs text-gray-600 text-center">
                🎟️ Please arrive 30 minutes before the show starts and bring a valid ID for entry.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

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

            {/* Total Amount - Highlighted */}
            <div className="bg-gradient-to-r from-pink-100 via-white to-rose-100 border border-pink-300 rounded-lg sm:rounded-xl p-3 sm:p-4">
              <div className="flex flex-col sm:flex-row justify-between items-center text-center sm:text-left">
                <div className="mb-2 sm:mb-0">
                  <h4 className="text-base sm:text-lg font-semibold text-rose-800">Total Amount to Pay</h4>
                  <p className="text-xs max-w-lg mt-2 sm:text-sm text-orange-600">All payments made for Havan seats, stalls, and show seats will be considered <span className="font-bold text-sm">Donations</span> to <span className="font-bold text-sm">SVS</span>. With your contribution, you will become a valued member of SVS, and your donation will be eligible for exemption under <span className="font-bold text-sm">Section 80G</span> of the Income Tax Act.</p>
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-rose-800 bg-white px-4 py-2 sm:px-6 sm:py-3 rounded-lg sm:rounded-xl shadow-md">
                  ₹{totalPrice?.toLocaleString('en-IN') || 0}
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
                  Pay ₹{totalPrice?.toLocaleString('en-IN') || 0}
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
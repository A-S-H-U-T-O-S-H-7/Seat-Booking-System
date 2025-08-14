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
    const requiredFields = ['name', 'email', 'phone', 'aadhar', 'address', 'emergencyContact'];
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

  // Countdown timer for redirect
  useEffect(() => {
    if (paymentSuccess && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (paymentSuccess && countdown === 0) {
      router.push('/profile');
    }
  }, [paymentSuccess, countdown, router]);

  if (paymentSuccess) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full mb-4 shadow-lg">
            <CheckCircle className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">🎉 Booking Confirmed!</h3>
          <p className="text-gray-600 mb-6">Your show tickets have been successfully booked</p>
          
          <div className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-200">
            <div className="text-center mb-4">
              <p className="text-gray-600 text-sm">Booking ID</p>
              <p className="text-purple-600 font-bold text-lg">{bookingId}</p>
            </div>
            <div className="text-center">
              <p className="text-gray-600 text-sm">Redirecting to profile in</p>
              <p className="text-gray-900 font-bold text-2xl">{countdown}s</p>
            </div>
          </div>
          
          <button
            onClick={() => router.push('/profile')}
            className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 text-white py-3 px-6 rounded-lg font-medium hover:from-purple-600 hover:to-indigo-600 transition-all duration-200"
          >
            View My Bookings
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-full flex items-center justify-center">
          <CreditCard className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900">Complete Booking</h3>
          <p className="text-gray-600 text-sm">Confirm your show tickets</p>
        </div>
      </div>

      {/* Booking Summary */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-200">
        <h4 className="text-gray-900 font-semibold mb-4 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-green-500" />
          Booking Summary
        </h4>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar className="w-4 h-4" />
              <span>Show Date</span>
            </div>
            <span className="text-gray-900 font-medium">
              {selectedDate ? (selectedDate instanceof Date ? format(selectedDate, 'MMM dd, yyyy') : format(new Date(selectedDate), 'MMM dd, yyyy')) : 'N/A'}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-gray-600">
              <Clock className="w-4 h-4" />
              <span>Show Time</span>
            </div>
            <span className="text-gray-900 font-medium">5:00 PM - 10:00 PM</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-gray-600">
              <Users className="w-4 h-4" />
              <span>Selected Seats</span>
            </div>
            <span className="text-gray-900 font-medium">
              {selectedSeats.length} seat{selectedSeats.length > 1 ? 's' : ''}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="text-gray-600">Seat Numbers</div>
            <span className="text-gray-900 font-medium">
              {selectedSeats.slice(0, 3).join(', ')}
              {selectedSeats.length > 3 && ` +${selectedSeats.length - 3} more`}
            </span>
          </div>
        </div>
      </div>

      {/* Customer Details Summary */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-200">
        <h4 className="text-gray-900 font-semibold mb-4 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-green-500" />
          Customer Details
        </h4>
        
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Name:</span>
            <span className="text-gray-900">{userDetails.name || 'N/A'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Email:</span>
            <span className="text-gray-900">{userDetails.email || 'N/A'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Phone:</span>
            <span className="text-gray-900">{userDetails.phone || 'N/A'}</span>
          </div>
        </div>
      </div>

      {/* Payment Amount */}
      <div className="bg-gradient-to-r from-purple-500/10 to-indigo-500/10 rounded-lg p-4 mb-6 border border-purple-500/20">
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-700 font-medium">Total Amount</span>
          <span className="text-gray-900 font-bold text-xl">₹{totalPrice.toLocaleString('en-IN')}</span>
        </div>
        <p className="text-gray-500 text-sm">Including all taxes and fees</p>
      </div>

      {/* Complete Booking Button */}
      <button
        onClick={completeBooking}
        disabled={processing}
        className={`w-full py-4 px-6 rounded-lg font-semibold text-white transition-all duration-200 ${
          processing
            ? 'bg-gray-600 cursor-not-allowed'
            : 'bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
        }`}
      >
        {processing ? (
          <div className="flex items-center justify-center gap-2">
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            Processing Booking...
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2">
            <CheckCircle className="w-5 h-5" />
            Complete Booking
          </div>
        )}
      </button>

      {/* Security Note */}
      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-blue-700 text-sm font-medium">Secure Process</p>
            <p className="text-blue-600 text-xs">Your information is protected and secure</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShowPaymentProcess;
"use client";
import { useState } from 'react';
import { useShowSeatBooking } from '@/context/ShowSeatBookingContext';
import { useTheme } from '@/context/ThemeContext';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { ArrowLeftIcon, CreditCardIcon, ShieldCheckIcon, LockClosedIcon, CheckCircleIcon, TicketIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';

export default function ShowPaymentProcess({ onBack, onComplete }) {
  const { 
    selectedSeats, 
    selectedDate, 
    selectedShift, 
    totalPrice, 
    totalCapacity, 
    bookingData, 
    processBooking,
    loading 
  } = useShowSeatBooking();
  const { isDarkMode } = useTheme();
  const router = useRouter();
  
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    holderName: ''
  });
  const [upiId, setUpiId] = useState('');
  const [processing, setProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [bookingId, setBookingId] = useState('');

  const handleCardInputChange = (e) => {
    const { name, value } = e.target;
    
    // Format card number with spaces
    if (name === 'cardNumber') {
      const formatted = value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
      if (formatted.length <= 19) { // 16 digits + 3 spaces
        setCardDetails(prev => ({ ...prev, [name]: formatted }));
      }
    }
    // Format expiry date
    else if (name === 'expiryDate') {
      const formatted = value.replace(/\D/g, '').replace(/(\d{2})(\d{2})/, '$1/$2');
      if (formatted.length <= 5) {
        setCardDetails(prev => ({ ...prev, [name]: formatted }));
      }
    }
    // Limit CVV to 3-4 digits
    else if (name === 'cvv') {
      if (value.length <= 4) {
        setCardDetails(prev => ({ ...prev, [name]: value.replace(/\D/g, '') }));
      }
    }
    else {
      setCardDetails(prev => ({ ...prev, [name]: value }));
    }
  };

  const validatePayment = () => {
    if (paymentMethod === 'card') {
      if (!cardDetails.cardNumber.replace(/\s/g, '') || cardDetails.cardNumber.replace(/\s/g, '').length < 16) {
        toast.error('Please enter a valid card number');
        return false;
      }
      if (!cardDetails.expiryDate || cardDetails.expiryDate.length < 5) {
        toast.error('Please enter a valid expiry date');
        return false;
      }
      if (!cardDetails.cvv || cardDetails.cvv.length < 3) {
        toast.error('Please enter a valid CVV');
        return false;
      }
      if (!cardDetails.holderName.trim()) {
        toast.error('Please enter cardholder name');
        return false;
      }
    } else if (paymentMethod === 'upi') {
      if (!upiId.trim() || !upiId.includes('@')) {
        toast.error('Please enter a valid UPI ID');
        return false;
      }
    }
    return true;
  };

  const handlePayment = async () => {
    if (!validatePayment()) return;
    
    setProcessing(true);
    
    try {
      // Simulate payment processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const paymentDetails = {
        method: paymentMethod,
        amount: totalPrice,
        timestamp: new Date(),
        ...(paymentMethod === 'card' 
          ? { 
              cardLast4: cardDetails.cardNumber.slice(-4),
              holderName: cardDetails.holderName
            }
          : { upiId }
        )
      };

      const result = await processBooking(paymentDetails);
      
      if (result.success) {
        setBookingId(result.bookingId);
        setPaymentSuccess(true);
        toast.success('🎉 Booking confirmed successfully!');
      } else {
        toast.error(result.error || 'Payment failed. Please try again.');
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const handleComplete = () => {
    onComplete();
    router.push('/profile'); // Redirect to profile to see booking
  };

  if (paymentSuccess) {
    return (
      <div className="space-y-6">
        {/* Success Message */}
        <div className={`p-8 rounded-lg border text-center ${
          isDarkMode ? 'bg-green-900/20 border-green-700' : 'bg-green-50 border-green-200'
        }`}>
          <CheckCircleIcon className={`w-16 h-16 mx-auto mb-4 ${
            isDarkMode ? 'text-green-400' : 'text-green-600'
          }`} />
          <h2 className={`text-2xl font-bold mb-2 ${
            isDarkMode ? 'text-green-300' : 'text-green-800'
          }`}>
            🎉 Booking Confirmed!
          </h2>
          <p className={`text-lg mb-4 ${
            isDarkMode ? 'text-green-200' : 'text-green-700'
          }`}>
            Your show seat booking has been confirmed successfully
          </p>
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg ${
            isDarkMode ? 'bg-green-800' : 'bg-green-100'
          }`}>
            <TicketIcon className="w-5 h-5" />
            <span className="font-mono font-semibold">Booking ID: {bookingId}</span>
          </div>
        </div>

        {/* Booking Summary */}
        <div className={`p-6 rounded-lg border ${
          isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <h3 className={`text-lg font-semibold mb-4 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Booking Summary
          </h3>
          
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Show Date:</span>
              <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>
                {format(new Date(selectedDate), 'EEEE, MMMM d, yyyy')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Show Time:</span>
              <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>
                {selectedShift === 'morning' ? '10:00 AM - 1:00 PM' : 
                 selectedShift === 'afternoon' ? '2:00 PM - 5:00 PM' : '6:00 PM - 9:00 PM'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Seats:</span>
              <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>
                {selectedSeats.length} seats ({totalCapacity} people)
              </span>
            </div>
            <div className="flex justify-between font-semibold text-lg border-t pt-2">
              <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>Total Paid:</span>
              <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>
                ₹{totalPrice.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className={`p-6 rounded-lg border ${
          isDarkMode ? 'bg-blue-900/20 border-blue-700' : 'bg-blue-50 border-blue-200'
        }`}>
          <h4 className={`font-semibold mb-2 ${
            isDarkMode ? 'text-blue-300' : 'text-blue-800'
          }`}>
            📧 Next Steps
          </h4>
          <ul className={`text-sm space-y-1 ${
            isDarkMode ? 'text-blue-200' : 'text-blue-700'
          }`}>
            <li>• Booking confirmation has been sent to your email</li>
            <li>• You can view your booking details in your profile</li>
            <li>• Please arrive 30 minutes before the show starts</li>
            <li>• Bring a valid ID for verification at the venue</li>
            <li>• Cancellation allowed up to 5 days before show date</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => router.push('/profile')}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-all duration-200"
          >
            View My Bookings
          </button>
          <button
            onClick={() => router.push('/')}
            className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
              isDarkMode 
                ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
            }`}
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`p-6 rounded-lg border ${
        isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <div className="flex items-center gap-3 mb-4">
          <CreditCardIcon className={`w-6 h-6 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`} />
          <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Secure Payment
          </h2>
        </div>
        
        <div className={`p-4 rounded-lg ${
          isDarkMode ? 'bg-gray-700' : 'bg-blue-50'
        }`}>
          <div className="flex items-center justify-between text-sm">
            <span className={isDarkMode ? 'text-gray-300' : 'text-blue-800'}>
              {selectedSeats.length} seats • {totalCapacity} people
            </span>
            <span className={`font-bold text-lg ${isDarkMode ? 'text-gray-300' : 'text-blue-800'}`}>
              Total: ₹{totalPrice.toLocaleString('en-IN')}
            </span>
          </div>
        </div>
      </div>

      {/* Security Badge */}
      <div className="flex items-center justify-center gap-2 text-sm">
        <ShieldCheckIcon className="w-4 h-4 text-green-600" />
        <LockClosedIcon className="w-4 h-4 text-green-600" />
        <span className={`${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
          SSL Secured Payment • Your data is protected
        </span>
      </div>

      {/* Payment Methods */}
      <div className={`p-6 rounded-lg border ${
        isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Choose Payment Method
        </h3>

        <div className="space-y-3 mb-6">
          <label className="flex items-center">
            <input
              type="radio"
              name="paymentMethod"
              value="card"
              checked={paymentMethod === 'card'}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="mr-3 text-purple-600 focus:ring-purple-500"
            />
            <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              💳 Credit/Debit Card
            </span>
          </label>
          
          <label className="flex items-center">
            <input
              type="radio"
              name="paymentMethod"
              value="upi"
              checked={paymentMethod === 'upi'}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="mr-3 text-purple-600 focus:ring-purple-500"
            />
            <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              📱 UPI Payment
            </span>
          </label>
        </div>

        {/* Card Payment Form */}
        {paymentMethod === 'card' && (
          <div className="space-y-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Cardholder Name
              </label>
              <input
                type="text"
                name="holderName"
                value={cardDetails.holderName}
                onChange={handleCardInputChange}
                placeholder="Enter cardholder name"
                className={`block w-full px-3 py-2 rounded-md border transition-colors focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Card Number
              </label>
              <input
                type="text"
                name="cardNumber"
                value={cardDetails.cardNumber}
                onChange={handleCardInputChange}
                placeholder="1234 5678 9012 3456"
                className={`block w-full px-3 py-2 rounded-md border transition-colors focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Expiry Date
                </label>
                <input
                  type="text"
                  name="expiryDate"
                  value={cardDetails.expiryDate}
                  onChange={handleCardInputChange}
                  placeholder="MM/YY"
                  className={`block w-full px-3 py-2 rounded-md border transition-colors focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  CVV
                </label>
                <input
                  type="text"
                  name="cvv"
                  value={cardDetails.cvv}
                  onChange={handleCardInputChange}
                  placeholder="123"
                  className={`block w-full px-3 py-2 rounded-md border transition-colors focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                />
              </div>
            </div>
          </div>
        )}

        {/* UPI Payment Form */}
        {paymentMethod === 'upi' && (
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              UPI ID
            </label>
            <input
              type="text"
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
              placeholder="your-upi-id@paytm"
              className={`block w-full px-3 py-2 rounded-md border transition-colors focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
            />
          </div>
        )}
      </div>

      {/* Payment Button */}
      <div className="flex justify-between">
        <button
          onClick={onBack}
          disabled={processing}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
            isDarkMode 
              ? 'bg-gray-700 hover:bg-gray-600 text-white' 
              : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
          } disabled:opacity-50`}
        >
          <ArrowLeftIcon className="w-5 h-5" />
          Back to Review
        </button>

        <button
          onClick={handlePayment}
          disabled={processing || loading}
          className="flex items-center gap-2 px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-all duration-200 shadow-lg hover:scale-105 disabled:opacity-50 disabled:transform-none"
        >
          {processing ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Processing Payment...
            </>
          ) : (
            <>
              <LockClosedIcon className="w-5 h-5" />
              Pay ₹{totalPrice.toLocaleString('en-IN')}
            </>
          )}
        </button>
      </div>
    </div>
  );
}

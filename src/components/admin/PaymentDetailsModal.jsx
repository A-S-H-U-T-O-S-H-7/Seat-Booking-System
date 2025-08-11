import { format } from 'date-fns';
import { CreditCardIcon, XCircleIcon, EyeIcon } from '@heroicons/react/24/outline';

export default function PaymentDetailsModal({
  show,
  booking,
  onClose,
  onViewFullDetails,
  isDarkMode
}) {
  if (!show || !booking) return null;

  const formatCurrency = (amount) => {
    if (!amount || isNaN(amount)) {
      return '₹0';
    }
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDateTime = (dateValue) => {
    if (!dateValue) return 'N/A';
    
    try {
      if (dateValue.toDate && typeof dateValue.toDate === 'function') {
        return format(dateValue.toDate(), 'MMM dd, yyyy HH:mm');
      }
      if (dateValue.seconds) {
        return format(new Date(dateValue.seconds * 1000), 'MMM dd, yyyy HH:mm');
      }
      if (dateValue instanceof Date) {
        return format(dateValue, 'MMM dd, yyyy HH:mm');
      }
      if (typeof dateValue === 'string' || typeof dateValue === 'number') {
        return format(new Date(dateValue), 'MMM dd, yyyy HH:mm');
      }
    } catch (error) {
      console.error('Error formatting datetime:', error, dateValue);
    }
    
    return 'N/A';
  };

  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 py-6">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true" onClick={onClose}>
          <div className="absolute inset-0 bg-balck/20 bg-opacity-75 backdrop-blur-md"></div>
        </div>
        <div className={`relative max-w-lg w-full mx-auto rounded-xl shadow-2xl overflow-hidden transform transition-all z-[70] ${
          isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
        }`}>
          {/* Modal Header */}
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center">
              <CreditCardIcon className="w-6 h-6 text-white mr-3" />
              <h3 className="text-xl font-bold text-white">💳 Payment Details</h3>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors duration-150 p-1 rounded-full hover:bg-white hover:bg-opacity-20"
            >
              <XCircleIcon className="w-6 h-6" />
            </button>
          </div>
          
          {/* Modal Content */}
          <div className="p-6">
            {/* Payment Information */}
            <div className={`p-4 rounded-lg mb-6 ${
              isDarkMode ? 'bg-gray-700 border border-gray-600' : 'bg-gray-50 border border-gray-200'
            }`}>
              <h4 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                💰 Payment Information
              </h4>
              <div className="space-y-3">
                <div>
                  <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Total Amount:</span>
                  <p className={`text-lg font-bold ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                    {formatCurrency(booking.totalAmount)}
                  </p>
                </div>
                
                {booking.priceAdjusted && (
                  <div>
                    <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Original Amount:</span>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {formatCurrency(booking.originalAmount)}
                    </p>
                  </div>
                )}
                
                {booking.discountApplied > 0 && (
                  <div>
                    <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Discount Applied:</span>
                    <p className={`text-sm ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                      🎯 {booking.discountApplied}%
                    </p>
                  </div>
                )}

                {booking.payment && (
                  <>
                    <div>
                      <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Payment ID:</span>
                      <p className={`text-sm font-mono ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {booking.payment.paymentId || 'N/A'}
                      </p>
                    </div>
                    
                    <div>
                      <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Order ID:</span>
                      <p className={`text-sm font-mono ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {booking.payment.orderId || 'N/A'}
                      </p>
                    </div>
                    
                    <div>
                      <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Payment Status:</span>
                      <span className={`ml-2 inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                        booking.payment.status === 'captured' || booking.payment.status === 'success'
                          ? isDarkMode ? 'bg-green-900 text-green-300' : 'bg-green-100 text-green-800'
                          : booking.payment.status === 'pending'
                          ? isDarkMode ? 'bg-yellow-900 text-yellow-300' : 'bg-yellow-100 text-yellow-800'
                          : isDarkMode ? 'bg-red-900 text-red-300' : 'bg-red-100 text-red-800'
                      }`}>
                        {booking.payment.status === 'captured' && '✅'}
                        {booking.payment.status === 'success' && '✅'}
                        {booking.payment.status === 'pending' && '⏳'}
                        {booking.payment.status === 'failed' && '❌'}
                        {' '}{booking.payment.status || 'Unknown'}
                      </span>
                    </div>
                    
                    {booking.payment.method && (
                      <div>
                        <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Payment Method:</span>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          💳 {booking.payment.method}
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Booking Summary */}
            <div className={`p-4 rounded-lg ${
              isDarkMode ? 'bg-blue-900 bg-opacity-30 border border-blue-700' : 'bg-blue-50 border border-blue-200'
            }`}>
              <h4 className={`text-md font-semibold mb-3 ${isDarkMode ? 'text-blue-300' : 'text-blue-900'}`}>
                📋 Quick Summary
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className={`text-sm ${isDarkMode ? 'text-blue-400' : 'text-blue-700'}`}>Booking ID:</span>
                  <span className={`text-sm font-mono ${isDarkMode ? 'text-blue-300' : 'text-blue-900'}`}>
                    {booking.id}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={`text-sm ${isDarkMode ? 'text-blue-400' : 'text-blue-700'}`}>Customer:</span>
                  <span className={`text-sm ${isDarkMode ? 'text-blue-300' : 'text-blue-900'}`}>
                    {booking.customerDetails?.name || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={`text-sm ${isDarkMode ? 'text-blue-400' : 'text-blue-700'}`}>Seats:</span>
                  <span className={`text-sm ${isDarkMode ? 'text-blue-300' : 'text-blue-900'}`}>
                    🪑 {booking.seatCount || booking.seats?.length || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={`text-sm ${isDarkMode ? 'text-blue-400' : 'text-blue-700'}`}>Created:</span>
                  <span className={`text-xs ${isDarkMode ? 'text-blue-300' : 'text-blue-900'}`}>
                    {formatDateTime(booking.createdAt)}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Modal Footer */}
          <div className={`px-6 py-4 border-t ${isDarkMode ? 'border-gray-700 bg-gray-750' : 'border-gray-200 bg-gray-50'}`}>
            <div className="flex justify-between space-x-3">
              <button
                onClick={onViewFullDetails}
                className={`px-4 py-2 border rounded-lg text-sm font-medium transition-colors duration-150 flex items-center ${
                  isDarkMode 
                    ? 'border-blue-600 text-blue-400 bg-blue-900 bg-opacity-30 hover:bg-opacity-50'
                    : 'border-blue-300 text-blue-700 bg-blue-50 hover:bg-blue-100'
                }`}
              >
                <EyeIcon className="w-4 h-4 mr-2" />
                Full Details
              </button>
              
              <button
                onClick={onClose}
                className={`px-6 py-2 border rounded-lg text-sm font-medium transition-colors duration-150 ${
                  isDarkMode 
                    ? 'border-gray-600 text-gray-300 bg-gray-700 hover:bg-gray-600'
                    : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                }`}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

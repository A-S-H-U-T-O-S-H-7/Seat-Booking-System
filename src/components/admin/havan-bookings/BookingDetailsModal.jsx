import { format } from 'date-fns';
import { EyeIcon, XCircleIcon } from '@heroicons/react/24/outline';

export default function BookingDetailsModal({
  show,
  booking,
  onClose,
  isDarkMode
}) {
  if (!show || !booking) return null;

  const formatDate = (dateValue) => {
    if (!dateValue) return 'N/A';
    
    try {
      if (dateValue.toDate && typeof dateValue.toDate === 'function') {
        return format(dateValue.toDate(), 'MMM dd, yyyy');
      }
      if (dateValue.seconds) {
        return format(new Date(dateValue.seconds * 1000), 'MMM dd, yyyy');
      }
      if (dateValue instanceof Date) {
        return format(dateValue, 'MMM dd, yyyy');
      }
      if (typeof dateValue === 'string' || typeof dateValue === 'number') {
        return format(new Date(dateValue), 'MMM dd, yyyy');
      }
    } catch (error) {
      console.error('Error formatting date:', error, dateValue);
    }
    
    return 'N/A';
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

  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 py-6">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true" onClick={onClose}>
          <div className="absolute inset-0 bg-black/20 bg-opacity-75 backdrop-blur-md"></div>
        </div>
        <div className={`relative max-w-3xl w-full mx-auto rounded-xl shadow-2xl overflow-hidden transform transition-all z-[70] ${
          isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
        }`}>
          {/* Modal Header */}
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center">
              <EyeIcon className="w-6 h-6 text-white mr-3" />
              <h3 className="text-xl font-bold text-white">📋 Booking Details</h3>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Customer Info */}
              <div className={`p-4 rounded-lg ${
                isDarkMode ? 'bg-gray-700 border border-gray-600' : 'bg-gray-50 border border-gray-200'
              }`}>
                <h4 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  👤 Customer Information
                </h4>
                <div className="space-y-3">
                  <div>
                    <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Name:</span>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {booking.customerDetails?.name || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Email:</span>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {booking.customerDetails?.email || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Phone:</span>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {booking.customerDetails?.phone || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Aadhar:</span>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {booking.customerDetails?.aadhar || 'N/A'}
                    </p>
                  </div>
                  {booking.customerDetails?.address && (
                    <div>
                      <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Address:</span>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} whitespace-pre-line`}>
                        {booking.customerDetails.address}
                      </p>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Booking Info */}
              <div className={`p-4 rounded-lg ${
                isDarkMode ? 'bg-gray-700 border border-gray-600' : 'bg-gray-50 border border-gray-200'
              }`}>
                <h4 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  🎫 Booking Information
                </h4>
                <div className="space-y-3">
                  <div>
                    <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Booking ID:</span>
                    <p className={`text-sm font-mono ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {booking.id}
                    </p>
                  </div>
                  <div>
                    <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Event Date:</span>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {formatDate(booking.eventDate)}
                    </p>
                  </div>
                  <div>
                    <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Shift:</span>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      🌅 {booking.shift || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Seats ({booking.seatCount || booking.seats?.length || 0}):
                    </span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {booking.seats?.map((seat, index) => (
                        <span key={index} className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                          isDarkMode ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {seat}
                        </span>
                      )) || <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>No seats selected</span>}
                    </div>
                  </div>
                  <div>
                    <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Total Amount:</span>
                    <p className={`text-sm font-bold ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                      {formatCurrency(booking.totalAmount)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
           {/* Status and Timeline */}
<div className={`mt-6 p-4 rounded-lg ${
  isDarkMode ? 'bg-blue-900 bg-opacity-30 border border-blue-700' : 'bg-blue-50 border border-blue-200'
}`}>
  <h4 className={`text-lg font-semibold mb-3 ${isDarkMode ? 'text-blue-300' : 'text-blue-900'}`}>
    📊 Status & Timeline
  </h4>
  
  {/* Main Status and Created Date in one line */}
  <div className="flex flex-wrap items-center gap-4 md:gap-6">
    <div className="flex items-center">
      <span className={`text-sm font-medium ${isDarkMode ? 'text-blue-400' : 'text-blue-700'}`}>Status:</span>
      <span className={`ml-2 inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
        booking.status === 'confirmed' 
          ? isDarkMode ? 'bg-green-900 text-green-300' : 'bg-green-100 text-green-800'
          : booking.status === 'pending'
          ? isDarkMode ? 'bg-yellow-900 text-yellow-300' : 'bg-yellow-100 text-yellow-800'
          : isDarkMode ? 'bg-red-900 text-red-300' : 'bg-red-100 text-red-800'
      }`}>
        {booking.status === 'confirmed' && '✅'}
        {booking.status === 'pending' && '⏳'}
        {booking.status === 'cancelled' && '❌'}
        {' '}{booking.status}
      </span>
    </div>
    
    <div className="flex items-center">
      <span className={`text-sm font-medium ${isDarkMode ? 'text-blue-400' : 'text-blue-700'}`}>Created:</span>
      <span className={`ml-2 text-sm ${isDarkMode ? 'text-blue-300' : 'text-blue-900'}`}>
        {formatDateTime(booking.createdAt)}
      </span>
    </div>

    {/* Payment Information inline */}
    {booking.payment && (
      <>
        <div className="flex items-center">
          <span className={`text-sm font-medium ${isDarkMode ? 'text-blue-400' : 'text-blue-700'}`}>💳 Payment ID:</span>
          <span className={`ml-2 text-xs font-mono ${isDarkMode ? 'text-blue-300' : 'text-blue-900'}`}>
            {booking.payment.paymentId || 'N/A'}
          </span>
        </div>
        
        <div className="flex items-center">
          <span className={`text-sm font-medium ${isDarkMode ? 'text-blue-400' : 'text-blue-700'}`}>Order ID:</span>
          <span className={`ml-2 text-xs font-mono ${isDarkMode ? 'text-blue-300' : 'text-blue-900'}`}>
            {booking.payment.orderId || 'N/A'}
          </span>
        </div>
      </>
    )}
  </div>
</div>
          </div>
          
          {/* Modal Footer */}
          <div className={`px-6 py-4 border-t ${isDarkMode ? 'border-gray-700 bg-gray-750' : 'border-gray-200 bg-gray-50'}`}>
            <div className="flex justify-end space-x-3">
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
"use client";
import { format } from 'date-fns';
import { 
  XCircleIcon, 
  TicketIcon, 
  UserIcon, 
  PhoneIcon, 
  EnvelopeIcon, 
  CalendarIcon, 
  ClockIcon, 
  CreditCardIcon 
} from '@heroicons/react/24/outline';
import PropTypes from 'prop-types';

export default function ShowBookingDetailsModal({
  show,
  booking,
  onClose,
  isDarkMode
}) {
  // Early return if modal shouldn't show or booking is null
  if (!show || !booking) return null;

  const formatCurrency = (amount) => {
    if (!amount || isNaN(amount)) return '₹0';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateValue) => {
    if (!dateValue) return 'N/A';
    try {
      const date = dateValue?.toDate?.() || new Date(dateValue);
      return format(date, 'MMM dd, yyyy');
    } catch (error) {
      return 'N/A';
    }
  };

  const formatDateTime = (dateValue) => {
    if (!dateValue) return 'N/A';
    try {
      const date = dateValue?.toDate?.() || new Date(dateValue);
      return format(date, 'MMM dd, yyyy HH:mm');
    } catch (error) {
      return 'N/A';
    }
  };

  const getSeatCategory = (seatId) => {
    if (!seatId) return 'Standard';
    const seatStr = String(seatId).toUpperCase();
    if (seatStr.startsWith('A') || seatStr.startsWith('B')) return 'VIP';
    if (seatStr.startsWith('C')) return 'Premium';
    return 'Standard';
  };

  const getSeatPrice = (seatId) => {
    return booking.showDetails?.seatPrices?.[seatId] || 
           (getSeatCategory(seatId) === 'VIP' ? 1500 : 
            getSeatCategory(seatId) === 'Premium' ? 1000 : 750);
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
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center">
              <TicketIcon className="w-6 h-6 text-white mr-3" />
              <h3 className="text-xl font-bold text-white">🎭 Show Booking Details</h3>
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
                  <div className="flex items-start">
                    <UserIcon className={`w-5 h-5 mr-2 mt-0.5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                    <div>
                      <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Name:</span>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {booking.userDetails?.name || 'N/A'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <EnvelopeIcon className={`w-5 h-5 mr-2 mt-0.5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                    <div>
                      <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Email:</span>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {booking.userDetails?.email || 'N/A'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <PhoneIcon className={`w-5 h-5 mr-2 mt-0.5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                    <div>
                      <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Phone:</span>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {booking.userDetails?.phone || 'N/A'}
                      </p>
                    </div>
                  </div>
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
                      {booking.id || booking.bookingId || 'N/A'}
                    </p>
                  </div>
                  <div className="flex items-start">
                    <CalendarIcon className={`w-5 h-5 mr-2 mt-0.5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                    <div>
                      <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Show Date:</span>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {booking.showDetails?.date ? formatDate(booking.showDetails.date) : 'N/A'}
                        {booking.showDetails?.time && ` (${booking.showDetails.time})`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <ClockIcon className={`w-5 h-5 mr-2 mt-0.5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                    <div>
                      <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Booked On:</span>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {formatDateTime(booking.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Seat Details */}
            <div className={`mt-6 p-4 rounded-lg ${
              isDarkMode ? 'bg-blue-900/30 border border-blue-700' : 'bg-blue-50 border border-blue-200'
            }`}>
              <h4 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-blue-300' : 'text-blue-900'}`}>
                🪑 Seat Details
              </h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {booking.showDetails?.selectedSeats?.map((seat, index) => {
                  const seatDisplay = typeof seat === 'object' ? (seat.id || seat.seatId || seat.type || String(seat)) : String(seat);
                  return (
                    <div key={index} className={`p-3 rounded-lg border ${
                      getSeatCategory(seatDisplay) === 'VIP' 
                        ? isDarkMode ? 'bg-yellow-900/20 border-yellow-700' : 'bg-yellow-50 border-yellow-200'
                        : getSeatCategory(seatDisplay) === 'Premium'
                        ? isDarkMode ? 'bg-blue-900/20 border-blue-700' : 'bg-blue-50 border-blue-200'
                        : isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                    }`}>
                      <div className="flex justify-between items-center">
                        <span className={`font-medium ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                          Seat {seatDisplay}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          getSeatCategory(seatDisplay) === 'VIP' 
                            ? isDarkMode ? 'bg-yellow-900 text-yellow-300' : 'bg-yellow-100 text-yellow-800'
                            : getSeatCategory(seatDisplay) === 'Premium'
                            ? isDarkMode ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-800'
                            : isDarkMode ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-700'
                        }`}>
                          {getSeatCategory(seatDisplay)}
                        </span>
                      </div>
                      <div className={`text-sm mt-1 ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        Price: {formatCurrency(getSeatPrice(seatDisplay))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Payment and Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div className={`p-4 rounded-lg ${
                isDarkMode ? 'bg-purple-900/30 border border-purple-700' : 'bg-purple-50 border border-purple-200'
              }`}>
                <h4 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-purple-300' : 'text-purple-900'}`}>
                  💳 Payment Information
                </h4>
                <div className="space-y-3">
                  <div>
                    <span className={`text-sm font-medium ${isDarkMode ? 'text-purple-400' : 'text-purple-700'}`}>Total Amount:</span>
                    <p className={`text-lg font-bold ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                      {formatCurrency(booking.showDetails?.totalAmount)}
                    </p>
                  </div>
                  {booking.paymentDetails?.method && (
                    <div>
                      <span className={`text-sm font-medium ${isDarkMode ? 'text-purple-400' : 'text-purple-700'}`}>Payment Method:</span>
                      <p className={`text-sm ${isDarkMode ? 'text-purple-300' : 'text-purple-800'}`}>
                        {booking.paymentDetails.method}
                      </p>
                    </div>
                  )}
                  {booking.paymentDetails?.transactionId && (
                    <div>
                      <span className={`text-sm font-medium ${isDarkMode ? 'text-purple-400' : 'text-purple-700'}`}>Transaction ID:</span>
                      <p className={`text-sm font-mono ${isDarkMode ? 'text-purple-300' : 'text-purple-800'}`}>
                        {booking.paymentDetails.transactionId}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className={`p-4 rounded-lg ${
                isDarkMode ? 'bg-green-900/30 border border-green-700' : 'bg-green-50 border border-green-200'
              }`}>
                <h4 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-green-300' : 'text-green-900'}`}>
                  📊 Status & Timeline
                </h4>
                <div className="space-y-3">
                  <div>
                    <span className={`text-sm font-medium ${isDarkMode ? 'text-green-400' : 'text-green-700'}`}>Status:</span>
                    <div className="mt-1">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                        booking.status === 'confirmed' 
                          ? isDarkMode ? 'bg-green-900 text-green-300' : 'bg-green-100 text-green-800'
                          : booking.status === 'pending'
                          ? isDarkMode ? 'bg-yellow-900 text-yellow-300' : 'bg-yellow-100 text-yellow-800'
                          : isDarkMode ? 'bg-red-900 text-red-300' : 'bg-red-100 text-red-800'
                      }`}>
                        {booking.status}
                      </span>
                    </div>
                  </div>
                  {booking.cancellationReason && (
                    <div>
                      <span className={`text-sm font-medium ${isDarkMode ? 'text-green-400' : 'text-green-700'}`}>Cancellation Reason:</span>
                      <p className={`text-sm ${isDarkMode ? 'text-green-300' : 'text-green-800'}`}>
                        {booking.cancellationReason}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Modal Footer */}
          <div className={`px-6 py-4 border-t ${isDarkMode ? 'border-gray-700 bg-gray-750' : 'border-gray-200 bg-gray-50'}`}>
            <div className="flex justify-end">
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

// PropTypes validation
ShowBookingDetailsModal.propTypes = {
  show: PropTypes.bool.isRequired,
  booking: PropTypes.shape({
    id: PropTypes.string,
    bookingId: PropTypes.string,
    status: PropTypes.string,
    createdAt: PropTypes.oneOfType([
      PropTypes.instanceOf(Date),
      PropTypes.object // Firestore Timestamp
    ]),
    userDetails: PropTypes.shape({
      name: PropTypes.string,
      email: PropTypes.string,
      phone: PropTypes.string
    }),
    showDetails: PropTypes.shape({
      date: PropTypes.oneOfType([
        PropTypes.instanceOf(Date),
        PropTypes.object // Firestore Timestamp
      ]),
      time: PropTypes.string,
      selectedSeats: PropTypes.array,
      totalAmount: PropTypes.number,
      seatPrices: PropTypes.object
    }),
    paymentDetails: PropTypes.shape({
      method: PropTypes.string,
      transactionId: PropTypes.string
    }),
    cancellationReason: PropTypes.string
  }),
  onClose: PropTypes.func.isRequired,
  isDarkMode: PropTypes.bool
};

ShowBookingDetailsModal.defaultProps = {
  booking: null,
  isDarkMode: false
};
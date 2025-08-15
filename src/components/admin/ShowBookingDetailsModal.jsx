"use client";
import { useTheme } from '@/context/ThemeContext';
import { format } from 'date-fns';
import { 
  XMarkIcon, 
  UserIcon, 
  CalendarDaysIcon, 
  MapPinIcon,
  CurrencyRupeeIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  EnvelopeIcon,
  PhoneIcon,
  CreditCardIcon,
  TicketIcon
} from '@heroicons/react/24/outline';

export default function ShowBookingDetailsModal({ booking, onClose, show = false }) {
  const { isDarkMode } = useTheme();

  // Add null/undefined checks for booking and show prop
  if (!show) {
    return null;
  }

  if (!booking) {
    return (
      <div className="fixed inset-0 bg-black/20 backdrop-blur-md flex items-center justify-center p-4 z-50">
        <div className={`max-w-md w-full rounded-xl shadow-2xl p-6 ${
          isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
        }`}>
          <h2 className="text-xl font-bold mb-4">Error</h2>
          <p className="mb-4">No booking data available to display.</p>
          <button
            onClick={onClose}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              isDarkMode
                ? 'bg-gray-700 text-white hover:bg-gray-600'
                : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
            }`}
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'text-green-600 bg-green-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'cancelled':
        return 'text-red-600 bg-red-100';
      case 'completed':
        return 'text-blue-600 bg-blue-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const formatDateTime = (date) => {
    if (!date) return 'N/A';
    try {
      return format(date, 'MMMM dd, yyyy \'at\' hh:mm a');
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const getSeatTypeDisplay = (seat) => {
    if (seat.type === 'vip') {
      return `VIP Sofa ${seat.id}`;
    } else {
      return `Regular Seat ${seat.id}`;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-md flex items-center justify-center p-4 z-50">
      <div className={`max-w-3xl w-full max-h-[85vh] overflow-y-auto rounded-xl shadow-2xl ${
        isDarkMode ? 'bg-gray-800' : 'bg-white'
      }`}>
        
        {/* Header */}
        <div className={`px-6 py-4 border-b ${
          isDarkMode ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${
                isDarkMode ? 'bg-purple-900' : 'bg-purple-100'
              }`}>
                <TicketIcon className={`w-6 h-6 ${
                  isDarkMode ? 'text-purple-400' : 'text-purple-600'
                }`} />
              </div>
              <div>
                <h2 className={`text-xl font-bold ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  Show Booking Details
                </h2>
                <p className={`text-sm ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Booking ID: {booking.id || booking.bookingId || 'N/A'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className={`p-2 rounded-lg hover:bg-opacity-80 ${
                isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
              }`}
            >
              <XMarkIcon className={`w-5 h-5 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`} />
            </button>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {/* Status and Basic Info */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            <div className={`p-3 rounded-lg ${
              isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
            }`}>
              <div className="flex items-center space-x-3">
                <CheckCircleIcon className={`w-8 h-8 ${
                  booking.status === 'confirmed' 
                    ? 'text-green-500' 
                    : booking.status === 'cancelled' 
                    ? 'text-red-500' 
                    : 'text-yellow-500'
                }`} />
                <div>
                  <p className={`text-sm font-medium ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Status
                  </p>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                    {booking.status?.charAt(0).toUpperCase() + booking.status?.slice(1)}
                  </span>
                </div>
              </div>
            </div>

            <div className={`p-3 rounded-lg ${
              isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
            }`}>
              <div className="flex items-center space-x-3">
                <ClockIcon className={`w-8 h-8 ${
                  isDarkMode ? 'text-blue-400' : 'text-blue-600'
                }`} />
                <div>
                  <p className={`text-sm font-medium ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Booked At
                  </p>
                  <p className={`text-sm ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {formatDateTime(booking.createdAt || booking.bookingDate)}
                  </p>
                </div>
              </div>
            </div>

            <div className={`p-3 rounded-lg ${
              isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
            }`}>
              <div className="flex items-center space-x-3">
                <CurrencyRupeeIcon className={`w-8 h-8 ${
                  isDarkMode ? 'text-green-400' : 'text-green-600'
                }`} />
                <div>
                  <p className={`text-sm font-medium ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Total Amount
                  </p>
                  <p className={`text-lg font-bold ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    ₹{(booking.showDetails?.totalPrice || booking.showDetails?.totalAmount || booking.paymentDetails?.amount || booking.payment?.amount || 0).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Customer & Show Details Combined */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className={`p-4 rounded-lg border ${
              isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'
            }`}>
              <h3 className={`text-md font-semibold mb-3 flex items-center ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                <UserIcon className="w-4 h-4 mr-2" />
                Customer Info
              </h3>
              <div className="space-y-2">
                <div>
                  <span className={`text-xs font-medium ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>Name:</span>
                  <p className={`text-sm ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {booking.userDetails?.name || 'N/A'}
                  </p>
                </div>
                <div>
                  <span className={`text-xs font-medium ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>Email:</span>
                  <p className={`text-sm ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {booking.userDetails?.email || 'N/A'}
                  </p>
                </div>
                <div>
                  <span className={`text-xs font-medium ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>Phone:</span>
                  <p className={`text-sm ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {booking.userDetails?.phone || 'N/A'}
                  </p>
                </div>
              </div>
            </div>
            
            <div className={`p-4 rounded-lg border ${
              isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'
            }`}>
              <h3 className={`text-md font-semibold mb-3 flex items-center ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                <CalendarDaysIcon className="w-4 h-4 mr-2" />
                Show Details
              </h3>
              <div className="space-y-2">
                <div>
                  <span className={`text-xs font-medium ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>Date & Time:</span>
                  <p className={`text-sm ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {booking.showDetails?.date ? format(new Date(booking.showDetails.date), 'MMM dd, yyyy') : 'N/A'}
                    {booking.showDetails?.time && ` (${booking.showDetails.time})`}
                  </p>
                </div>
                <div>
                  <span className={`text-xs font-medium ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>Seats ({booking.showDetails?.selectedSeats?.length || 0}):</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {booking.showDetails?.selectedSeats?.map((seat, index) => {
                      const seatStr = typeof seat === 'string' ? seat : (seat.seatId || seat.id || String(seat));
                      const isVip = seatStr.startsWith('A-') || seatStr.startsWith('B-');
                      return (
                        <span key={index} className={`px-2 py-1 rounded text-xs font-medium ${
                          isVip
                            ? (isDarkMode 
                                ? 'bg-purple-900 text-purple-300 border border-purple-700' 
                                : 'bg-purple-100 text-purple-800 border border-purple-200')
                            : (isDarkMode 
                                ? 'bg-blue-900 text-blue-300 border border-blue-700' 
                                : 'bg-blue-100 text-blue-800 border border-blue-200')
                        }`}>
                          {seatStr}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Details Section */}
          <div className={`p-4 rounded-lg border ${
            isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'
          }`}>
            <h3 className={`text-md font-semibold mb-3 flex items-center ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              <CreditCardIcon className="w-4 h-4 mr-2" />
              Payment Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div>
                  <span className={`text-xs font-medium ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>Total Amount:</span>
                  <p className={`text-lg font-bold ${
                    isDarkMode ? 'text-green-400' : 'text-green-600'
                  }`}>
                    ₹{(booking.showDetails?.totalPrice || booking.showDetails?.totalAmount || booking.paymentDetails?.amount || booking.payment?.amount || 0).toLocaleString()}
                  </p>
                </div>
                <div>
                  <span className={`text-xs font-medium ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>Payment Status:</span>
                  <p className={`text-sm ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {booking.paymentDetails?.status || booking.payment?.status || 'Completed'}
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <div>
                  <span className={`text-xs font-medium ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>Payment Method:</span>
                  <p className={`text-sm ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {booking.paymentDetails?.method || booking.payment?.method || 'Cash'}
                  </p>
                </div>
                <div>
                  <span className={`text-xs font-medium ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>Transaction ID:</span>
                  <p className={`text-sm font-mono ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {booking.paymentDetails?.transactionId || booking.payment?.transactionId || booking.payment?.razorpayPaymentId || 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          {(booking.cancelledAt || booking.updatedAt || booking.cancellationReason) && (
            <div className={`p-3 rounded-lg border ${
              isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'
            }`}>
              <h3 className={`text-sm font-semibold mb-2 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Additional Info
              </h3>
              <div className="space-y-2 text-xs">
                {booking.cancellationReason && (
                  <div>
                    <span className={`font-medium ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>Cancellation:</span>
                    <span className={`ml-2 ${
                      isDarkMode ? 'text-red-400' : 'text-red-600'
                    }`}>
                      {booking.cancellationReason}
                    </span>
                  </div>
                )}
                {booking.updatedAt && (
                  <div>
                    <span className={`font-medium ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>Updated:</span>
                    <span className={`ml-2 ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      {formatDateTime(booking.updatedAt.toDate?.() || booking.updatedAt)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={`px-6 py-4 border-t ${
          isDarkMode ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                isDarkMode
                  ? 'bg-gray-700 text-white hover:bg-gray-600'
                  : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
              }`}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

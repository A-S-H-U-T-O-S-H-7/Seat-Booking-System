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

export default function ShowBookingDetailsModal({ booking, onClose }) {
  const { isDarkMode } = useTheme();

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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className={`max-w-4xl w-full max-h-[90vh] overflow-y-auto rounded-xl shadow-2xl ${
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
                  Booking ID: {booking.bookingId}
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

        <div className="p-6 space-y-6">
          {/* Status and Basic Info */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className={`p-4 rounded-lg ${
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

            <div className={`p-4 rounded-lg ${
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
                    {formatDateTime(booking.createdAt)}
                  </p>
                </div>
              </div>
            </div>

            <div className={`p-4 rounded-lg ${
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
                    ₹{booking.payment?.amount?.toLocaleString() || '0'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Customer Information */}
          <div className={`p-6 rounded-lg border ${
            isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'
          }`}>
            <h3 className={`text-lg font-semibold mb-4 flex items-center ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              <UserIcon className="w-5 h-5 mr-2" />
              Customer Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className={`text-sm font-medium ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Name
                </p>
                <p className={`text-base ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {booking.userDetails?.name || 'N/A'}
                </p>
              </div>
              <div>
                <p className={`text-sm font-medium ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Email
                </p>
                <div className="flex items-center space-x-2">
                  <EnvelopeIcon className={`w-4 h-4 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`} />
                  <p className={`text-base ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {booking.userDetails?.email || 'N/A'}
                  </p>
                </div>
              </div>
              <div>
                <p className={`text-sm font-medium ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Phone
                </p>
                <div className="flex items-center space-x-2">
                  <PhoneIcon className={`w-4 h-4 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`} />
                  <p className={`text-base ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {booking.userDetails?.phone || 'N/A'}
                  </p>
                </div>
              </div>
              {booking.userDetails?.emergencyContact && (
                <div>
                  <p className={`text-sm font-medium ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Emergency Contact
                  </p>
                  <p className={`text-base ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {booking.userDetails.emergencyContact}
                  </p>
                </div>
              )}
            </div>
            {booking.userDetails?.specialRequests && (
              <div className="mt-4">
                <p className={`text-sm font-medium mb-2 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Special Requests
                </p>
                <p className={`text-base p-3 rounded-lg ${
                  isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
                }`}>
                  {booking.userDetails.specialRequests}
                </p>
              </div>
            )}
          </div>

          {/* Show Details */}
          <div className={`p-6 rounded-lg border ${
            isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'
          }`}>
            <h3 className={`text-lg font-semibold mb-4 flex items-center ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              <CalendarDaysIcon className="w-5 h-5 mr-2" />
              Show Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className={`text-sm font-medium ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Show Date
                </p>
                <p className={`text-base ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {booking.showDate ? format(booking.showDate, 'MMMM dd, yyyy') : 'N/A'}
                </p>
              </div>
              <div>
                <p className={`text-sm font-medium ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Show Time
                </p>
                <p className={`text-base ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {booking.showDetails?.time || 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* Selected Seats */}
          <div className={`p-6 rounded-lg border ${
            isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'
          }`}>
            <h3 className={`text-lg font-semibold mb-4 flex items-center ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              <MapPinIcon className="w-5 h-5 mr-2" />
              Selected Seats ({booking.showDetails?.selectedSeats?.length || 0})
            </h3>
            
            {booking.showDetails?.selectedSeats?.length > 0 ? (
              <div className="space-y-4">
                {/* Seat Summary */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className={`p-3 rounded-lg ${
                    isDarkMode ? 'bg-gray-800' : 'bg-white'
                  }`}>
                    <p className={`text-sm font-medium ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      VIP Sofas
                    </p>
                    <p className={`text-xl font-bold ${
                      isDarkMode ? 'text-purple-400' : 'text-purple-600'
                    }`}>
                      {booking.showDetails.selectedSeats.filter(s => s.type === 'vip').length}
                    </p>
                  </div>
                  <div className={`p-3 rounded-lg ${
                    isDarkMode ? 'bg-gray-800' : 'bg-white'
                  }`}>
                    <p className={`text-sm font-medium ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Regular Seats
                    </p>
                    <p className={`text-xl font-bold ${
                      isDarkMode ? 'text-orange-400' : 'text-orange-600'
                    }`}>
                      {booking.showDetails.selectedSeats.filter(s => s.type === 'regular').length}
                    </p>
                  </div>
                  <div className={`p-3 rounded-lg ${
                    isDarkMode ? 'bg-gray-800' : 'bg-white'
                  }`}>
                    <p className={`text-sm font-medium ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Total Seats
                    </p>
                    <p className={`text-xl font-bold ${
                      isDarkMode ? 'text-blue-400' : 'text-blue-600'
                    }`}>
                      {booking.showDetails.selectedSeats.length}
                    </p>
                  </div>
                </div>

                {/* Detailed Seat List */}
                <div className="space-y-3">
                  <h4 className={`font-medium ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Seat Details:
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                    {booking.showDetails.selectedSeats.map((seat, index) => (
                      <div
                        key={index}
                        className={`p-2 rounded text-center text-sm font-medium ${
                          seat.type === 'vip'
                            ? (isDarkMode 
                                ? 'bg-purple-900 text-purple-300 border border-purple-700' 
                                : 'bg-purple-100 text-purple-800 border border-purple-200')
                            : (isDarkMode 
                                ? 'bg-orange-900 text-orange-300 border border-orange-700' 
                                : 'bg-orange-100 text-orange-800 border border-orange-200')
                        }`}
                      >
                        {getSeatTypeDisplay(seat)}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <p className={`text-center py-8 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                No seat information available
              </p>
            )}
          </div>

          {/* Payment Information */}
          <div className={`p-6 rounded-lg border ${
            isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'
          }`}>
            <h3 className={`text-lg font-semibold mb-4 flex items-center ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              <CreditCardIcon className="w-5 h-5 mr-2" />
              Payment Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <p className={`text-sm font-medium ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Payment Method
                </p>
                <p className={`text-base ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {booking.payment?.method || 'N/A'}
                </p>
              </div>
              <div>
                <p className={`text-sm font-medium ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Total Amount
                </p>
                <p className={`text-lg font-bold ${
                  isDarkMode ? 'text-green-400' : 'text-green-600'
                }`}>
                  ₹{booking.payment?.amount?.toLocaleString() || '0'}
                </p>
              </div>
              {booking.payment?.transactionId && (
                <div>
                  <p className={`text-sm font-medium ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Transaction ID
                  </p>
                  <p className={`text-sm font-mono ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {booking.payment.transactionId}
                  </p>
                </div>
              )}
              <div>
                <p className={`text-sm font-medium ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Payment Status
                </p>
                <p className={`text-base ${
                  booking.payment?.status === 'completed' 
                    ? 'text-green-600' 
                    : booking.payment?.status === 'failed' 
                    ? 'text-red-600' 
                    : 'text-yellow-600'
                }`}>
                  {booking.payment?.status?.charAt(0).toUpperCase() + booking.payment?.status?.slice(1) || 'N/A'}
                </p>
              </div>
            </div>

            {/* Price Breakdown if available */}
            {booking.pricing && (
              <div className="mt-4">
                <h4 className={`font-medium mb-3 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Price Breakdown:
                </h4>
                <div className={`p-4 rounded-lg space-y-2 ${
                  isDarkMode ? 'bg-gray-800' : 'bg-white'
                }`}>
                  {booking.pricing.vipSeats > 0 && (
                    <div className="flex justify-between">
                      <span>VIP Seats ({booking.pricing.vipSeats} × ₹{booking.pricing.vipPrice})</span>
                      <span>₹{(booking.pricing.vipSeats * booking.pricing.vipPrice).toLocaleString()}</span>
                    </div>
                  )}
                  {booking.pricing.regularSeats > 0 && (
                    <div className="flex justify-between">
                      <span>Regular Seats ({booking.pricing.regularSeats} × ₹{booking.pricing.regularPrice})</span>
                      <span>₹{(booking.pricing.regularSeats * booking.pricing.regularPrice).toLocaleString()}</span>
                    </div>
                  )}
                  {booking.pricing.discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount</span>
                      <span>-₹{booking.pricing.discount.toLocaleString()}</span>
                    </div>
                  )}
                  {booking.pricing.tax > 0 && (
                    <div className="flex justify-between">
                      <span>Tax ({booking.pricing.taxRate}%)</span>
                      <span>₹{booking.pricing.tax.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="border-t pt-2 flex justify-between font-bold">
                    <span>Total</span>
                    <span>₹{booking.payment?.amount?.toLocaleString() || '0'}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Additional Information */}
          {(booking.cancelledAt || booking.updatedAt) && (
            <div className={`p-6 rounded-lg border ${
              isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'
            }`}>
              <h3 className={`text-lg font-semibold mb-4 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Additional Information
              </h3>
              <div className="space-y-3">
                {booking.cancelledAt && (
                  <div>
                    <p className={`text-sm font-medium ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Cancelled At
                    </p>
                    <p className={`text-base ${
                      isDarkMode ? 'text-red-400' : 'text-red-600'
                    }`}>
                      {formatDateTime(booking.cancelledAt.toDate?.() || booking.cancelledAt)}
                    </p>
                    {booking.cancelledBy && (
                      <p className={`text-sm ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        Cancelled by: {booking.cancelledBy}
                      </p>
                    )}
                  </div>
                )}
                {booking.updatedAt && (
                  <div>
                    <p className={`text-sm font-medium ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Last Updated
                    </p>
                    <p className={`text-base ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      {formatDateTime(booking.updatedAt.toDate?.() || booking.updatedAt)}
                    </p>
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

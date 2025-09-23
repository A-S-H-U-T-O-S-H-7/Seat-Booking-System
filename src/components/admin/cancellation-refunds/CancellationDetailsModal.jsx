import { useTheme } from '@/context/ThemeContext';
import { 
  XMarkIcon,
  CalendarIcon,
  UserIcon,
  CurrencyRupeeIcon,
  ClockIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline';

export default function CancellationDetailsModal({ 
  isOpen, 
  onClose, 
  cancellation 
}) {
  const { isDarkMode } = useTheme();

  const getStatusColor = (status) => {
    const colors = {
      pending: isDarkMode ? 'bg-yellow-900 text-yellow-200' : 'bg-yellow-100 text-yellow-800',
      processed: isDarkMode ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-800',
      rejected: isDarkMode ? 'bg-red-900 text-red-200' : 'bg-red-100 text-red-800'
    };
    return colors[status] || (isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700');
  };

  const getTypeColor = (type) => {
    const colors = {
      havan: isDarkMode ? 'bg-purple-900 text-purple-200' : 'bg-purple-100 text-purple-800',
      stall: isDarkMode ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800',
      show: isDarkMode ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-800'
    };
    return colors[type] || (isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700');
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-IN', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      time: date.toLocaleTimeString('en-IN', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      })
    };
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (!isOpen || !cancellation) return null;

  const cancellationDateTime = formatDate(cancellation.cancellationDate);
  const bookingDateTime = cancellation.bookingDate ? formatDate(cancellation.bookingDate) : null;
  const eventDateTime = cancellation.eventDate ? formatDate(cancellation.eventDate) : null;

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-md bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-xl border max-w-4xl w-full max-h-[90vh] overflow-y-auto`}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <DocumentTextIcon className={`w-6 h-6 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`} />
            <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Cancellation Details
            </h2>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-md transition-colors ${
              isDarkMode ? 'text-gray-400 hover:text-white hover:bg-gray-700' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            }`}
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Status & Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className={`${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'} rounded-lg border p-4`}>
              <h3 className={`text-sm font-medium mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Booking Status
              </h3>
              <div className="space-y-2">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getTypeColor(cancellation.bookingType)}`}>
                  {cancellation.bookingType.charAt(0).toUpperCase() + cancellation.bookingType.slice(1)} Booking
                </span>
                <div>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(cancellation.refundStatus)}`}>
                    {cancellation.refundStatus.charAt(0).toUpperCase() + cancellation.refundStatus.slice(1)}
                  </span>
                </div>
              </div>
            </div>

            <div className={`${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'} rounded-lg border p-4`}>
              <h3 className={`text-sm font-medium mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Financial Summary
              </h3>
              <div className="space-y-2">
                <div>
                  <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Original Amount</span>
                  <p className={`text-lg font-bold ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                    {formatCurrency(cancellation.originalAmount)}
                  </p>
                </div>
                {cancellation.refundAmount && (
                  <div>
                    <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Refund Amount</span>
                    <p className={`text-lg font-bold ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                      {formatCurrency(cancellation.refundAmount)}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className={`${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'} rounded-lg border p-4`}>
              <h3 className={`text-sm font-medium mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Key Identifiers
              </h3>
              <div className="space-y-2">
                <div>
                  <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Booking ID</span>
                  <p className={`font-mono text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {cancellation.bookingId}
                  </p>
                </div>
                <div>
                  <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Cancellation ID</span>
                  <p className={`font-mono text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {cancellation.id}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Customer Information */}
          <div className={`${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'} rounded-lg border p-4`}>
            <h3 className={`text-base font-medium mb-3 flex items-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              <UserIcon className="w-4 h-4 mr-2" />
              Customer Information
            </h3>
            <div className="flex flex-col lg:flex-row lg:items-center gap-4 text-sm">
              <div className="flex-1">
                <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {cancellation.customerName}
                </span>
                {cancellation.customerPhone && (
                  <span className={`ml-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    • {cancellation.customerPhone}
                  </span>
                )}
              </div>
              <div className="flex items-center">
                <EnvelopeIcon className="w-4 h-4 mr-2 text-gray-400" />
                <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
                  {cancellation.customerEmail}
                </span>
              </div>
            </div>
          </div>

          {/* Timeline, Booking Details, Cancellation Details - Compact Row Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Timeline */}
            <div className={`${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'} rounded-lg border p-4`}>
              <h3 className={`text-sm font-medium mb-3 flex items-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                <ClockIcon className="w-4 h-4 mr-2" />
                Timeline
              </h3>
              <div className="space-y-3">
                {bookingDateTime && (
                  <div className="flex items-start space-x-2">
                    <div className={`w-1.5 h-1.5 rounded-full mt-1.5 ${isDarkMode ? 'bg-blue-500' : 'bg-blue-600'}`}></div>
                    <div>
                      <p className={`text-xs font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        Booking Created
                      </p>
                      <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {bookingDateTime.date.split(',')[0]} at {bookingDateTime.time}
                      </p>
                    </div>
                  </div>
                )}
                <div className="flex items-start space-x-2">
                  <div className={`w-1.5 h-1.5 rounded-full mt-1.5 ${isDarkMode ? 'bg-red-500' : 'bg-red-600'}`}></div>
                  <div>
                    <p className={`text-xs font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      Cancelled
                    </p>
                    <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {cancellationDateTime.date.split(',')[0]} at {cancellationDateTime.time}
                    </p>
                  </div>
                </div>
                {eventDateTime && (
                  <div className="flex items-start space-x-2">
                    <div className={`w-1.5 h-1.5 rounded-full mt-1.5 ${isDarkMode ? 'bg-green-500' : 'bg-green-600'}`}></div>
                    <div>
                      <p className={`text-xs font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        Event Date
                      </p>
                      <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {eventDateTime.date.split(',')[0]} at {eventDateTime.time}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Booking Details */}
            <div className={`${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'} rounded-lg border p-4`}>
              <h3 className={`text-sm font-medium mb-3 flex items-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                <CalendarIcon className="w-4 h-4 mr-2" />
                Booking Details
              </h3>
              <div className="space-y-2 text-xs">
                <div>
                  <span className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Type: </span>
                  <span className={`capitalize ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {cancellation.bookingType}
                  </span>
                </div>
                {cancellation.seatNumbers && (
                  <div>
                    <span className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Seats: </span>
                    <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>
                      {Array.isArray(cancellation.seatNumbers) 
                        ? cancellation.seatNumbers.join(', ')
                        : cancellation.seatNumbers
                      }
                    </span>
                  </div>
                )}
                {cancellation.eventName && (
                  <div>
                    <span className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Event: </span>
                    <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>
                      {cancellation.eventName}
                    </span>
                  </div>
                )}
                {cancellation.guestCount && (
                  <div>
                    <span className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Guests: </span>
                    <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>
                      {cancellation.guestCount}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Cancellation Details */}
            <div className={`${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'} rounded-lg border p-4`}>
              <h3 className={`text-sm font-medium mb-3 flex items-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                <CurrencyRupeeIcon className="w-4 h-4 mr-2" />
                Refund Details
              </h3>
              <div className="space-y-2 text-xs">
                <div>
                  <span className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Reason: </span>
                  <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>
                    {cancellation.cancellationReason || 'Not specified'}
                  </span>
                </div>
                {cancellation.refundReason && (
                  <div>
                    <span className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Refund: </span>
                    <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>
                      {cancellation.refundReason}
                    </span>
                  </div>
                )}
                {cancellation.processingFee && (
                  <div>
                    <span className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Fee: </span>
                    <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>
                      {formatCurrency(cancellation.processingFee)}
                    </span>
                  </div>
                )}
                {cancellation.refundPercentage && (
                  <div>
                    <span className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Rate: </span>
                    <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>
                      {cancellation.refundPercentage}%
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Payment Information */}
          {(cancellation.paymentMethod || cancellation.transactionId || cancellation.paymentStatus) && (
            <div className={`${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'} rounded-lg border p-6`}>
              <h3 className={`text-lg font-medium mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Payment Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {cancellation.paymentMethod && (
                  <div>
                    <label className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      Payment Method
                    </label>
                    <p className={`text-sm mt-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {cancellation.paymentMethod}
                    </p>
                  </div>
                )}
                {cancellation.transactionId && (
                  <div>
                    <label className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      Transaction ID
                    </label>
                    <p className={`text-sm mt-1 font-mono ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {cancellation.transactionId}
                    </p>
                  </div>
                )}
                {cancellation.paymentStatus && (
                  <div>
                    <label className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      Payment Status
                    </label>
                    <p className={`text-sm mt-1 capitalize ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {cancellation.paymentStatus}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Notes */}
          {cancellation.notes && (
            <div className={`${isDarkMode ? 'bg-yellow-900/20 border-yellow-700' : 'bg-yellow-50 border-yellow-200'} border rounded-lg p-4`}>
              <div className="flex items-start space-x-3">
                <ExclamationTriangleIcon className={`w-5 h-5 mt-0.5 ${isDarkMode ? 'text-yellow-400' : 'text-yellow-500'}`} />
                <div className="flex-1">
                  <h4 className={`text-sm font-medium ${isDarkMode ? 'text-yellow-200' : 'text-yellow-700'}`}>
                    Additional Notes
                  </h4>
                  <p className={`text-sm mt-1 ${isDarkMode ? 'text-yellow-300' : 'text-yellow-600'}`}>
                    {cancellation.notes}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              isDarkMode 
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

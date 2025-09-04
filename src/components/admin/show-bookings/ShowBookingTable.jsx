"use client";
import {
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  TrashIcon,
  ExclamationTriangleIcon,
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  TicketIcon,
  CheckIcon
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';

export default function ShowBookingsTable({
  bookings,
  isDarkMode,
  currentPage = 1,
  bookingsPerPage = 10,
  isUpdating,
  onViewDetails,
  onConfirm,
  onCancel,
  onDelete,
  onApproveCancellation,
  onRejectCancellation,
  onParticipation
}) {
  const formatCurrency = (amount) => {
    if (!amount || isNaN(amount)) return '₹0';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
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

  const getStatusBadge = (status) => {
    const statusConfig = {
      confirmed: {
        bg: isDarkMode ? 'bg-green-900/30 text-green-300 border-green-600' : 'bg-green-50 text-green-700 border-green-200',
        icon: CheckCircleIcon,
        label: 'Confirmed'
      },
      pending: {
        bg: isDarkMode ? 'bg-yellow-900/30 text-yellow-300 border-yellow-600' : 'bg-yellow-50 text-yellow-700 border-yellow-200',
        icon: ClockIcon,
        label: 'Pending'
      },
      cancelled: {
        bg: isDarkMode ? 'bg-red-900/30 text-red-300 border-red-600' : 'bg-red-50 text-red-700 border-red-200',
        icon: XCircleIcon,
        label: 'Cancelled'
      },
      'cancellation-requested': {
        bg: isDarkMode ? 'bg-orange-900/30 text-orange-300 border-orange-600' : 'bg-orange-50 text-orange-700 border-orange-200',
        icon: ExclamationTriangleIcon,
        label: 'Cancellation Requested'
      }
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;
    
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium border ${config.bg}`}>
        <Icon className="w-3 h-3 mr-1.5" />
        {config.label}
      </span>
    );
  };

  const getSeatCategory = (seatId) => {
    if (!seatId) return 'Standard';
    // Convert to string to handle cases where seatId might be a number or object
    const seatStr = String(seatId);
    if (seatStr.startsWith('A') || seatStr.startsWith('B')) return 'VIP';
    if (seatStr.startsWith('C')) return 'Premium';
    return 'Standard';
  };

  const renderActionButtons = (booking) => {
    const baseButtonClass = `p-2 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105`;
    
    return (
      <div className="flex items-center space-x-2">
        <button
          onClick={() => onViewDetails(booking)}
          className={`${baseButtonClass} ${
            isDarkMode 
              ? 'bg-slate-700 hover:bg-slate-600 text-slate-200 border border-slate-600' 
              : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
          }`}
          title="View Details"
        >
          <EyeIcon className="h-4 w-4" />
        </button>

        {/* Pending Status: No action buttons shown (only View Details) */}

        {booking.status === 'confirmed' && (
          <>
            <button
              onClick={() => onParticipation(booking)}
              disabled={isUpdating}
              className={`${baseButtonClass} ${
                booking.participated
                  ? (isDarkMode
                      ? 'bg-green-700 text-green-100 border border-green-600 cursor-default'
                      : 'bg-green-600 text-white border border-green-600 cursor-default')
                  : (isDarkMode
                      ? 'bg-blue-700 hover:bg-blue-600 text-blue-100 border border-blue-600'
                      : 'bg-blue-600 hover:bg-blue-700 text-white border border-blue-600')
              }`}
              title={booking.participated ? 'Already Participated' : 'Mark Participation'}
            >
              <CheckIcon className="h-4 w-4" />
            </button>
            <button
              onClick={() => onCancel(booking)}
              disabled={isUpdating}
              className={`${baseButtonClass} ${
                isDarkMode 
                  ? 'bg-red-700 hover:bg-red-600 text-red-100 border border-red-600' 
                  : 'bg-red-600 hover:bg-red-700 text-white border border-red-600'
              }`}
              title="Cancel Booking"
            >
              <XCircleIcon className="h-4 w-4" />
            </button>
          </>
        )}

        {booking.status === 'cancellation-requested' && (
          <>
            <button
              onClick={() => onApproveCancellation(booking)}
              disabled={isUpdating}
              className={`${baseButtonClass} ${
                isDarkMode 
                  ? 'bg-green-700 hover:bg-green-600 text-green-100 border border-green-600' 
                  : 'bg-green-600 hover:bg-green-700 text-white border border-green-600'
              }`}
              title="Approve Cancellation"
            >
              <CheckCircleIcon className="h-4 w-4" />
            </button>
            <button
              onClick={() => onRejectCancellation(booking)}
              disabled={isUpdating}
              className={`${baseButtonClass} ${
                isDarkMode 
                  ? 'bg-red-700 hover:bg-red-600 text-red-100 border border-red-600' 
                  : 'bg-red-600 hover:bg-red-700 text-white border border-red-600'
              }`}
              title="Reject Cancellation"
            >
              <XCircleIcon className="h-4 w-4" />
            </button>
          </>
        )}

      </div>
    );
  };

  if (!bookings || bookings.length === 0) {
    return (
      <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border p-12 text-center`}>
        <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
          isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
        }`}>
          <TicketIcon className={`w-8 h-8 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
        </div>
        <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          No Show Bookings Found
        </h3>
        <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          There are no show bookings to display at the moment.
        </p>
      </div>
    );
  }

  return (
    <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className={isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50/50'}>
            <tr>
              <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${
                isDarkMode ? 'text-gray-300' : 'text-gray-500'
              }`}>
                S.No
              </th>
              <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${
                isDarkMode ? 'text-gray-300' : 'text-gray-500'
              }`}>
                Booking Details
              </th>
              <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${
                isDarkMode ? 'text-gray-300' : 'text-gray-500'
              }`}>
                Customer Information
              </th>
              <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${
                isDarkMode ? 'text-gray-300' : 'text-gray-500'
              }`}>
                Show Details
              </th>
              <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${
                isDarkMode ? 'text-gray-300' : 'text-gray-500'
              }`}>
                Amount
              </th>
              <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${
                isDarkMode ? 'text-gray-300' : 'text-gray-500'
              }`}>
                Status
              </th>
              <th className={`px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider ${
                isDarkMode ? 'text-gray-300' : 'text-gray-500'
              }`}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody className={`${isDarkMode ? 'bg-gray-800 divide-gray-700' : 'bg-white divide-gray-200'} divide-y`}>
            {bookings.map((booking, index) => (
              <tr key={booking.id} className={`transition-colors duration-150 ${
                booking.participated 
                  ? (isDarkMode ? 'bg-green-900/20 hover:bg-green-800/30 border-l-4 border-green-500' : 'bg-green-50 hover:bg-green-100/70 border-l-4 border-green-400')
                  : (isDarkMode ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50/50')
              }`}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {((currentPage - 1) * bookingsPerPage + index + 1).toString().padStart(2, '0')}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="space-y-1">
                    <div className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      #{booking.id}
                    </div>
                    <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Created: {formatDateTime(booking.createdAt)}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="space-y-1">
                    <div className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {booking.userDetails?.name || 'N/A'}
                    </div>
                    <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {booking.userDetails?.email || 'N/A'}
                    </div>
                    <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {booking.userDetails?.phone || 'N/A'}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="space-y-2">
                    <div className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {(() => {
                        try {
                          if (booking.showDetails?.date) {
                          const showDate = booking.showDetails.date;
                          let dateObj;
                            
                            if (showDate.toDate && typeof showDate.toDate === 'function') {
                              dateObj = showDate.toDate();
                            } else if (showDate.seconds) {
                              dateObj = new Date(showDate.seconds * 1000);
                            } else if (showDate._seconds) {
                              dateObj = new Date(showDate._seconds * 1000);
                            } else if (typeof showDate === 'string') {
                              // Handle string dates
                              if (showDate.includes('T') || showDate.includes('-')) {
                                dateObj = new Date(showDate);
                              } else {
                                // Try parsing as timestamp
                                const timestamp = parseInt(showDate);
                                if (!isNaN(timestamp)) {
                                  dateObj = new Date(timestamp);
                                }
                              }
                            } else if (typeof showDate === 'number') {
                              // Handle timestamp
                              dateObj = new Date(showDate);
                            } else if (showDate instanceof Date) {
                              dateObj = showDate;
                            } else if (typeof showDate === 'object' && showDate !== null) {
                              // Handle other object formats
                              if (showDate.seconds || showDate._seconds) {
                                const seconds = showDate.seconds || showDate._seconds;
                                dateObj = new Date(seconds * 1000);
                              }
                            }
                            
                            if (dateObj && !isNaN(dateObj.getTime())) {
                              return format(dateObj, 'MMM dd, yyyy') + (booking.showDetails?.time ? ` (${booking.showDetails.time})` : '');
                            }
                            
                            console.warn('Could not parse date:', showDate);
                          }
                          return 'N/A';
                        } catch (error) {
                          console.error('Error formatting show date:', error, booking.showDetails?.date);
                          return 'Invalid Date';
                        }
                      })()} 
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {booking.showDetails?.selectedSeats?.slice(0, 3).map((seat, idx) => {
                        const seatDisplay = typeof seat === 'object' ? (seat.id || seat.seatId || seat.type || String(seat)) : String(seat);
                        return (
                          <span key={idx} className={`inline-block px-2 py-1 rounded-md text-xs font-medium ${
                            getSeatCategory(seatDisplay) === 'VIP' 
                              ? isDarkMode ? 'bg-yellow-900/50 text-yellow-300 border border-yellow-700' : 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                              : getSeatCategory(seatDisplay) === 'Premium'
                              ? isDarkMode ? 'bg-blue-900/50 text-blue-300 border border-blue-700' : 'bg-blue-50 text-blue-700 border border-blue-200'
                              : isDarkMode ? 'bg-gray-600 text-gray-300 border border-gray-700' : 'bg-gray-100 text-gray-700 border border-gray-300'
                          }`}>
                            {seatDisplay}
                          </span>
                        );
                      })}
                      {booking.showDetails?.selectedSeats?.length > 3 && (
                        <span className={`inline-block px-2 py-1 rounded-md text-xs font-medium ${
                          isDarkMode ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-600'
                        }`}>
                          +{booking.showDetails.selectedSeats.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="space-y-1">
                    <div className={`text-sm font-bold ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                      {formatCurrency(booking.showDetails?.totalAmount || booking.showDetails?.totalPrice || booking.payment?.amount || 0)}
                    </div>
                    <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {booking.showDetails?.selectedSeats?.length || 0} seat{booking.showDetails?.selectedSeats?.length !== 1 ? 's' : ''}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="space-y-2">
                    {getStatusBadge(booking.status)}
                    {booking.cancellationReason && (
                      <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} max-w-32`}>
                        <span className="font-medium">Reason:</span> {booking.cancellationReason}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  {renderActionButtons(booking)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
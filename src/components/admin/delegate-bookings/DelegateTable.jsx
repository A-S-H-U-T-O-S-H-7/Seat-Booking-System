import React from 'react';
import {
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
  PhoneIcon,
  MapPinIcon,
  BuildingOfficeIcon,
  UserIcon,
  CurrencyRupeeIcon,
  CalendarIcon,
  EnvelopeIcon,
  CheckIcon
} from '@heroicons/react/24/outline';

export default function DelegateTable({
  bookings,
  isDarkMode,
  currentPage = 1,  
  bookingsPerPage = 10,
  isUpdating,
  onViewDetails,
  onConfirm,
  onCancel,
  onApproveCancellation,
  onRejectCancellation,
  onParticipation,
  onViewDocuments
}) {
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

  const formatDate = (dateValue) => {
    if (!dateValue) return 'N/A';
    
    try {
      let date;
      
      if (dateValue.toDate && typeof dateValue.toDate === 'function') {
        date = dateValue.toDate();
      }
      else if (dateValue.seconds) {
        date = new Date(dateValue.seconds * 1000);
      }
      else if (dateValue instanceof Date) {
        date = dateValue;
      }
      else if (typeof dateValue === 'string' || typeof dateValue === 'number') {
        date = new Date(dateValue);
      }
      
      if (date && !isNaN(date.getTime())) {
        return date.toLocaleDateString('en-US', {
          month: 'short',
          day: '2-digit',
          year: 'numeric'
        });
      }
    } catch (error) {
      console.error('Error formatting date:', error, dateValue);
    }
    
    return 'N/A';
  };

  const formatDateTime = (dateValue) => {
    if (!dateValue) return 'N/A';
    
    try {
      let date;
      
      if (dateValue.toDate && typeof dateValue.toDate === 'function') {
        date = dateValue.toDate();
      }
      else if (dateValue.seconds) {
        date = new Date(dateValue.seconds * 1000);
      }
      else if (dateValue instanceof Date) {
        date = dateValue;
      }
      else if (typeof dateValue === 'string' || typeof dateValue === 'number') {
        date = new Date(dateValue);
      }
      
      if (date && !isNaN(date.getTime())) {
        return date.toLocaleDateString('en-US', {
          month: 'short',
          day: '2-digit',
          year: 'numeric'
        }) + ' ' + date.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        });
      }
    } catch (error) {
      console.error('Error formatting datetime:', error, dateValue);
    }
    
    return 'N/A';
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'confirmed': { color: 'green', label: 'Confirmed', icon: '✓' },
      'pending': { color: 'yellow', label: 'Pending', icon: '⏳' },
      'cancelled': { color: 'red', label: 'Cancelled', icon: '✕' },
      'cancellation-requested': { color: 'orange', label: 'Cancel Requested', icon: '⚠️' },
      'refunded': { color: 'purple', label: 'Refunded', icon: '💰' }
    };

    const config = statusMap[status] || statusMap.pending;
    
    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
        config.color === 'green' ? (isDarkMode ? 'bg-green-900/30 text-green-300 border border-green-700' : 'bg-green-100 text-green-800 border border-green-200') :
        config.color === 'yellow' ? (isDarkMode ? 'bg-yellow-900/30 text-yellow-300 border border-yellow-700' : 'bg-yellow-100 text-yellow-800 border border-yellow-200') :
        config.color === 'red' ? (isDarkMode ? 'bg-red-900/30 text-red-300 border border-red-700' : 'bg-red-100 text-red-800 border border-red-200') :
        config.color === 'orange' ? (isDarkMode ? 'bg-orange-900/30 text-orange-300 border border-orange-700' : 'bg-orange-100 text-orange-800 border border-orange-200') :
        (isDarkMode ? 'bg-purple-900/30 text-purple-300 border border-purple-700' : 'bg-purple-100 text-purple-800 border border-purple-200')
      }`}>
        <span>{config.icon}</span>
        {config.label}
      </span>
    );
  };

  const getRegistrationTypeIcon = (type) => {
    const icons = {
      'Company': '🏢',
      'Temple': '🕉️',
      'Individual': '👤'
    };
    return icons[type] || '📋';
  };

  const getDelegateTypeDisplay = (type) => {
    const types = {
      'withoutAssistance': 'Without Assistance',
      'withAssistance': 'With Assistance'
    };
    return types[type] || type || 'Standard';
  };

  const renderActionButtons = (booking) => {
    const baseButtonClass = `p-2 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105`;
    
    return (
      <div className="flex items-center gap-2">
        {/* View Details Button */}
        <button
          onClick={() => onViewDetails(booking)}
          className={`${baseButtonClass} ${
            isDarkMode 
              ? 'bg-blue-600 hover:bg-blue-700 text-white' 
              : 'bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200'
          }`}
          title="View Details"
        >
          <EyeIcon className="h-4 w-4" />
        </button>

        {/* Status-specific buttons */}
        {booking.status === 'pending' && (
          <>
            <button
              onClick={() => onConfirm(booking)}
              disabled={isUpdating}
              className={`${baseButtonClass} ${
                isDarkMode
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-green-50 hover:bg-green-100 text-green-600 border border-green-200'
              }`}
              title="Confirm Registration"
            >
              <CheckCircleIcon className="h-4 w-4" />
            </button>
            <button
              onClick={() => onCancel(booking)}
              disabled={isUpdating}
              className={`${baseButtonClass} ${
                isDarkMode
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-red-50 hover:bg-red-100 text-red-600 border border-red-200'
              }`}
              title="Cancel Registration"
            >
              <XCircleIcon className="h-4 w-4" />
            </button>
          </>
        )}

        {booking.status === 'confirmed' && (
          <button
            onClick={() => onParticipation(booking)}
            disabled={isUpdating}
            className={`${baseButtonClass} ${
              booking.participated
                ? (isDarkMode
                    ? 'bg-green-600 text-white cursor-default'
                    : 'bg-green-50 text-green-600 border border-green-200 cursor-default')
                : (isDarkMode
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200')
            }`}
            title={booking.participated ? 'Already Participated' : 'Mark Participation'}
          >
            <CheckIcon className="h-4 w-4" />
          </button>
        )}

        {booking.status === 'cancellation-requested' && (
          <>
            <button
              onClick={() => onApproveCancellation(booking.id)}
              disabled={isUpdating}
              className={`${baseButtonClass} ${
                isDarkMode
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-green-50 hover:bg-green-100 text-green-600 border border-green-200'
              }`}
              title="Approve Cancellation"
            >
              <CheckCircleIcon className="h-4 w-4" />
            </button>
            <button
              onClick={() => onRejectCancellation(booking.id)}
              disabled={isUpdating}
              className={`${baseButtonClass} ${
                isDarkMode
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-red-50 hover:bg-red-100 text-red-600 border border-red-200'
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

  if (bookings.length === 0) {
    return (
      <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-2xl border shadow-lg`}>
        <div className="text-center py-16">
          <div className={`mx-auto h-16 w-16 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} flex items-center justify-center mb-4`}>
            <UserIcon className={`h-8 w-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
          </div>
          <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-900'} mb-2`}>
            No delegate registrations found
          </h3>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            No delegates match your current search criteria.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl border shadow-sm overflow-hidden`}>
      {/* Desktop Table - Improved structure */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="min-w-full">
          <thead className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} border-b ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}>
            <tr>
              <th className={`px-4 py-4 text-left text-xs font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} uppercase tracking-wider`}>
                S.No.
              </th>
              <th className={`px-4 py-4 text-left text-xs font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} uppercase tracking-wider`}>
                Delegate Information
              </th>
              <th className={`px-4 py-4 text-left text-xs font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} uppercase tracking-wider`}>
                Contact Details
              </th>
              <th className={`px-4 py-4 text-left text-xs font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} uppercase tracking-wider`}>
                Organization & Type
              </th>
              <th className={`px-4 py-4 text-left text-xs font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} uppercase tracking-wider`}>
                Documents & Photo
              </th>
              <th className={`px-4 py-4 text-left text-xs font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} uppercase tracking-wider`}>
                Payment & Status
              </th>
              <th className={`px-4 py-4 text-center text-xs font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} uppercase tracking-wider`}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody className={`divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
            {bookings.map((booking, index) => {
              // Extract data based on actual Firestore structure
              const delegate = booking.delegateDetails || {};
              const event = booking.eventDetails || {};
              const payment = booking.payment || {};
              
              return (
                <tr key={booking.id} className={`${
                  booking.participated 
                    ? (isDarkMode ? 'bg-green-900/20 hover:bg-green-800/30 border-l-4 border-green-500' : 'bg-green-50 hover:bg-green-100/70 border-l-4 border-green-400')
                    : (isDarkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50')
                } transition-colors duration-150`}>
                  {/* Serial Number */}
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {(currentPage - 1) * bookingsPerPage + index + 1}
                    </div>
                  </td>
                  {/* Delegate Information */}
                  <td className="px-4 py-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-12 w-12">
                        {delegate.fileInfo?.imageUrl ? (
                          <img 
                            src={delegate.fileInfo.imageUrl} 
                            alt="Delegate"
                            className="h-12 w-12 rounded-full object-cover border-2 border-gray-200"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div className={`h-12 w-12 rounded-full ${isDarkMode ? 'bg-gradient-to-br from-yellow-500 to-amber-600' : 'bg-gradient-to-br from-yellow-400 to-amber-500'} flex items-center justify-center ${delegate.fileInfo?.imageUrl ? 'hidden' : 'flex'}`}>
                          <span className="text-sm font-bold text-white">
                            {(delegate.name || 'D').charAt(0).toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {delegate.name || 'N/A'}
                        </div>
                        <div className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} flex items-center gap-1`}>
                          <span className="font-mono">ID: {booking.id.substring(0, 8)}...</span>
                        </div>
                        {event.designation && (
                          <div className={`text-xs ${isDarkMode ? 'text-yellow-300' : 'text-yellow-700'} font-medium`}>
                            {event.designation}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Contact Details */}
                  <td className="px-4 py-4">
                    <div className="space-y-1">
                      <div className={`text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'} flex items-center gap-1`}>
                        <PhoneIcon className="w-3 h-3" />
                        <span>{delegate.mobile || 'N/A'}</span>
                      </div>
                      <div className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} flex items-center gap-1`}>
                        <EnvelopeIcon className="w-3 h-3" />
                        <span className="truncate max-w-[150px]">{delegate.email || 'N/A'}</span>
                      </div>
                      <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} flex items-center gap-1`}>
                        <MapPinIcon className="w-3 h-3" />
                        <span>{delegate.pincode || 'N/A'}</span>
                        {delegate.city && <span>• {delegate.city}</span>}
                      </div>
                    </div>
                  </td>

                  {/* Organization & Type */}
                  <td className="px-4 py-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{getRegistrationTypeIcon(event.registrationType)}</span>
                        <div>
                          <div className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {event.registrationType === 'Company' ? event.companyName :
                             event.registrationType === 'Temple' ? event.templeName :
                             event.registrationType || 'Individual'}
                          </div>
                          <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            {event.registrationType || 'Individual'} Registration
                          </div>
                        </div>
                      </div>
                      <div className={`text-xs px-2 py-1 rounded-full ${isDarkMode ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-700'} font-medium text-center`}>
                        {getDelegateTypeDisplay(event.delegateType)}
                      </div>
                      {event.numberOfPersons && (
                        <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {event.numberOfPersons} person{event.numberOfPersons > 1 ? 's' : ''} • {event.duration || '5'} days
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Documents & Photo */}
                  <td className="px-4 py-4">
                    <div className="space-y-2">
                      {/* Documents */}
                      <div className="space-y-1">
                        {booking.status !== 'cancelled' && (
                          <button
                            onClick={() => onViewDocuments && onViewDocuments(booking)}
                            className={`w-full px-3 py-1.5 text-xs font-medium rounded-lg transition-all text-center ${
                              isDarkMode 
                                ? 'bg-blue-900/30 text-blue-300 border border-blue-700 hover:bg-blue-800/40' 
                                : 'bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100'
                            }`}
                            title="View Booking Documents"
                          >
                            📄 Documents
                          </button>
                        )}
                        {delegate.aadharno && (
                          <div className={`text-xs ${isDarkMode ? 'text-blue-300' : 'text-blue-600'} font-mono bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded`}>
                            Aadhar: ****{delegate.aadharno.toString().substring(8)}
                          </div>
                        )}
                        {delegate.pan && (
                          <div className={`text-xs ${isDarkMode ? 'text-purple-300' : 'text-purple-600'} font-mono bg-purple-50 dark:bg-purple-900/20 px-2 py-1 rounded`}>
                            PAN: {delegate.pan}
                          </div>
                        )}
                        {delegate.passportno && (
                          <div className={`text-xs ${isDarkMode ? 'text-green-300' : 'text-green-600'} font-mono bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded`}>
                            Passport: {delegate.passportno}
                          </div>
                        )}
                      </div>
                      
                      {/* Photo Status */}
                      <div className="flex items-center space-x-2">
                        {delegate.fileInfo?.fileUploaded ? (
                          <>
                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${isDarkMode ? 'bg-green-900/30 text-green-300' : 'bg-green-100 text-green-700'}`}>
                              ✅ Photo
                            </span>
                            {delegate.fileInfo?.imageUrl && (
                              <button 
                                onClick={() => window.open(delegate.fileInfo.imageUrl, '_blank')}
                                className={`text-xs px-2 py-1 rounded ${isDarkMode ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-blue-100 text-blue-600 hover:bg-blue-200'} transition-colors`}
                              >
                                View
                              </button>
                            )}
                          </>
                        ) : (
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${isDarkMode ? 'bg-red-900/30 text-red-300' : 'bg-red-100 text-red-700'}`}>
                            ❌ No Photo
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Payment & Status */}
                  <td className="px-4 py-4">
                    <div className="space-y-3">
                      {getStatusBadge(booking.status)}
                      <div className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        ₹{(booking.totalAmount || 0).toLocaleString()}
                      </div>
                      <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        via {payment.method || payment.gateway || booking.payment?.gateway || 'CCAvenue'}
                      </div>
                      <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} flex items-center gap-1`}>
                        <CalendarIcon className="w-3 h-3" />
                        {formatDate(booking.createdAt)}
                      </div>
                      {payment.paymentId && !payment.paymentId.includes('pending_') && (
                        <div className={`text-xs font-mono ${isDarkMode ? 'text-blue-300' : 'text-blue-600'} bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded`}>
                          {payment.paymentId.substring(0, 12)}...
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-4">
                    <div className="flex justify-center">
                      {renderActionButtons(booking)}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Tablet View */}
      <div className="hidden md:block lg:hidden overflow-x-auto">
        <div className="space-y-4 p-4">
          {bookings.map((booking, index) => {
            const delegate = booking.delegateDetails || {};
            const event = booking.eventDetails || {};
            const payment = booking.payment || {};
            
            return (
              <div key={booking.id} className={`${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'} border rounded-lg p-4 hover:shadow-md transition-all`}>
                <div className="grid grid-cols-3 gap-4">
                  {/* Left Column - Delegate Info */}
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0 h-12 w-12">
                      {delegate.fileInfo?.imageUrl ? (
                        <img 
                          src={delegate.fileInfo.imageUrl} 
                          alt="Delegate"
                          className="h-12 w-12 rounded-full object-cover border-2 border-gray-200"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div className={`h-12 w-12 rounded-full ${isDarkMode ? 'bg-gradient-to-br from-yellow-500 to-amber-600' : 'bg-gradient-to-br from-yellow-400 to-amber-500'} flex items-center justify-center ${delegate.fileInfo?.imageUrl ? 'hidden' : 'flex'}`}>
                        <span className="text-sm font-bold text-white">
                          {(delegate.name || 'D').charAt(0).toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} truncate`}>
                        {delegate.name || 'N/A'}
                      </div>
                      <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} truncate`}>
                        {delegate.email || 'N/A'}
                      </div>
                      <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        📱 {delegate.mobile || 'N/A'}
                      </div>
                    </div>
                  </div>

                  {/* Middle Column - Details */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-md">{getRegistrationTypeIcon(event.registrationType)}</span>
                      <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'} truncate`}>
                        {event.registrationType === 'Company' ? event.companyName :
                         event.registrationType === 'Temple' ? event.templeName :
                         event.registrationType || 'Individual'}
                      </span>
                    </div>
                    <div className={`text-xs px-2 py-1 rounded-full ${isDarkMode ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-700'} font-medium text-center`}>
                      {getDelegateTypeDisplay(event.delegateType)}
                    </div>
                    {delegate.fileInfo?.fileUploaded ? (
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${isDarkMode ? 'bg-green-900/30 text-green-300' : 'bg-green-100 text-green-700'}`}>
                        ✅ Photo
                      </span>
                    ) : (
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${isDarkMode ? 'bg-red-900/30 text-red-300' : 'bg-red-100 text-red-700'}`}>
                        ❌ No Photo
                      </span>
                    )}
                  </div>

                  {/* Right Column - Status & Actions */}
                  <div className="flex flex-col items-end space-y-2">
                    {getStatusBadge(booking.status)}
                    <div className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      ₹{(booking.totalAmount || 0).toLocaleString()}
                    </div>
                    <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {formatDate(booking.createdAt)}
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      {renderActionButtons(booking)}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>


      {/* Mobile Cards */}
      <div className="block md:hidden">
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {bookings.map((booking, index) => {
            const delegate = booking.delegateDetails || {};
            const event = booking.eventDetails || {};
            const payment = booking.payment || {};
            
            return (
              <div key={booking.id} className={`p-4 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    {delegate.fileInfo?.imageUrl ? (
                      <img 
                        src={delegate.fileInfo.imageUrl} 
                        alt="Delegate"
                        className="h-12 w-12 rounded-full object-cover border-2 border-gray-200 flex-shrink-0"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div className={`h-12 w-12 rounded-full ${isDarkMode ? 'bg-gradient-to-br from-yellow-500 to-amber-600' : 'bg-gradient-to-br from-yellow-400 to-amber-500'} flex items-center justify-center flex-shrink-0 ${delegate.fileInfo?.imageUrl ? 'hidden' : 'flex'}`}>
                      <span className="text-sm font-bold text-white">
                        {(delegate.name || 'D').charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} truncate`}>
                        {delegate.name || 'N/A'}
                      </div>
                      <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} font-mono`}>
                        {booking.id.substring(0, 12)}...
                      </div>
                      <div className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} truncate`}>
                        {delegate.email || 'N/A'}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-1">
                    {getStatusBadge(booking.status)}
                    <div className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      ₹{(booking.totalAmount || 0).toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Quick Info */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="space-y-1">
                    <div className={`text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Contact</div>
                    <div className={`text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>📱 {delegate.mobile || 'N/A'}</div>
                    <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>📮 {delegate.pincode || 'N/A'}</div>
                  </div>
                  <div className="space-y-1">
                    <div className={`text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Registration</div>
                    <div className="flex items-center gap-1">
                      <span className="text-sm">{getRegistrationTypeIcon(event.registrationType)}</span>
                      <span className={`text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{event.registrationType || 'Individual'}</span>
                    </div>
                    <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {getDelegateTypeDisplay(event.delegateType)}
                    </div>
                  </div>
                </div>
                
                {/* Additional Details */}
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between items-center">
                    <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Photo Status:</span>
                    <span className={`text-xs font-medium ${
                      delegate.fileInfo?.fileUploaded
                        ? (isDarkMode ? 'text-green-400' : 'text-green-600') 
                        : (isDarkMode ? 'text-red-400' : 'text-red-600')
                    }`}>
                      {delegate.fileInfo?.fileUploaded ? '✅ Uploaded' : '❌ Not uploaded'}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Payment Method:</span>
                    <span className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} font-medium`}>
                      {payment.method || payment.gateway || booking.payment?.gateway || 'CCAvenue'}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Registration Date:</span>
                    <span className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {formatDate(booking.createdAt)}
                    </span>
                  </div>
                  
                  {/* Documents Quick View */}
                  {(delegate.aadharno || delegate.pan || delegate.passportno) && (
                    <div className="flex justify-between items-start">
                      <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Documents:</span>
                      <div className="text-right space-y-1">
                        {delegate.aadharno && (
                          <div className={`text-xs ${isDarkMode ? 'text-blue-300' : 'text-blue-700'} font-mono bg-blue-50 dark:bg-blue-900/20 px-1 py-0.5 rounded`}>
                            Aadhar: ****{delegate.aadharno.substring(8)}
                          </div>
                        )}
                        {delegate.pan && (
                          <div className={`text-xs ${isDarkMode ? 'text-purple-300' : 'text-purple-700'} font-mono bg-purple-50 dark:bg-purple-900/20 px-1 py-0.5 rounded`}>
                            PAN: {delegate.pan}
                          </div>
                        )}
                        {delegate.passportno && (
                          <div className={`text-xs ${isDarkMode ? 'text-green-300' : 'text-green-700'} font-mono bg-green-50 dark:bg-green-900/20 px-1 py-0.5 rounded`}>
                            Passport: {delegate.passportno}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex justify-center pt-3 border-t border-gray-200 dark:border-gray-600">
                  {renderActionButtons(booking)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

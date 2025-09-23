import React, { useRef, useEffect } from 'react';
import {
  XMarkIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  BuildingOfficeIcon,
  DocumentTextIcon,
  PhotoIcon,
  CreditCardIcon,
  CalendarDaysIcon,
  TagIcon,
  IdentificationIcon
} from '@heroicons/react/24/outline';

export default function DelegateDetailsModal({
  show,
  booking,
  onClose,
  isDarkMode
}) {
  const modalRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (show) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [show, onClose]);

  const handleBackdropClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      onClose();
    }
  };

  const formatDate = (dateValue) => {
    if (!dateValue) return 'N/A';
    
    try {
      let date;
      
      if (dateValue.toDate && typeof dateValue.toDate === 'function') {
        date = dateValue.toDate();
      } else if (dateValue.seconds) {
        date = new Date(dateValue.seconds * 1000);
      } else if (dateValue instanceof Date) {
        date = dateValue;
      } else if (typeof dateValue === 'string' || typeof dateValue === 'number') {
        date = new Date(dateValue);
      }
      
      if (date && !isNaN(date.getTime())) {
        return date.toLocaleDateString('en-US', {
          weekday: 'short',
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });
      }
    } catch (error) {
      console.error('Error formatting date:', error, dateValue);
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

  if (!show || !booking) return null;

  const delegate = booking.delegateDetails || {};
  const event = booking.eventDetails || {};
  const payment = booking.payment || {};

  return (
    <div 
      className="fixed inset-0 bg-black/20 backdrop-blur-sm bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div 
        ref={modalRef}
        className={`
          ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}
          border rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto
          transform transition-all duration-300 ease-out
        `}
      >
        {/* Header */}
        <div className={`sticky top-0 z-10 px-6 py-4 border-b ${isDarkMode ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-white'} rounded-t-2xl`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`h-12 w-12 rounded-xl ${isDarkMode ? 'bg-gradient-to-br from-blue-600 to-purple-600' : 'bg-gradient-to-br from-blue-500 to-purple-500'} flex items-center justify-center`}>
                <span className="text-xl">{getRegistrationTypeIcon(event.registrationType)}</span>
              </div>
              <div>
                <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {delegate.name || 'N/A'}
                </h2>
                <p className={`text-sm font-mono ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  ID: {booking.id || booking.bookingId}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className={`
                p-2 rounded-xl transition-colors hover:scale-105
                ${isDarkMode 
                  ? 'text-gray-400 hover:text-white hover:bg-gray-800' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }
              `}
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Personal Information */}
              <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'} border rounded-2xl p-6`}>
                <div className="flex items-center gap-3 mb-6">
                  <UserIcon className={`w-6 h-6 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                  <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Personal Information
                  </h3>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className={`block text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wide mb-1`}>Full Name</label>
                    <p className={`text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'} font-medium`}>
                      {delegate.name || 'N/A'}
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wide mb-1`}>Email</label>
                      <div className="flex items-center gap-2">
                        <EnvelopeIcon className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                        <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          {delegate.email || 'N/A'}
                        </p>
                      </div>
                    </div>
                    <div>
                      <label className={`block text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wide mb-1`}>Mobile</label>
                      <div className="flex items-center gap-2">
                        <PhoneIcon className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                        <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          {delegate.mobile || 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                  {delegate.designation && (
                    <div>
                      <label className={`block text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wide mb-1`}>Designation</label>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {delegate.designation}
                      </p>
                    </div>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wide mb-1`}>Registration Type</label>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {event.registrationType || 'Individual'}
                      </p>
                    </div>
                    <div>
                      <label className={`block text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wide mb-1`}>Company/Temple Name</label>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {event.registrationType === 'Company' ? event.companyName :
                         event.registrationType === 'Temple' ? event.templeName :
                         delegate.companyname || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Address & Location */}
              <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'} border rounded-2xl p-6`}>
                <div className="flex items-center gap-3 mb-6">
                  <MapPinIcon className={`w-6 h-6 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} />
                  <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Address & Location
                  </h3>
                </div>
                <div className="space-y-4">
                  {delegate.address && (
                    <div>
                      <label className={`block text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wide mb-1`}>Complete Address</label>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} p-3 bg-gray-100 dark:bg-gray-700 rounded-lg`}>
                        {delegate.address}
                      </p>
                    </div>
                  )}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <label className={`block text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wide mb-1`}>City</label>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {delegate.city || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <label className={`block text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wide mb-1`}>State</label>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {delegate.state || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <label className={`block text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wide mb-1`}>Country</label>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {delegate.country || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <label className={`block text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wide mb-1`}>Pincode</label>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} font-mono`}>
                        {delegate.pincode || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Registration Details */}
              <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'} border rounded-2xl p-6`}>
                <div className="flex items-center gap-3 mb-6">
                  <BuildingOfficeIcon className={`w-6 h-6 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`} />
                  <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Registration Details
                  </h3>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className={`block text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wide mb-1`}>Registration Type</label>
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{getRegistrationTypeIcon(event.registrationType)}</span>
                      <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {event.registrationType || 'Individual'}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className={`block text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wide mb-1`}>Organization</label>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {event.registrationType === 'Company' ? event.companyName :
                       event.registrationType === 'Temple' ? event.templeName :
                       delegate.companyname || 'N/A'}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wide mb-1`}>Package Type</label>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {getDelegateTypeDisplay(event.delegateType)}
                      </p>
                    </div>
                    <div>
                      <label className={`block text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wide mb-1`}>Duration</label>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {event.duration || 'N/A'} days
                      </p>
                    </div>
                  </div>
                  <div>
                    <label className={`block text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wide mb-1`}>Number of Persons</label>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {event.numberOfPersons || 1} person{(event.numberOfPersons || 1) > 1 ? 's' : ''}
                    </p>
                  </div>
                  {event.registrationType === 'Temple' && event.briefProfile && (
                    <div>
                      <label className={`block text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wide mb-1`}>Brief Profile</label>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} p-3 bg-gray-100 dark:bg-gray-700 rounded-lg`}>
                        {event.briefProfile || delegate.brief || 'N/A'}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Identity Documents */}
              <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'} border rounded-2xl p-6`}>
                <div className="flex items-center gap-3 mb-6">
                  <IdentificationIcon className={`w-6 h-6 ${isDarkMode ? 'text-orange-400' : 'text-orange-600'}`} />
                  <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Identity Documents
                  </h3>
                </div>
                <div className="space-y-3">
                  {delegate.aadharno && (
                    <div className="flex justify-between items-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <span className={`text-xs font-medium ${isDarkMode ? 'text-blue-300' : 'text-blue-700'} uppercase tracking-wide`}>Aadhar Number</span>
                      <span className={`text-sm font-mono ${isDarkMode ? 'text-blue-200' : 'text-blue-800'}`}>
                        {delegate.aadharno}
                      </span>
                    </div>
                  )}
                  {delegate.passportno && (
                    <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <span className={`text-xs font-medium ${isDarkMode ? 'text-green-300' : 'text-green-700'} uppercase tracking-wide`}>Passport Number</span>
                      <span className={`text-sm font-mono ${isDarkMode ? 'text-green-200' : 'text-green-800'}`}>
                        {delegate.passportno}
                      </span>
                    </div>
                  )}
                  {delegate.pan && (
                    <div className="flex justify-between items-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <span className={`text-xs font-medium ${isDarkMode ? 'text-purple-300' : 'text-purple-700'} uppercase tracking-wide`}>PAN Number</span>
                      <span className={`text-sm font-mono ${isDarkMode ? 'text-purple-200' : 'text-purple-800'}`}>
                        {delegate.pan}
                      </span>
                    </div>
                  )}
                  {!delegate.aadharno && !delegate.passportno && !delegate.pan && (
                    <div className="text-center py-4">
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        No identity documents provided
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Payment & Additional Info */}
              <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'} border rounded-2xl p-6`}>
                <div className="flex items-center gap-3 mb-6">
                  <CreditCardIcon className={`w-6 h-6 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`} />
                  <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Payment & Status
                  </h3>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className={`text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wide`}>Status</span>
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                      booking.status === 'confirmed' ? (isDarkMode ? 'bg-green-900/30 text-green-300 border border-green-700' : 'bg-green-100 text-green-800 border border-green-200') :
                      booking.status === 'pending' ? (isDarkMode ? 'bg-yellow-900/30 text-yellow-300 border border-yellow-700' : 'bg-yellow-100 text-yellow-800 border border-yellow-200') :
                      (isDarkMode ? 'bg-red-900/30 text-red-300 border border-red-700' : 'bg-red-100 text-red-800 border border-red-200')
                    }`}>
                      {booking.status === 'confirmed' ? '✓' : booking.status === 'pending' ? '⏳' : '✕'}
                      {booking.status?.charAt(0).toUpperCase() + booking.status?.slice(1)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={`text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wide`}>Total Amount</span>
                    <span className={`text-lg font-bold ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>
                      {formatCurrency(booking.totalAmount)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={`text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wide`}>Registered On</span>
                    <div className="flex items-center gap-2">
                      <CalendarDaysIcon className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                      <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {formatDate(booking.createdAt)}
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={`text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wide`}>Photo Uploaded</span>
                    <span className={`text-sm font-medium ${
                      delegate.fileInfo?.fileUploaded 
                        ? (isDarkMode ? 'text-green-400' : 'text-green-600') 
                        : (isDarkMode ? 'text-red-400' : 'text-red-600')
                    }`}>
                      {delegate.fileInfo?.fileUploaded ? '✓ Yes' : '✗ No'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={`text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wide`}>Payment Method</span>
                    <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {payment.method || payment.gateway || booking.payment?.gateway || 'CCAvenue'}
                    </span>
                  </div>
                  {payment.paymentId && payment.paymentId !== 'pending_' + Date.now() && (
                    <div className="flex justify-between items-center">
                      <span className={`text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wide`}>Payment ID</span>
                      <span className={`text-xs font-mono ${isDarkMode ? 'text-blue-300' : 'text-blue-600'}`}>
                        {payment.paymentId}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

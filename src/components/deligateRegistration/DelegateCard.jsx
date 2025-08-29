"use client";
import { useState } from 'react';
import { Calendar, MapPin, Users, Clock, Building, User, Phone, Mail, ChevronDown, ChevronUp, FileText, Trophy, IndianRupee, CheckCircle, Camera } from 'lucide-react';

const DelegateCard = ({ booking }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    
    try {
      const date = timestamp.seconds 
        ? new Date(timestamp.seconds * 1000)
        : new Date(timestamp);
      return date.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Date parsing error:', error);
      return 'N/A';
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending_payment':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRegistrationTypeIcon = (type) => {
    switch (type) {
      case 'Company': return '🏢';
      case 'Temple': return '🕉️';
      case 'Individual': return '👤';
      default: return '📋';
    }
  };

  const getDelegateTypeLabel = (type) => {
    switch (type) {
      case 'withoutAssistance': return 'Without Assistance';
      case 'withAssistance': return 'With Assistance';
      default: return type;
    }
  };

  const delegateDetails = booking.delegateDetails || {};
  const eventDetails = booking.eventDetails || {};
  const registrationType = eventDetails.registrationType;

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return <CheckCircle className="w-4 h-4 text-amber-600" />;
      case 'pending_payment':
        return <Clock className="w-4 h-4 text-amber-400" />;
      default:
        return <Clock className="w-4 h-4 text-amber-400" />;
    }
  };

  const getStatusText = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return 'Registration Confirmed';
      case 'pending_payment':
        return 'Payment Pending';
      case 'cancelled':
        return 'Registration Cancelled';
      default:
        return status || 'Unknown Status';
    }
  };

  // Format the created date
  const registrationDate = booking.createdAt instanceof Date 
    ? booking.createdAt 
    : booking.createdAt?.toDate ? booking.createdAt.toDate()
    : new Date(booking.createdAt);

  return (
    <div className="bg-gradient-to-br w-full from-amber-50 via-yellow-50 to-amber-100 rounded-xl shadow-sm border border-amber-100 hover:shadow-md transition-all duration-200 overflow-hidden">
      {/* Header with status and amount */}
      <div className="px-4 py-3 bg-gradient-to-r from-amber-100 to-yellow-100 border-b border-amber-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-600 fill-amber-600" />
            <span className="text-sm font-semibold text-amber-800">Delegate Registration</span>
          </div>
          <div className="flex items-center gap-3">
            <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(booking.status)} flex items-center gap-1`}>
              {getStatusIcon(booking.status)}
              {getStatusText(booking.status)}
            </span>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="p-4 space-y-3">
        {/* Amount - prominently displayed */}
        <div className="text-center py-2">
          <div className="flex items-center justify-center gap-1 text-2xl font-bold text-amber-700">
            <IndianRupee className="w-6 h-6" />
            <span>{booking.totalAmount?.toLocaleString() || '0'}</span>
          </div>
          <p className="text-xs text-amber-600 mt-1">
            {eventDetails.delegateType && (
              <span className="bg-amber-100 px-2 py-0.5 rounded-full">
                {getDelegateTypeLabel(eventDetails.delegateType)} Package
              </span>
            )}
          </p>
        </div>

        {/* Delegate details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Delegate information */}
          <div className="bg-white/70 rounded-lg p-3 border border-amber-100">
            <div className="flex items-start gap-2">
              <User className="w-4 h-4 text-amber-600 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800">
                  {delegateDetails.name || 'N/A'}
                </p>
                <p className="text-xs text-gray-600 truncate">
                  {delegateDetails.email || ''}
                </p>
                <p className="text-xs text-amber-600 mt-1">
                  {getRegistrationTypeIcon(registrationType)} {registrationType || 'Individual'}
                </p>
              </div>
            </div>
          </div>

          {/* Organization/Company */}
          <div className="bg-white/70 rounded-lg p-3 border border-amber-100">
            <div className="flex items-start gap-2">
              <Building className="w-4 h-4 text-amber-600 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-800">
                  {registrationType === 'Company' ? (eventDetails.companyName || 'N/A') :
                   registrationType === 'Temple' ? (eventDetails.templeName || 'N/A') :
                   delegateDetails.companyname || 'Individual Registration'}
                </p>
                {eventDetails.designation && (
                  <p className="text-xs text-gray-600">{eventDetails.designation}</p>
                )}
              </div>
            </div>
          </div>

          {/* Package & Date */}
          <div className="bg-white/70 rounded-lg p-3 border border-amber-100">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-600" />
                <div className="flex-1">
                  <p className="text-xs text-gray-600">Package</p>
                  <p className="text-sm font-medium text-gray-800">
                    {eventDetails.duration || 'N/A'} days • {eventDetails.numberOfPersons || 1} person{(eventDetails.numberOfPersons || 1) > 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-amber-600" />
                <div className="flex-1">
                  <p className="text-xs text-gray-600">Registered</p>
                  <p className="text-sm text-gray-800">
                    {formatDate(booking.createdAt)}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Booking ID */}
            <div className="pt-2 border-t border-amber-100 mt-2">
              <p className="text-xs text-gray-500 font-mono">
                ID: {booking.bookingId || booking.id}
              </p>
            </div>
          </div>
        </div>

        {/* Photo Upload Status */}
        {delegateDetails.fileInfo && (
          <div className="bg-white/70 rounded-lg p-3 border border-amber-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-amber-600" />
                <span className="text-sm text-gray-600">Photo:</span>
                <span className={`text-sm font-medium ${
                  delegateDetails.fileInfo.fileUploaded 
                    ? 'text-green-600' 
                    : 'text-red-600'
                }`}>
                  {delegateDetails.fileInfo.fileUploaded 
                    ? '✅ Uploaded' 
                    : '❌ Not uploaded'}
                </span>
              </div>
              
              {/* Image thumbnail and view button */}
              {delegateDetails.fileInfo.imageUrl && (
                <div className="flex items-center gap-2">
                  <img 
                    src={delegateDetails.fileInfo.imageUrl} 
                    alt="Delegate photo"
                    className="w-10 h-10 rounded-lg object-cover border border-amber-200"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                  <button 
                    onClick={() => window.open(delegateDetails.fileInfo.imageUrl, '_blank')}
                    className="text-xs bg-amber-100 hover:bg-amber-200 px-2 py-1 rounded transition-colors"
                  >
                    View Full
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Expand/Collapse Button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex text-gray-800  items-center justify-center py-2 text-white-600 hover:text-white-700 transition-colors"
        >
          <span className="text-sm font-medium mr-2">
            {isExpanded ? 'Show Less' : 'Show More Details'}
          </span>
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {/* Expanded Details */}
        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
            {/* Combined Contact and Additional Information */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Contact Information */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                  <Mail className="w-4 h-4 text-white-600 mr-2" />
                  Contact Information
                </h4>
                <div className="bg-gradient-to-br from-yellow-50 to-white p-3 rounded-lg space-y-2 border border-yellow-200">
                  <div className="flex items-center">
                    <Mail className="w-3 h-3 text-yellow-500 mr-2" />
                    <span className="text-sm text-gray-600">Email:</span>
                    <span className="text-sm font-medium text-gray-900 ml-2">
                      {delegateDetails.email || 'N/A'}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Phone className="w-3 h-3 text-yellow-500 mr-2" />
                    <span className="text-sm text-gray-600">Mobile:</span>
                    <span className="text-sm font-medium text-gray-900 ml-2">
                      {delegateDetails.mobile || 'N/A'}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="w-3 h-3 text-yellow-500 mr-2" />
                    <span className="text-sm text-gray-600">Location:</span>
                    <span className="text-sm font-medium text-gray-900 ml-2">
                      {delegateDetails.city}, {delegateDetails.state}, {delegateDetails.country}
                    </span>
                  </div>
                </div>
              </div>

            {/* Temple Profile (if applicable) */}
            {registrationType === 'Temple' && eventDetails.briefProfile && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                  <FileText className="w-4 h-4 text-amber-600 mr-2" />
                  Temple Profile
                </h4>
                <div className="bg-gradient-to-br from-amber-50 to-white border border-amber-200 p-3 rounded-lg">
                  <p className="text-sm text-amber-800">{eventDetails.briefProfile}</p>
                </div>
              </div>
            )}

              {/* Additional Information */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Additional Information</h4>
                <div className="bg-gradient-to-br from-white-50 to-white border border-white-200 p-3 rounded-lg space-y-2 text-sm">
                  {eventDetails.designation && (
                    <div>
                      <span className="text-gray-600">Designation:</span>
                      <span className="font-medium text-gray-900 ml-2">{eventDetails.designation}</span>
                    </div>
                  )}
                  <div>
                    <span className="text-gray-600">Photo:</span>
                    <span className="font-medium text-gray-900 ml-2">
                      {delegateDetails.fileInfo?.fileUploaded ? 
                        `✅ Uploaded (${delegateDetails.fileInfo.fileName})` : 
                        '❌ Not uploaded'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Payment Method:</span>
                    <span className="font-medium text-gray-900 ml-2">
                      {booking.payment?.gateway?.toUpperCase() || 'CCAvenue'}
                    </span>
                  </div>
                  {booking.payment?.transactionId && (
                    <div>
                      <span className="text-gray-600">Transaction ID:</span>
                      <span className="font-mono text-xs text-gray-900 ml-2">
                        {booking.payment.transactionId}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};

export default DelegateCard;

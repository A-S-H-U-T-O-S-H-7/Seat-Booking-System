"use client";
import { useState } from 'react';
import { Calendar, MapPin, Users, Clock, Building, User, Phone, Mail, ChevronDown, ChevronUp, FileText, Trophy } from 'lucide-react';

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

  return (
    <div className="bg-white border border-emerald-200 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-4">
        <div className="flex justify-between items-start">
          <div className="text-white">
            <h3 className="text-lg font-bold flex items-center">
              🎓 Delegate Registration
            </h3>
            <p className="text-emerald-100 text-sm mt-1">
              Booking ID: {booking.bookingId || booking.id}
            </p>
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(booking.status)}`}>
            {booking.status === 'confirmed' ? '✅ Confirmed' : 
             booking.status === 'pending_payment' ? '⏳ Pending' :
             booking.status === 'cancelled' ? '❌ Cancelled' : booking.status}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4">
        {/* Basic Info */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center">
            <User className="w-4 h-4 text-emerald-600 mr-2" />
            <div>
              <p className="text-xs text-gray-500">Delegate Name</p>
              <p className="font-semibold text-gray-900">{delegateDetails.name || 'N/A'}</p>
            </div>
          </div>
          
          <div className="flex items-center">
            <Building className="w-4 h-4 text-emerald-600 mr-2" />
            <div>
              <p className="text-xs text-gray-500">
                {getRegistrationTypeIcon(registrationType)} {registrationType || 'Type'}
              </p>
              <p className="font-semibold text-gray-900">
                {registrationType === 'Company' ? (eventDetails.companyName || 'N/A') :
                 registrationType === 'Temple' ? (eventDetails.templeName || 'N/A') :
                 registrationType === 'Individual' ? 'Individual' : 
                 (delegateDetails.companyname || 'N/A')}
              </p>
            </div>
          </div>
        </div>

        {/* Package Details */}
        <div className="bg-gradient-to-r from-teal-50 to-emerald-50 p-3 rounded-lg border border-teal-200 mb-4">
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <Trophy className="w-4 h-4 text-teal-600 mx-auto mb-1" />
              <p className="text-xs text-teal-600 font-medium">Package</p>
              <p className="text-sm font-bold text-teal-800">
                {getDelegateTypeLabel(eventDetails.delegateType)}
              </p>
            </div>
            <div>
              <Clock className="w-4 h-4 text-teal-600 mx-auto mb-1" />
              <p className="text-xs text-teal-600 font-medium">Duration</p>
              <p className="text-sm font-bold text-teal-800">
                {eventDetails.duration || 'N/A'} days
              </p>
            </div>
            <div>
              <Users className="w-4 h-4 text-teal-600 mx-auto mb-1" />
              <p className="text-xs text-teal-600 font-medium">Persons</p>
              <p className="text-sm font-bold text-teal-800">
                {eventDetails.numberOfPersons || 1}
              </p>
            </div>
          </div>
        </div>

        {/* Amount */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center">
            <Calendar className="w-4 h-4 text-gray-500 mr-2" />
            <div>
              <p className="text-xs text-gray-500">Registered On</p>
              <p className="text-sm font-medium text-gray-900">{formatDate(booking.createdAt)}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500">Total Amount</p>
            <p className="text-lg font-bold text-emerald-600">₹{booking.totalAmount?.toLocaleString() || '0'}</p>
          </div>
        </div>

        {/* Expand/Collapse Button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-center py-2 text-emerald-600 hover:text-emerald-700 transition-colors"
        >
          <span className="text-sm font-medium mr-2">
            {isExpanded ? 'Show Less' : 'Show More Details'}
          </span>
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {/* Expanded Details */}
        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
            {/* Contact Information */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                <Mail className="w-4 h-4 text-emerald-600 mr-2" />
                Contact Information
              </h4>
              <div className="bg-gray-50 p-3 rounded-lg space-y-2">
                <div className="flex items-center">
                  <Mail className="w-3 h-3 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-600">Email:</span>
                  <span className="text-sm font-medium text-gray-900 ml-2">
                    {delegateDetails.email || 'N/A'}
                  </span>
                </div>
                <div className="flex items-center">
                  <Phone className="w-3 h-3 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-600">Mobile:</span>
                  <span className="text-sm font-medium text-gray-900 ml-2">
                    {delegateDetails.mobile || 'N/A'}
                  </span>
                </div>
                <div className="flex items-center">
                  <MapPin className="w-3 h-3 text-gray-400 mr-2" />
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
                  <FileText className="w-4 h-4 text-orange-600 mr-2" />
                  Temple Profile
                </h4>
                <div className="bg-orange-50 border border-orange-200 p-3 rounded-lg">
                  <p className="text-sm text-orange-800">{eventDetails.briefProfile}</p>
                </div>
              </div>
            )}

            {/* Additional Information */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Additional Information</h4>
              <div className="bg-gray-50 p-3 rounded-lg space-y-2 text-sm">
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

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              <button className="flex-1 bg-emerald-100 text-emerald-700 py-2 px-4 rounded-lg text-sm font-medium hover:bg-emerald-200 transition-colors">
                Download Receipt
              </button>
              {booking.status === 'pending_payment' && (
                <button className="flex-1 bg-emerald-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors">
                  Complete Payment
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DelegateCard;

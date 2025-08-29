import React from 'react';
import { format } from 'date-fns';
import { Heart, MapPin, Calendar, IndianRupee, User, CheckCircle, Clock } from 'lucide-react';

const DonationCard = ({ donation }) => {
  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed':
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-pink-600" />;
      case 'pending_payment':
        return <Clock className="w-4 h-4 text-pink-400" />;
      default:
        return <Clock className="w-4 h-4 text-pink-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
      case 'completed':
        return 'bg-pink-100 text-pink-800 border-pink-200';
      case 'pending_payment':
        return 'bg-pink-50 text-pink-600 border-pink-100';
      default:
        return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'confirmed':
      case 'completed':
        return 'Donation Received';
      case 'pending_payment':
        return 'Payment Pending';
      default:
        return status;
    }
  };

  // Format the created date
  const donationDate = donation.createdAt instanceof Date 
    ? donation.createdAt 
    : donation.createdAt?.toDate ? donation.createdAt.toDate()
    : new Date(donation.createdAt);

  return (
    <div className="bg-gradient-to-br w-full from-pink-50 via-rose-50 to-pink-100 rounded-xl shadow-sm border border-pink-100 hover:shadow-md transition-all duration-200 overflow-hidden">
      {/* Header with status and amount */}
      <div className="px-4 py-3 bg-gradient-to-r from-pink-100 to-rose-100 border-b border-pink-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-pink-600 fill-pink-600" />
            <span className="text-sm font-semibold text-pink-800">Donation</span>
          </div>
          <div className="flex items-center gap-3">
            <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(donation.status)} flex items-center gap-1`}>
              {getStatusIcon(donation.status)}
              {getStatusText(donation.status)}
            </span>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="p-4 space-y-3">
        {/* Amount - prominently displayed */}
        <div className="text-center py-2">
          <div className="flex items-center justify-center gap-1 text-2xl font-bold text-pink-700">
            <IndianRupee className="w-6 h-6" />
            <span>{donation.amount?.toLocaleString() || '0'}</span>
          </div>
          <p className="text-xs text-pink-600 mt-1">
            {donation.taxExemption?.eligible && (
              <span className="bg-pink-100 px-2 py-0.5 rounded-full">
                80G Tax Exemption Available
              </span>
            )}
          </p>
        </div>

        {/* Donation details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Donor information */}
          <div className="bg-white/70 rounded-lg p-3 border border-pink-100">
            <div className="flex items-start gap-2">
              <User className="w-4 h-4 text-pink-600 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800">
                  {donation.donorDetails?.name || 'Anonymous'}
                </p>
                <p className="text-xs text-gray-600 truncate">
                  {donation.donorDetails?.email || ''}
                </p>
              </div>
            </div>
          </div>

          {/* Location */}
          {(donation.donorDetails?.city || donation.donorDetails?.state) && (
            <div className="bg-white/70 rounded-lg p-3 border border-pink-100">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-pink-600 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-800">
                    {[donation.donorDetails?.city, donation.donorDetails?.state, donation.donorDetails?.country]
                      .filter(Boolean)
                      .join(', ')}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Date and ID */}
          <div className="bg-white/70 rounded-lg p-3 border border-pink-100">
            <div className="flex items-start gap-2 mb-2">
              <Calendar className="w-4 h-4 text-pink-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-gray-800">
                  {format(donationDate, 'MMM dd, yyyy')}
                </p>
                <p className="text-xs text-gray-600">
                  {format(donationDate, 'hh:mm a')}
                </p>
              </div>
            </div>
            
            {/* Donation ID */}
            <div className="pt-2 border-t border-pink-100">
              <p className="text-xs text-gray-500 font-mono">
                ID: {donation.id || donation.donationId}
              </p>
            </div>
          </div>
        </div>

        {/* Additional info for tax exemption
        {donation.taxExemption?.eligible && donation.status === 'confirmed' && (
          <div className="mt-3 p-2 bg-pink-50 border border-pink-200 rounded-lg">
            <p className="text-xs text-pink-700 text-center">
              🧾 Tax exemption certificate will be emailed within 7 business days
            </p>
          </div>
        )} */}
      </div>
    </div>
  );
};

export default DonationCard;

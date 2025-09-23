"use client";
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { 
  XMarkIcon, 
  HeartIcon, 
  UserIcon, 
  CurrencyRupeeIcon,
  CreditCardIcon,
  IdentificationIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  BanknotesIcon,
  PhoneIcon,
  EnvelopeIcon,
  HomeIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import { useTheme } from '@/context/ThemeContext';
import { format, isValid } from 'date-fns';

export default function DonationDetailsModal({ donation, isOpen, onClose, onRefresh }) {
  const { isDarkMode } = useTheme();
  const [updating, setUpdating] = useState(false);

  if (!isOpen || !donation) return null;

  // Safe date formatting helper
  const formatDate = (date, formatString = 'MMM dd, yyyy') => {
    if (!date) return 'Not available';
    
    try {
      let dateObj;
      if (date && typeof date.toDate === 'function') {
        // Firestore Timestamp
        dateObj = date.toDate();
      } else if (date instanceof Date) {
        dateObj = date;
      } else if (typeof date === 'string' || typeof date === 'number') {
        dateObj = new Date(date);
      } else {
        return 'Invalid date';
      }
      
      // Check if date is valid
      if (!isValid(dateObj)) {
        return 'Invalid date';
      }
      
      return format(dateObj, formatString);
    } catch (error) {
      console.error('Date formatting error:', error);
      return 'Invalid date';
    }
  };

  // Update donation status
  const updateDonationStatus = async (newStatus) => {
    try {
      setUpdating(true);
      const { db } = await import('@/lib/firebase');
      const { doc, updateDoc, serverTimestamp } = await import('firebase/firestore');
      
      const donationRef = doc(db, 'donations', donation.id);
      await updateDoc(donationRef, {
        status: newStatus,
        updatedAt: serverTimestamp(),
        ...(newStatus === 'confirmed' && { confirmedAt: serverTimestamp() })
      });

      toast.success(`Donation status updated to ${newStatus}`);
      onRefresh();
      onClose();
    } catch (error) {
      console.error('Error updating donation status:', error);
      toast.error('Failed to update donation status');
    } finally {
      setUpdating(false);
    }
  };

  // Get status info
  const getStatusInfo = (status) => {
    const statusConfig = {
      'confirmed': { color: 'text-green-600 dark:text-green-400', bgColor: 'bg-green-100 dark:bg-green-900/30', icon: CheckCircleIcon, label: 'Confirmed' },
      'completed': { color: 'text-green-600 dark:text-green-400', bgColor: 'bg-green-100 dark:bg-green-900/30', icon: CheckCircleIcon, label: 'Completed' },
      'pending_payment': { color: 'text-yellow-600 dark:text-yellow-400', bgColor: 'bg-yellow-100 dark:bg-yellow-900/30', icon: ClockIcon, label: 'Pending Payment' },
      'failed': { color: 'text-red-600 dark:text-red-400', bgColor: 'bg-red-100 dark:bg-red-900/30', icon: XCircleIcon, label: 'Failed' },
      'cancelled': { color: 'text-gray-600 dark:text-gray-400', bgColor: 'bg-gray-100 dark:bg-gray-900/30', icon: XCircleIcon, label: 'Cancelled' }
    };
    return statusConfig[status] || statusConfig['pending_payment'];
  };

  const statusInfo = getStatusInfo(donation.status);
  const StatusIcon = statusInfo.icon;

  return (
    <div className="fixed inset-0 z-[9999] overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20">
        {/* Backdrop */}
        <div className="fixed inset-0 bg-gradient-to-br from-blue-900/40 via-black/60 to-blue-800/40 backdrop-blur-sm" onClick={onClose}></div>

        {/* Modal */}
        <div className={`relative w-full max-w-4xl mx-auto my-8 overflow-hidden text-left align-middle transition-all transform shadow-2xl rounded-xl z-[10000] border ${
          isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          
          {/* Header */}
          <div className={`px-6 py-4 border-b ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="p-2 rounded-lg bg-gradient-to-r from-pink-500 to-red-500 mr-3">
                  <HeartIcon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Donation Details</h3>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    ID: {donation.donationId || donation.id}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className={`p-2 rounded-full transition-colors ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
            
            {/* Amount & Status Section */}
            <div className={`p-5 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-sm`}>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold flex items-center">
                  <BanknotesIcon className="h-5 w-5 mr-2 text-green-600 dark:text-green-400" />
                  Amount & Status
                </h4>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${statusInfo.bgColor} ${statusInfo.color}`}>
                  <StatusIcon className="w-4 h-4 mr-1" />
                  {statusInfo.label}
                </span>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="flex items-center justify-center text-2xl font-bold text-green-600 dark:text-green-400">
                    <CurrencyRupeeIcon className="h-6 w-6 mr-1" />
                    {(donation.amount || 0).toLocaleString('en-IN')}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Amount</div>
                </div>
                
                <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                    {donation.currency || 'INR'}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Currency</div>
                </div>
                
                <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <div className={`text-lg font-bold ${
                    donation.donorType === 'foreign' 
                      ? 'text-blue-600 dark:text-blue-400' 
                      : 'text-green-600 dark:text-green-400'
                  }`}>
                    {donation.donorType === 'foreign' ? 'NRI' : 'Indian'}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Donor Type</div>
                </div>
                
                <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                  <div className="text-lg font-bold text-orange-600 dark:text-orange-400">
                    {donation.purpose || 'Donation'}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Purpose</div>
                </div>
              </div>
            </div>

            {/* Donor Information Section */}
            <div className={`p-5 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-sm`}>
              <h4 className="text-lg font-semibold flex items-center mb-4">
                <UserIcon className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
                Donor Information
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <IdentificationIcon className="h-5 w-5 text-gray-400 mr-3 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Name</div>
                    <div className="font-semibold truncate">{donation.donorDetails?.name || 'Anonymous'}</div>
                  </div>
                </div>
                
                <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <EnvelopeIcon className="h-5 w-5 text-gray-400 mr-3 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</div>
                    <div className="font-semibold truncate">{donation.donorDetails?.email || 'Not provided'}</div>
                  </div>
                </div>
                
                <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <PhoneIcon className="h-5 w-5 text-gray-400 mr-3 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Mobile</div>
                    <div className="font-semibold">{donation.donorDetails?.mobile || 'Not provided'}</div>
                  </div>
                </div>
                
                <div className="flex items-start p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <HomeIcon className="h-5 w-5 text-gray-400 mr-3 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Address</div>
                    {donation.donorDetails?.address ? (
                      <div className="font-semibold">
                        <div className="truncate">{donation.donorDetails.address}</div>
                        <div className="text-sm font-normal text-gray-600 dark:text-gray-300 mt-1">
                          {[
                            donation.donorDetails?.city,
                            donation.donorDetails?.state,
                            donation.donorDetails?.country,
                            donation.donorDetails?.pincode
                          ].filter(Boolean).join(', ')}
                        </div>
                      </div>
                    ) : (
                      <div className="font-semibold">Not provided</div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Details Section */}
            <div className={`p-5 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-sm`}>
              <h4 className="text-lg font-semibold flex items-center mb-4">
                <CreditCardIcon className="h-5 w-5 mr-2 text-green-600 dark:text-green-400" />
                Payment Details
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Gateway</div>
                  <div className="font-semibold text-blue-600 dark:text-blue-400">
                    {donation.paymentGateway || 'CCAvenue'}
                  </div>
                </div>
                
                {donation.paymentDetails?.tracking_id && (
                  <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Tracking ID</div>
                    <div className="font-mono text-sm font-semibold break-all">
                      {donation.paymentDetails.tracking_id}
                    </div>
                  </div>
                )}
                
                {donation.paymentDetails?.bank_ref_no && (
                  <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Bank Ref</div>
                    <div className="font-mono text-sm font-semibold break-all">
                      {donation.paymentDetails.bank_ref_no}
                    </div>
                  </div>
                )}
                
                {donation.paymentDetails?.payment_mode && (
                  <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Payment Method</div>
                    <div className="font-semibold">{donation.paymentDetails.payment_mode}</div>
                  </div>
                )}
              </div>
              
              {/* Confirmation Date */}
              {donation.confirmedAt && (
                <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <CheckCircleIcon className="h-5 w-5 text-green-600 dark:text-green-400 mr-2" />
                      <span className="font-medium text-green-800 dark:text-green-400">Confirmed On</span>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-green-800 dark:text-green-400">
                        {formatDate(donation.confirmedAt, 'MMM dd, yyyy')}
                      </div>
                      <div className="text-sm text-green-600 dark:text-green-500">
                        {formatDate(donation.confirmedAt, 'hh:mm:ss a')}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Failure Message */}
              {donation.paymentDetails?.failure_message && (
                <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                  <div className="flex items-start">
                    <XCircleIcon className="h-5 w-5 text-red-600 dark:text-red-400 mr-2 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="font-medium text-red-800 dark:text-red-400 mb-1">Failure Reason</div>
                      <div className="text-sm text-red-700 dark:text-red-300">
                        {donation.paymentDetails.failure_message}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* System Information Section */}
            <div className={`p-5 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-sm`}>
              <h4 className="text-lg font-semibold flex items-center mb-4">
                <ShieldCheckIcon className="h-5 w-5 mr-2 text-gray-600 dark:text-gray-400" />
                System Information
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Created Date</div>
                  <div className="font-semibold">{formatDate(donation.createdAt, 'MMM dd, yyyy')}</div>
                  <div className="text-sm text-gray-500">{formatDate(donation.createdAt, 'hh:mm:ss a')}</div>
                </div>
                
                {donation.userId && (
                  <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400">User ID</div>
                    <div className="font-mono text-sm font-semibold break-all">{donation.userId}</div>
                  </div>
                )}
                
                <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Document ID</div>
                  <div className="font-mono text-sm font-semibold break-all">{donation.id}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className={`px-6 py-4 border-t ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'}`}>
            <div className="flex items-center justify-between">
              <div className="flex space-x-3">
                {donation.status === 'pending_payment' && (
                  <button
                    onClick={() => updateDonationStatus('confirmed')}
                    disabled={updating}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-all duration-200 font-medium"
                  >
                    {updating ? 'Updating...' : 'Mark as Confirmed'}
                  </button>
                )}
                {donation.status !== 'cancelled' && donation.status !== 'failed' && (
                  <button
                    onClick={() => updateDonationStatus('cancelled')}
                    disabled={updating}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-all duration-200 font-medium"
                  >
                    {updating ? 'Updating...' : 'Cancel'}
                  </button>
                )}
              </div>
              <button
                onClick={onClose}
                className={`px-4 py-2 border rounded-lg transition-all duration-200 font-medium ${
                  isDarkMode 
                    ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                    : 'border-gray-300 text-gray-700 hover:bg-gray-100'
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
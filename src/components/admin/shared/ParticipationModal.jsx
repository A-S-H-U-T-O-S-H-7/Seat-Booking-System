'use client';

import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { markAsParticipated, undoParticipation, canUndoParticipation } from '@/services/participationService';
import { useAuth } from '@/context/AuthContext';
import { useAdmin } from '@/context/AdminContext';

const ParticipationModal = ({ 
  isOpen, 
  onClose, 
  booking, 
  bookingType, 
  onSuccess 
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { user } = useAuth();
  const { adminUser, isSuperAdmin } = useAdmin();

  // Component now properly uses AdminContext for permission checking

  if (!isOpen || !booking) return null;

  const handleMarkParticipated = async () => {
    if (!user?.uid) {
      toast.error('User not authenticated');
      return;
    }

    setIsProcessing(true);
    try {
      const result = await markAsParticipated(booking.id, bookingType, user.uid);
      
      if (result.success) {
        toast.success('✅ Marked as participated successfully!');
        onSuccess(booking.id);
        onClose();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Error marking participation:', error);
      toast.error('Failed to mark participation');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUndoParticipation = async () => {
    if (!isSuperAdmin && !canUndoParticipation(adminUser)) {
      toast.error('Only super admin can undo participation');
      return;
    }

    setIsProcessing(true);
    try {
      const result = await undoParticipation(booking.id, bookingType, user.uid);
      
      if (result.success) {
        toast.success(`✅ Participation undone successfully by ${adminUser?.name}!`);
        
        // Call onSuccess to update parent component states
        onSuccess(booking.id);
        
        // Don't close modal immediately - let user see the change
        // The modal will show the updated state
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Error undoing participation:', error);
      toast.error('Failed to undo participation');
    } finally {
      setIsProcessing(false);
    }
  };

  const renderBookingDetails = () => {
    switch (bookingType) {
      case 'havan':
        return (
          <>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="font-medium text-gray-600">Name:</span>
                <span className="text-gray-900">{booking.customerDetails?.name || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-600">Email:</span>
                <span className="text-gray-900">{booking.customerDetails?.email || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-600">Event Date:</span>
                <span className="text-gray-900">
                  {booking.eventDate ? new Date(booking.eventDate.seconds * 1000).toLocaleDateString() : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-600">Shift:</span>
                <span className="text-gray-900 capitalize">{booking.shift || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-600">Booking ID:</span>
                <span className="text-gray-900 font-mono text-sm">{booking.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-600">Seats:</span>
                <span className="text-gray-900">{booking.seats?.join(', ') || 'N/A'}</span>
              </div>
            </div>
          </>
        );
      
      case 'show':
        return (
          <>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="font-medium text-gray-600">Name:</span>
                <span className="text-gray-900">{booking.userDetails?.name || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-600">Email:</span>
                <span className="text-gray-900">{booking.userDetails?.email || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-600">Event Date:</span>
                <span className="text-gray-900">
                  {(() => {
                    try {
                      if (booking.showDetails?.date) {
                        const showDate = booking.showDetails.date;
                        let dateObj;
                        
                        if (showDate.toDate && typeof showDate.toDate === 'function') {
                          dateObj = showDate.toDate();
                        } else if (showDate.seconds) {
                          dateObj = new Date(showDate.seconds * 1000);
                        } else if (typeof showDate === 'string' || typeof showDate === 'number') {
                          dateObj = new Date(showDate);
                        } else if (showDate instanceof Date) {
                          dateObj = showDate;
                        } else {
                          return 'N/A';
                        }
                        
                        if (dateObj && !isNaN(dateObj.getTime())) {
                          return dateObj.toLocaleDateString();
                        }
                      }
                      return 'N/A';
                    } catch (error) {
                      console.error('Error formatting show date:', error);
                      return 'N/A';
                    }
                  })()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-600">Booking ID:</span>
                <span className="text-gray-900 font-mono text-sm">{booking.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-600">Seats:</span>
                <span className="text-gray-900">{booking.showDetails?.selectedSeats?.join(', ') || 'N/A'}</span>
              </div>
            </div>
          </>
        );
      
      case 'stall':
        return (
          <>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="font-medium text-gray-600">Name:</span>
                <span className="text-gray-900">{booking.vendorDetails?.name || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-600">Email:</span>
                <span className="text-gray-900">{booking.vendorDetails?.email || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-600">Business Type:</span>
                <span className="text-gray-900">{booking.vendorDetails?.businessType || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-600">Booking ID:</span>
                <span className="text-gray-900 font-mono text-sm">{booking.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-600">Stalls:</span>
                <span className="text-gray-900">{booking.stallIds?.join(', ') || 'N/A'}</span>
              </div>
            </div>
          </>
        );
      
      case 'delegate':
        return (
          <>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="font-medium text-gray-600">Name:</span>
                <span className="text-gray-900">{booking.delegateDetails?.name || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-600">Email:</span>
                <span className="text-gray-900">{booking.delegateDetails?.email || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-600">Package Type:</span>
                <span className="text-gray-900">
                  {booking.eventDetails?.delegateType === 'withAssistance' ? 'With Assistance' : 'Without Assistance'}
                </span>
              </div>
              {booking.delegateDetails?.profileImage && (
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-600">Photo:</span>
                  <img 
                    src={booking.delegateDetails.profileImage} 
                    alt="Delegate" 
                    className="w-16 h-16 object-cover rounded-lg border"
                  />
                </div>
              )}
              <div className="flex justify-between">
                <span className="font-medium text-gray-600">Booking ID:</span>
                <span className="text-gray-900 font-mono text-sm">{booking.id}</span>
              </div>
            </div>
          </>
        );
      
      default:
        return <div>Booking details not available</div>;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {booking.participated ? 'Participation Status' : 'Mark Participation'}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Participation Status */}
          {booking.participated && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-2">
                  <p className="text-sm font-medium text-green-800">
                    Already Participated
                  </p>
                  <p className="text-xs text-green-600">
                    Marked on: {(() => {
                      try {
                        if (booking.participatedAt) {
                          const participatedDate = booking.participatedAt;
                          let dateObj;
                          
                          if (participatedDate.toDate && typeof participatedDate.toDate === 'function') {
                            dateObj = participatedDate.toDate();
                          } else if (participatedDate.seconds) {
                            dateObj = new Date(participatedDate.seconds * 1000);
                          } else if (participatedDate instanceof Date) {
                            dateObj = participatedDate;
                          } else {
                            return 'Unknown';
                          }
                          
                          if (dateObj && !isNaN(dateObj.getTime())) {
                            return dateObj.toLocaleString();
                          }
                        }
                        return 'Unknown';
                      } catch (error) {
                        console.error('Error formatting participated date:', error);
                        return 'Unknown';
                      }
                    })()} 
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Booking Details */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Booking Details</h4>
            <div className="bg-gray-50 p-4 rounded-lg">
              {renderBookingDetails()}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              disabled={isProcessing}
            >
              Cancel
            </button>
            
            {!booking.participated ? (
              <button
                onClick={handleMarkParticipated}
                disabled={isProcessing}
                className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <div className="flex items-center justify-center">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Processing...
                  </div>
                ) : (
                  '✅ Mark Participated'
                )}
              </button>
            ) : (
              (isSuperAdmin || canUndoParticipation(adminUser)) && (
                <button
                  onClick={handleUndoParticipation}
                  disabled={isProcessing}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? (
                    <div className="flex items-center justify-center">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Processing...
                    </div>
                  ) : (
                    '🔄 Undo Participation'
                  )}
                </button>
              )
            )}
          </div>

          {/* Warning for already participated */}
          {booking.participated && !isSuperAdmin && !canUndoParticipation(adminUser) && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                ⚠️ This booking has already been marked as participated. Only super admin can undo this action.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ParticipationModal;

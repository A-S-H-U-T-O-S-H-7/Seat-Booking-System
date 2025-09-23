'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { 
  markAsParticipated, 
  undoParticipation, 
  canUndoParticipation,
  ensureSeatSubcollectionExists,
  getSeatAttendanceStatus,
  markSeatAttendance,
  markMultipleSeatsAttendance
} from '@/services/participationService';
import { useAuth } from '@/context/AuthContext';
import { useAdmin } from '@/context/AdminContext';
import adminLogger from '@/lib/adminLogger';

const ParticipationModal = ({ 
  isOpen, 
  onClose, 
  booking, 
  bookingType, 
  onSuccess 
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSeatAttendance, setShowSeatAttendance] = useState(false);
  const [seatAttendanceData, setSeatAttendanceData] = useState({});
  const [loadingSeatData, setLoadingSeatData] = useState(false);
  const [loadingSeats, setLoadingSeats] = useState({});
  const { user } = useAuth();
  const { adminUser, isSuperAdmin } = useAdmin();

  // Helper function to format dates properly
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return null;
    
    try {
      let dateObj;
      
      // Handle different timestamp formats
      if (timestamp.toDate && typeof timestamp.toDate === 'function') {
        // Firestore Timestamp
        dateObj = timestamp.toDate();
      } else if (timestamp.seconds) {
        // Firestore Timestamp-like object
        dateObj = new Date(timestamp.seconds * 1000);
      } else if (timestamp instanceof Date) {
        // Already a Date object
        dateObj = timestamp;
      } else if (typeof timestamp === 'string' || typeof timestamp === 'number') {
        // String or number timestamp
        dateObj = new Date(timestamp);
      } else {
        return null;
      }
      
      // Verify we have a valid date
      if (dateObj && !isNaN(dateObj.getTime())) {
        return dateObj.toLocaleString();
      }
      
      return null;
    } catch (error) {
      console.warn('Error formatting timestamp:', error, timestamp);
      return null;
    }
  };

  // Helper function to check if booking type supports seat-level attendance
  const supportsSeatsAttendance = () => {
    return ['havan', 'show', 'stall'].includes(bookingType);
  };

  // Get the units array for this booking
  const getUnitsArray = () => {
    if (!booking) return [];
    
    try {
      switch (bookingType) {
        case 'havan':
          return booking?.seats || booking?.selectedSeats || [];
        case 'show':
          return booking?.showDetails?.selectedSeats || [];
        case 'stall':
          return booking?.stallIds || [];
        default:
          return [];
      }
    } catch (error) {
      console.error('Error getting units array:', error);
      return [];
    }
  };

  const unitsArray = getUnitsArray();
  const hasMultipleUnits = unitsArray.length > 1;

  // Load seat attendance data when dropdown is shown OR when modal opens
  useEffect(() => {
    if (showSeatAttendance && supportsSeatsAttendance() && unitsArray.length > 0) {
      loadSeatAttendanceData();
    }
  }, [showSeatAttendance, booking?.id]);
  
  // Auto-load seat attendance data when modal opens if we have seats
  useEffect(() => {
    if (isOpen && supportsSeatsAttendance() && unitsArray.length > 0) {
      loadSeatAttendanceData();
    }
  }, [isOpen, booking?.id]);

  const loadSeatAttendanceData = async () => {
    if (!booking?.id || !supportsSeatsAttendance()) return;
    
    setLoadingSeatData(true);
    try {
      // Ensure seat subcollection exists and get all attendance data
      const result = await ensureSeatSubcollectionExists(booking.id, bookingType, unitsArray);
      
      if (result.success && result.data) {
        // Transform the seats data from the service response
        const attendanceData = {};
        Object.keys(result.data.seats).forEach(unitId => {
          const seatData = result.data.seats[unitId];
          attendanceData[unitId] = {
            status: seatData.status || 'pending',
            updatedAt: seatData.updatedAt || seatData.checkedInAt,
            updatedBy: seatData.updatedBy || seatData.checkedInBy,
            notes: seatData.notes || ''
          };
        });
        setSeatAttendanceData(attendanceData);
      } else {
        console.warn('No seat attendance data found or failed to initialize:', result.message);
        // Initialize with default pending status for all seats
        const defaultData = {};
        unitsArray.forEach(unitId => {
          defaultData[unitId] = {
            status: 'pending',
            updatedAt: null,
            updatedBy: null,
            notes: ''
          };
        });
        setSeatAttendanceData(defaultData);
      }
    } catch (error) {
      console.error('Error loading seat attendance data:', error);
      toast.error('Failed to load seat attendance data');
      
      // Initialize with default pending status on error
      const defaultData = {};
      unitsArray.forEach(unitId => {
        defaultData[unitId] = {
          status: 'pending',
          updatedAt: null,
          updatedBy: null,
          notes: ''
        };
      });
      setSeatAttendanceData(defaultData);
    } finally {
      setLoadingSeatData(false);
    }
  };

  const handleSeatAttendanceChange = async (unitId, status) => {
    // Set loading state for this specific seat
    setLoadingSeats(prev => ({ ...prev, [unitId]: true }));
    
    try {
      const result = await markSeatAttendance(booking.id, bookingType, unitId, status, user.uid);
      
      if (result.success) {
        // Log the seat attendance change
        try {
          await adminLogger.logSeatActivity(
            adminUser,
            'update',
            `${booking.id}-${unitId}`,
            `Updated ${bookingType === 'stall' ? 'stall' : 'seat'} ${unitId} attendance to '${status}' for ${bookingType} booking ${booking.id}. Customer: ${booking.customerDetails?.name || booking.userDetails?.name || booking.vendorDetails?.name || booking.delegateDetails?.name || 'Unknown'}`,
            await adminLogger.getClientIP(),
            adminLogger.getUserAgent()
          );
        } catch (logError) {
          console.error('Failed to log seat attendance activity:', logError);
        }
        
        // Update local state
        setSeatAttendanceData(prev => ({
          ...prev,
          [unitId]: {
            ...prev[unitId],
            status,
            updatedAt: new Date(),
            updatedBy: user.uid
          }
        }));
        
        // Check if all seats are now present and auto-mark participation
        const updatedData = { ...seatAttendanceData };
        updatedData[unitId] = { ...updatedData[unitId], status };
        
        const allPresent = Object.values(updatedData).every(data => data.status === 'present');
        
        if (allPresent && !booking.participated) {
          toast.success(`${bookingType === 'stall' ? 'Stall' : 'Seat'} marked as ${status}. All units present - marking booking as participated!`);
          setTimeout(() => handleMarkParticipated(), 1000);
        } else {
          toast.success(`${bookingType === 'stall' ? 'Stall' : 'Seat'} ${unitId} marked as ${status}`);
        }
      } else {
        toast.error(result.message || 'Failed to update attendance');
      }
    } catch (error) {
      console.error('Error updating seat attendance:', error);
      toast.error('Failed to update attendance');
    } finally {
      // Clear loading state for this specific seat
      setLoadingSeats(prev => ({ ...prev, [unitId]: false }));
    }
  };

  const handleBulkAttendance = async (status) => {
    try {
      // Only super admins can reset seats to 'pending'
      if (status === 'pending' && !isSuperAdmin) {
        toast.error('Only super admin can reset seat attendance');
        return;
      }
      
      // Transform units array to updates format expected by the service
      const unitUpdates = unitsArray.map(unitId => ({
        unitId: unitId,
        status: status,
        notes: ''
      }));
      
      const result = await markMultipleSeatsAttendance(
        booking.id, 
        bookingType, 
        unitUpdates, 
        user.uid
      );
      
      if (result.success) {
        // Log the bulk attendance update
        try {
          await adminLogger.logSeatActivity(
            adminUser,
            'update',
            `${booking.id}-bulk`,
            `Bulk updated all ${bookingType === 'stall' ? 'stalls' : 'seats'} (${unitsArray.join(', ')}) attendance to '${status}' for ${bookingType} booking ${booking.id}. Customer: ${booking.customerDetails?.name || booking.userDetails?.name || booking.vendorDetails?.name || booking.delegateDetails?.name || 'Unknown'}`,
            await adminLogger.getClientIP(),
            adminLogger.getUserAgent()
          );
        } catch (logError) {
          console.error('Failed to log bulk attendance activity:', logError);
        }
        
        // Update all seats in local state
        const updatedData = {};
        unitsArray.forEach(unitId => {
          updatedData[unitId] = {
            status,
            updatedAt: new Date(),
            updatedBy: user.uid
          };
        });
        setSeatAttendanceData(updatedData);
        
        // If all marked as present, auto-mark participation
        if (status === 'present' && !booking.participated) {
          toast.success(`All ${bookingType === 'stall' ? 'stalls' : 'seats'} marked as ${status} - marking booking as participated!`);
          setTimeout(() => handleMarkParticipated(), 1000);
        } else {
          toast.success(`All ${bookingType === 'stall' ? 'stalls' : 'seats'} marked as ${status}`);
        }
      } else {
        toast.error(result.message || 'Failed to bulk update attendance');
      }
    } catch (error) {
      console.error('Error bulk updating attendance:', error);
      toast.error('Failed to bulk update attendance');
    }
  };

  if (!isOpen || !booking) return null;

  const handleMarkParticipated = async () => {
    if (!user?.uid) {
      toast.error('User not authenticated');
      return;
    }

    setIsProcessing(true);
    try {
      // First mark all seats as present if booking supports seat attendance
      if (supportsSeatsAttendance() && unitsArray.length > 0) {
        try {
          const unitUpdates = unitsArray.map(unitId => ({
            unitId: unitId,
            status: 'present',
            notes: ''
          }));
          
          await markMultipleSeatsAttendance(
            booking.id, 
            bookingType, 
            unitUpdates, 
            user.uid
          );
          // Update local state to reflect all seats as present
          const updatedData = {};
          unitsArray.forEach(unitId => {
            updatedData[unitId] = {
              status: 'present',
              updatedAt: new Date(),
              updatedBy: user.uid
            };
          });
          setSeatAttendanceData(updatedData);
        } catch (seatError) {
          console.warn('Failed to mark seats as present, but continuing with participation:', seatError);
        }
      }
      
      // Then mark the booking as participated
      const result = await markAsParticipated(booking.id, bookingType, user.uid);
      
      if (result.success) {
        // Log the participation activity
        try {
          await adminLogger.logBookingActivity(
            adminUser,
            'update',
            booking.id,
            `Marked ${bookingType} booking as participated. Customer: ${booking.customerDetails?.name || booking.userDetails?.name || booking.vendorDetails?.name || booking.delegateDetails?.name || 'Unknown'}. ${unitsArray.length > 0 ? `Units: ${unitsArray.join(', ')}` : ''}`,
            await adminLogger.getClientIP(),
            adminLogger.getUserAgent()
          );
        } catch (logError) {
          console.error('Failed to log participation activity:', logError);
        }
        
        toast.success('✅ Marked as participated successfully! All seats marked as present.');
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
      // First reset all seat attendance to 'pending' if booking supports seat attendance
      if (supportsSeatsAttendance() && unitsArray.length > 0) {
        try {
          const unitUpdates = unitsArray.map(unitId => ({
            unitId: unitId,
            status: 'pending',
            notes: ''
          }));
          
          await markMultipleSeatsAttendance(
            booking.id, 
            bookingType, 
            unitUpdates, 
            user.uid
          );
          
          // Update local state to reflect all seats as pending
          const updatedData = {};
          unitsArray.forEach(unitId => {
            updatedData[unitId] = {
              status: 'pending',
              updatedAt: new Date(),
              updatedBy: user.uid
            };
          });
          setSeatAttendanceData(updatedData);
        } catch (seatError) {
          console.warn('Failed to reset seat attendance, but continuing with undo participation:', seatError);
        }
      }
      
      // Then undo the participation
      const result = await undoParticipation(booking.id, bookingType, user.uid);
      
      if (result.success) {
        // Log the undo participation activity
        try {
          await adminLogger.logBookingActivity(
            adminUser,
            'update',
            booking.id,
            `Undid participation for ${bookingType} booking. Customer: ${booking.customerDetails?.name || booking.userDetails?.name || booking.vendorDetails?.name || booking.delegateDetails?.name || 'Unknown'}. ${unitsArray.length > 0 ? `Units: ${unitsArray.join(', ')}` : ''}`,
            await adminLogger.getClientIP(),
            adminLogger.getUserAgent()
          );
        } catch (logError) {
          console.error('Failed to log undo participation activity:', logError);
        }
        
        toast.success(`✅ Participation undone successfully by ${adminUser?.name}! All seat attendance reset to pending.`);
        
        // Refresh seat attendance data to ensure it's loaded from database
        if (supportsSeatsAttendance() && unitsArray.length > 0) {
          await loadSeatAttendanceData();
        }
        
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
    const getDetailsConfig = () => {
      switch (bookingType) {
        case 'havan':
          return {
            name: booking.customerDetails?.name || 'N/A',
            email: booking.customerDetails?.email || 'N/A',
            date: booking.eventDate ? new Date(booking.eventDate.seconds * 1000).toLocaleDateString() : 'N/A',
            extra: booking.shift || 'N/A',
            extraLabel: 'Shift',
            units: booking.seats?.join(', ') || 'N/A',
            unitsLabel: 'Seats',
            extraClass: 'bg-blue-50 text-blue-700'
          };
        
        case 'show':
          return {
            name: booking.userDetails?.name || 'N/A',
            email: booking.userDetails?.email || 'N/A',
            date: (() => {
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
            })(),
            units: booking.showDetails?.selectedSeats?.join(', ') || 'N/A',
            unitsLabel: 'Seats'
          };
        
        case 'stall':
          return {
            name: booking.vendorDetails?.name || 'N/A',
            email: booking.vendorDetails?.email || 'N/A',
            extra: booking.vendorDetails?.businessType || 'N/A',
            extraLabel: 'Business Type',
            units: booking.stallIds?.join(', ') || 'N/A',
            unitsLabel: 'Stalls',
            extraClass: 'bg-purple-50 text-purple-700'
          };
        
        case 'delegate':
          const packageTypes = {
          withAssistance: 'With Assistance',
          normal: 'Normal',
          withoutAssistance: 'Without Assistance'
          };
          return {
            name: booking.delegateDetails?.name || 'N/A',
            email: booking.delegateDetails?.email || 'N/A',
            extra: packageTypes[booking.eventDetails?.delegateType] || 'Normal',
            extraLabel: 'Package Type',
            extraClass: 'bg-green-50 text-green-700',
            profileImage: booking.delegateDetails?.profileImage
          };
        
        default:
          return null;
      }
    };

    const config = getDetailsConfig();
    if (!config) return <div>Booking details not available</div>;

    return (
      <div className="space-y-3">
        {/* Name & Email - Side by side on larger screens */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Name</span>
            <span className="text-sm font-medium text-slate-900 truncate">{config.name}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Email</span>
            <span className="text-sm font-medium text-slate-900 truncate">{config.email}</span>
          </div>
        </div>

        {/* Date & Extra field - Side by side if both exist */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {config.date && (
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Event Date</span>
              <div className="bg-blue-100 px-3 py-2 rounded-lg border-l-4 border-blue-500">
                <span className="text-sm font-bold text-blue-900">📅 {config.date}</span>
              </div>
            </div>
          )}
          {config.extra && (
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">{config.extraLabel}</span>
              <span className={`text-sm font-medium px-2 py-1 rounded-md inline-block w-fit ${config.extraClass || 'bg-gray-100 text-gray-700'}`}>
                {config.extra}
              </span>
            </div>
          )}
        </div>

        {/* Profile Image for delegate */}
        {config.profileImage && (
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Photo</span>
            <img 
              src={config.profileImage} 
              alt="Delegate" 
              className="w-12 h-12 object-cover rounded-lg border border-gray-200 shadow-sm"
            />
          </div>
        )}

        {/* Booking ID - Full width */}
        <div className="flex flex-col">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Booking ID</span>
          <div className="bg-yellow-100 px-3 py-2 rounded-lg border-l-4 border-yellow-500">
            <span className="text-sm font-bold font-mono text-yellow-900">🏷️ {booking.id}</span>
          </div>
        </div>

        {/* Units - Full width if exists */}
        {config.units && config.unitsLabel && (
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">{config.unitsLabel}</span>
            <div className="flex flex-wrap gap-2 mt-1">
              {(() => {
                // Split the units string and create individual boxes
                const unitsArray = config.units.split(', ').filter(unit => unit && unit !== 'N/A');
                return unitsArray.map((unit, index) => (
                  <span key={index} className="inline-flex items-center px-2 py-1 rounded-md text-xs font-bold bg-purple-100 text-purple-800 border border-purple-200">
                    {bookingType === 'stall' ? '🏨' : '🪑'} {unit}
                  </span>
                ));
              })()
            }</div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-xl max-h-[95vh] overflow-y-auto border border-gray-100">
        <div className="p-4 sm:p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1 min-w-0">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 leading-tight">
                {booking.participated ? '📊 Participation Status' : '✅ Mark Participation'}
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 mt-1 font-medium truncate">
                {bookingType.charAt(0).toUpperCase() + bookingType.slice(1)} Booking Management
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-full ml-2 flex-shrink-0"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Participation Status */}
          {booking.participated && (
            <div className="mb-4 p-3 bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-400 rounded-lg">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <div className="ml-2 flex-1 min-w-0">
                  <p className="text-sm font-semibold text-green-800">
                    ✅ Already Participated
                  </p>
                  <div className="bg-green-100 px-2 py-1 rounded-md mt-2">
                    <p className="text-xs text-green-800 font-bold">
                      📅 Participated on: <span className="font-mono">{(() => {
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
                      })()}</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Booking Details - Compact Layout */}
          <div className="mb-4">
            <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center">
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></span>
              Booking Details
            </h4>
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
              {renderBookingDetails()}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mb-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all duration-200 border border-gray-200 hover:border-gray-300"
              disabled={isProcessing}
            >
              Cancel
            </button>
            
            {!booking.participated ? (
              <button
                onClick={handleMarkParticipated}
                disabled={isProcessing}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-lg transition-all duration-200 font-semibold shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-sm"
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
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-lg transition-all duration-200 font-semibold shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  {isProcessing ? (
                    <div className="flex items-center justify-center">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                      Processing...
                    </div>
                  ) : (
                    '🔄 Undo Participation'
                  )}
                </button>
              )
            )}
          </div>

          {/* Seat Attendance Tracking */}
          {supportsSeatsAttendance() && hasMultipleUnits && (
            <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
              <button
                onClick={() => setShowSeatAttendance(!showSeatAttendance)}
                className="w-full px-4 py-3 bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-150 text-left flex items-center justify-between transition-all duration-200"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-900 flex items-center">
                    <span className="mr-2">
                      {bookingType === 'stall' ? '🏪' : '🪑'}
                    </span>
                    Per-{bookingType === 'stall' ? 'Stall' : 'Seat'} Attendance
                  </p>
                  <p className="text-xs text-gray-600 font-medium mt-1">
                    {unitsArray.length} {bookingType === 'stall' ? 'stalls' : 'seats'} • Click to {showSeatAttendance ? 'hide' : 'show'}
                  </p>
                </div>
                <div className="flex items-center ml-2">
                  <div className={`w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center transition-transform duration-200 ${showSeatAttendance ? 'rotate-180' : ''}`}>
                    <svg 
                      className="w-4 h-4 text-blue-600" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </button>
              
              {showSeatAttendance && (
                <div className="border-t border-gray-200 bg-white">
                  {loadingSeatData ? (
                    <div className="p-4 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-sm text-gray-600 font-medium">Loading attendance data...</span>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4">
                      {/* Bulk Actions */}
                      <div className="mb-4 flex flex-wrap gap-2">
                        <button
                          onClick={() => handleBulkAttendance('present')}
                          className="px-3 py-1.5 bg-green-100 hover:bg-green-200 text-green-800 rounded-md text-xs font-semibold transition-all duration-200 border border-green-200 hover:border-green-300"
                        >
                          ✅ All Present
                        </button>
                        {/* Reset All button - only visible to super admin */}
                        {isSuperAdmin && (
                          <button
                            onClick={() => handleBulkAttendance('pending')}
                            className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md text-xs font-semibold transition-all duration-200 border border-gray-200 hover:border-gray-300"
                          >
                            🔄 Reset All
                          </button>
                        )}
                      </div>
                      
                      {/* Individual Seat/Stall Controls */}
                      <div className="space-y-3">
                        {unitsArray.map(unitId => {
                          const attendanceData = seatAttendanceData[unitId] || { status: 'pending' };
                          const statusColors = {
                            present: 'bg-green-50 text-green-800 border-green-200',
                            absent: 'bg-red-50 text-red-800 border-red-200',
                            pending: 'bg-gray-50 text-gray-800 border-gray-200'
                          };
                          
                          return (
                            <div key={unitId} className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                              {/* Seat/Stall ID Line */}
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-bold text-gray-900">
                                  {bookingType === 'stall' ? '🏪' : '🪑'} {bookingType === 'stall' ? 'Stall' : 'Seat'} {unitId}
                                </span>
                                <div className="flex gap-1">
                                  <button
                                    onClick={() => handleSeatAttendanceChange(unitId, 'present')}
                                    disabled={loadingSeats[unitId]}
                                    className={`px-3 py-1.5 text-xs rounded-md transition-all duration-200 font-semibold flex items-center ${
                                      attendanceData.status === 'present'
                                        ? 'bg-green-600 text-white shadow-md'
                                        : 'bg-white hover:bg-green-50 text-gray-700 hover:text-green-800 border border-gray-300 hover:border-green-300'
                                    } ${loadingSeats[unitId] ? 'opacity-50 cursor-not-allowed' : ''}`}
                                  >
                                    {loadingSeats[unitId] ? (
                                      <>
                                        <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin mr-1"></div>
                                        Loading
                                      </>
                                    ) : (
                                      attendanceData.status === 'present' ? '✅ Present' : '✅ Mark Present'
                                    )}
                                  </button>
                                </div>
                              </div>
                              
                              {/* Status Line */}
                              <div className="flex items-center justify-between text-xs">
                                <span className={`px-2 py-1 rounded-full border capitalize font-medium ${statusColors[attendanceData.status]}`}>
                                  {attendanceData.status === 'present' && '✅ '}
                                  {attendanceData.status === 'absent' && '❌ '}
                                  {attendanceData.status === 'pending' && '⏳ '}
                                  {attendanceData.status}
                                </span>
                                {(() => {
                                  const formattedTime = formatTimestamp(attendanceData.updatedAt);
                                  return formattedTime && (
                                    <span className="text-green-600 font-medium">
                                      {formattedTime}
                                    </span>
                                  );
                                })()}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          
          {/* Warning for already participated */}
          {booking.participated && !isSuperAdmin && !canUndoParticipation(adminUser) && (
            <div className="mt-6 p-4 bg-gradient-to-r from-yellow-50 to-amber-50 border-l-4 border-yellow-400 rounded-lg">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-base font-semibold text-yellow-800">
                    ⚠️ Participation Already Confirmed
                  </p>
                  <p className="text-sm text-yellow-700 font-medium mt-1">
                    This booking has been marked as participated. Only super admin can undo this action.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ParticipationModal;
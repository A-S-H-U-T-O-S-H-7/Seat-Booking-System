'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { 
  ensureSeatSubcollectionExists,
  getSeatAttendanceStatus,
  markSeatAttendance,
  markMultipleSeatsAttendance
} from '@/services/participationService';
import { useAuth } from '@/context/AuthContext';
import { useAdmin } from '@/context/AdminContext';

const SeatAttendanceModal = ({ 
  isOpen, 
  onClose, 
  booking, 
  bookingType, 
  onSuccess 
}) => {
  const [attendanceData, setAttendanceData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { user } = useAuth();
  const { adminUser } = useAdmin();

  // Initialize seat attendance data when modal opens
  useEffect(() => {
    if (isOpen && booking) {
      initializeAttendanceData();
    }
  }, [isOpen, booking]);

  const initializeAttendanceData = async () => {
    setLoading(true);
    try {
      const result = await ensureSeatSubcollectionExists(booking.id, bookingType);
      if (result.success) {
        setAttendanceData(result.data);
      } else {
        toast.error(result.message);
        console.log('Failed to initialize attendance tracking:', result.message);
      }
    } catch (error) {
      console.error('Error initializing attendance data:', error);
      toast.error('Failed to load attendance data');
    } finally {
      setLoading(false);
    }
  };

  const handleSeatAttendance = async (seatId, status) => {
    setIsProcessing(true);
    try {
      const result = await markSeatAttendance(
        booking.id, 
        bookingType, 
        seatId, 
        status, 
        user.uid
      );

      if (result.success) {
        toast.success(result.message);
        // Refresh attendance data
        await refreshAttendanceData();
        onSuccess?.(booking.id);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Error marking seat attendance:', error);
      toast.error('Failed to mark attendance');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBulkAttendance = async (status) => {
    if (!attendanceData || !attendanceData.seats) return;

    const pendingSeats = Object.entries(attendanceData.seats)
      .filter(([_, seatData]) => seatData.status === 'pending')
      .map(([seatId]) => ({ unitId: seatId, status }));

    if (pendingSeats.length === 0) {
      toast.error(`No pending ${attendanceData.unitType} to mark as ${status}`);
      return;
    }

    setIsProcessing(true);
    try {
      const result = await markMultipleSeatsAttendance(
        booking.id, 
        bookingType, 
        pendingSeats, 
        user.uid
      );

      if (result.success) {
        toast.success(`Marked ${pendingSeats.length} ${attendanceData.unitType} as ${status}`);
        await refreshAttendanceData();
        onSuccess?.(booking.id);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Error marking bulk attendance:', error);
      toast.error('Failed to mark bulk attendance');
    } finally {
      setIsProcessing(false);
    }
  };

  const refreshAttendanceData = async () => {
    try {
      const result = await getSeatAttendanceStatus(booking.id, bookingType);
      if (result.success) {
        setAttendanceData(result.data);
      }
    } catch (error) {
      console.error('Error refreshing attendance data:', error);
    }
  };

  const getSeatStatusColor = (status) => {
    switch (status) {
      case 'present':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'absent':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'pending':
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  if (!isOpen || !booking) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {attendanceData?.unitType === 'stalls' ? 'Stall' : 'Seat'} Attendance Tracking
              </h3>
              <p className="text-sm text-gray-600">
                Booking #{booking.id.slice(-8)}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : attendanceData ? (
            <div className="space-y-6">
              {/* Summary Stats */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{attendanceData.summary.total}</div>
                    <div className="text-sm text-gray-600">Total {attendanceData.unitType}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{attendanceData.summary.present}</div>
                    <div className="text-sm text-gray-600">Present</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">{attendanceData.summary.absent}</div>
                    <div className="text-sm text-gray-600">Absent</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">{attendanceData.summary.pending}</div>
                    <div className="text-sm text-gray-600">Pending</div>
                  </div>
                </div>
                <div className="mt-4 text-center">
                  <div className="text-lg font-semibold text-blue-600">
                    {attendanceData.attendanceRate}% Attendance Rate
                  </div>
                </div>
              </div>

              {/* Bulk Actions */}
              {attendanceData.summary.pending > 0 && (
                <div className="flex gap-3">
                  <button
                    onClick={() => handleBulkAttendance('present')}
                    disabled={isProcessing}
                    className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50"
                  >
                    Mark All Present ({attendanceData.summary.pending})
                  </button>
                  <button
                    onClick={() => handleBulkAttendance('absent')}
                    disabled={isProcessing}
                    className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50"
                  >
                    Mark All Absent ({attendanceData.summary.pending})
                  </button>
                </div>
              )}

              {/* Individual Seats Grid */}
              <div className="max-h-96 overflow-y-auto">
                <h4 className="text-sm font-medium text-gray-900 mb-3">
                  Individual {attendanceData.unitType === 'stalls' ? 'Stall' : 'Seat'} Status
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {Object.entries(attendanceData.seats).map(([seatId, seatData]) => (
                    <div key={seatId} className="border rounded-lg p-3 bg-white">
                      <div className="flex justify-between items-start mb-2">
                        <div className="font-medium text-gray-900">{seatId}</div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getSeatStatusColor(seatData.status)}`}>
                          {seatData.status.charAt(0).toUpperCase() + seatData.status.slice(1)}
                        </span>
                      </div>
                      
                      {seatData.checkedInAt && (
                        <div className="text-xs text-gray-500 mb-2">
                          Marked: {new Date(seatData.checkedInAt.seconds * 1000).toLocaleString()}
                        </div>
                      )}

                      {seatData.status === 'pending' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleSeatAttendance(seatId, 'present')}
                            disabled={isProcessing}
                            className="flex-1 px-2 py-1 text-xs bg-green-600 hover:bg-green-700 text-white rounded transition-colors disabled:opacity-50"
                          >
                            Present
                          </button>
                          <button
                            onClick={() => handleSeatAttendance(seatId, 'absent')}
                            disabled={isProcessing}
                            className="flex-1 px-2 py-1 text-xs bg-red-600 hover:bg-red-700 text-white rounded transition-colors disabled:opacity-50"
                          >
                            Absent
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Close Button */}
              <div className="flex justify-end">
                <button
                  onClick={onClose}
                  className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-500">No attendance data available</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SeatAttendanceModal;

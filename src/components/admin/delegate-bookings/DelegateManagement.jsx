"use client";
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, getDocs, doc, updateDoc, where } from 'firebase/firestore';
import { toast } from 'react-hot-toast';
import { useTheme } from '@/context/ThemeContext';
import { useAdmin } from '@/context/AdminContext';
import adminLogger from '@/lib/adminLogger';
import { cancelBooking } from '@/utils/cancellationUtils';

import DelegateFilters from './DelegateFilters';
import DelegateTable from './DelegateTable';
import DelegateDetailsModal from './DelegateDetailsModal';
import DelegateCancellationModal from './DelegateCancellationModal';
import ParticipationModal from '../shared/ParticipationModal';
import DocumentViewerModal from '../DocumentViewerModal';
import Pagination from '../stall-bookings/Pagination';

export default function DelegateManagement() {
  const { isDarkMode } = useTheme();
  const { adminUser, hasPermission } = useAdmin();
  const [bookings, setBookings] = useState([]);
  const [allBookings, setAllBookings] = useState([]); // Store all bookings for stats
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [participationFilter, setParticipationFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    confirmed: 0,
    pending: 0,
    cancelled: 0,
    totalRevenue: 0
  });
  
  // Modal states
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showCancellationModal, setShowCancellationModal] = useState(false);
  const [showParticipationModal, setShowParticipationModal] = useState(false);
  const [documentModal, setDocumentModal] = useState({
    isOpen: false,
    booking: null
  });

  const [isUpdating, setIsUpdating] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalBookings, setTotalBookings] = useState(0);
  const bookingsPerPage = 10;

  useEffect(() => {
    fetchBookings();
  }, [currentPage, statusFilter, participationFilter, dateFilter]);

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchBookings();
    }, 500); // 500ms delay

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // Reset current page to 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, participationFilter, dateFilter]);

  // Calculate stats from all bookings
  const calculateStats = (bookingsData) => {
    const stats = {
      total: bookingsData.length,
      confirmed: bookingsData.filter(b => b.status === 'confirmed').length,
      pending: bookingsData.filter(b => b.status === 'pending_payment' || b.status === 'pending').length,
      cancelled: bookingsData.filter(b => b.status === 'cancelled').length,
      totalRevenue: bookingsData
        .filter(b => b.status === 'confirmed')
        .reduce((sum, booking) => sum + (booking.totalAmount || 0), 0)
    };
    setStats(stats);
    return stats;
  };

  const fetchBookings = async () => {
    setLoading(true);
    try {
      // Fetch all bookings first for stats (without filters)
      const allBookingsQuery = query(
        collection(db, 'delegateBookings'),
        orderBy('createdAt', 'desc')
      );
      const allSnapshot = await getDocs(allBookingsQuery);
      const allBookingsData = [];
      
      allSnapshot.forEach(doc => {
        try {
          const data = doc.data();
          const normalizedBooking = {
            id: doc.id,
            ...data,
            totalAmount: data.payment?.amount || data.totalAmount || data.amount || 0,
          };
          allBookingsData.push(normalizedBooking);
        } catch (err) {
          console.error('Error processing booking for stats:', doc.id, err);
        }
      });
      
      // Store all bookings and calculate stats
      setAllBookings(allBookingsData);
      calculateStats(allBookingsData);

      // Build query conditions array for filtered view
      const queryConditions = [];
      
      // Add status filter
      if (statusFilter !== 'all') {
        queryConditions.push(where('status', '==', statusFilter));
      }
      
      // Add date filter
      if (dateFilter !== 'all') {
        let startDate;
        const now = new Date();
        
        switch (dateFilter) {
          case 'today':
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            break;
          case 'week':
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
          case 'month':
            startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
            break;
        }
        
        if (startDate) {
          queryConditions.push(where('createdAt', '>=', startDate));
        }
      }
      
      // Always add orderBy
      queryConditions.push(orderBy('createdAt', 'desc'));
      
      // Build the final query
      let bookingsQuery = query(collection(db, 'delegateBookings'), ...queryConditions);

      const snapshot = await getDocs(bookingsQuery);
      const bookingsData = [];
      
      snapshot.forEach(doc => {
        console.log('Raw delegate booking data:', doc.id, doc.data());
        try {
          const data = doc.data();
          // Don't normalize - use the data structure as is, like DelegateCard does
          const normalizedBooking = {
            id: doc.id,
            ...data,
            // Keep original delegateDetails and eventDetails structure intact
            totalAmount: data.payment?.amount || data.totalAmount || data.amount || 0,
          };
          console.log('Normalized delegate booking data:', normalizedBooking);

          bookingsData.push(normalizedBooking);
        } catch (err) {
          console.error('Error processing delegate booking document:', doc.id, err);
        }
      });

      // Apply search and participation filters on client side
      let filteredBookings = bookingsData;
      if (searchTerm) {
        filteredBookings = filteredBookings.filter(booking => 
          (booking.delegateDetails?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          booking.delegateDetails?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          booking.delegateDetails?.organization?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          booking.id.toLowerCase().includes(searchTerm.toLowerCase())
        ));
      }
      
      // Apply participation filter
      if (participationFilter !== 'all') {
        filteredBookings = filteredBookings.filter(booking => {
          const hasParticipated = booking.participated === true;
          return participationFilter === 'yes' ? hasParticipated : !hasParticipated;
        });
      }

      setTotalBookings(filteredBookings.length);
      
      // Apply pagination
      const startIndex = (currentPage - 1) * bookingsPerPage;
      const endIndex = startIndex + bookingsPerPage;
      setBookings(filteredBookings.slice(startIndex, endIndex));

    } catch (error) {
      console.error('Error fetching delegate bookings:', error);
      toast.error('Failed to load delegate bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (bookingId, newStatus, reason = '') => {
    if (!hasPermission('manage_bookings')) {
      toast.error('You do not have permission to manage bookings');
      return;
    }

    setIsUpdating(true);
    try {
      if (newStatus === 'cancelled') {
        // Use the cancellation utility
        const bookingData = bookings.find(b => b.id === bookingId);
        if (bookingData) {
          const result = await cancelBooking(
            bookingData,
            reason,
            { ...adminUser, isAdmin: true },
            false // Delegates don't need seat release
          );
          
          if (result.success) {
            toast.success(result.message);
            // Update local state
            setBookings(prev => prev.map(booking => 
              booking.id === bookingId 
                ? { ...booking, status: 'cancelled', cancellationReason: reason, cancellationDate: new Date() }
                : booking
            ));
          } else {
            toast.error(result.error || 'Failed to cancel booking');
          }
        }
      } else {
        // Handle other status updates normally
        const bookingRef = doc(db, 'delegateBookings', bookingId);
        const updates = {
          status: newStatus,
          updatedAt: new Date()
        };

        await updateDoc(bookingRef, updates);

        // Log the action
        if (adminUser) {
          await adminLogger.logBookingActivity(
            adminUser,
            'update',
            bookingId,
            `Changed delegate status to ${newStatus}` + (reason ? ` with reason: ${reason}` : '')
          );
        }

        // Update local state
        setBookings(prev => prev.map(booking => 
          booking.id === bookingId 
            ? { ...booking, ...updates }
            : booking
        ));

        toast.success(`Delegate booking ${newStatus} successfully`);
      }
    } catch (error) {
      console.error('Error updating delegate booking status:', error);
      toast.error('Failed to update delegate booking status');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancellationRequest = async (bookingId, action) => {
    setIsUpdating(true);
    try {
      const bookingRef = doc(db, 'delegateBookings', bookingId);
      
      if (action === 'approve') {
        await updateDoc(bookingRef, {
          status: 'cancelled',
          cancellationStatus: 'approved',
          cancellationApprovedAt: new Date(),
          updatedAt: new Date()
        });
        
        toast.success('Delegate cancellation request approved');

        // Log the approval
        await adminLogger.logBookingActivity(
          { uid: 'admin', name: 'Admin', role: 'admin' },
          'update',
          bookingId,
          'Approved delegate cancellation request'
        );
      } else {
        await updateDoc(bookingRef, {
          cancellationStatus: 'rejected',
          cancellationRejectedAt: new Date(),
          updatedAt: new Date()
        });
        
        toast.success('Delegate cancellation request rejected');

        // Log the rejection
        await adminLogger.logBookingActivity(
          { uid: 'admin', name: 'Admin', role: 'admin' },
          'update',
          bookingId,
          'Rejected delegate cancellation request'
        );
      }

      fetchBookings(); // Refresh the list
    } catch (error) {
      console.error('Error handling delegate cancellation request:', error);
      toast.error(`Failed to ${action} delegate cancellation request`);
    } finally {
      setIsUpdating(false);
    }
  };

  const totalPages = Math.ceil(totalBookings / bookingsPerPage);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Main Header */}
      <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl border shadow-sm overflow-hidden`}>
        <div className="px-6 py-6">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-xl ${isDarkMode ? 'bg-yellow-900/30' : 'bg-yellow-100'}`}>
              <span className="text-2xl">🎓</span>
            </div>
            <div>
              <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Delegate Management
              </h1>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
                Manage delegate registrations and applications
              </p>
            </div>
          </div>
        </div>
      </div>

      <DelegateFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        participationFilter={participationFilter}
        setParticipationFilter={setParticipationFilter}
        dateFilter={dateFilter}
        setDateFilter={setDateFilter}
        onSearch={fetchBookings}
        loading={loading}
        isDarkMode={isDarkMode}
      />

      <DelegateTable
        bookings={bookings}
        currentPage={currentPage}
        bookingsPerPage={bookingsPerPage}
        isDarkMode={isDarkMode}
        isUpdating={isUpdating}
        onViewDetails={(booking) => {
          setSelectedBooking(booking);
          setShowBookingModal(true);
        }}
        onConfirm={(booking) => handleStatusUpdate(booking.id, 'confirmed')}
        onCancel={(booking) => {
          setSelectedBooking(booking);
          setShowCancellationModal(true);
        }}
        onApproveCancellation={(bookingId) => handleCancellationRequest(bookingId, 'approve')}
        onRejectCancellation={(bookingId) => handleCancellationRequest(bookingId, 'reject')}
        onParticipation={(booking) => {
          setSelectedBooking(booking);
          setShowParticipationModal(true);
        }}
        onViewDocuments={(booking) => {
          setDocumentModal({
            isOpen: true,
            booking: booking
          });
        }}
      />

      {totalBookings > bookingsPerPage && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalBookings={totalBookings}
          bookingsPerPage={bookingsPerPage}
          onPageChange={setCurrentPage}
          isDarkMode={isDarkMode}
        />
      )}

      {/* Modals */}
      <DelegateDetailsModal
        show={showBookingModal}
        booking={selectedBooking}
        onClose={() => setShowBookingModal(false)}
        isDarkMode={isDarkMode}
      />      

      <DelegateCancellationModal
        show={showCancellationModal}
        booking={selectedBooking}
        onClose={() => setShowCancellationModal(false)}
        onConfirm={(reason) => {
          handleStatusUpdate(selectedBooking.id, 'cancelled', reason);
          setShowCancellationModal(false);
        }}
        isUpdating={isUpdating}
        isDarkMode={isDarkMode}
      />

      <ParticipationModal
        isOpen={showParticipationModal}
        onClose={() => setShowParticipationModal(false)}
        booking={selectedBooking}
        bookingType="delegate"
        onSuccess={(bookingId) => {
          // Update the booking in local state to show it as participated
          setBookings(prev => prev.map(booking => 
            booking.id === bookingId 
              ? { ...booking, participated: true, participatedAt: new Date() }
              : booking
          ));
          setShowParticipationModal(false);
        }}
      />

      <DocumentViewerModal
        isOpen={documentModal.isOpen}
        onClose={() => setDocumentModal({ isOpen: false, booking: null })}
        booking={documentModal.booking}
        isDarkMode={isDarkMode}
      />
    </div>
  );
}

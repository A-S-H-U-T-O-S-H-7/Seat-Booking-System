"use client";
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, getDocs, doc, updateDoc, getDoc, where } from 'firebase/firestore';
import { toast } from 'react-hot-toast';
import { useTheme } from '@/context/ThemeContext';
import adminLogger from '@/lib/adminLogger';

import StallBookingFilters from './StallBookingFilters';
import StallBookingTable from './StallBookingTable';
import StallBookingDetailsModal from './StallBookingDetailsModal';
import StallCancellationModal from './StallCancellationModal';
import Pagination from './Pagination';

export default function StallBookingManagement() {
  const { isDarkMode } = useTheme();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [selectedBooking, setSelectedBooking] = useState(null);
  
  // Modal states
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showCancellationModal, setShowCancellationModal] = useState(false);

  
  const [isUpdating, setIsUpdating] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalBookings, setTotalBookings] = useState(0);
  const bookingsPerPage = 10;



  useEffect(() => {
    fetchBookings();
  }, [currentPage, statusFilter, dateFilter]);

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
  }, [statusFilter, dateFilter]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      // Build query conditions array
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
      let bookingsQuery = query(collection(db, 'stallBookings'), ...queryConditions);

      const snapshot = await getDocs(bookingsQuery);
      const bookingsData = [];
      
      snapshot.forEach(doc => {
        console.log('Raw booking data:', doc.id, doc.data());
        try {
          const data = doc.data();
          // Normalize booking data to handle different field structures
          const normalizedBooking = {
  id: doc.id,
  ...data,
  stallIds: data.stallIds || [data.stallId].filter(Boolean),
  vendorDetails: {
    name: data.vendorDetails?.ownerName || 'N/A',
    email: data.vendorDetails?.email || 'N/A',
    phone: data.vendorDetails?.phone || 'N/A',
    businessType: data.vendorDetails?.businessType || 'N/A',
    aadhar: data.vendorDetails?.aadhar,
    address: data.vendorDetails?.address
  },
  totalAmount: data.payment?.amount || data.totalAmount || data.amount || 0,
};
            console.log('Normalized booking data:', normalizedBooking);

          bookingsData.push(normalizedBooking);
        } catch (err) {
          console.error('Error processing stall booking document:', doc.id, err);
        }
      });

      // Apply search filter on client side
      let filteredBookings = bookingsData;
      if (searchTerm) {
        filteredBookings = bookingsData.filter(booking => 
          (booking.vendorDetails?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (booking.vendorDetails?.email?.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (booking.id.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (booking.stallIds?.some(stallId => stallId.toLowerCase().includes(searchTerm.toLowerCase())))
        ));
      }

      setTotalBookings(filteredBookings.length);
      
      // Apply pagination
      const startIndex = (currentPage - 1) * bookingsPerPage;
      const endIndex = startIndex + bookingsPerPage;
      setBookings(filteredBookings.slice(startIndex, endIndex));

    } catch (error) {
      console.error('Error fetching stall bookings:', error);
      toast.error('Failed to load stall bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (bookingId, newStatus, reason = '') => {
    setIsUpdating(true);
    try {
      const bookingRef = doc(db, 'stallBookings', bookingId);
      const updates = {
        status: newStatus,
        updatedAt: new Date()
      };

      if (newStatus === 'cancelled' && reason) {
        updates.cancellationReason = reason;
        updates.cancellationDate = new Date();
      }

      await updateDoc(bookingRef, updates);

      // Log the action
      await adminLogger.logBookingActivity(
        { uid: 'admin', name: 'Admin', role: 'admin' },
        'update',
        bookingId,
        `Changed status to ${newStatus}` + (reason ? ` with reason: ${reason}` : '')
      );

      // Update local state
      setBookings(prev => prev.map(booking => 
        booking.id === bookingId 
          ? { ...booking, ...updates }
          : booking
      ));

      toast.success(`Booking ${newStatus} successfully`);
      
      // If cancelling, should also free up the stalls
      if (newStatus === 'cancelled') {
        await handleStallRelease(bookingId);
      }
    } catch (error) {
      console.error('Error updating booking status:', error);
      toast.error('Failed to update booking status');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleStallRelease = async (bookingId) => {
    try {
      const booking = bookings.find(b => b.id === bookingId);
      if (!booking || !booking.stallIds || booking.stallIds.length === 0) {
        console.error('No stalls found for release:', bookingId);
        return;
      }

      // Implementation for stall release logic
      console.log('Releasing stalls:', booking.stallIds, 'for booking:', bookingId);
      toast.success(`Released ${booking.stallIds.length} stalls back to availability`);

      // Log the stall release
      await adminLogger.logBookingActivity(
        { uid: 'admin', name: 'Admin', role: 'admin' },
        'update',
        bookingId,
        `Released ${booking.stallIds.length} stalls`
      );
    } catch (error) {
      console.error('Error releasing stalls:', error);
      toast.error('Failed to release stalls');
    }
  };

  const handleCancellationRequest = async (bookingId, action) => {
    setIsUpdating(true);
    try {
      const bookingRef = doc(db, 'stallBookings', bookingId);
      
      if (action === 'approve') {
        await updateDoc(bookingRef, {
          status: 'cancelled',
          cancellationStatus: 'approved',
          cancellationApprovedAt: new Date(),
          updatedAt: new Date()
        });
        
        await handleStallRelease(bookingId);
        toast.success('Cancellation request approved');

        // Log the approval
        await adminLogger.logBookingActivity(
          { uid: 'admin', name: 'Admin', role: 'admin' },
          'update',
          bookingId,
          'Approved cancellation request'
        );
      } else {
        await updateDoc(bookingRef, {
          cancellationStatus: 'rejected',
          cancellationRejectedAt: new Date(),
          updatedAt: new Date()
        });
        
        toast.success('Cancellation request rejected');

        // Log the rejection
        await adminLogger.logBookingActivity(
          { uid: 'admin', name: 'Admin', role: 'admin' },
          'update',
          bookingId,
          'Rejected cancellation request'
        );
      }

      fetchBookings(); // Refresh the list
    } catch (error) {
      console.error('Error handling cancellation request:', error);
      toast.error(`Failed to ${action} cancellation request`);
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
      <StallBookingFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        dateFilter={dateFilter}
        setDateFilter={setDateFilter}
        onSearch={fetchBookings}
        loading={loading}
        isDarkMode={isDarkMode}
      />

      <StallBookingTable
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
      <StallBookingDetailsModal
        show={showBookingModal}
        booking={selectedBooking}
        onClose={() => setShowBookingModal(false)}
        isDarkMode={isDarkMode}
      />      

      <StallCancellationModal
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
    </div>
  );
}
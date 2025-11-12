"use client";
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, getDocs, doc, updateDoc, getDoc, where } from 'firebase/firestore';
import { toast } from 'react-hot-toast';
import { useTheme } from '@/context/ThemeContext';
import { useAdmin } from '@/context/AdminContext';
import adminLogger from '@/lib/adminLogger';
import { cancelBooking } from '@/utils/cancellationUtils';

import StallBookingFilters from './StallBookingFilters';
import StallBookingTable from './StallBookingTable';
import StallBookingDetailsModal from './StallBookingDetailsModal';
import StallCancellationModal from './StallCancellationModal';
import ParticipationModal from '../shared/ParticipationModal';
import Pagination from './Pagination';
import DocumentViewerModal from '../DocumentViewerModal';

export default function StallBookingManagement() {
  const { isDarkMode } = useTheme();
  const { adminUser, hasPermission } = useAdmin();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [participationFilter, setParticipationFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [selectedBooking, setSelectedBooking] = useState(null);
  
  // Modal states
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
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
    name: data.vendorDetails?.ownerName || data.vendorDetails?.name || data.ownerName || data.name || 'N/A',
    email: data.vendorDetails?.email || data.email || 'N/A',
    phone: data.vendorDetails?.phone || data.phone || 'N/A',
    businessType: data.vendorDetails?.businessType || data.businessType || 'N/A',
    aadhar: data.vendorDetails?.aadhar || data.aadhar,
    address: data.vendorDetails?.address || data.address
  },
  totalAmount: data.payment?.amount || data.totalAmount || data.amount || 0,
};
            console.log('Normalized booking data:', normalizedBooking);

          bookingsData.push(normalizedBooking);
        } catch (err) {
          console.error('Error processing stall booking document:', doc.id, err);
        }
      });

      // Apply search and participation filters on client side
      let filteredBookings = bookingsData;
      if (searchTerm) {
        filteredBookings = filteredBookings.filter(booking => 
          (booking.vendorDetails?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (booking.vendorDetails?.email?.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (booking.id.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (booking.stallIds?.some(stallId => stallId.toLowerCase().includes(searchTerm.toLowerCase())))
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
      console.error('Error fetching stall bookings:', error);
      toast.error('Failed to load stall bookings');
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
        // Use the new cancellation utility
        const bookingData = bookings.find(b => b.id === bookingId);
        if (bookingData) {
          const result = await cancelBooking(
            bookingData,
            reason,
            { ...adminUser, isAdmin: true },
            true // Release stalls
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
        const bookingRef = doc(db, 'stallBookings', bookingId);
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
            `Changed status to ${newStatus}` + (reason ? ` with reason: ${reason}` : '')
          );
        }

        // Update local state
        setBookings(prev => prev.map(booking => 
          booking.id === bookingId 
            ? { ...booking, ...updates }
            : booking
        ));

        toast.success(`Booking ${newStatus} successfully`);
      }
    } catch (error) {
      console.error('Error updating booking status:', error);
      toast.error('Failed to update booking status');
    } finally {
      setIsUpdating(false);
    }
  };

  // This function is now handled by the cancellation utilities
  const handleStallRelease = async (bookingId) => {
    // Legacy function - stall release is now handled in cancelBooking utility
    console.log('Stall release handled by cancellation utility for booking:', bookingId);
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
        participationFilter={participationFilter}
        setParticipationFilter={setParticipationFilter}
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

      <ParticipationModal
        isOpen={showParticipationModal}
        onClose={() => setShowParticipationModal(false)}
        booking={selectedBooking}
        bookingType="stall"
        onSuccess={(bookingId) => {
          // Update the selectedBooking state immediately to reflect changes in UI
          if (selectedBooking && selectedBooking.id === bookingId) {
            setSelectedBooking(prevBooking => ({
              ...prevBooking,
              participated: !prevBooking.participated, // Toggle participation status
              participatedAt: prevBooking.participated ? null : new Date(), // Set or clear timestamp
              participatedBy: prevBooking.participated ? null : adminUser?.uid // Set or clear admin UID
            }));
          }
          
          // Update the booking in local state to toggle participation
          setBookings(prev => prev.map(booking => 
            booking.id === bookingId 
              ? { 
                  ...booking, 
                  participated: !booking.participated, 
                  participatedAt: booking.participated ? null : new Date(),
                  participatedBy: booking.participated ? null : adminUser?.uid
                }
              : booking
          ));
          
          // Refresh bookings to get updated participation status from server (for accuracy)
          fetchBookings();
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

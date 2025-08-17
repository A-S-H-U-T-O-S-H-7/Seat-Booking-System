"use client";
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, getDocs, doc, updateDoc, getDoc, where } from 'firebase/firestore';
import { toast } from 'react-hot-toast';
import { useTheme } from '@/context/ThemeContext';
import { useAdmin } from '@/context/AdminContext';
import adminLogger from '@/lib/adminLogger';
import { cancelBooking } from '@/utils/cancellationUtils';

import BookingFilters from './BookingFilter';
import BookingTable from './BookingTable';
import BookingDetailsModal from './BookingDetailsModal';
import PaymentDetailsModal from './PaymentDetailsModal';
import PriceAdjustmentModal from './PriceAdjustmentModal';
import CancellationModal from './CancellationModal';
import Pagination from './Pagination';

export default function BookingManagement() {
  const { isDarkMode } = useTheme();
  const { adminUser } = useAdmin();
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
  const [showPriceModal, setShowPriceModal] = useState(false);
  
  const [isUpdating, setIsUpdating] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalBookings, setTotalBookings] = useState(0);
  const bookingsPerPage = 10;

  const [priceAdjustment, setPriceAdjustment] = useState({
    bookingId: null,
    newPrice: 0,
    discount: 0,
    reason: ''
  });

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
      let bookingsQuery = query(collection(db, 'bookings'), ...queryConditions);

      const snapshot = await getDocs(bookingsQuery);
      const bookingsData = [];
      
      snapshot.forEach(doc => {
        try {
          const data = doc.data();
          // Normalize booking data to handle different field structures
          const normalizedBooking = {
            id: doc.id,
            ...data,
            // Handle different seat field variations
            seats: data.eventDetails?.seats || data.seats || data.selectedSeats || data.seatNumbers || [],
            seatCount: data.eventDetails?.seatCount || data.seatCount || data.eventDetails?.seats?.length || data.seats?.length || 0,
            // Handle different date field variations
            eventDate: data.eventDetails?.date || data.eventDate,
            // Handle different shift field variations
            shift: data.eventDetails?.shift || data.shift,
            // Handle different amount field variations
            totalAmount: data.payment?.amount || data.totalAmount || data.amount || 0,
          };
          bookingsData.push(normalizedBooking);
        } catch (err) {
          console.error('Error processing booking document:', doc.id, err);
        }
      });

      // Apply search filter on client side
      let filteredBookings = bookingsData;
      if (searchTerm) {
        filteredBookings = bookingsData.filter(booking => 
          booking.customerDetails?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          booking.customerDetails?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          booking.id.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      setTotalBookings(filteredBookings.length);
      
      // Apply pagination
      const startIndex = (currentPage - 1) * bookingsPerPage;
      const endIndex = startIndex + bookingsPerPage;
      setBookings(filteredBookings.slice(startIndex, endIndex));

    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (bookingId, newStatus, reason = '') => {
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
            true // Release seats
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
        const bookingRef = doc(db, 'bookings', bookingId);
        const updates = {
          status: newStatus,
          updatedAt: new Date()
        };

        await updateDoc(bookingRef, updates);

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
  const handleSeatRelease = async (bookingId) => {
    // Legacy function - seat release is now handled in cancelBooking utility
    console.log('Seat release handled by cancellation utility for booking:', bookingId);
  };

  const handleCancellationRequest = async (bookingId, action) => {
    setIsUpdating(true);
    try {
      const bookingRef = doc(db, 'bookings', bookingId);
      
      if (action === 'approve') {
        await updateDoc(bookingRef, {
          status: 'cancelled',
          cancellationStatus: 'approved',
          cancellationApprovedAt: new Date(),
          updatedAt: new Date()
        });
        
        await handleSeatRelease(bookingId);
        toast.success('Cancellation request approved');
      } else {
        await updateDoc(bookingRef, {
          cancellationStatus: 'rejected',
          cancellationRejectedAt: new Date(),
          updatedAt: new Date()
        });
        
        toast.success('Cancellation request rejected');
      }

      fetchBookings(); // Refresh the list
    } catch (error) {
      console.error('Error handling cancellation request:', error);
      toast.error(`Failed to ${action} cancellation request`);
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePriceAdjustment = async () => {
    if (!priceAdjustment.bookingId || priceAdjustment.newPrice <= 0) {
      toast.error('Please enter a valid price');
      return;
    }

    setIsUpdating(true);
    try {
      const bookingRef = doc(db, 'bookings', priceAdjustment.bookingId);
      const originalBooking = bookings.find(b => b.id === priceAdjustment.bookingId);
      
      await updateDoc(bookingRef, {
        totalAmount: priceAdjustment.newPrice,
        originalAmount: originalBooking.totalAmount,
        priceAdjusted: true,
        priceAdjustmentReason: priceAdjustment.reason,
        discountApplied: priceAdjustment.discount,
        priceAdjustedAt: new Date(),
        updatedAt: new Date()
      });

      // Update local state
      setBookings(prev => prev.map(booking => 
        booking.id === priceAdjustment.bookingId 
          ? { 
              ...booking, 
              totalAmount: priceAdjustment.newPrice,
              originalAmount: originalBooking.totalAmount,
              priceAdjusted: true,
              discountApplied: priceAdjustment.discount
            }
          : booking
      ));

      // Log the activity
      if (adminUser) {
        await adminLogger.logBookingActivity(
          adminUser,
          'price_adjustment',
          priceAdjustment.bookingId,
          `Admin adjusted havan booking price from ₹${originalBooking.totalAmount} to ₹${priceAdjustment.newPrice}${priceAdjustment.reason ? `. Reason: ${priceAdjustment.reason}` : ''}`
        );
      }
      
      setShowPriceModal(false);
      setPriceAdjustment({ bookingId: null, newPrice: 0, discount: 0, reason: '' });
      toast.success('Price adjusted successfully');
    } catch (error) {
      console.error('Error adjusting price:', error);
      toast.error('Failed to adjust price');
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
      <BookingFilters
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

      <BookingTable
        bookings={bookings}
        isDarkMode={isDarkMode}
        isUpdating={isUpdating}
        onViewDetails={(booking) => {
          setSelectedBooking(booking);
          setShowBookingModal(true);
        }}
        onViewPayment={(booking) => {
          setSelectedBooking(booking);
          setShowPaymentModal(true);
        }}
        onAdjustPrice={(booking) => {
          setPriceAdjustment({
            bookingId: booking.id,
            newPrice: booking.totalAmount || 0,
            originalPrice: booking.totalAmount || 0,
            discount: 0,
            reason: ''
          });
          setShowPriceModal(true);
        }}
        onConfirm={(bookingId) => handleStatusUpdate(bookingId, 'confirmed')}
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
      <BookingDetailsModal
        show={showBookingModal}
        booking={selectedBooking}
        onClose={() => setShowBookingModal(false)}
        isDarkMode={isDarkMode}
      />

      <PaymentDetailsModal
        show={showPaymentModal}
        booking={selectedBooking}
        onClose={() => setShowPaymentModal(false)}
        onViewFullDetails={() => {
          setShowPaymentModal(false);
          setShowBookingModal(true);
        }}
        isDarkMode={isDarkMode}
      />

      <PriceAdjustmentModal
        show={showPriceModal}
        priceAdjustment={priceAdjustment}
        setPriceAdjustment={setPriceAdjustment}
        onClose={() => setShowPriceModal(false)}
        onSubmit={handlePriceAdjustment}
        isUpdating={isUpdating}
        isDarkMode={isDarkMode}
      />

      <CancellationModal
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
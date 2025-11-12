"use client";
import { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, getDocs, doc, updateDoc, getDoc, where } from 'firebase/firestore';
import { toast } from 'react-hot-toast';
import { useTheme } from '@/context/ThemeContext';
import { useAdmin } from '@/context/AdminContext';
import adminLogger from '@/lib/adminLogger';
import { cancelBooking } from '@/utils/cancellationUtils';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  CalendarDaysIcon
} from '@heroicons/react/24/outline';

import BookingFilters from './BookingFilter';
import BookingTable from './BookingTable';
import BookingDetailsModal from './BookingDetailsModal';
import PaymentDetailsModal from './PaymentDetailsModal';
import PriceAdjustmentModal from './PriceAdjustmentModal';
import CancellationModal from './CancellationModal';
import Pagination from './Pagination';
import ParticipationModal from '../shared/ParticipationModal';
import DocumentViewerModal from '../DocumentViewerModal';

export default function BookingManagement() {
  const { isDarkMode } = useTheme();
  const { adminUser } = useAdmin();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [participationFilter, setParticipationFilter] = useState('all');
  const [bookingDate, setBookingDate] = useState(null);
  const [eventDate, setEventDate] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);
  
  // Modal states
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showCancellationModal, setShowCancellationModal] = useState(false);
  const [showPriceModal, setShowPriceModal] = useState(false);
  const [showParticipationModal, setShowParticipationModal] = useState(false);
  const [documentModal, setDocumentModal] = useState({
    isOpen: false,
    booking: null
  });
  
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

  // Simple effect like ShowSeatManagement - no debouncing
  useEffect(() => {
    fetchBookings();
  }, [currentPage, statusFilter, participationFilter, bookingDate, eventDate]);

  // Debounced search effect only
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchBookings();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // Reset current page to 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, participationFilter, bookingDate, eventDate]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      // Build query conditions array
      const queryConditions = [];
      
      // Add status filter
      if (statusFilter !== 'all') {
        queryConditions.push(where('status', '==', statusFilter));
      }
      
      // Add booking date filter (created date)
      if (bookingDate) {
        const startOfDay = new Date(bookingDate.getFullYear(), bookingDate.getMonth(), bookingDate.getDate());
        const endOfDay = new Date(bookingDate.getFullYear(), bookingDate.getMonth(), bookingDate.getDate() + 1);
        
        queryConditions.push(where('createdAt', '>=', startOfDay));
        queryConditions.push(where('createdAt', '<', endOfDay));
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

      // Apply search and event date filters on client side
      let filteredBookings = bookingsData;
      
      // Apply search filter
      if (searchTerm) {
        filteredBookings = filteredBookings.filter(booking => 
          booking.customerDetails?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          booking.customerDetails?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          booking.id.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      
      // Apply event date filter (client-side since eventDate field structure varies)
      if (eventDate) {
        filteredBookings = filteredBookings.filter(booking => {
          if (!booking.eventDate) return false;
          
          let bookingEventDate;
          // Handle different date formats
          if (booking.eventDate.toDate && typeof booking.eventDate.toDate === 'function') {
            bookingEventDate = booking.eventDate.toDate();
          } else if (booking.eventDate.seconds) {
            bookingEventDate = new Date(booking.eventDate.seconds * 1000);
          } else {
            bookingEventDate = new Date(booking.eventDate);
          }
          
          // Compare dates (same day)
          return bookingEventDate.toDateString() === eventDate.toDateString();
        });
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
            const seatCount = bookingData.seatCount || bookingData.seats?.length || 0;
            const successMsg = seatCount > 0 
              ? `${result.message}. ${seatCount} seats have been released and are now available for booking.`
              : result.message;
            
            toast.success(successMsg, { duration: 6000 });
            
            // Update local state
            setBookings(prev => prev.map(booking => 
              booking.id === bookingId 
                ? { ...booking, status: 'cancelled', cancellationReason: reason, cancellationDate: new Date() }
                : booking
            ));
          } else {
            console.error('Cancellation failed:', result.error);
            toast.error(result.error || 'Failed to cancel booking');
          }
        } else {
          toast.error('Booking data not found');
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

  const handleParticipationSuccess = (bookingId) => {
    // Update the selectedBooking state immediately to reflect changes in UI
    if (selectedBooking && selectedBooking.id === bookingId) {
      setSelectedBooking(prevBooking => ({
        ...prevBooking,
        participated: !prevBooking.participated, // Toggle participation status
        participatedAt: prevBooking.participated ? null : new Date(), // Set or clear timestamp
        participatedBy: prevBooking.participated ? null : adminUser?.uid // Set or clear admin UID
      }));
    }
    
    // Also update the bookings array state immediately
    setBookings(prevBookings => 
      prevBookings.map(booking => 
        booking.id === bookingId 
          ? {
              ...booking,
              participated: !booking.participated,
              participatedAt: booking.participated ? null : new Date(),
              participatedBy: booking.participated ? null : adminUser?.uid
            }
          : booking
      )
    );
    
    // Still refresh bookings to get updated participation status from server (for accuracy)
    fetchBookings();
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
      {/* Booking Filters - Inline like ShowSeatManagement */}
      <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-lg border p-6`}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
          {/* Search */}
          <div>
            <label className={`block text-sm font-semibold mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              <MagnifyingGlassIcon className="w-5 h-5 inline mr-2" />
              Search Bookings
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search by name, email, or booking ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`block w-full h-12 pl-4 pr-10 rounded-lg shadow-sm transition-all duration-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
              />
              <MagnifyingGlassIcon className={`absolute right-3 top-3.5 h-5 w-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`} />
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <label className={`block text-sm font-semibold mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              <FunnelIcon className="w-5 h-5 inline mr-2" />
              Filter by Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={`block w-full h-12 px-4 rounded-lg shadow-sm transition-all duration-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="all">🔍 All Status</option>
              <option value="confirmed">✅ Confirmed</option>
              <option value="cancelled">❌ Cancelled</option>
            </select>
          </div>

          {/* Participation Filter */}
          <div>
            <label className={`block text-sm font-semibold mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              <FunnelIcon className="w-5 h-5 inline mr-2" />
              Participation
            </label>
            <select
              value={participationFilter}
              onChange={(e) => setParticipationFilter(e.target.value)}
              className={`block w-full h-12 px-4 rounded-lg shadow-sm transition-all duration-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="all">🔍 All</option>
              <option value="yes">✅ Yes</option>
              <option value="no">❌ No</option>
            </select>
          </div>

          {/* Booking Date Filter */}
          <div>
            <label className={`block text-sm font-semibold mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              <CalendarDaysIcon className="w-5 h-5 inline mr-2" />
              Booking Date
            </label>
            <input
              type="date"
              value={bookingDate ? format(bookingDate, 'yyyy-MM-dd') : ''}
              onChange={(e) => setBookingDate(e.target.value ? new Date(e.target.value) : null)}
              className={`block w-full p-2 rounded-lg shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            />
          </div>

          {/* Event Date Filter */}
          <div>
            <label className={`block text-sm font-semibold mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              <CalendarDaysIcon className="w-5 h-5 inline mr-2" />
              Event Date
            </label>
            <input
              type="date"
              value={eventDate ? format(eventDate, 'yyyy-MM-dd') : ''}
              onChange={(e) => setEventDate(e.target.value ? new Date(e.target.value) : null)}
              className={`block w-full p-2 rounded-lg shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            />
          </div>

          {/* Clear Filters Button */}
          <div className="flex items-end">
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setParticipationFilter('all');
                setBookingDate(null);
                setEventDate(null);
              }}
              disabled={loading}
              className={`w-full h-12 inline-flex items-center justify-center px-6 py-3 border text-sm font-semibold rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${
                isDarkMode 
                  ? 'border-gray-600 text-gray-300 bg-gray-700 hover:bg-gray-600'
                  : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
              }`}
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Clear Filters
            </button>
          </div>
        </div>
      </div>

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

      <ParticipationModal
        isOpen={showParticipationModal}
        onClose={() => setShowParticipationModal(false)}
        booking={selectedBooking}
        bookingType="havan"
        onSuccess={handleParticipationSuccess}
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

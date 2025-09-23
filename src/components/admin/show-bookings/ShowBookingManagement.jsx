"use client";
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { 
  collection, 
  query, 
  getDocs, 
  getDoc,
  doc, 
  updateDoc, 
  deleteDoc, 
  orderBy,
  where,
  serverTimestamp
} from 'firebase/firestore';
import { toast } from 'react-hot-toast';
import { useTheme } from '@/context/ThemeContext';
import { useAdmin } from '@/context/AdminContext';
import adminLogger from '@/lib/adminLogger';
import { formatDateKey } from '@/utils/dateUtils';
import { cancelBooking } from '@/utils/cancellationUtils';

import ShowBookingFilters from './ShowBookingFilters';
import ShowBookingsTable from './ShowBookingTable';
import ShowBookingDetailsModal from '../ShowBookingDetailsModal';
import ShowBookingCancellationModal from './ShowCancellationModal';
import ParticipationModal from '../shared/ParticipationModal';
import Pagination from './Pagination';

export default function ShowBookingsPage() {
  const { isDarkMode } = useTheme();
  const { hasPermission, adminUser } = useAdmin();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [participationFilter, setParticipationFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [selectedDate, setSelectedDate] = useState(null);
  const [bookingDate, setBookingDate] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showCancellationModal, setShowCancellationModal] = useState(false);
  const [showParticipationModal, setShowParticipationModal] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalBookings, setTotalBookings] = useState(0);
  const [allBookingsData, setAllBookingsData] = useState([]); // Store all fetched data
  const bookingsPerPage = 10;

  useEffect(() => {
    fetchBookings();
  }, [currentPage, statusFilter, dateFilter]);
  
  // Separate effect for selectedDate and bookingDate to avoid re-fetching data
  useEffect(() => {
    if (allBookingsData.length > 0) {
      // Apply client-side filtering without re-fetching
      applyClientSideFilters();
    }
  }, [selectedDate, bookingDate, participationFilter, currentPage, statusFilter, dateFilter, searchTerm, allBookingsData]);

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchBookings();
    }, 500); // 500ms delay

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, participationFilter, dateFilter, selectedDate, bookingDate]);

  // Client-side filtering function that handles both show date and booking date filters
  const applyClientSideFilters = () => {
    // Start with all available data
    let filteredBookings = [...allBookingsData];
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filteredBookings = filteredBookings.filter(booking => booking.status === statusFilter);
    }
    
    // Apply date range filter (server-side filters like week, month, etc.)
    if (dateFilter !== 'all') {
      const now = new Date();
      let startDate = new Date();
      
      switch (dateFilter) {
        case 'today':
          startDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          startDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          startDate.setDate(now.getDate() - 30);
          break;
        case '3months':
          startDate.setDate(now.getDate() - 90);
          break;
      }
      
      filteredBookings = filteredBookings.filter(booking => {
        const bookingDate = booking.bookingDate || booking.createdAt;
        return bookingDate && bookingDate >= startDate;
      });
    }
    
    // Apply specific show date filter (showDetails.date)
    if (selectedDate) {
      const targetDate = new Date(selectedDate);
      targetDate.setHours(0, 0, 0, 0);
      const nextDay = new Date(targetDate);
      nextDay.setDate(nextDay.getDate() + 1);
      
      filteredBookings = filteredBookings.filter(booking => {
        const showDate = booking.showDetails?.date;
        
        if (!showDate) {
          return false;
        }
        
        // Convert show date to Date object if it's not already
        let showDateObj;
        if (typeof showDate === 'string') {
          showDateObj = new Date(showDate);
        } else if (showDate.toDate && typeof showDate.toDate === 'function') {
          showDateObj = showDate.toDate();
        } else {
          showDateObj = new Date(showDate);
        }
        
        // Normalize show date to start of day for comparison
        showDateObj.setHours(0, 0, 0, 0);
        
        const isMatch = showDateObj >= targetDate && showDateObj < nextDay;
        
        return isMatch;
      });
    }
    
    // Apply specific booking date filter
    if (bookingDate) {
      const targetDate = new Date(bookingDate);
      targetDate.setHours(0, 0, 0, 0);
      const nextDay = new Date(targetDate);
      nextDay.setDate(nextDay.getDate() + 1);
      
      filteredBookings = filteredBookings.filter(booking => {
        const bookingDateObj = booking.bookingDate || booking.createdAt;
        
        if (!bookingDateObj) {
          return false;
        }
        
        // Normalize booking date to start of day for comparison
        const normalizedBookingDate = new Date(bookingDateObj);
        normalizedBookingDate.setHours(0, 0, 0, 0);
        
        const isMatch = normalizedBookingDate >= targetDate && normalizedBookingDate < nextDay;
        
        return isMatch;
      });
    }
    
    // Apply participation filter
    if (participationFilter !== 'all') {
      filteredBookings = filteredBookings.filter(booking => {
        const hasParticipated = booking.participated === true;
        return participationFilter === 'yes' ? hasParticipated : !hasParticipated;
      });
    }
    
    // Apply search filter
    if (searchTerm) {
      filteredBookings = filteredBookings.filter(booking => 
        booking.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (booking.userDetails?.name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (booking.userDetails?.email?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (booking.userEmail?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (booking.showDetails?.selectedSeats?.some(seat => 
          String(seat).toLowerCase().includes(searchTerm.toLowerCase())
        ))
      );
    }
    
    // Sort by booking date (most recent first)
    filteredBookings.sort((a, b) => {
      const dateA = a.bookingDate || a.createdAt || new Date(0);
      const dateB = b.bookingDate || b.createdAt || new Date(0);
      return dateB - dateA;
    });

    // Update total count
    setTotalBookings(filteredBookings.length);
    
    // Apply pagination
    const startIndex = (currentPage - 1) * bookingsPerPage;
    const endIndex = startIndex + bookingsPerPage;
    setBookings(filteredBookings.slice(startIndex, endIndex));
  };

  const fetchBookings = async () => {
    setLoading(true);
    try {
      // Try the simplest possible query to check if data exists
      let snapshot;
      try {
        snapshot = await getDocs(collection(db, 'showBookings'));
        
        if (snapshot.size === 0) {
          setBookings([]);
          setTotalBookings(0);
          return;
        }
      } catch (error) {
        console.error('Failed to access showBookings collection:', error);
        toast.error('Unable to access booking data. Please check permissions.');
        return;
      }
      
      // Build query conditions
      const queryConditions = [];
      
      // Add status filter
      if (statusFilter !== 'all') {
        queryConditions.push(where('status', '==', statusFilter));
      }
      
      // Use simple query approach - no orderBy since documents might not have createdAt
      let bookingsQuery;
      
      try {
        if (queryConditions.length > 0) {
          bookingsQuery = query(collection(db, 'showBookings'), ...queryConditions);
        } else {
          bookingsQuery = collection(db, 'showBookings');
        }
        snapshot = await getDocs(bookingsQuery);
      } catch (queryError) {
        snapshot = await getDocs(collection(db, 'showBookings'));
      }
      
      const bookingsData = [];
      
      snapshot.forEach(doc => {
        const data = doc.data();
        
        // Handle both createdAt and bookingDate for backward compatibility
        const bookingTimestamp = data.bookingDate || data.createdAt;
        
        bookingsData.push({
          id: doc.id,
          ...data,
          createdAt: bookingTimestamp?.toDate(),
          bookingDate: bookingTimestamp?.toDate(),
          showDetails: {
            ...data.showDetails,
            date: data.showDetails?.date ? 
              (typeof data.showDetails.date === 'string' ? 
                new Date(data.showDetails.date) : 
                data.showDetails.date?.toDate?.() || data.showDetails.date
              ) : null
          }
        });
      });
      
      // Store all fetched data for client-side filtering
      setAllBookingsData(bookingsData);

      // Apply client-side date filter if server-side filtering failed
      let filteredBookings = bookingsData;
      if (dateFilter !== 'all') {
        const now = new Date();
        let startDate = new Date();
        
        switch (dateFilter) {
          case 'today':
            startDate.setHours(0, 0, 0, 0);
            break;
          case 'week':
            startDate.setDate(now.getDate() - 7);
            break;
          case 'month':
            startDate.setDate(now.getDate() - 30);
            break;
          case '3months':
            startDate.setDate(now.getDate() - 90);
            break;
        }
        
        filteredBookings = filteredBookings.filter(booking => {
          const bookingDate = booking.bookingDate || booking.createdAt;
          return bookingDate && bookingDate >= startDate;
        });
      }
      
      // Skip selectedDate filtering here - it's handled by applyClientSideFilters()
      
      // Apply search filter
      if (searchTerm) {
        filteredBookings = filteredBookings.filter(booking => 
          booking.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (booking.userDetails?.name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (booking.userDetails?.email?.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (booking.userEmail?.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (booking.showDetails?.selectedSeats?.some(seat => 
            String(seat).toLowerCase().includes(searchTerm.toLowerCase())
          ))
        );
      }
      
      // Sort by booking date (most recent first) if no server-side ordering
      filteredBookings.sort((a, b) => {
        const dateA = a.bookingDate || a.createdAt || new Date(0);
        const dateB = b.bookingDate || b.createdAt || new Date(0);
        return dateB - dateA;
      });

      setTotalBookings(filteredBookings.length);
      
      // Apply pagination
      const startIndex = (currentPage - 1) * bookingsPerPage;
      const endIndex = startIndex + bookingsPerPage;
      setBookings(filteredBookings.slice(startIndex, endIndex));

    } catch (error) {
      console.error('Error fetching show bookings:', error);
      toast.error('Failed to load show bookings');
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
        const bookingData = bookings.find(b => b.id === bookingId) || allBookingsData.find(b => b.id === bookingId);
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
            // Also update allBookingsData if needed
            setAllBookingsData(prev => prev.map(booking => 
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
        const bookingRef = doc(db, 'showBookings', bookingId);
        const updates = {
          status: newStatus,
          updatedAt: serverTimestamp()
        };

        await updateDoc(bookingRef, updates);

        // Log the activity
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
  const handleSeatRelease = async (bookingId) => {
    // Legacy function - seat release is now handled in cancelBooking utility
    console.log('Seat release handled by cancellation utility for booking:', bookingId);
  };

  const handleDeleteBooking = async (bookingId) => {
    if (!hasPermission('manage_bookings')) {
      toast.error('You do not have permission to delete bookings');
      return;
    }

    if (!confirm('Are you sure you want to permanently delete this booking? This action cannot be undone.')) {
      return;
    }

    try {
      setIsUpdating(true);
      await deleteDoc(doc(db, 'showBookings', bookingId));
      
      // Log the activity
      if (adminUser) {
        await adminLogger.logBookingActivity(
          adminUser,
          'delete',
          bookingId,
          'Admin deleted show booking'
        );
      }
      
      toast.success('Booking deleted successfully');
      fetchBookings(); // Refresh the list
    } catch (error) {
      console.error('Error deleting booking:', error);
      toast.error('Failed to delete booking');
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Show Bookings Management
          </h1>
          <p className={`mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Manage show bookings and seat assignments
          </p>
        </div>
      </div>

      {/* Filters Component */}
      <ShowBookingFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        participationFilter={participationFilter}
        setParticipationFilter={setParticipationFilter}
        dateFilter={dateFilter}
        setDateFilter={setDateFilter}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        bookingDate={bookingDate}
        setBookingDate={setBookingDate}
        onSearch={fetchBookings}
        loading={loading}
        isDarkMode={isDarkMode}
      />


      {/* Bookings Table */}
      <ShowBookingsTable
        bookings={bookings}
        currentPage={currentPage}
        bookingsPerPage={bookingsPerPage}
        isDarkMode={isDarkMode}
        isUpdating={isUpdating}
        onViewDetails={(booking) => {
          setSelectedBooking(booking);
          setShowBookingModal(true);
        }}
        onConfirm={(booking) => booking?.id && handleStatusUpdate(booking.id, 'confirmed')}
        onCancel={(booking) => {
          setSelectedBooking(booking);
          setShowCancellationModal(true);
        }}
        onApproveCancellation={(booking) => booking?.id && handleStatusUpdate(booking.id, 'cancelled')}
        onRejectCancellation={(booking) => booking?.id && handleStatusUpdate(booking.id, 'confirmed')}
        onParticipation={(booking) => {
          setSelectedBooking(booking);
          setShowParticipationModal(true);
        }}
      />

      {/* Pagination */}
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
      <ShowBookingDetailsModal
        show={showBookingModal}
        booking={selectedBooking}
        onClose={() => setShowBookingModal(false)}
        isDarkMode={isDarkMode}
      />      

      <ShowBookingCancellationModal
        show={showCancellationModal}
        booking={selectedBooking}
        onClose={() => setShowCancellationModal(false)}
        onConfirm={(reason) => {
          selectedBooking?.id && handleStatusUpdate(selectedBooking.id, 'cancelled', reason);
          setShowCancellationModal(false);
        }}
        isUpdating={isUpdating}
        isDarkMode={isDarkMode}
      />

      <ParticipationModal
        isOpen={showParticipationModal}
        onClose={() => setShowParticipationModal(false)}
        booking={selectedBooking}
        bookingType="show"
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
          setAllBookingsData(prev => prev.map(booking => 
            booking.id === bookingId 
              ? { 
                  ...booking, 
                  participated: !booking.participated, 
                  participatedAt: booking.participated ? null : new Date(),
                  participatedBy: booking.participated ? null : adminUser?.uid
                }
              : booking
          ));
        }}
      />
    </div>
  );
}

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

import ShowBookingFilters from './ShowBookingFilters';
import ShowBookingsTable from './ShowBookingTable';
import ShowBookingDetailsModal from '../ShowBookingDetailsModal';
import ShowBookingCancellationModal from './ShowCancellationModal';
import Pagination from './Pagination';

export default function ShowBookingsPage() {
  const { isDarkMode } = useTheme();
  const { hasPermission, adminUser } = useAdmin();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showCancellationModal, setShowCancellationModal] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalBookings, setTotalBookings] = useState(0);
  const bookingsPerPage = 10;

  useEffect(() => {
    fetchBookings();
  }, [currentPage, statusFilter, dateFilter, searchTerm]);

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, dateFilter, searchTerm]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      // Build query conditions
      const queryConditions = [];
      
      // Add status filter
      if (statusFilter !== 'all') {
        queryConditions.push(where('status', '==', statusFilter));
      }
      
      // Add date filter
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
            startDate.setMonth(now.getMonth() - 1);
            break;
        }
        
        queryConditions.push(where('createdAt', '>=', startDate));
      }
      
      // Always add orderBy
      queryConditions.push(orderBy('createdAt', 'desc'));
      
      // Build the final query
      let bookingsQuery = query(collection(db, 'showBookings'), ...queryConditions);

      const snapshot = await getDocs(bookingsQuery);
      const bookingsData = [];
      
      snapshot.forEach(doc => {
        const data = doc.data();
        bookingsData.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate(),
          showDetails: {
            ...data.showDetails,
            date: data.showDetails?.date?.toDate?.() || new Date(data.showDetails?.date)
          }
        });
      });

      // Apply search filter
      let filteredBookings = bookingsData;
      if (searchTerm) {
        filteredBookings = bookingsData.filter(booking => 
          booking.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (booking.userDetails?.name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (booking.userDetails?.email?.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (booking.showDetails?.selectedSeats?.some(seat => 
            String(seat).toLowerCase().includes(searchTerm.toLowerCase())
          ))
        );
      }

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
      const bookingRef = doc(db, 'showBookings', bookingId);
      const updates = {
        status: newStatus,
        updatedAt: serverTimestamp()
      };

      if (newStatus === 'cancelled' && reason) {
        updates.cancellationReason = reason;
        updates.cancellationDate = serverTimestamp();
      }

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
      
      // If cancelling, should also free up the seats
      if (newStatus === 'cancelled') {
        await handleSeatRelease(bookingId);
      }
    } catch (error) {
      console.error('Error updating booking status:', error);
      toast.error('Failed to update booking status');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSeatRelease = async (bookingId) => {
    try {
      const booking = bookings.find(b => b.id === bookingId);
      if (!booking || !booking.showDetails?.selectedSeats || booking.showDetails.selectedSeats.length === 0) {
        console.error('No seats found for release:', bookingId);
        return;
      }

      // Convert to ISO date string
      const dateObj = new Date(booking.showDetails.date);
      const dateKey = dateObj.toISOString().split('T')[0];
      
      // Update seat availability
      const availabilityRef = doc(db, 'showSeatAvailability', `${dateKey}_${booking.showDetails.time || 'evening'}`);
      const currentDoc = await getDoc(availabilityRef);
      const currentSeats = currentDoc.exists() ? currentDoc.data().seats || {} : {};
      
      const updatedSeats = { ...currentSeats };
      booking.showDetails.selectedSeats.forEach(seatId => {
        if (updatedSeats[seatId]) {
          updatedSeats[seatId] = {
            ...updatedSeats[seatId],
            booked: false,
            bookingId: null,
            userId: null
          };
        }
      });
      
      await updateDoc(availabilityRef, {
        seats: updatedSeats,
        lastUpdated: serverTimestamp()
      });

      toast.success(`Released ${booking.showDetails.selectedSeats.length} seats back to availability`);

      // Log the seat release
      if (adminUser) {
        await adminLogger.logBookingActivity(
          adminUser,
          'update',
          bookingId,
          `Released ${booking.showDetails.selectedSeats.length} seats`
        );
      }
    } catch (error) {
      console.error('Error releasing seats:', error);
      toast.error('Failed to release seats');
    }
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
        dateFilter={dateFilter}
        setDateFilter={setDateFilter}
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
        onConfirm={(booking) => handleStatusUpdate(booking.id, 'confirmed')}
        onCancel={(booking) => {
          setSelectedBooking(booking);
          setShowCancellationModal(true);
        }}
        onDelete={(booking) => handleDeleteBooking(booking.id)}
        onApproveCancellation={(booking) => handleStatusUpdate(booking.id, 'cancelled')}
        onRejectCancellation={(booking) => handleStatusUpdate(booking.id, 'confirmed')}
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
          handleStatusUpdate(selectedBooking.id, 'cancelled', reason);
          setShowCancellationModal(false);
        }}
        isUpdating={isUpdating}
        isDarkMode={isDarkMode}
      />
    </div>
  );
}
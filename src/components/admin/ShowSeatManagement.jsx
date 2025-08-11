"use client";
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  orderBy,
  onSnapshot,
  serverTimestamp 
} from 'firebase/firestore';
import { format, parseISO } from 'date-fns';
import { useTheme } from '@/context/ThemeContext';
import { useAdmin } from '@/context/AdminContext';
import { toast } from 'react-hot-toast';
import {
  CalendarDaysIcon,
  UserIcon,
  MapPinIcon,
  CurrencyRupeeIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  EyeIcon,
  TrashIcon,
  ExclamationTriangleIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import ShowBookingDetailsModal from './ShowBookingDetailsModal';

export default function ShowSeatManagement() {
  const { isDarkMode } = useTheme();
  const { hasPermission } = useAdmin();
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all',
    dateRange: 'all',
    searchTerm: '',
    showTime: 'all'
  });
  const [stats, setStats] = useState({
    totalBookings: 0,
    confirmedBookings: 0,
    vipSeats: 0,
    regularSeats: 0,
    totalRevenue: 0
  });

  useEffect(() => {
    if (hasPermission('view_bookings')) {
      fetchShowBookings();
    }
  }, [hasPermission]);

  useEffect(() => {
    applyFilters();
  }, [bookings, filters]);

  const fetchShowBookings = async () => {
    try {
      setLoading(true);
      const bookingsRef = collection(db, 'showBookings');
      const q = query(bookingsRef, orderBy('createdAt', 'desc'));
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const bookingsData = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          bookingsData.push({
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate(),
            showDate: data.showDetails?.date ? parseISO(data.showDetails.date) : new Date(),
          });
        });
        
        setBookings(bookingsData);
        calculateStats(bookingsData);
        setLoading(false);
      });

      return () => unsubscribe();
    } catch (error) {
      console.error('Error fetching show bookings:', error);
      toast.error('Failed to load show bookings');
      setLoading(false);
    }
  };

  const calculateStats = (bookingsData) => {
    const stats = {
      totalBookings: bookingsData.length,
      confirmedBookings: bookingsData.filter(b => b.status === 'confirmed').length,
      vipSeats: 0,
      regularSeats: 0,
      totalRevenue: 0
    };

    bookingsData.forEach(booking => {
      if (booking.status === 'confirmed') {
        if (booking.payment?.amount) {
          stats.totalRevenue += parseFloat(booking.payment.amount);
        }
        
        if (booking.showDetails?.selectedSeats) {
          booking.showDetails.selectedSeats.forEach(seat => {
            if (seat.type === 'vip') {
              stats.vipSeats++;
            } else {
              stats.regularSeats++;
            }
          });
        }
      }
    });

    setStats(stats);
  };

  const applyFilters = () => {
    let filtered = [...bookings];

    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(booking => booking.status === filters.status);
    }

    // Search filter
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(booking => 
        booking.bookingId?.toLowerCase().includes(searchLower) ||
        booking.userDetails?.name?.toLowerCase().includes(searchLower) ||
        booking.userDetails?.email?.toLowerCase().includes(searchLower) ||
        booking.userDetails?.phone?.includes(filters.searchTerm)
      );
    }

    // Show time filter
    if (filters.showTime !== 'all') {
      filtered = filtered.filter(booking => booking.showDetails?.time === filters.showTime);
    }

    // Date range filter
    if (filters.dateRange !== 'all') {
      const now = new Date();
      const startDate = new Date();
      
      switch (filters.dateRange) {
        case 'today':
          startDate.setHours(0, 0, 0, 0);
          filtered = filtered.filter(booking => 
            booking.createdAt >= startDate
          );
          break;
        case 'week':
          startDate.setDate(now.getDate() - 7);
          filtered = filtered.filter(booking => 
            booking.createdAt >= startDate
          );
          break;
        case 'month':
          startDate.setMonth(now.getMonth() - 1);
          filtered = filtered.filter(booking => 
            booking.createdAt >= startDate
          );
          break;
      }
    }

    setFilteredBookings(filtered);
  };

  const handleCancelBooking = async (bookingId) => {
    if (!hasPermission('manage_bookings')) {
      toast.error('You do not have permission to cancel bookings');
      return;
    }

    if (!confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    try {
      const bookingRef = doc(db, 'showBookings', bookingId);
      await updateDoc(bookingRef, {
        status: 'cancelled',
        cancelledAt: serverTimestamp(),
        cancelledBy: 'admin',
        updatedAt: serverTimestamp()
      });
      
      toast.success('Booking cancelled successfully');
    } catch (error) {
      console.error('Error cancelling booking:', error);
      toast.error('Failed to cancel booking');
    }
  };

  const handleDeleteBooking = async (bookingId) => {
    if (!hasPermission('delete_bookings')) {
      toast.error('You do not have permission to delete bookings');
      return;
    }

    if (!confirm('Are you sure you want to permanently delete this booking? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'showBookings', bookingId));
      toast.success('Booking deleted successfully');
    } catch (error) {
      console.error('Error deleting booking:', error);
      toast.error('Failed to delete booking');
    }
  };

  const getStatusBadge = (status) => {
    const statusStyles = {
      confirmed: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      cancelled: 'bg-red-100 text-red-800',
      completed: 'bg-blue-100 text-blue-800'
    };

    const statusIcons = {
      confirmed: CheckCircleIcon,
      pending: ClockIcon,
      cancelled: XCircleIcon,
      completed: CheckCircleIcon
    };

    const Icon = statusIcons[status] || ClockIcon;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyles[status] || 'bg-gray-100 text-gray-800'}`}>
        <Icon className="w-3 h-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className={`h-8 rounded w-1/4 mb-4 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <div className={`h-4 rounded w-1/2 mb-2 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
                <div className={`h-6 rounded w-1/3 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
              </div>
            ))}
          </div>
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
            Show Seat Management
          </h1>
          <p className={`mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Manage show seat bookings and reservations
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className={`p-4 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center">
            <ChartBarIcon className={`w-6 h-6 mr-2 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
            <div>
              <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Total Bookings
              </p>
              <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {stats.totalBookings}
              </p>
            </div>
          </div>
        </div>

        <div className={`p-4 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center">
            <CheckCircleIcon className={`w-6 h-6 mr-2 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} />
            <div>
              <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Confirmed
              </p>
              <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {stats.confirmedBookings}
              </p>
            </div>
          </div>
        </div>

        <div className={`p-4 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center">
            <MapPinIcon className={`w-6 h-6 mr-2 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`} />
            <div>
              <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                VIP Seats
              </p>
              <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {stats.vipSeats}
              </p>
            </div>
          </div>
        </div>

        <div className={`p-4 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center">
            <MapPinIcon className={`w-6 h-6 mr-2 ${isDarkMode ? 'text-orange-400' : 'text-orange-600'}`} />
            <div>
              <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Regular Seats
              </p>
              <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {stats.regularSeats}
              </p>
            </div>
          </div>
        </div>

        <div className={`p-4 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center">
            <CurrencyRupeeIcon className={`w-6 h-6 mr-2 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} />
            <div>
              <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Total Revenue
              </p>
              <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                ₹{stats.totalRevenue.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className={`p-4 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
              className={`w-full rounded-md border px-3 py-2 text-sm ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="all">All Statuses</option>
              <option value="confirmed">Confirmed</option>
              <option value="pending">Pending</option>
              <option value="cancelled">Cancelled</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Show Time
            </label>
            <select
              value={filters.showTime}
              onChange={(e) => setFilters({...filters, showTime: e.target.value})}
              className={`w-full rounded-md border px-3 py-2 text-sm ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="all">All Times</option>
              <option value="10:00">10:00 AM</option>
              <option value="14:00">2:00 PM</option>
              <option value="18:00">6:00 PM</option>
            </select>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Date Range
            </label>
            <select
              value={filters.dateRange}
              onChange={(e) => setFilters({...filters, dateRange: e.target.value})}
              className={`w-full rounded-md border px-3 py-2 text-sm ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Search
            </label>
            <input
              type="text"
              placeholder="Booking ID, name, email..."
              value={filters.searchTerm}
              onChange={(e) => setFilters({...filters, searchTerm: e.target.value})}
              className={`w-full rounded-md border px-3 py-2 text-sm ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
            />
          </div>
        </div>
      </div>

      {/* Bookings Table */}
      <div className={`rounded-lg border overflow-hidden ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className={isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}>
              <tr>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                  Booking Details
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                  Customer
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                  Show Details
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                  Seats
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                  Amount
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                  Status
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
              {filteredBookings.map((booking) => (
                <tr key={booking.id} className={isDarkMode ? 'bg-gray-800' : 'bg-white'}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {booking.bookingId}
                      </p>
                      <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {booking.createdAt ? format(booking.createdAt, 'MMM dd, yyyy HH:mm') : 'N/A'}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {booking.userDetails?.name || 'N/A'}
                      </p>
                      <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {booking.userDetails?.email}
                      </p>
                      <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {booking.userDetails?.phone}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <p className={`text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {booking.showDate ? format(booking.showDate, 'MMM dd, yyyy') : 'N/A'}
                      </p>
                      <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {booking.showDetails?.time || 'N/A'}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <p className={`text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {booking.showDetails?.selectedSeats?.length || 0} seats
                      </p>
                      <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        VIP: {booking.showDetails?.selectedSeats?.filter(s => s.type === 'vip').length || 0} | 
                        Regular: {booking.showDetails?.selectedSeats?.filter(s => s.type === 'regular').length || 0}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      ₹{booking.payment?.amount?.toLocaleString() || '0'}
                    </p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(booking.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setSelectedBooking(booking);
                          setShowDetailsModal(true);
                        }}
                        className={`p-1 rounded hover:bg-gray-100 ${isDarkMode ? 'text-blue-400 hover:bg-gray-700' : 'text-blue-600'}`}
                      >
                        <EyeIcon className="w-4 h-4" />
                      </button>
                      {booking.status === 'confirmed' && hasPermission('manage_bookings') && (
                        <button
                          onClick={() => handleCancelBooking(booking.id)}
                          className={`p-1 rounded hover:bg-gray-100 ${isDarkMode ? 'text-yellow-400 hover:bg-gray-700' : 'text-yellow-600'}`}
                        >
                          <XCircleIcon className="w-4 h-4" />
                        </button>
                      )}
                      {hasPermission('delete_bookings') && (
                        <button
                          onClick={() => handleDeleteBooking(booking.id)}
                          className={`p-1 rounded hover:bg-gray-100 ${isDarkMode ? 'text-red-400 hover:bg-gray-700' : 'text-red-600'}`}
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredBookings.length === 0 && (
          <div className="text-center py-12">
            <ExclamationTriangleIcon className={`w-12 h-12 mx-auto mb-4 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`} />
            <p className={`text-lg font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              No show bookings found
            </p>
            <p className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>
              {filters.status !== 'all' || filters.searchTerm || filters.dateRange !== 'all'
                ? 'Try adjusting your filters'
                : 'Show bookings will appear here once customers start booking'}
            </p>
          </div>
        )}
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedBooking && (
        <ShowBookingDetailsModal
          booking={selectedBooking}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedBooking(null);
          }}
        />
      )}
    </div>
  );
}

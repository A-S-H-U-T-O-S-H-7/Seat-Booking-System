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
import adminLogger from '@/lib/adminLogger';
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
  ChartBarIcon,
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline';

export default function ShowBookingManagement() {
  const { isDarkMode } = useTheme();
  const { hasPermission, adminUser } = useAdmin();
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [updating, setUpdating] = useState(false);
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
            showDate: data.showDetails?.date ? new Date(data.showDetails.date) : new Date(),
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
            if (seat.type === 'VIP') {
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
      setUpdating(true);
      const bookingRef = doc(db, 'showBookings', bookingId);
      await updateDoc(bookingRef, {
        status: 'cancelled',
        cancelledAt: serverTimestamp(),
        cancelledBy: 'admin',
        updatedAt: serverTimestamp()
      });

      // Log the activity
      if (adminUser) {
        await adminLogger.logBookingActivity(
          adminUser,
          'cancel',
          bookingId,
          'Admin cancelled show booking'
        );
      }
      
      toast.success('Booking cancelled successfully');
    } catch (error) {
      console.error('Error cancelling booking:', error);
      toast.error('Failed to cancel booking');
    } finally {
      setUpdating(false);
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
      setUpdating(true);
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
    } catch (error) {
      console.error('Error deleting booking:', error);
      toast.error('Failed to delete booking');
    } finally {
      setUpdating(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusStyles = {
      confirmed: isDarkMode ? 'bg-green-900/50 text-green-300' : 'bg-green-100 text-green-800',
      pending: isDarkMode ? 'bg-yellow-900/50 text-yellow-300' : 'bg-yellow-100 text-yellow-800',
      cancelled: isDarkMode ? 'bg-red-900/50 text-red-300' : 'bg-red-100 text-red-800',
      completed: isDarkMode ? 'bg-blue-900/50 text-blue-300' : 'bg-blue-100 text-blue-800'
    };

    const statusIcons = {
      confirmed: CheckCircleIcon,
      pending: ClockIcon,
      cancelled: XCircleIcon,
      completed: CheckCircleIcon
    };

    const Icon = statusIcons[status] || ClockIcon;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyles[status] || (isDarkMode ? 'bg-gray-900/50 text-gray-300' : 'bg-gray-100 text-gray-800')}`}>
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
            Show Seat Bookings
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
            <MapPinIcon className={`w-6 h-6 mr-2 ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`} />
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
            <CurrencyRupeeIcon className={`w-6 h-6 mr-2 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`} />
            <div>
              <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Revenue
              </p>
              <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                ₹{stats.totalRevenue.toLocaleString('en-IN')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className={`p-4 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              <MagnifyingGlassIcon className="w-4 h-4 inline mr-1" />
              Search
            </label>
            <input
              type="text"
              value={filters.searchTerm}
              onChange={(e) => setFilters({...filters, searchTerm: e.target.value})}
              placeholder="Search by ID, name, email..."
              className={`block w-full rounded-lg border transition-colors ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-900'
              } px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              <AdjustmentsHorizontalIcon className="w-4 h-4 inline mr-1" />
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
              className={`block w-full rounded-lg border transition-colors ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              } px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
            >
              <option value="all">All Statuses</option>
              <option value="confirmed">Confirmed</option>
              <option value="pending">Pending</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              <CalendarDaysIcon className="w-4 h-4 inline mr-1" />
              Date Range
            </label>
            <select
              value={filters.dateRange}
              onChange={(e) => setFilters({...filters, dateRange: e.target.value})}
              className={`block w-full rounded-lg border transition-colors ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              } px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
            </select>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              <ClockIcon className="w-4 h-4 inline mr-1" />
              Show Time
            </label>
            <select
              value={filters.showTime}
              onChange={(e) => setFilters({...filters, showTime: e.target.value})}
              className={`block w-full rounded-lg border transition-colors ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              } px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
            >
              <option value="all">All Times</option>
              <option value="morning">Morning</option>
              <option value="afternoon">Afternoon</option>
              <option value="evening">Evening</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bookings Table */}
      <div className={`rounded-lg border overflow-hidden ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className={isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}>
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
                  Seats & Amount
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                  Status
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className={`${isDarkMode ? 'bg-gray-800 divide-gray-700' : 'bg-white divide-gray-200'} divide-y`}>
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan="6" className={`px-6 py-8 text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    <div className="flex flex-col items-center">
                      <ExclamationTriangleIcon className="w-12 h-12 mb-4 opacity-50" />
                      <p className="text-lg font-medium">No bookings found</p>
                      <p className="text-sm">Try adjusting your filters</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredBookings.map((booking) => (
                  <tr key={booking.id} className={`transition-colors duration-150 ${
                    isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                  }`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {booking.bookingId}
                        </div>
                        <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {booking.createdAt ? format(booking.createdAt, 'MMM dd, yyyy HH:mm') : 'Unknown date'}
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {booking.userDetails?.name || 'N/A'}
                        </div>
                        <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {booking.userDetails?.email || 'N/A'}
                        </div>
                        {booking.userDetails?.phone && (
                          <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            {booking.userDetails.phone}
                          </div>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {booking.showDate ? format(booking.showDate, 'MMM dd, yyyy') : 'TBD'}
                        </div>
                        <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {booking.showDetails?.time || 'TBD'}
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {booking.showDetails?.selectedSeats?.length || 0} seats
                        </div>
                        <div className={`text-sm font-bold ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>
                          ₹{booking.payment?.amount || 0}
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(booking.status)}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => {
                            setSelectedBooking(booking);
                            setShowDetailsModal(true);
                          }}
                          className={`p-1.5 rounded-md transition-colors duration-200 ${
                            isDarkMode 
                              ? 'text-blue-400 hover:text-blue-300 hover:bg-blue-900/50' 
                              : 'text-blue-600 hover:text-blue-900 hover:bg-blue-50'
                          }`}
                          title="View Details"
                        >
                          <EyeIcon className="w-4 h-4" />
                        </button>
                        
                        {booking.status === 'confirmed' && hasPermission('manage_bookings') && (
                          <button
                            onClick={() => handleCancelBooking(booking.id)}
                            disabled={updating}
                            className={`p-1.5 rounded-md transition-colors duration-200 disabled:opacity-50 ${
                              isDarkMode 
                                ? 'text-yellow-400 hover:text-yellow-300 hover:bg-yellow-900/50' 
                                : 'text-yellow-600 hover:text-yellow-900 hover:bg-yellow-50'
                            }`}
                            title="Cancel Booking"
                          >
                            <XCircleIcon className="w-4 h-4" />
                          </button>
                        )}

                        {hasPermission('manage_bookings') && (
                          <button
                            onClick={() => handleDeleteBooking(booking.id)}
                            disabled={updating}
                            className={`p-1.5 rounded-md transition-colors duration-200 disabled:opacity-50 ${
                              isDarkMode 
                                ? 'text-red-400 hover:text-red-300 hover:bg-red-900/50' 
                                : 'text-red-600 hover:text-red-900 hover:bg-red-50'
                            }`}
                            title="Delete Booking"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Booking Details Modal */}
      {showDetailsModal && selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className={`relative ${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden`}>
            <div className={`px-6 py-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} flex items-center justify-between`}>
              <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Booking Details
              </h3>
              <button
                onClick={() => setShowDetailsModal(false)}
                className={`p-2 rounded-md transition-colors ${isDarkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}
              >
                <XCircleIcon className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    Booking Information
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>ID:</span>
                      <span className={`ml-2 font-mono ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {selectedBooking.bookingId}
                      </span>
                    </div>
                    <div>
                      <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>Status:</span>
                      <span className="ml-2">{getStatusBadge(selectedBooking.status)}</span>
                    </div>
                    <div>
                      <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>Created:</span>
                      <span className={`ml-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {selectedBooking.createdAt ? format(selectedBooking.createdAt, 'MMM dd, yyyy HH:mm') : 'Unknown'}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    Customer Details
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>Name:</span>
                      <span className={`ml-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {selectedBooking.userDetails?.name || 'N/A'}
                      </span>
                    </div>
                    <div>
                      <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>Email:</span>
                      <span className={`ml-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {selectedBooking.userDetails?.email || 'N/A'}
                      </span>
                    </div>
                    <div>
                      <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>Phone:</span>
                      <span className={`ml-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {selectedBooking.userDetails?.phone || 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    Show Details
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>Date:</span>
                      <span className={`ml-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {selectedBooking.showDate ? format(selectedBooking.showDate, 'MMM dd, yyyy') : 'TBD'}
                      </span>
                    </div>
                    <div>
                      <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>Time:</span>
                      <span className={`ml-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {selectedBooking.showDetails?.time || 'TBD'}
                      </span>
                    </div>
                    <div>
                      <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>Seats:</span>
                      <span className={`ml-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {selectedBooking.showDetails?.selectedSeats?.length || 0} seats
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    Payment Details
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>Amount:</span>
                      <span className={`ml-2 font-bold ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>
                        ₹{selectedBooking.payment?.amount || 0}
                      </span>
                    </div>
                    <div>
                      <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>Method:</span>
                      <span className={`ml-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {selectedBooking.payment?.method || 'N/A'}
                      </span>
                    </div>
                    <div>
                      <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>Transaction ID:</span>
                      <span className={`ml-2 font-mono text-xs ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {selectedBooking.payment?.transactionId || 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Selected Seats Details */}
              {selectedBooking.showDetails?.selectedSeats && selectedBooking.showDetails.selectedSeats.length > 0 && (
                <div className="mt-6">
                  <h4 className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-3`}>
                    Selected Seats
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {selectedBooking.showDetails.selectedSeats.map((seat, index) => (
                      <div 
                        key={index}
                        className={`px-3 py-2 rounded-lg text-center text-xs font-medium ${
                          seat.type === 'VIP' 
                            ? (isDarkMode ? 'bg-purple-900/50 text-purple-300' : 'bg-purple-100 text-purple-800')
                            : (isDarkMode ? 'bg-blue-900/50 text-blue-300' : 'bg-blue-100 text-blue-800')
                        }`}
                      >
                        {seat.id || `Seat ${index + 1}`}
                        {seat.type && (
                          <div className="text-xs opacity-75">
                            {seat.type}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

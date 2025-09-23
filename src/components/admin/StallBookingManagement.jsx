"use client";
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { 
  collection, 
  query, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  orderBy,
  onSnapshot,
  where,
  serverTimestamp
} from 'firebase/firestore';
import { format } from 'date-fns';
import { useTheme } from '@/context/ThemeContext';
import { useAdmin } from '@/context/AdminContext';
import { toast } from 'react-hot-toast';
import adminLogger from '@/lib/adminLogger';
import {
  CalendarDaysIcon,
  BuildingStorefrontIcon,
  CurrencyRupeeIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  EyeIcon,
  TrashIcon,
  ExclamationTriangleIcon,
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';

export default function StallBookingManagement() {
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
    category: 'all'
  });
  const [stats, setStats] = useState({
    totalBookings: 0,
    confirmedBookings: 0,
    pendingBookings: 0,
    totalRevenue: 0
  });

  const stallCategories = [
    { id: 'food', name: 'Food & Beverages', icon: '🍽️' },
    { id: 'handicrafts', name: 'Handicrafts', icon: '🎨' },
    { id: 'clothing', name: 'Clothing', icon: '👕' },
    { id: 'jewelry', name: 'Jewelry', icon: '💍' },
    { id: 'books', name: 'Books & Literature', icon: '📚' },
    { id: 'toys', name: 'Toys & Games', icon: '🧸' },
    { id: 'electronics', name: 'Electronics', icon: '📱' },
    { id: 'general', name: 'General Merchandise', icon: '🛍️' }
  ];

  useEffect(() => {
    if (hasPermission('view_events') || hasPermission('manage_bookings')) {
      fetchBookings();
    }
  }, [hasPermission]);

  useEffect(() => {
    applyFilters();
  }, [bookings, filters]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const bookingsRef = collection(db, 'stallBookings');
      const q = query(bookingsRef, orderBy('createdAt', 'desc'));
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const bookingsData = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          bookingsData.push({
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate(),
            eventDate: data.eventDate?.toDate?.() || new Date(data.eventDate),
          });
        });
        
        setBookings(bookingsData);
        calculateStats(bookingsData);
        setLoading(false);
      });

      return () => unsubscribe();
    } catch (error) {
      console.error('Error fetching stall bookings:', error);
      toast.error('Failed to load stall bookings');
      setLoading(false);
    }
  };

  const calculateStats = (bookingsData) => {
    const stats = {
      totalBookings: bookingsData.length,
      confirmedBookings: bookingsData.filter(b => b.status === 'confirmed').length,
      pendingBookings: bookingsData.filter(b => b.status === 'pending').length,
      totalRevenue: bookingsData
        .filter(b => b.status === 'confirmed')
        .reduce((sum, booking) => sum + (parseFloat(booking.totalAmount) || 0), 0)
    };
    setStats(stats);
  };

  const applyFilters = () => {
    let filtered = [...bookings];

    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(booking => booking.status === filters.status);
    }

    // Category filter
    if (filters.category !== 'all') {
      filtered = filtered.filter(booking => 
        booking.stallDetails?.category === filters.category
      );
    }

    // Date range filter
    const now = new Date();
    if (filters.dateRange !== 'all') {
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

    // Search filter
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(booking => 
        booking.id.toLowerCase().includes(searchLower) ||
        booking.customerDetails?.name?.toLowerCase().includes(searchLower) ||
        booking.customerDetails?.email?.toLowerCase().includes(searchLower) ||
        booking.customerDetails?.phone?.toLowerCase().includes(searchLower) ||
        booking.stallDetails?.stallNumber?.toLowerCase().includes(searchLower)
      );
    }

    setFilteredBookings(filtered);
  };

  const handleCancelBooking = async (bookingId) => {
    if (!hasPermission('manage_bookings')) {
      toast.error('You do not have permission to cancel bookings');
      return;
    }

    if (!confirm('Are you sure you want to cancel this booking? This action cannot be undone.')) {
      return;
    }

    try {
      setUpdating(true);
      const bookingRef = doc(db, 'stallBookings', bookingId);
      await updateDoc(bookingRef, {
        status: 'cancelled',
        cancelledAt: serverTimestamp(),
        cancelledBy: adminUser?.uid,
        updatedAt: serverTimestamp()
      });

      // Log the activity
      if (adminUser) {
        await adminLogger.logBookingActivity(
          adminUser,
          'cancel',
          'stall_booking',
          bookingId,
          'Admin cancelled booking'
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
      await deleteDoc(doc(db, 'stallBookings', bookingId));
      
      // Log the activity
      if (adminUser) {
        await adminLogger.logBookingActivity(
          adminUser,
          'delete',
          'stall_booking',
          bookingId,
          'Admin deleted booking'
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

  const handleConfirmBooking = async (bookingId) => {
    if (!hasPermission('manage_bookings')) {
      toast.error('You do not have permission to confirm bookings');
      return;
    }

    try {
      setUpdating(true);
      const bookingRef = doc(db, 'stallBookings', bookingId);
      await updateDoc(bookingRef, {
        status: 'confirmed',
        confirmedAt: serverTimestamp(),
        confirmedBy: adminUser?.uid,
        updatedAt: serverTimestamp()
      });

      // Log the activity
      if (adminUser) {
        await adminLogger.logBookingActivity(
          adminUser,
          'confirm',
          'stall_booking',
          bookingId,
          'Admin confirmed booking'
        );
      }
      
      toast.success('Booking confirmed successfully');
    } catch (error) {
      console.error('Error confirming booking:', error);
      toast.error('Failed to confirm booking');
    } finally {
      setUpdating(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusStyles = {
      confirmed: isDarkMode ? 'bg-green-900/50 text-green-300' : 'bg-green-100 text-green-800',
      pending: isDarkMode ? 'bg-yellow-900/50 text-yellow-300' : 'bg-yellow-100 text-yellow-800',
      cancelled: isDarkMode ? 'bg-red-900/50 text-red-300' : 'bg-red-100 text-red-800'
    };

    const statusIcons = {
      confirmed: CheckCircleIcon,
      pending: ClockIcon,
      cancelled: XCircleIcon
    };

    const Icon = statusIcons[status] || ClockIcon;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyles[status] || (isDarkMode ? 'bg-gray-900/50 text-gray-300' : 'bg-gray-100 text-gray-800')}`}>
        <Icon className="w-3 h-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getCategoryIcon = (category) => {
    return stallCategories.find(c => c.id === category)?.icon || '🛍️';
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
            Stall Booking Management
          </h1>
          <p className={`mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Manage stall bookings and vendor assignments
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className={`p-4 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center">
            <BuildingStorefrontIcon className={`w-6 h-6 mr-2 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
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
            <ClockIcon className={`w-6 h-6 mr-2 ${isDarkMode ? 'text-yellow-400' : 'text-yellow-600'}`} />
            <div>
              <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Pending
              </p>
              <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {stats.pendingBookings}
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
              } px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
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
              } px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
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
              } px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">Last Week</option>
              <option value="month">Last Month</option>
            </select>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              <FunnelIcon className="w-4 h-4 inline mr-1" />
              Category
            </label>
            <select
              value={filters.category}
              onChange={(e) => setFilters({...filters, category: e.target.value})}
              className={`block w-full rounded-lg border transition-colors ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              } px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            >
              <option value="all">All Categories</option>
              {stallCategories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Bookings Table */}
      <div className={`rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className={isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}>
              <tr>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                  S.No.
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                  Booking Details
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                  Customer
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                  Stall Details
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                  Amount & Status
                </th>
                <th className={`px-6 py-3 text-right text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={6} className={`px-6 py-12 text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    <ExclamationTriangleIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium">No bookings found</p>
                    <p className="text-sm">Try adjusting your filters</p>
                  </td>
                </tr>
              ) : (
                filteredBookings.map((booking, index) => (
                  <tr key={booking.id} className={`hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {index + 1}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          #{booking.id.slice(-8)}
                        </div>
                        <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {booking.createdAt ? format(booking.createdAt, 'MMM dd, yyyy HH:mm') : 'Unknown'}
                        </div>
                        {booking.eventDate && (
                          <div className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                            Event: {format(booking.eventDate, 'MMM dd, yyyy')}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <UserIcon className={`w-5 h-5 mr-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                        <div>
                          <div className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {booking.customerDetails?.name || 'Unknown'}
                          </div>
                          {booking.customerDetails?.email && (
                            <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} flex items-center`}>
                              <EnvelopeIcon className="w-3 h-3 mr-1" />
                              {booking.customerDetails.email}
                            </div>
                          )}
                          {booking.customerDetails?.phone && (
                            <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} flex items-center`}>
                              <PhoneIcon className="w-3 h-3 mr-1" />
                              {booking.customerDetails.phone}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <span className="text-xl mr-2">
                          {getCategoryIcon(booking.stallDetails?.category)}
                        </span>
                        <div>
                          <div className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            Stall #{booking.stallDetails?.stallNumber || 'Unknown'}
                          </div>
                          <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            {stallCategories.find(c => c.id === booking.stallDetails?.category)?.name || booking.stallDetails?.category}
                          </div>
                          {booking.stallDetails?.size && (
                            <div className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                              Size: {booking.stallDetails.size}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className={`text-lg font-bold ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>
                          ₹{booking.totalAmount?.toLocaleString('en-IN') || 0}
                        </div>
                        <div className="mt-1">
                          {getStatusBadge(booking.status)}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => {
                            setSelectedBooking(booking);
                            setShowDetailsModal(true);
                          }}
                          className={`p-2 rounded-md transition-colors duration-200 ${
                            isDarkMode 
                              ? 'text-blue-400 hover:text-blue-300 hover:bg-blue-900/50' 
                              : 'text-blue-600 hover:text-blue-900 hover:bg-blue-50'
                          }`}
                          title="View Details"
                        >
                          <EyeIcon className="w-4 h-4" />
                        </button>

                        {hasPermission('manage_bookings') && booking.status === 'pending' && (
                          <button
                            onClick={() => handleConfirmBooking(booking.id)}
                            disabled={updating}
                            className={`p-2 rounded-md transition-colors duration-200 disabled:opacity-50 ${
                              isDarkMode 
                                ? 'text-green-400 hover:text-green-300 hover:bg-green-900/50' 
                                : 'text-green-600 hover:text-green-900 hover:bg-green-50'
                            }`}
                            title="Confirm Booking"
                          >
                            <CheckCircleIcon className="w-4 h-4" />
                          </button>
                        )}

                        {hasPermission('manage_bookings') && booking.status !== 'cancelled' && (
                          <button
                            onClick={() => handleCancelBooking(booking.id)}
                            disabled={updating}
                            className={`p-2 rounded-md transition-colors duration-200 disabled:opacity-50 ${
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
                            className={`p-2 rounded-md transition-colors duration-200 disabled:opacity-50 ${
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
                Booking Details - #{selectedBooking.id.slice(-8)}
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
                  <h4 className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-3`}>
                    Booking Information
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>Booking ID:</span>
                      <span className={`ml-2 font-mono ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {selectedBooking.id}
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
                    {selectedBooking.eventDate && (
                      <div>
                        <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>Event Date:</span>
                        <span className={`ml-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {format(selectedBooking.eventDate, 'MMM dd, yyyy')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-3`}>
                    Customer Information
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>Name:</span>
                      <span className={`ml-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {selectedBooking.customerDetails?.name || 'Unknown'}
                      </span>
                    </div>
                    <div>
                      <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>Email:</span>
                      <span className={`ml-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {selectedBooking.customerDetails?.email || 'Not provided'}
                      </span>
                    </div>
                    <div>
                      <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>Phone:</span>
                      <span className={`ml-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {selectedBooking.customerDetails?.phone || 'Not provided'}
                      </span>
                    </div>
                    {selectedBooking.customerDetails?.address && (
                      <div>
                        <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>Address:</span>
                        <span className={`ml-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {selectedBooking.customerDetails.address}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-3`}>
                    Stall Information
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>Stall Number:</span>
                      <span className={`ml-2 font-mono ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        #{selectedBooking.stallDetails?.stallNumber || 'Unknown'}
                      </span>
                    </div>
                    <div>
                      <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>Category:</span>
                      <span className={`ml-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {getCategoryIcon(selectedBooking.stallDetails?.category)} {stallCategories.find(c => c.id === selectedBooking.stallDetails?.category)?.name || selectedBooking.stallDetails?.category}
                      </span>
                    </div>
                    {selectedBooking.stallDetails?.size && (
                      <div>
                        <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>Size:</span>
                        <span className={`ml-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {selectedBooking.stallDetails.size}
                        </span>
                      </div>
                    )}
                    {selectedBooking.stallDetails?.location && (
                      <div>
                        <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>Location:</span>
                        <span className={`ml-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {selectedBooking.stallDetails.location}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-3`}>
                    Payment Information
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>Total Amount:</span>
                      <span className={`ml-2 font-bold text-lg ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>
                        ₹{selectedBooking.totalAmount?.toLocaleString('en-IN') || 0}
                      </span>
                    </div>
                    {selectedBooking.paymentMethod && (
                      <div>
                        <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>Payment Method:</span>
                        <span className={`ml-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {selectedBooking.paymentMethod}
                        </span>
                      </div>
                    )}
                    {selectedBooking.transactionId && (
                      <div>
                        <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>Transaction ID:</span>
                        <span className={`ml-2 font-mono ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {selectedBooking.transactionId}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {selectedBooking.notes && (
                <div className="mt-6">
                  <h4 className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    Notes
                  </h4>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} bg-gray-50 dark:bg-gray-700 p-3 rounded-lg`}>
                    {selectedBooking.notes}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

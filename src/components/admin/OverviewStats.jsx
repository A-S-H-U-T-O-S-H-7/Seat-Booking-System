"use client";
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, orderBy, limit, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { format, startOfDay, endOfDay, subDays, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { useTheme } from '@/context/ThemeContext';
import Link from 'next/link';
import { 
  CurrencyRupeeIcon, 
  UsersIcon, 
  CalendarDaysIcon, 
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  BuildingOfficeIcon,
  BuildingStorefrontIcon,
  EyeIcon,
  BanknotesIcon,
  UserGroupIcon,
  ArrowUpRightIcon,
  ArrowDownRightIcon,
  ChevronRightIcon,
  FireIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

export default function OverviewStats() {
  const { isDarkMode } = useTheme();
  const [stats, setStats] = useState({
    totalRevenue: 0,
    todayRevenue: 0,
    totalBookings: 0,
    todayBookings: 0,
    totalUsers: 0,
    activeEvents: 0,
    pendingCancellations: 0,
    totalCancellations: 0,
    refundedCancellations: 0,
    occupancyRate: 0,
    // Havan booking stats
    havanBookings: {
      total: 0,
      confirmed: 0,
      revenue: 0,
      todayBookings: 0
    },
    // Stall booking stats
    stallBookings: {
      total: 0,
      confirmed: 0,
      revenue: 0,
      todayBookings: 0
    },
    // Show booking stats
    showBookings: {
      total: 0,
      confirmed: 0,
      revenue: 0,
      todayBookings: 0
    },
    // Growth stats
    monthlyGrowth: {
      revenue: 0,
      bookings: 0
    },
    // Popular items
    popularSeats: [],
    popularStalls: []
  });
  
  const [previousMonthStats, setPreviousMonthStats] = useState({
    revenue: 0,
    bookings: 0
  });
  
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('today'); // today, week, month

  useEffect(() => {
    let isMounted = true;
    let loadingTimeout;
    
    const loadData = async () => {
      if (!isMounted) return;
      
      setLoading(true);
      setError(null);
      
      // Set a timeout to prevent infinite loading
      loadingTimeout = setTimeout(() => {
        if (isMounted) {
          console.warn('Loading timeout reached, setting loading to false');
          setError('Loading timeout - some data may not be available');
          setLoading(false);
        }
      }, 15000); // 15 second timeout
      
      try {
        // Execute data fetching with individual error handling
        const results = await Promise.allSettled([
          fetchOverviewData(),
          fetchStallBookingStats(), 
          fetchShowBookingStats(),
          fetchCancellationStats(),
          fetchRecentBookings(),
          fetchPreviousMonthData()
        ]);
        
        // Check for any failures
        const failures = results.filter(result => result.status === 'rejected');
        if (failures.length > 0 && isMounted) {
          console.warn('Some data failed to load:', failures);
          setError(`${failures.length} data sources failed to load completely`);
        }
        
        if (isMounted) {
          setLoading(false);
        }
      } catch (error) {
        console.error('Error loading overview data:', error);
        if (isMounted) {
          setError(`Failed to load dashboard data: ${error.message}`);
          setLoading(false);
        }
      } finally {
        if (loadingTimeout) {
          clearTimeout(loadingTimeout);
        }
      }
    };
    
    loadData();
    
    return () => {
      isMounted = false;
      if (loadingTimeout) {
        clearTimeout(loadingTimeout);
      }
    };
  }, [timeRange]);

  const fetchOverviewData = async () => {
    try {
      const now = new Date();
      
      // Fetch ALL bookings first for total stats
      const bookingsRef = collection(db, 'bookings');
      const allBookingsSnap = await getDocs(bookingsRef);
      
      let totalRevenue = 0;
      let totalBookings = 0;
      let confirmedBookings = 0;
      
      console.log('Total bookings found:', allBookingsSnap.size);
      
      allBookingsSnap.forEach(doc => {
        const booking = doc.data();
        console.log('Booking data:', booking);
        
        // Count all bookings
        totalBookings++;
        
        // Count confirmed bookings and calculate revenue
        if (booking.status === 'confirmed' || booking.status === 'completed') {
          confirmedBookings++;
          // Try multiple field names for total amount - including paymentDetails structure
          let amount = 0;
          if (booking.payment && booking.payment.amount) {
    amount = parseFloat(booking.payment.amount);
} else {
    amount = parseFloat(booking.totalAmount || booking.amount || booking.total || 0);
}
          
          console.log('Extracted amount:', amount, 'from booking:', doc.id);
          if (!isNaN(amount) && amount > 0) {
            totalRevenue += amount;
          }
        }
      });
      
      console.log('Confirmed bookings:', confirmedBookings, 'Total revenue:', totalRevenue);

      // Fetch today's stats (avoid composite index by filtering after fetch)
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const todayEnd = new Date();
      todayEnd.setHours(23, 59, 59, 999);
      
      // Query only by date first to avoid composite index requirement
      const todayBookingsQuery = query(
        bookingsRef,
        where('createdAt', '>=', todayStart),
        where('createdAt', '<=', todayEnd)
      );
      const todayBookingsSnap = await getDocs(todayBookingsQuery);
      
      let todayRevenue = 0;
      let todayBookingsCount = 0;
      
      todayBookingsSnap.forEach(doc => {
        const booking = doc.data();
        // Filter by status after fetching to avoid composite index
        if (booking.status === 'confirmed' || booking.status === 'completed') {
          todayBookingsCount++;
          // Try multiple field names for total amount - including paymentDetails structure
          let amount = 0;
          if (booking.paymentDetails && booking.paymentDetails.amount) {
            amount = parseFloat(booking.paymentDetails.amount);
          } else {
            amount = parseFloat(booking.totalAmount || booking.amount || booking.total || 0);
          }
          
          if (!isNaN(amount) && amount > 0) {
            todayRevenue += amount;
          }
        }
      });

      // Count unique users from all bookings (extract unique users from customerDetails)
      const uniqueUsers = new Set();
      
      allBookingsSnap.forEach(doc => {
        const booking = doc.data();
        const customerEmail = booking.customerDetails?.email;
        if (customerEmail) {
          uniqueUsers.add(customerEmail);
        }
      });
      
      // Also check stall bookings for unique users
      try {
        const stallBookingsRef = collection(db, 'stallBookings');
        const stallBookingsSnap = await getDocs(stallBookingsRef);
        
        stallBookingsSnap.forEach(doc => {
          const booking = doc.data();
          const customerEmail = booking.customerDetails?.email;
          if (customerEmail) {
            uniqueUsers.add(customerEmail);
          }
        });
      } catch (stallError) {
        console.warn('Error fetching stall bookings for user count:', stallError);
      }
      
      // Also check show bookings for unique users
      try {
        const showBookingsRef = collection(db, 'showBookings');
        const showBookingsSnap = await getDocs(showBookingsRef);
        
        showBookingsSnap.forEach(doc => {
          const booking = doc.data();
          const customerEmail = booking.customerDetails?.email;
          if (customerEmail) {
            uniqueUsers.add(customerEmail);
          }
        });
      } catch (showError) {
        console.warn('Error fetching show bookings for user count:', showError);
      }
      
      const totalUsers = uniqueUsers.size;

      // Fetch pending cancellations - try multiple field names
      let pendingCancellations = 0;
      
      allBookingsSnap.forEach(doc => {
        const booking = doc.data();
        // Check for cancellation requests
        if (booking.cancellationStatus === 'pending' || 
            booking.status === 'cancellation_requested' ||
            booking.requestedCancellation === true) {
          pendingCancellations++;
        }
      });

      // Calculate occupancy rate
      const totalSeats = 400; // 4 blocks × 5 columns × 5 kunds × 4 seats
      const bookedSeatsCount = await calculateBookedSeats();
      const occupancyRate = totalSeats > 0 ? Math.round((bookedSeatsCount / totalSeats) * 100) : 0;

      // Count active events (events with future dates)
      const eventsRef = collection(db, 'events');
      const eventsQuery = query(
        eventsRef,
        where('date', '>=', startOfDay(now))
      );
      const eventsSnap = await getDocs(eventsQuery);
      const activeEvents = eventsSnap.size;

      setStats(prevStats => ({
        ...prevStats,
        totalRevenue: isNaN(totalRevenue) ? 0 : totalRevenue,
        todayRevenue: isNaN(todayRevenue) ? 0 : todayRevenue,
        totalBookings: totalBookings || 0,
        todayBookings: todayBookingsCount || 0,
        totalUsers: totalUsers || 0,
        activeEvents: activeEvents || 0,
        pendingCancellations: pendingCancellations || 0,
        occupancyRate: isNaN(occupancyRate) ? 0 : occupancyRate,
        // Update havan bookings specifically (since these are from 'bookings' collection)
        havanBookings: {
          total: totalBookings || 0,
          confirmed: confirmedBookings || 0,
          revenue: isNaN(totalRevenue) ? 0 : totalRevenue,
          todayBookings: todayBookingsCount || 0
        }
      }));

    } catch (error) {
      console.error('Error fetching overview data:', error);
      // Set default values on error
      setStats(prevStats => ({
        ...prevStats,
        totalRevenue: 0,
        todayRevenue: 0,
        totalBookings: 0,
        todayBookings: 0,
        totalUsers: 0,
        activeEvents: 0,
        pendingCancellations: 0,
        occupancyRate: 0
      }));
    } finally {
      setLoading(false);
    }
  };

  const calculateBookedSeats = async () => {
    try {
      const today = format(new Date(), 'yyyy-MM-dd');
      const availabilityRef = collection(db, 'seatAvailability');
      const availabilitySnap = await getDocs(availabilityRef);
      
      let bookedSeats = 0;
      availabilitySnap.forEach(doc => {
        const data = doc.data();
        if (data.seats) {
          Object.values(data.seats).forEach(seat => {
            if (seat.booked) bookedSeats++;
          });
        }
      });
      
      return bookedSeats;
    } catch (error) {
      console.error('Error calculating booked seats:', error);
      return 0;
    }
  };

  const fetchStallBookingStats = async () => {
    try {
      const stallBookingsRef = collection(db, 'stallBookings');
      const stallBookingsSnap = await getDocs(stallBookingsRef);
      
      let totalStallBookings = 0;
      let confirmedStallBookings = 0;
      let stallRevenue = 0;
      let todayStallBookings = 0;
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      stallBookingsSnap.forEach(doc => {
        const booking = doc.data();
        totalStallBookings++;
        
        if (booking.status === 'confirmed' || booking.status === 'completed') {
          confirmedStallBookings++;
          // Handle multiple possible amount field names
          let amount = 0;
          if (booking.payment?.amount) {
            amount = parseFloat(booking.payment.amount);
          } else {
            amount = parseFloat(booking.totalAmount || booking.amount || booking.total || 0);
          }
          
          if (!isNaN(amount) && amount > 0) {
            stallRevenue += amount;
          }
        }
        
        // Check if booking was made today
        if (booking.createdAt) {
          let createdDate;
          if (booking.createdAt.toDate) {
            createdDate = booking.createdAt.toDate();
          } else {
            createdDate = new Date(booking.createdAt);
          }
          
          if (createdDate >= today && createdDate < tomorrow) {
            todayStallBookings++;
          }
        }
      });
      
      setStats(prevStats => ({
        ...prevStats,
        stallBookings: {
          total: totalStallBookings,
          confirmed: confirmedStallBookings,
          revenue: stallRevenue,
          todayBookings: todayStallBookings
        }
      }));
    } catch (error) {
      console.error('Error fetching stall booking stats:', error);
    }
  };

  const fetchCancellationStats = async () => {
    try {
      const cancellationsRef = collection(db, 'cancellations');
      const cancellationsSnap = await getDocs(cancellationsRef);
      
      let totalCancellations = 0;
      let pendingCancellations = 0;
      let refundedCancellations = 0;
      
      cancellationsSnap.forEach(doc => {
        const cancellation = doc.data();
        totalCancellations++;
        
        if (cancellation.status === 'pending' || cancellation.refundStatus === 'pending') {
          pendingCancellations++;
        }
        
        if (cancellation.refundStatus === 'refunded') {
          refundedCancellations++;
        }
      });
      
      setStats(prevStats => ({
        ...prevStats,
        totalCancellations,
        refundedCancellations,
        // Update the existing pendingCancellations from cancellations collection if higher
        pendingCancellations: Math.max(prevStats.pendingCancellations, pendingCancellations)
      }));
    } catch (error) {
      console.error('Error fetching cancellation stats:', error);
      // If cancellations collection doesn't exist, it's not an error
      if (error.code !== 'unavailable') {
        console.warn('Cancellations collection may not exist yet');
      }
    }
  };

  const fetchShowBookingStats = async () => {
    try {
      const showBookingsRef = collection(db, 'showBookings');
      const showBookingsSnap = await getDocs(showBookingsRef);
      
      let totalShowBookings = 0;
      let confirmedShowBookings = 0;
      let showRevenue = 0;
      let todayShowBookings = 0;
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      showBookingsSnap.forEach(doc => {
        const booking = doc.data();
        totalShowBookings++;
        
        if (booking.status === 'confirmed') {
          confirmedShowBookings++;
          if (booking.payment?.amount) {
            showRevenue += parseFloat(booking.payment.amount);
          }
        }
        
        // Check if booking was made today
        if (booking.createdAt) {
          let createdDate;
          if (booking.createdAt.toDate) {
            createdDate = booking.createdAt.toDate();
          } else {
            createdDate = new Date(booking.createdAt);
          }
          
          if (createdDate >= today && createdDate < tomorrow) {
            todayShowBookings++;
          }
        }
      });
      
      setStats(prevStats => ({
        ...prevStats,
        showBookings: {
          total: totalShowBookings,
          confirmed: confirmedShowBookings,
          revenue: showRevenue,
          todayBookings: todayShowBookings
        }
      }));
    } catch (error) {
      console.error('Error fetching show booking stats:', error);
    }
  };

  const fetchPreviousMonthData = async () => {
    try {
      const now = new Date();
      const lastMonth = subMonths(now, 1);
      const lastMonthStart = startOfMonth(lastMonth);
      const lastMonthEnd = endOfMonth(lastMonth);
      
      // Fetch previous month's data for comparison
      const bookingsRef = collection(db, 'bookings');
      const lastMonthQuery = query(
        bookingsRef,
        where('createdAt', '>=', lastMonthStart),
        where('createdAt', '<=', lastMonthEnd)
      );
      
      const lastMonthSnap = await getDocs(lastMonthQuery);
      
      let lastMonthRevenue = 0;
      let lastMonthBookings = 0;
      
      lastMonthSnap.forEach(doc => {
        const booking = doc.data();
        if (booking.status === 'confirmed' || booking.status === 'completed') {
          lastMonthBookings++;
          let amount = 0;
          if (booking.payment?.amount) {
            amount = parseFloat(booking.payment.amount);
          } else {
            amount = parseFloat(booking.totalAmount || booking.amount || booking.total || 0);
          }
          
          if (!isNaN(amount) && amount > 0) {
            lastMonthRevenue += amount;
          }
        }
      });
      
      setPreviousMonthStats({
        revenue: lastMonthRevenue,
        bookings: lastMonthBookings
      });
      
      // Calculate growth rates
      const currentMonthRevenue = stats.totalRevenue + stats.showBookings.revenue + stats.stallBookings.revenue;
      const currentMonthBookings = stats.totalBookings + stats.showBookings.total + stats.stallBookings.total;
      
      const revenueGrowth = lastMonthRevenue > 0 ? 
        ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue * 100).toFixed(1) : 0;
      const bookingsGrowth = lastMonthBookings > 0 ? 
        ((currentMonthBookings - lastMonthBookings) / lastMonthBookings * 100).toFixed(1) : 0;
      
      setStats(prevStats => ({
        ...prevStats,
        monthlyGrowth: {
          revenue: parseFloat(revenueGrowth),
          bookings: parseFloat(bookingsGrowth)
        }
      }));
      
    } catch (error) {
      console.error('Error fetching previous month data:', error);
    }
  };

  const fetchRecentBookings = async () => {
    try {
      const bookingsRef = collection(db, 'bookings');
      const recentQuery = query(
        bookingsRef,
        orderBy('createdAt', 'desc'),
        limit(5)
      );
      const recentSnap = await getDocs(recentQuery);
      
      const bookings = [];
      recentSnap.forEach(doc => {
        bookings.push({ id: doc.id, ...doc.data() });
      });
      
      setRecentBookings(bookings);
    } catch (error) {
      console.error('Error fetching recent bookings:', error);
    }
  };

  const getStartDate = (now, range) => {
    switch (range) {
      case 'week':
        return subDays(now, 7);
      case 'month':
        return startOfMonth(now);
      default:
        return startOfDay(now);
    }
  };

  const getEndDate = (now, range) => {
    switch (range) {
      case 'week':
      case 'month':
        return now;
      default:
        return endOfDay(now);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const totalAllRevenue = stats.totalRevenue + stats.showBookings.revenue + stats.stallBookings.revenue;
  const totalAllBookings = stats.totalBookings + stats.showBookings.total + stats.stallBookings.total;
  const todayAllBookings = stats.todayBookings + stats.showBookings.todayBookings + stats.stallBookings.todayBookings;

  const statCards = [
    {
      title: 'Total Revenue',
      value: formatCurrency(totalAllRevenue),
      change: stats.monthlyGrowth.revenue !== 0 ? 
        `${stats.monthlyGrowth.revenue > 0 ? '+' : ''}${stats.monthlyGrowth.revenue}% vs last month` : 
        'No comparison data',
      changeType: stats.monthlyGrowth.revenue > 0 ? 'increase' : 
                 stats.monthlyGrowth.revenue < 0 ? 'decrease' : 'neutral',
      icon: CurrencyRupeeIcon,
      color: 'green'
    },
    {
      title: 'Havan Bookings',
      value: stats.totalBookings.toString(),
      change: `+${stats.todayBookings} today • ${formatCurrency(stats.totalRevenue)} revenue`,
      changeType: stats.todayBookings > 0 ? 'increase' : 'neutral',
      icon: CalendarDaysIcon,
      color: 'blue'
    },
    {
      title: 'Stall Bookings',
      value: stats.stallBookings.total.toString(),
      change: `${stats.stallBookings.confirmed} confirmed • ${formatCurrency(stats.stallBookings.revenue)} revenue`,
      changeType: stats.stallBookings.confirmed > 0 ? 'increase' : 'neutral',
      icon: BuildingStorefrontIcon,
      color: 'orange'
    },
    {
      title: 'Show Bookings',
      value: stats.showBookings.total.toString(),
      change: `${stats.showBookings.confirmed} confirmed • ${formatCurrency(stats.showBookings.revenue)} revenue`,
      changeType: stats.showBookings.confirmed > 0 ? 'increase' : 'neutral',
      icon: EyeIcon,
      color: 'purple'
    },
    {
      title: 'Total Users',
      value: stats.totalUsers.toString(),
      change: 'Registered users',
      changeType: 'neutral',
      icon: UsersIcon,
      color: 'indigo'
    },
    {
      title: 'Seat Occupancy',
      value: `${stats.occupancyRate}%`,
      change: `${stats.occupancyRate > 75 ? 'High' : stats.occupancyRate > 50 ? 'Medium' : 'Low'} demand`,
      changeType: stats.occupancyRate > 75 ? 'increase' : 'neutral',
      icon: BuildingOfficeIcon,
      color: 'emerald'
    }
  ];

  const alertItems = [
    {
      title: 'Pending Cancellations',
      count: stats.pendingCancellations,
      color: stats.pendingCancellations > 0 ? 'red' : 'green',
      icon: stats.pendingCancellations > 0 ? ExclamationTriangleIcon : CheckCircleIcon
    },
    {
      title: 'Total Cancellations',
      count: stats.totalCancellations,
      color: stats.totalCancellations > 0 ? 'orange' : 'gray',
      icon: ClockIcon
    },
    {
      title: 'Refunded',
      count: stats.refundedCancellations,
      color: stats.refundedCancellations > 0 ? 'green' : 'gray',
      icon: CheckCircleIcon
    },
    {
      title: 'Active Events',
      count: stats.activeEvents,
      color: stats.activeEvents > 0 ? 'green' : 'gray',
      icon: CalendarDaysIcon
    }
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className={`rounded-xl shadow-sm border p-6 animate-pulse ${
              isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <div className={`h-4 rounded w-3/4 mb-4 ${
                isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
              }`}></div>
              <div className={`h-8 rounded w-1/2 mb-2 ${
                isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
              }`}></div>
              <div className={`h-3 rounded w-2/3 ${
                isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
              }`}></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Error Message */}
      {error && (
        <div className={`rounded-xl border p-4 ${
          isDarkMode ? 'bg-red-900/20 border-red-800 text-red-200' : 'bg-red-50 border-red-200 text-red-700'
        }`}>
          <div className="flex items-center">
            <ExclamationTriangleIcon className="w-5 h-5 mr-2 text-red-500" />
            <p className="text-sm font-medium">Warning: {error}</p>
          </div>
        </div>
      )}
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Dashboard Overview</h1>
          <p className={`mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Monitor your booking system performance</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className={`block w-full pl-3 pr-10 py-2 text-base border focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm rounded-md transition-colors duration-150
              ${isDarkMode 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'bg-white border-gray-300 text-gray-900'
              }`}
          >
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
        </div>
      </div>

      {/* Quick Stats Summary */}
      <div className={`rounded-xl shadow-sm border p-6 mb-6 ${
        isDarkMode ? 'bg-gradient-to-r from-gray-800 to-gray-700 border-gray-600' : 'bg-gradient-to-r from-blue-50 to-purple-50 border-gray-200'
      }`}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {formatCurrency(totalAllRevenue)}
            </div>
            <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Total Revenue</div>
          </div>
          <div className="text-center">
            <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {totalAllBookings}
            </div>
            <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Total Bookings</div>
          </div>
          <div className="text-center">
            <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {todayAllBookings}
            </div>
            <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Today's Bookings</div>
          </div>
          <div className="text-center">
            <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {stats.totalUsers}
            </div>
            <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Registered Users</div>
          </div>
        </div>
      </div>

      {/* Detailed Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat, index) => (
          <div key={index} className={`rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow ${
            isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <div className="flex items-center">
              <div className={`p-2 rounded-lg ${
                isDarkMode ? `bg-${stat.color}-900` : `bg-${stat.color}-100`
              }`}>
                <stat.icon className={`w-6 h-6 ${
                  isDarkMode ? `text-${stat.color}-400` : `text-${stat.color}-600`
                }`} />
              </div>
              <div className="ml-4 flex-1">
                <p className={`text-sm font-medium ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>{stat.title}</p>
                <div className="flex items-baseline">
                  <p className={`text-2xl font-semibold ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>{stat.value}</p>
                </div>
              </div>
            </div>
            <div className="mt-4 flex items-center">
              {stat.changeType === 'increase' && (
                <ArrowTrendingUpIcon className="w-4 h-4 text-green-500 mr-1" />
              )}
              {stat.changeType === 'decrease' && (
                <ArrowTrendingDownIcon className="w-4 h-4 text-red-500 mr-1" />
              )}
              <p className={`text-sm ${stat.changeType === 'increase' ? 'text-green-600' : (
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              )}`}>
                {stat.change}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Alert Cards and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Alerts */}
        <div className={`rounded-xl shadow-sm border p-6 ${
          isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <h3 className={`text-lg font-semibold mb-4 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>System Alerts</h3>
          <div className="space-y-4">
            {alertItems.map((alert, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`p-2 rounded-lg ${
                    isDarkMode ? `bg-${alert.color}-900` : `bg-${alert.color}-100`
                  }`}>
                    <alert.icon className={`w-5 h-5 ${
                      isDarkMode ? `text-${alert.color}-400` : `text-${alert.color}-600`
                    }`} />
                  </div>
                  <span className={`ml-3 text-sm font-medium ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>{alert.title}</span>
                </div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  isDarkMode ? `bg-${alert.color}-900 text-${alert.color}-300` : `bg-${alert.color}-100 text-${alert.color}-800`
                }`}>
                  {alert.count}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className={`rounded-xl shadow-sm border p-6 ${
          isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <h3 className={`text-lg font-semibold mb-4 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>Quick Actions</h3>
          <div className="space-y-3">
            <Link href="/admin/dashboard?tab=bookings" className={`flex items-center p-3 rounded-lg transition-colors ${
              isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-50 hover:bg-gray-100'
            }`}>
              <CalendarDaysIcon className={`w-5 h-5 mr-3 ${
                isDarkMode ? 'text-blue-400' : 'text-blue-600'
              }`} />
              <div className="flex-1">
                <div className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Manage Havan Bookings</div>
                <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{stats.totalBookings} total bookings</div>
              </div>
              <ChevronRightIcon className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
            </Link>
            
            <Link href="/admin/dashboard?tab=stall-bookings" className={`flex items-center p-3 rounded-lg transition-colors ${
              isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-50 hover:bg-gray-100'
            }`}>
              <BuildingStorefrontIcon className={`w-5 h-5 mr-3 ${
                isDarkMode ? 'text-orange-400' : 'text-orange-600'
              }`} />
              <div className="flex-1">
                <div className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Manage Stall Bookings</div>
                <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{stats.stallBookings.total} total bookings</div>
              </div>
              <ChevronRightIcon className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
            </Link>
            
            {stats.pendingCancellations > 0 && (
              <Link href="/admin/dashboard?tab=cancellations" className={`flex items-center p-3 rounded-lg transition-colors ${
                isDarkMode ? 'bg-red-900/20 hover:bg-red-900/30 border border-red-800' : 'bg-red-50 hover:bg-red-100 border border-red-200'
              }`}>
                <ExclamationTriangleIcon className="w-5 h-5 mr-3 text-red-500" />
                <div className="flex-1">
                  <div className={`text-sm font-medium ${isDarkMode ? 'text-red-200' : 'text-red-800'}`}>Pending Cancellations</div>
                  <div className={`text-xs ${isDarkMode ? 'text-red-300' : 'text-red-600'}`}>Requires immediate attention</div>
                </div>
                <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">{stats.pendingCancellations}</span>
              </Link>
            )}
          </div>
        </div>

        {/* Recent Bookings */}
        <div className={`lg:col-span-2 rounded-xl shadow-sm border p-6 ${
          isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <h3 className={`text-lg font-semibold mb-4 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>Recent Bookings</h3>
          <div className="space-y-4">
            {recentBookings.length > 0 ? (
              recentBookings.map((booking) => (
                <div key={booking.id} className={`flex items-center justify-between p-3 rounded-lg ${
                  isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
                }`}>
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        isDarkMode ? 'bg-purple-900' : 'bg-purple-100'
                      }`}>
                        <UsersIcon className={`w-4 h-4 ${
                          isDarkMode ? 'text-purple-400' : 'text-purple-600'
                        }`} />
                      </div>
                      <div>
                        <p className={`text-sm font-medium ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                          {booking.customerDetails?.name || 'N/A'}
                        </p>
                        <p className={`text-xs ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          {(() => {
                            // Try different ways to get seat/item count based on booking type
                            let count = 0;
                            let type = 'items';
                            
                            if (booking.eventDetails?.seats?.length) {
                              // Havan booking with eventDetails.seats
                              count = booking.eventDetails.seats.length;
                              type = 'seats';
                            } else if (booking.seats?.length) {
                              // Alternative seat structure
                              count = booking.seats.length;
                              type = 'seats';
                            } else if (booking.selectedSeats?.length) {
                              // Another alternative seat structure
                              count = booking.selectedSeats.length;
                              type = 'seats';
                            } else if (booking.seatNumbers?.length) {
                              // Show booking with seatNumbers
                              count = booking.seatNumbers.length;
                              type = 'seats';
                            } else if (booking.stalls?.length) {
                              // Stall booking
                              count = booking.stalls.length;
                              type = 'stalls';
                            } else if (booking.stallNumbers?.length) {
                              // Alternative stall structure
                              count = booking.stallNumbers.length;
                              type = 'stalls';
                            } else if (booking.tickets?.length) {
                              // Show booking with tickets
                              count = booking.tickets.length;
                              type = 'tickets';
                            } else if (booking.ticketCount) {
                              // Show booking with ticketCount
                              count = booking.ticketCount;
                              type = 'tickets';
                            } else if (booking.quantity) {
                              // Generic quantity field
                              count = booking.quantity;
                              type = 'items';
                            }
                            
                            return `${count} ${type}`;
                          })()} • {booking.createdAt ? format(booking.createdAt?.toDate(), 'MMM dd, yyyy') : 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-semibold ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      {formatCurrency(
                        booking.payment?.amount || 
                        booking.totalAmount || 
                        booking.amount || 
                        booking.total || 
                        0
                      )}
                    </p>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium
                      ${booking.status === 'confirmed' ? 'bg-green-100 text-green-800' : 
                        booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'}`}>
                      {booking.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <ClockIcon className={`w-12 h-12 mx-auto mb-3 ${
                  isDarkMode ? 'text-gray-600' : 'text-gray-400'
                }`} />
                <p className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>
                  No recent bookings
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

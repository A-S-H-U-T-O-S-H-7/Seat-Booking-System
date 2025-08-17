// src/app/(web)/profile/page.jsx
"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { db } from '@/lib/firebase';
import { collection, query, where, orderBy, getDocs, doc, runTransaction, serverTimestamp, updateDoc } from 'firebase/firestore';
import { format, differenceInDays, parseISO } from 'date-fns';
import { toast } from 'react-hot-toast';
import ShowBookingCard from '@/components/show/ShowBookingCard';
import StallBookingCard from '@/components/stall/StallBookingCard';
import { useShifts } from '@/hooks/useShifts';
import { cancelBooking } from '@/utils/cancellationUtils';

const ProfilePage = () => {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [bookings, setBookings] = useState([]);
  const [showBookings, setShowBookings] = useState([]);
  const [stallBookings, setStallBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingBooking, setCancellingBooking] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState(null);
  const [activeTab, setActiveTab] = useState('havan');

  const { getShiftLabel, getShiftTime } = useShifts();

  useEffect(() => {
    if (user) {
      fetchUserBookings();
      fetchUserShowBookings();
      fetchUserStallBookings();
    }
  }, [user]);

  const fetchUserBookings = async () => {
    try {
      console.log('Fetching bookings for user:', user.uid);
      
      const bookingsQuery = query(
        collection(db, 'bookings'),
        where('userId', '==', user.uid)
      );
      
      const snapshot = await getDocs(bookingsQuery);
      console.log('Found', snapshot.size, 'bookings');
      
      const bookingsData = [];
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        console.log('Raw booking data:', data);
        console.log('Event details from data:', data.eventDetails);
        console.log('Root level fields:', {
          eventDate: data.eventDate,
          shift: data.shift,
          seats: data.seats,
          seatCount: data.seatCount
        });
        
        // Handle different date formats
        let eventDate;
        if (data.eventDetails?.date) {
          if (data.eventDetails.date.toDate && typeof data.eventDetails.date.toDate === 'function') {
            // Firestore timestamp
            eventDate = data.eventDetails.date.toDate();
          } else if (data.eventDetails.date.seconds) {
            // Firestore timestamp object (sometimes comes as plain object)
            eventDate = new Date(data.eventDetails.date.seconds * 1000);
          } else if (typeof data.eventDetails.date === 'string') {
            // ISO string
            eventDate = parseISO(data.eventDetails.date);
          } else if (data.eventDetails.date instanceof Date) {
            // Already a Date object
            eventDate = data.eventDetails.date;
          } else {
            console.warn('Unknown date format in eventDetails.date:', data.eventDetails.date);
            eventDate = new Date();
          }
        } else if (data.eventDate) {
          // Fallback to root-level eventDate (older Havan bookings)
          if (data.eventDate.toDate && typeof data.eventDate.toDate === 'function') {
            eventDate = data.eventDate.toDate();
          } else if (data.eventDate.seconds) {
            eventDate = new Date(data.eventDate.seconds * 1000);
          } else if (typeof data.eventDate === 'string') {
            eventDate = parseISO(data.eventDate);
          } else if (data.eventDate instanceof Date) {
            eventDate = data.eventDate;
          } else {
            console.warn('Unknown date format in root eventDate:', data.eventDate);
            eventDate = new Date();
          }
        } else {
          eventDate = new Date();
        }
        
        let createdDate;
        if (data.createdAt) {
          if (data.createdAt.toDate && typeof data.createdAt.toDate === 'function') {
            createdDate = data.createdAt.toDate();
          } else if (data.createdAt.seconds) {
            // Firestore timestamp object (sometimes comes as plain object)
            createdDate = new Date(data.createdAt.seconds * 1000);
          } else if (typeof data.createdAt === 'string') {
            createdDate = parseISO(data.createdAt);
          } else if (data.createdAt instanceof Date) {
            createdDate = data.createdAt;
          } else {
            createdDate = new Date();
          }
        } else {
          createdDate = new Date();
        }
        
        // Structure the data properly for Havan bookings
        const structuredData = {
          id: doc.id,
          ...data,
          createdAt: createdDate,
          eventDetails: {
            // If eventDetails already exists, use it, otherwise create from root level fields
            ...(data.eventDetails || {}),
            date: eventDate,
            // For Havan bookings, the data might be at root level
            shift: data.eventDetails?.shift || data.shift,
            seats: data.eventDetails?.seats || data.seats,
            seatCount: data.eventDetails?.seatCount || data.seatCount
          }
        };
        
        console.log('Structured booking data:', structuredData);
        console.log('Shift value in structured data:', structuredData.eventDetails?.shift);
        console.log('Seat count in structured data:', structuredData.eventDetails?.seatCount);
        console.log('Seats array in structured data:', structuredData.eventDetails?.seats);
        bookingsData.push(structuredData);
      });
      
      // Sort by creation date (newest first)
      bookingsData.sort((a, b) => b.createdAt - a.createdAt);
      
      console.log('Processed bookings:', bookingsData);
      setBookings(bookingsData);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast.error('Failed to load booking history');
    }
  };

  const fetchUserShowBookings = async () => {
    try {
      console.log('Fetching show bookings for user:', user.uid);
      
      const showBookingsQuery = query(
        collection(db, 'showBookings'),
        where('userId', '==', user.uid)
      );
      
      const snapshot = await getDocs(showBookingsQuery);
      console.log('Found', snapshot.size, 'show bookings');
      
      const showBookingsData = [];
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        console.log('Show booking data:', data);
        
        // Handle different date formats for show date
        let showDate;
        if (data.showDetails?.date) {
          if (typeof data.showDetails.date === 'string') {
            showDate = parseISO(data.showDetails.date);
          } else if (data.showDetails.date.toDate && typeof data.showDetails.date.toDate === 'function') {
            showDate = data.showDetails.date.toDate();
          } else if (data.showDetails.date.seconds) {
            showDate = new Date(data.showDetails.date.seconds * 1000);
          } else {
            showDate = new Date();
          }
        } else {
          showDate = new Date();
        }
        
        let createdDate;
        if (data.createdAt) {
          if (data.createdAt.toDate && typeof data.createdAt.toDate === 'function') {
            createdDate = data.createdAt.toDate();
          } else if (data.createdAt.seconds) {
            createdDate = new Date(data.createdAt.seconds * 1000);
          } else if (typeof data.createdAt === 'string') {
            createdDate = parseISO(data.createdAt);
          } else if (data.createdAt instanceof Date) {
            createdDate = data.createdAt;
          } else {
            createdDate = new Date();
          }
        } else {
          createdDate = new Date();
        }
        
        showBookingsData.push({
          id: doc.id,
          ...data,
          createdAt: createdDate,
          showDetails: {
            ...data.showDetails,
            date: showDate
          },
          type: 'show' // Add type identifier
        });
      });
      
      // Sort by creation date (newest first)
      showBookingsData.sort((a, b) => b.createdAt - a.createdAt);
      
      console.log('Processed show bookings:', showBookingsData);
      setShowBookings(showBookingsData);
    } catch (error) {
      console.error('Error fetching show bookings:', error);
      toast.error('Failed to load show booking history');
    }
  };

  const fetchUserStallBookings = async () => {
    try {
      console.log('Fetching stall bookings for user:', user.uid);
      
      const stallBookingsQuery = query(
        collection(db, 'stallBookings'),
        where('userId', '==', user.uid)
      );
      
      const snapshot = await getDocs(stallBookingsQuery);
      console.log('Found', snapshot.size, 'stall bookings');
      
      const stallBookingsData = [];
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        console.log('Stall booking data:', data);
        
        // Handle different date formats for event dates
        let startDate, endDate;
        if (data.eventDetails?.startDate) {
          if (data.eventDetails.startDate.toDate && typeof data.eventDetails.startDate.toDate === 'function') {
            startDate = data.eventDetails.startDate.toDate();
          } else if (data.eventDetails.startDate.seconds) {
            startDate = new Date(data.eventDetails.startDate.seconds * 1000);
          } else if (data.eventDetails.startDate instanceof Date) {
            startDate = data.eventDetails.startDate;
          } else {
            startDate = new Date(data.eventDetails.startDate);
          }
        } else {
          startDate = new Date('2025-11-15');
        }
        
        if (data.eventDetails?.endDate) {
          if (data.eventDetails.endDate.toDate && typeof data.eventDetails.endDate.toDate === 'function') {
            endDate = data.eventDetails.endDate.toDate();
          } else if (data.eventDetails.endDate.seconds) {
            endDate = new Date(data.eventDetails.endDate.seconds * 1000);
          } else if (data.eventDetails.endDate instanceof Date) {
            endDate = data.eventDetails.endDate;
          } else {
            endDate = new Date(data.eventDetails.endDate);
          }
        } else {
          endDate = new Date('2025-11-20');
        }
        
        let createdDate;
        if (data.createdAt) {
          if (data.createdAt.toDate && typeof data.createdAt.toDate === 'function') {
            createdDate = data.createdAt.toDate();
          } else if (data.createdAt.seconds) {
            createdDate = new Date(data.createdAt.seconds * 1000);
          } else if (typeof data.createdAt === 'string') {
            createdDate = parseISO(data.createdAt);
          } else if (data.createdAt instanceof Date) {
            createdDate = data.createdAt;
          } else {
            createdDate = new Date();
          }
        } else {
          createdDate = new Date();
        }
        
        stallBookingsData.push({
          id: doc.id,
          ...data,
          createdAt: createdDate,
          eventDetails: {
            ...data.eventDetails,
            startDate,
            endDate
          },
          type: 'stall' // Add type identifier
        });
      });
      
      // Sort by creation date (newest first)
      stallBookingsData.sort((a, b) => b.createdAt - a.createdAt);
      
      console.log('Processed stall bookings:', stallBookingsData);
      setStallBookings(stallBookingsData);
    } catch (error) {
      console.error('Error fetching stall bookings:', error);
      toast.error('Failed to load stall booking history');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (booking) => {
    // Determine event date based on booking type
    let eventDate;
    if (booking.type === 'show') {
      eventDate = booking.showDetails.date;
    } else if (booking.type === 'stall') {
      eventDate = booking.eventDetails.startDate;
    } else {
      eventDate = booking.eventDetails.date;
    }
    
    const today = new Date();
    const daysUntilEvent = differenceInDays(eventDate, today);
    
    if (daysUntilEvent < 15) {
      toast.error('Cancellation is only allowed 15+ days before the event');
      return;
    }

    // Show confirmation modal
    setBookingToCancel(booking);
    setShowCancelModal(true);
  };

  const confirmCancelBooking = async () => {
    if (!bookingToCancel) return;

    setCancellingBooking(bookingToCancel.id);
    setShowCancelModal(false);
    
    try {
      if (bookingToCancel.type === 'show') {
        // Handle show booking cancellation
        const bookingRef = doc(db, 'showBookings', bookingToCancel.id);
        await updateDoc(bookingRef, {
          status: 'cancelled',
          cancelledAt: serverTimestamp(),
          cancelledBy: 'user',
          updatedAt: serverTimestamp()
        });
        
        toast.success('Show booking cancelled successfully. Refund will be processed within 5-7 business days.');
        fetchUserShowBookings(); // Refresh show bookings
      } else if (bookingToCancel.type === 'stall') {
        // Handle stall booking cancellation with stall release
        await runTransaction(db, async (transaction) => {
          // Update booking status
          const bookingRef = doc(db, 'stallBookings', bookingToCancel.id);
          transaction.update(bookingRef, {
            status: 'cancelled',
            cancelledAt: serverTimestamp(),
            cancelledBy: 'user',
            updatedAt: serverTimestamp()
          });

          // Release stalls from availability
          const availabilityRef = doc(db, 'stallAvailability', 'current');
          const availabilityDoc = await transaction.get(availabilityRef);
          
          if (availabilityDoc.exists()) {
            const currentAvailability = availabilityDoc.data().stalls || {};
            const updatedAvailability = { ...currentAvailability };
            
            // Release all stalls associated with this booking
            const stallsToRelease = bookingToCancel.stallIds || [bookingToCancel.stallId];
            stallsToRelease.forEach(stallId => {
              if (updatedAvailability[stallId] && updatedAvailability[stallId].bookingId === bookingToCancel.bookingId) {
                delete updatedAvailability[stallId];
              }
            });

            transaction.update(availabilityRef, {
              stalls: updatedAvailability,
              updatedAt: serverTimestamp()
            });
          }
        });
        
        toast.success('Stall booking cancelled successfully. Refund will be processed within 5-7 business days.');
        fetchUserStallBookings(); // Refresh stall bookings
      } else {
        // Handle regular havan booking cancellation
        await runTransaction(db, async (transaction) => {
          // First, do all the reads
          const eventDate = bookingToCancel.eventDetails?.date || bookingToCancel.eventDate;
          const eventShift = bookingToCancel.eventDetails?.shift || bookingToCancel.shift;
          
          if (!eventDate || !eventShift) {
            throw new Error('Missing event date or shift information');
          }
          
          const dateKey = eventDate.toISOString().split('T')[0];
          const availabilityRef = doc(db, 'seatAvailability', `${dateKey}_${eventShift}`);
          const availabilityDoc = await transaction.get(availabilityRef);
          
          // Then do all the writes
          // Update booking status
          const bookingRef = doc(db, 'bookings', bookingToCancel.id);
          transaction.update(bookingRef, {
            status: 'cancelled',
            cancelledAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          });

          // Release seats
          if (availabilityDoc.exists()) {
            const currentAvailability = availabilityDoc.data().seats || {};
            const updatedAvailability = { ...currentAvailability };
            
            const seatsToRelease = bookingToCancel.eventDetails?.seats || bookingToCancel.seats || [];
            seatsToRelease.forEach(seatId => {
              delete updatedAvailability[seatId];
            });

            transaction.update(availabilityRef, {
              seats: updatedAvailability,
              updatedAt: serverTimestamp()
            });
          }
        });

        toast.success('Booking cancelled successfully. Refund will be processed within 5-7 business days.');
        fetchUserBookings(); // Refresh bookings
      }
      
    } catch (error) {
      console.error('Cancellation failed:', error);
      toast.error('Failed to cancel booking. Please try again.');
    } finally {
      setCancellingBooking(null);
      setBookingToCancel(null);
    }
  };

  const canCancelBooking = (eventDate) => {
    const today = new Date();
    const daysUntilEvent = differenceInDays(eventDate, today);
    return daysUntilEvent >= 15;
  };

  const refreshBookings = () => {
    if (activeTab === 'havan') {
      fetchUserBookings();
    } else if (activeTab === 'show') {
      fetchUserShowBookings();
    } else if (activeTab === 'stall') {
      fetchUserStallBookings();
    }
  };

  const renderBookingCard = (booking) => {
    return (
      <div 
        key={booking.id} 
        className={`border rounded-xl p-3 sm:p-6 transform hover:scale-[1.02] transition-all duration-200 ${
          booking.status === 'cancelled' 
            ? 'border-red-200 bg-red-50 shadow-md' 
            : 'border-gray-200 bg-white shadow-lg hover:shadow-xl'
        }`}
      >
        {/* Mobile-first layout */}
        <div className="space-y-4">
          {/* Status and ID Row */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm ${
                booking.status === 'confirmed' 
                  ? 'bg-green-100 text-green-800 border border-green-200' 
                  : booking.status === 'cancelled'
                  ? 'bg-red-100 text-red-800 border border-red-200'
                  : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
              }`}>
                {booking.status === 'confirmed' ? '✓ Confirmed' : 
                 booking.status === 'cancelled' ? '✗ Cancelled' : 
                 booking.status}
              </span>
            </div>
            <span className="text-xs sm:text-sm text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded">
              ID: {booking.id || booking.bookingId || 'N/A'}
            </span>
          </div>
          
          {/* Main booking details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-orange-50 p-3 rounded-lg border border-orange-100">
              <p className="text-xs font-semibold text-orange-700 uppercase tracking-wide mb-1">Event Date</p>
              <p className="text-sm font-bold text-gray-900 leading-tight">
                {booking.eventDetails?.date ? format(booking.eventDetails.date, 'MMM dd, yyyy') : 'N/A'}
              </p>
              <p className="text-xs text-gray-600">
                {booking.eventDetails?.date ? format(booking.eventDetails.date, 'EEEE') : 'N/A'}
              </p>
            </div>
            
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
              <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-1">Session</p>
              <p className="text-sm font-bold text-gray-900">
                {getShiftLabel(booking.eventDetails.shift) || 'N/A'}
              </p>
              <p className="text-xs text-gray-600">
                {getShiftTime(booking.eventDetails.shift) || 'N/A'}
              </p>
            </div>
            
            <div className="bg-purple-50 p-3 rounded-lg border border-purple-100">
              <p className="text-xs font-semibold text-purple-700 uppercase tracking-wide mb-1">Seats</p>
              <p className="text-sm font-bold text-gray-900">
                {booking.eventDetails?.seatCount || 0} seat{(booking.eventDetails?.seatCount || 0) > 1 ? 's' : ''}
              </p>
              <p className="text-xs text-gray-600 truncate">
                {(booking.eventDetails?.seats || []).join(', ') || 'No seats specified'}
              </p>
            </div>
            
            <div className="bg-green-50 p-3 rounded-lg border border-green-100">
              <p className="text-xs font-semibold text-green-700 uppercase tracking-wide mb-1">Amount Paid</p>
              <p className="text-lg font-bold text-green-600">
                ₹{booking.payment?.amount || 0}
              </p>
            </div>
          </div>

          {/* Footer with booking info and action */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-3 border-t border-gray-200 gap-3">
            <div className="text-xs text-gray-500 space-y-1">
              <p>🕐 Booked: {format(booking.createdAt, 'MMM dd, yyyy \'at\' hh:mm a')}</p>
              {booking.customerDetails && (
                <p>📞 Contact: {booking.customerDetails.phone}</p>
              )}
            </div>

            {booking.status === 'confirmed' && (
              <div className="flex flex-col sm:flex-row items-center gap-2">
                {canCancelBooking(booking.eventDetails?.date) ? (
                  <div className="text-center">
                    <button
                      onClick={async () => {
                        if (window.confirm('Are you sure you want to cancel this Havan booking? This action cannot be undone.')) {
                          setCancellingBooking(booking.id);
                          try {
                            const result = await cancelBooking(
                              booking,
                              'User requested cancellation',
                              { uid: user?.uid, name: user?.displayName, email: user?.email, isAdmin: false },
                              true // Release seats
                            );
                            
                            if (result.success) {
                              toast.success('Havan booking cancelled successfully');
                              fetchUserBookings(); // Refresh bookings
                            } else {
                              toast.error(result.error || 'Failed to cancel Havan booking');
                            }
                          } catch (error) {
                            toast.error('Error cancelling Havan booking');
                            console.error('Havan cancellation error:', error);
                          } finally {
                            setCancellingBooking(null);
                          }
                        }
                      }}
                      disabled={cancellingBooking === booking.id}
                      className={`${cancellingBooking === booking.id ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-600'} bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 transform hover:scale-105 shadow-md min-w-[100px]`}
                    >
                      {cancellingBooking === booking.id ? 'Cancelling...' : 'Cancel Booking'}
                    </button>
                    <p className="text-xs text-green-600 mt-1 font-medium">
                      ✓ Free cancellation
                    </p>
                  </div>
                ) : (
                  <div className="text-center">
                    <button
                      disabled
                      className="bg-gray-300 text-gray-500 px-4 py-2 rounded-lg text-sm cursor-not-allowed min-w-[100px]"
                    >
                      Cannot Cancel
                    </button>
                    <p className="text-xs text-red-500 mt-1">
                      Only {booking.eventDetails?.date ? differenceInDays(booking.eventDetails.date, new Date()) : 0} days left
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderShowBookingCard = (booking) => {
    return <ShowBookingCard key={booking.id} booking={booking} onCancel={() => {
      // Refresh show bookings after cancellation
      setTimeout(() => {
        fetchUserShowBookings();
      }, 1000);
    }} />;
  };

  const renderStallBookingCard = (booking) => {
    return <StallBookingCard key={booking.id} booking={booking} onCancel={() => {
      // Refresh stall bookings after cancellation
      setTimeout(() => {
        fetchUserStallBookings();
      }, 1000);
    }} />;
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your profile...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50">
        {/* Header */}
        <header className="bg-white/95 backdrop-blur-sm shadow-lg sticky top-0 z-50 border-b border-orange-100">
          <div className="px-2 sm:px-6  py-3 sm:py-4">
            <div className="flex justify-between items-center">
              <Link href="/" className="flex items-center gap-3">
               <div className="flex items-center pr-2">
            <img 
              src="/header-logo.png" 
              alt="Havan Logo" 
              
            />
            
          </div>
              </Link>
              
              <div className="flex items-center gap-4">
                
                <button
                  onClick={handleLogout}
                  className="bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white px-4 py-2 rounded-lg text-sm font-medium transform hover:scale-105 transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Profile Header */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <div className="flex items-center gap-4">
              <div className=" w-10 h-10 md:w-16 md:h-16 bg-gradient-to-r from-orange-400 to-amber-500 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-2xl text-white font-bold">
                  {user?.email?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-800">Welcome </h2>
                <p className="text-gray-600 text-sm md:text-md">{user?.email}</p>
                
              </div>
            </div>
          </div>

          {/* Debug Component - Remove in production
          <DebugBookings /> */}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Booking History */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-lg p-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
                  <h3 className="text-xl font-bold text-gray-800">Your Bookings</h3>
                  
                  {/* Tab Navigation */}
                  <div className="flex bg-gray-100 rounded-lg p-1">
                    <button
                      onClick={() => setActiveTab('havan')}
                      className={`flex-1 px-3 py-2 text-xs sm:text-sm font-medium rounded-md transition-colors ${
                        activeTab === 'havan'
                          ? 'bg-white text-orange-600 shadow-sm'
                          : 'text-gray-600 hover:text-orange-600'
                      }`}
                    >
                      Havan ({bookings.length})
                    </button>
                    <button
                      onClick={() => setActiveTab('show')}
                      className={`flex-1 px-3 py-2 text-xs sm:text-sm font-medium rounded-md transition-colors ${
                        activeTab === 'show'
                          ? 'bg-white text-purple-600 shadow-sm'
                          : 'text-gray-600 hover:text-purple-600'
                      }`}
                    >
                      Shows ({showBookings.length})
                    </button>
                    <button
                      onClick={() => setActiveTab('stall')}
                      className={`flex-1 px-3 py-2 text-xs sm:text-sm font-medium rounded-md transition-colors ${
                        activeTab === 'stall'
                          ? 'bg-white text-green-600 shadow-sm'
                          : 'text-gray-600 hover:text-green-600'
                      }`}
                    >
                      Stalls ({stallBookings.length})
                    </button>
                  </div>
                </div>

                {/* Render bookings based on active tab */}
                {activeTab === 'havan' ? (
                  bookings.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-3xl text-gray-400">🎫</span>
                      </div>
                      <h4 className="text-lg font-medium text-gray-500 mb-2">No Havan bookings yet</h4>
                      <p className="text-gray-400 mb-4">Book your first seat for the sacred Havan ceremony</p>
                      <Link
                        href="/booking"
                        className="inline-block bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white px-6 py-3 rounded-lg font-medium transform hover:scale-105 transition-all duration-200 shadow-md hover:shadow-lg"
                      >
                        Book Havan Seats
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {bookings.map((booking) => renderBookingCard(booking))}
                    </div>
                  )
                ) : activeTab === 'show' ? (
                  showBookings.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-3xl text-gray-400">🎭</span>
                      </div>
                      <h4 className="text-lg font-medium text-gray-500 mb-2">No Show bookings yet</h4>
                      <p className="text-gray-400 mb-4">Book your first seat for cultural shows and performances</p>
                      <Link
                        href="/booking/show"
                        className="inline-block bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white px-6 py-3 rounded-lg font-medium transform hover:scale-105 transition-all duration-200 shadow-md hover:shadow-lg"
                      >
                        Book Show Seats
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {showBookings.map((booking) => renderShowBookingCard(booking))}
                    </div>
                  )
                ) : activeTab === 'stall' ? (
                  stallBookings.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-3xl text-gray-400">🏪</span>
                      </div>
                      <h4 className="text-lg font-medium text-gray-500 mb-2">No Stall bookings yet</h4>
                      <p className="text-gray-400 mb-4">Book your first stall for business opportunities</p>
                      <Link
                        href="/booking/stall"
                        className="inline-block bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-3 rounded-lg font-medium transform hover:scale-105 transition-all duration-200 shadow-md hover:shadow-lg"
                      >
                        Book Stalls
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {stallBookings.map((booking) => renderStallBookingCard(booking))}
                    </div>
                  )
                ) : null}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <Link
                    href="/booking"
                    className="w-full bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white px-4 py-3 rounded-lg font-medium transform hover:scale-105 transition-all duration-200 shadow-md hover:shadow-lg text-center block"
                  >
                    🎫 Book Havan Seats
                  </Link>
                  <Link
                    href="/booking/show"
                    className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white px-4 py-3 rounded-lg font-medium transform hover:scale-105 transition-all duration-200 shadow-md hover:shadow-lg text-center block"
                  >
                    🎭 Book Show Seats
                  </Link>
                  <Link
                    href="/booking/stall"
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-4 py-3 rounded-lg font-medium transform hover:scale-105 transition-all duration-200 shadow-md hover:shadow-lg text-center block"
                  >
                    🏪 Book Stalls
                  </Link>
                  <button
                    onClick={refreshBookings}
                    className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-3 rounded-lg font-medium transition-colors duration-200"
                  >
                    🔄 Refresh Bookings
                  </button>
                </div>
              </div>

              {/* Contact Information */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Contact Support</h3>
                <div className="space-y-4 text-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600">📞</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-700">Phone Support</p>
                      <p className="text-gray-600">+91 730 339 7090</p>
                      <p className="text-gray-600">0120-4348458</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-600">✉️</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-700">Email Support</p>
                      <p className="text-gray-600">info@svsamiti.com</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <span className="text-purple-600">🌐</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-700">Website</p>
                      <p className="text-gray-600">www.svsamiti.com</p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <p className="text-xs text-gray-500 leading-relaxed">
                      For booking-related queries, please contact us with your Booking ID. 
                      Support is available Monday to Saturday, 9 AM to 6 PM.
                    </p>
                  </div>
                </div>
              </div>

              {/* Important Notes */}
              <div className="bg-yellow-50 border-l-4 border-yellow-400 rounded-lg p-4">
                <h4 className="font-medium text-yellow-800 mb-2">Important Notes</h4>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• Confirmation email sent to registered address</li>
                  <li>• Arrive 30 minutes before ceremony time</li>
                  <li>• Refunds processed within 5-7 business days</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Cancel Confirmation Modal */}
        {showCancelModal && bookingToCancel && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[100]">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 transform transition-all">
              <div className="p-6">
                {/* Modal Header */}
                <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.232 15.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                
                <h3 className="text-lg font-bold text-gray-900 text-center mb-2">
                  Cancel {bookingToCancel.type === 'show' ? 'Show' : 'Havan'} Booking?
                </h3>
                
                <p className="text-sm text-gray-600 text-center mb-6">
                  Are you sure you want to cancel your booking for <strong>
                    {bookingToCancel.type === 'show' 
                      ? format(bookingToCancel.showDetails.date, 'MMMM dd, yyyy')
                      : format(bookingToCancel.eventDetails.date, 'MMMM dd, yyyy')
                    }
                  </strong>? This action cannot be undone.
                </p>

                {/* Booking Details Summary */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6 text-sm">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="font-medium text-gray-700">Booking ID:</span>
                      <p className="text-gray-900">{bookingToCancel.id || bookingToCancel.bookingId || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Amount:</span>
                      <p className="text-gray-900 font-semibold">₹{bookingToCancel.payment?.amount || bookingToCancel.showDetails?.totalAmount || bookingToCancel.eventDetails?.totalAmount || 0}</p>
                    </div>
                    <div className="col-span-2">
                      <span className="font-medium text-gray-700">
                        {bookingToCancel.type === 'show' ? 'Seats' : 'Seats'}:
                      </span>
                      <p className="text-gray-900">
                        {bookingToCancel.type === 'show' 
                          ? `${bookingToCancel.showDetails?.selectedSeats?.length || 0} seats`
                          : bookingToCancel.eventDetails.seats.join(', ')
                        }
                      </p>
                    </div>
                  </div>
                </div>

                {/* Refund Notice */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-6">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="w-5 h-5 text-green-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="ml-2">
                      <p className="text-sm font-medium text-green-800">Full Refund Available</p>
                      <p className="text-xs text-green-600 mt-1">
                        Your refund will be processed within 5-7 business days.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Modal Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowCancelModal(false);
                      setBookingToCancel(null);
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                  >
                    Keep Booking
                  </button>
                  <button
                    onClick={confirmCancelBooking}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors"
                  >
                    Cancel Booking
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
};

export default ProfilePage;
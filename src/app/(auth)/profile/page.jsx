"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import SimpleUserProfile from '@/components/profile/SimpleUserProfile';
import ProfileHeader from '@/components/profile/ProfileHeader';
import BookingTabs from '@/components/profile/BookingTabs';
import EmptyState from '@/components/profile/EmptyState';
import QuickActions from '@/components/profile/QuickActions';
import ContactInfo from '@/components/profile/ContactInfo';
import HavanBookingCard from '@/components/profile/HavanBookingCard';
import ShowBookingCard from '@/components/show/ShowBookingCard';
import StallBookingCard from '@/components/stall/StallBookingCard';
import DelegateCard from '@/components/deligateRegistration/DelegateCard';
import DonationCard from '@/components/donation/DonationCard';
import ImageModal from '@/components/ImageModal';
import { useShifts } from '@/hooks/useShifts';
import { useSeatCleanup } from '@/hooks/useSeatCleanup';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { parseISO } from 'date-fns';
import { toast } from 'react-hot-toast';

const ProfilePage = () => {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [bookings, setBookings] = useState([]);
  const [showBookings, setShowBookings] = useState([]);
  const [stallBookings, setStallBookings] = useState([]);
  const [delegateBookings, setDelegateBookings] = useState([]);
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('havan');
  const [showEventLayoutModal, setShowEventLayoutModal] = useState(false);

  const { getShiftLabel, getShiftTime } = useShifts();
  
  // Initialize seat cleanup for havan bookings auto-cancellation
  const { manualCleanup } = useSeatCleanup();

  useEffect(() => {
    if (user) {
      fetchUserBookings();
      fetchUserShowBookings();
      fetchUserStallBookings();
      fetchUserDelegateBookings();
      fetchUserDonations();
    }
  }, [user]);

  const fetchUserBookings = async () => {
    try {
      const bookingsQuery = query(
        collection(db, 'bookings'),
        where('userId', '==', user.uid)
      );
      
      const snapshot = await getDocs(bookingsQuery);
      const bookingsData = [];
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        let eventDate;
        
        if (data.eventDetails?.date) {
          if (data.eventDetails.date.toDate) {
            eventDate = data.eventDetails.date.toDate();
          } else if (data.eventDetails.date.seconds) {
            eventDate = new Date(data.eventDetails.date.seconds * 1000);
          } else if (typeof data.eventDetails.date === 'string') {
            eventDate = parseISO(data.eventDetails.date);
          } else {
            eventDate = new Date();
          }
        } else if (data.eventDate) {
          if (data.eventDate.toDate) {
            eventDate = data.eventDate.toDate();
          } else if (data.eventDate.seconds) {
            eventDate = new Date(data.eventDate.seconds * 1000);
          } else if (typeof data.eventDate === 'string') {
            eventDate = parseISO(data.eventDate);
          } else {
            eventDate = new Date();
          }
        } else {
          eventDate = new Date();
        }
        
        let createdDate;
        if (data.createdAt) {
          if (data.createdAt.toDate) {
            createdDate = data.createdAt.toDate();
          } else if (data.createdAt.seconds) {
            createdDate = new Date(data.createdAt.seconds * 1000);
          } else if (typeof data.createdAt === 'string') {
            createdDate = parseISO(data.createdAt);
          } else {
            createdDate = new Date();
          }
        } else {
          createdDate = new Date();
        }
        
        const structuredData = {
          id: doc.id,
          ...data,
          createdAt: createdDate,
          eventDetails: {
            ...(data.eventDetails || {}),
            date: eventDate,
            shift: data.eventDetails?.shift || data.shift,
            seats: data.eventDetails?.seats || data.seats,
            seatCount: data.eventDetails?.seatCount || data.seatCount
          }
        };
        
        bookingsData.push(structuredData);
      });
      
      bookingsData.sort((a, b) => b.createdAt - a.createdAt);
      setBookings(bookingsData);
    } catch (error) {
      toast.error('Failed to load booking history');
    }
  };

  const fetchUserShowBookings = async () => {
    try {
      const showBookingsQuery = query(
        collection(db, 'showBookings'),
        where('userId', '==', user.uid)
      );
      
      const snapshot = await getDocs(showBookingsQuery);
      const showBookingsData = [];
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        let showDate;
        
        if (data.showDetails?.date) {
          if (typeof data.showDetails.date === 'string') {
            showDate = parseISO(data.showDetails.date);
          } else if (data.showDetails.date.toDate) {
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
          if (data.createdAt.toDate) {
            createdDate = data.createdAt.toDate();
          } else if (data.createdAt.seconds) {
            createdDate = new Date(data.createdAt.seconds * 1000);
          } else if (typeof data.createdAt === 'string') {
            createdDate = parseISO(data.createdAt);
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
          type: 'show'
        });
      });
      
      showBookingsData.sort((a, b) => b.createdAt - a.createdAt);
      setShowBookings(showBookingsData);
    } catch (error) {
      toast.error('Failed to load show booking history');
    }
  };

  const fetchUserStallBookings = async () => {
    try {
      // Query by UID first
      const stallBookingsQueryByUid = query(
        collection(db, 'stallBookings'),
        where('userId', '==', user.uid)
      );
      
      // Also query by email (for admin-booked stalls)
      const stallBookingsQueryByEmail = query(
        collection(db, 'stallBookings'),
        where('userId', '==', user.email)
      );
      
      // Fetch both
      const [snapshotByUid, snapshotByEmail] = await Promise.all([
        getDocs(stallBookingsQueryByUid),
        getDocs(stallBookingsQueryByEmail)
      ]);
      
      // Combine and deduplicate results
      const allDocs = new Map();
      snapshotByUid.forEach(doc => allDocs.set(doc.id, doc));
      snapshotByEmail.forEach(doc => allDocs.set(doc.id, doc));
      
      const snapshot = { docs: Array.from(allDocs.values()) };
      const stallBookingsData = [];
      
      let stallSettings = null;
      
      for (const doc of snapshot.docs) {
        const data = doc.data();
        let startDate, endDate;
        
        if (data.eventDetails?.startDate) {
          if (data.eventDetails.startDate.toDate) {
            startDate = data.eventDetails.startDate.toDate();
          } else if (data.eventDetails.startDate.seconds) {
            startDate = new Date(data.eventDetails.startDate.seconds * 1000);
          } else if (data.eventDetails.startDate instanceof Date) {
            startDate = data.eventDetails.startDate;
          } else {
            startDate = new Date(data.eventDetails.startDate);
          }
        } else {
          try {
            if (!stallSettings) {
              const { getStallEventSettings } = await import('@/services/systemSettingsService');
              stallSettings = await getStallEventSettings();
            }
            startDate = new Date(stallSettings.startDate);
          } catch (error) {
            startDate = new Date('2025-11-15');
          }
        }
        
        if (data.eventDetails?.endDate) {
          if (data.eventDetails.endDate.toDate) {
            endDate = data.eventDetails.endDate.toDate();
          } else if (data.eventDetails.endDate.seconds) {
            endDate = new Date(data.eventDetails.endDate.seconds * 1000);
          } else if (data.eventDetails.endDate instanceof Date) {
            endDate = data.eventDetails.endDate;
          } else {
            endDate = new Date(data.eventDetails.endDate);
          }
        } else {
          try {
            if (!stallSettings) {
              const { getStallEventSettings } = await import('@/services/systemSettingsService');
              stallSettings = await getStallEventSettings();
            }
            endDate = new Date(stallSettings.endDate);
          } catch (error) {
            endDate = new Date('2025-11-20');
          }
        }
        
        let createdDate;
        if (data.createdAt) {
          if (data.createdAt.toDate) {
            createdDate = data.createdAt.toDate();
          } else if (data.createdAt.seconds) {
            createdDate = new Date(data.createdAt.seconds * 1000);
          } else if (typeof data.createdAt === 'string') {
            createdDate = parseISO(data.createdAt);
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
          type: 'stall'
        });
      }
      
      stallBookingsData.sort((a, b) => b.createdAt - a.createdAt);
      setStallBookings(stallBookingsData);
    } catch (error) {
      toast.error('Failed to load stall booking history');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserDelegateBookings = async () => {
    try {
      const delegateBookingsQuery = query(
        collection(db, 'delegateBookings'),
        where('userId', '==', user.uid)
      );
      
      const snapshot = await getDocs(delegateBookingsQuery);
      const delegateBookingsData = [];
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        let createdDate;
        
        if (data.createdAt) {
          if (data.createdAt.toDate) {
            createdDate = data.createdAt.toDate();
          } else if (data.createdAt.seconds) {
            createdDate = new Date(data.createdAt.seconds * 1000);
          } else if (typeof data.createdAt === 'string') {
            createdDate = parseISO(data.createdAt);
          } else {
            createdDate = new Date();
          }
        } else {
          createdDate = new Date();
        }
        
        delegateBookingsData.push({
          id: doc.id,
          ...data,
          createdAt: createdDate,
          type: 'delegate'
        });
      });
      
      delegateBookingsData.sort((a, b) => b.createdAt - a.createdAt);
      setDelegateBookings(delegateBookingsData);
    } catch (error) {
      toast.error('Failed to load delegate booking history');
    }
  };

  const fetchUserDonations = async () => {
    try {
      const userDonationsQuery = query(
        collection(db, 'donations'),
        where('userId', '==', user.uid)
      );
      
      const snapshot = await getDocs(userDonationsQuery);
      const donationsData = [];
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        let createdDate;
        
        if (data.createdAt) {
          if (data.createdAt.toDate) {
            createdDate = data.createdAt.toDate();
          } else if (data.createdAt.seconds) {
            createdDate = new Date(data.createdAt.seconds * 1000);
          } else if (typeof data.createdAt === 'string') {
            createdDate = parseISO(data.createdAt);
          } else {
            createdDate = new Date();
          }
        } else {
          createdDate = new Date();
        }
        
        donationsData.push({
          id: doc.id,
          ...data,
          createdAt: createdDate,
          type: 'donation'
        });
      });
      
      donationsData.sort((a, b) => b.createdAt - a.createdAt);
      setDonations(donationsData);
    } catch (error) {
      toast.error('Failed to load donation history');
    }
  };

  const refreshBookings = () => {
    if (activeTab === 'havan') {
      fetchUserBookings();
    } else if (activeTab === 'show') {
      fetchUserShowBookings();
    } else if (activeTab === 'stall') {
      fetchUserStallBookings();
    } else if (activeTab === 'delegates') {
      fetchUserDelegateBookings();
    } else if (activeTab === 'donations') {
      fetchUserDonations();
    }
  };

  // Handle booking status updates from individual booking cards
  const handleBookingStatusUpdate = async (bookingId, newStatus) => {
    console.log(`🔄 Handling status update for booking ${bookingId}: ${newStatus}`);
    
    // Always refresh bookings to get latest data
    await fetchUserBookings();
    
    // If status changed to cancelled, also trigger cleanup to ensure consistency
    if (newStatus === 'cancelled') {
      try {
        console.log('🧹 Triggering manual cleanup after cancellation...');
        await manualCleanup();
      } catch (error) {
        console.error('❌ Manual cleanup failed:', error);
      }
    }
  };

  // Auto-refresh havan bookings periodically to catch status updates
  useEffect(() => {
    if (activeTab === 'havan' && bookings.length > 0) {
      const hasPendingBookings = bookings.some(booking => booking.status === 'pending_payment');
      
      if (hasPendingBookings) {
        console.log('🔄 Setting up periodic refresh for pending havan bookings...');
        const refreshInterval = setInterval(() => {
          console.log('⏰ Auto-refreshing havan bookings...');
          fetchUserBookings();
        }, 30000); // Refresh every 30 seconds when there are pending bookings
        
        return () => {
          console.log('🛑 Stopping periodic refresh for havan bookings');
          clearInterval(refreshInterval);
        };
      }
    }
  }, [activeTab, bookings]);

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

  const emptyStates = {
    havan: {
      type: 'Havan reservations',
      icon: '🎫',
      color: 'orange',
      link: '/booking',
      linkText: 'Reserve Havan Spots'
    },
    show: {
      type: 'Show reservations',
      icon: '🎭',
      color: 'purple',
      link: '/booking/show',
      linkText: 'Reserve Show Spots'
    },
    stall: {
      type: 'Stall reservations',
      icon: '🏪',
      color: 'green',
      link: '/booking/stall',
      linkText: 'Reserve Stalls'
    },
    delegates: {
      type: 'Delegate registrations',
      icon: '🎓',
      color: 'yellow',
      link: '/booking/delegate',
      linkText: 'Register as Delegate'
    },
    donations: {
      type: 'Donations',
      icon: '💝',
      color: 'pink',
      link: '/donate',
      linkText: 'Make a Donation'
    }
  };

  const renderBookings = () => {
    switch (activeTab) {
      case 'havan':
        return bookings.map((booking) => (
          <HavanBookingCard 
            key={booking.id} 
            booking={booking} 
            getShiftLabel={getShiftLabel}
            getShiftTime={getShiftTime}
            onStatusUpdate={handleBookingStatusUpdate}
          />
        ));
      case 'show':
        return showBookings.map((booking) => (
          <ShowBookingCard 
            key={booking.id} 
            booking={booking} 
            onCancel={fetchUserShowBookings}
          />
        ));
      case 'stall':
        return stallBookings.map((booking) => (
          <StallBookingCard 
            key={booking.id} 
            booking={booking} 
            onCancel={fetchUserStallBookings}
          />
        ));
      case 'delegates':
        return delegateBookings.map((booking) => (
          <DelegateCard key={booking.id} booking={booking} />
        ));
      case 'donations':
        return donations.map((donation) => (
          <DonationCard key={donation.id} donation={donation} />
        ));
      default:
        return null;
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50">
        <ProfileHeader 
          onShowEventLayout={() => setShowEventLayoutModal(true)}
          onLogout={handleLogout}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <SimpleUserProfile user={user} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-3">
              <div className="bg-white rounded-xl shadow-lg p-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
                  <h3 className="text-xl font-bold text-gray-800">Your Reservations</h3>
                  <BookingTabs 
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    counts={{
                      havan: bookings.length,
                      show: showBookings.length,
                      stall: stallBookings.length,
                      delegates: delegateBookings.length,
                      donations: donations.length
                    }}
                  />
                </div>

                {(() => {
                  const currentTabData = {
                    havan: bookings,
                    show: showBookings,
                    stall: stallBookings,
                    delegates: delegateBookings,
                    donations: donations
                  };
                  
                  if (currentTabData[activeTab].length === 0) {
                    return <EmptyState {...emptyStates[activeTab]} />;
                  }
                  
                  return <div className="space-y-4">{renderBookings()}</div>;
                })()}
              </div>
            </div>

            <div className="space-y-6">
              <QuickActions onRefresh={refreshBookings} />
              <ContactInfo />
            </div>
          </div>
        </div>

        <ImageModal
          show={showEventLayoutModal}
          onClose={() => setShowEventLayoutModal(false)}
          imageSrc="/layout2.png"
          imageAlt="Event Layout"
          title="Event Layout"
        />
      </div>
    </ProtectedRoute>
  );
};

export default ProfilePage;
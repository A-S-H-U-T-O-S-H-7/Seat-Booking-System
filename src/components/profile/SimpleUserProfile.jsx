"use client";
import { useState, useEffect } from 'react';
import { Mail, Phone, User } from 'lucide-react';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const SimpleUserProfile = ({ user }) => {
  const [userProfile, setUserProfile] = useState({
    name: null,
    email: user?.email || null,
    phone: null
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.uid) {
      fetchUserProfile();
    }
  }, [user]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      
      const profile = {
        name: null,
        email: user?.email || null,
        phone: null
      };

      // First check userProfiles collection for manually saved data
      const userProfileRef = doc(db, 'userProfiles', user.uid);
      const userProfileDoc = await getDoc(userProfileRef);
      
      if (userProfileDoc.exists()) {
        const savedProfile = userProfileDoc.data();
        if (savedProfile.name) profile.name = savedProfile.name;
        if (savedProfile.email) profile.email = savedProfile.email;
        if (savedProfile.phone) profile.phone = savedProfile.phone;
      }

      // If we don't have complete data, check booking collections
      if (!profile.name || !profile.phone) {
        const bookingCollections = ['bookings', 'showBookings', 'stallBookings'];
        
        for (const collectionName of bookingCollections) {
          if (profile.name && profile.phone) break; // Stop if we have all data
          
          const q = query(
            collection(db, collectionName),
            where('userId', '==', user.uid)
          );
          
          const snapshot = await getDocs(q);
          
          snapshot.forEach((doc) => {
            if (profile.name && profile.phone) return; // Skip if already found
            
            const data = doc.data();
            const customerDetails = data.customerDetails || data.userDetails;
            
            if (customerDetails) {
              if (!profile.name && customerDetails.name?.trim()) {
                profile.name = customerDetails.name.trim();
              }
              if (!profile.phone && customerDetails.phone?.trim()) {
                profile.phone = customerDetails.phone.trim();
              }
              if (!profile.email && customerDetails.email?.trim()) {
                profile.email = customerDetails.email.trim();
              }
            }
          });
        }
      }

      setUserProfile(profile);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const getUserInitials = () => {
    if (userProfile?.name?.trim()) {
      const nameParts = userProfile.name.trim().split(' ');
      if (nameParts.length >= 2) {
        return `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase();
      }
      return userProfile.name.trim()[0].toUpperCase();
    }
    
    if (userProfile?.email?.trim()) {
      return userProfile.email.trim()[0].toUpperCase();
    }
    
    return 'U';
  };

  const formatPhoneNumber = (phone) => {
    if (!phone || phone.length !== 10) return phone;
    return `+91 ${phone.slice(0, 5)} ${phone.slice(5)}`;
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-r from-blue-50 via-white to-indigo-50 border border-blue-200 rounded-xl shadow-lg p-6 animate-pulse">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-32"></div>
            <div className="h-3 bg-gray-200 rounded w-48"></div>
            <div className="h-3 bg-gray-200 rounded w-40"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-blue-50 via-white to-indigo-50 border border-blue-200 rounded-xl shadow-lg p-6">
      <div className="flex items-center space-x-4">
        {/* Profile Avatar */}
        <div className="w-16 h-16 bg-gradient-to-r from-orange-400 to-amber-500 rounded-full flex items-center justify-center shadow-lg flex-shrink-0">
          <span className="text-2xl font-bold text-white">
            {getUserInitials()}
          </span>
        </div>

        {/* Profile Information */}
        <div className="flex-1 min-w-0">
          {/* Name - only show if available */}
          {userProfile?.name && (
            <h2 className="text-xl font-bold text-gray-900 truncate">
              {userProfile.name}
            </h2>
          )}
          
          {/* Phone - only show if available */}
          {userProfile?.phone && (
            <div className="flex items-center space-x-2 mt-1">
              <Phone className="w-4 h-4 text-green-600 flex-shrink-0" />
              <span className="text-sm text-gray-700 font-medium">
                {formatPhoneNumber(userProfile.phone)}
              </span>
            </div>
          )}
          
          {/* Email - always show since user must have email to sign up */}
          {userProfile?.email && (
            <div className="flex items-center space-x-2 mt-1">
              <Mail className="w-4 h-4 text-blue-600 flex-shrink-0" />
              <span className="text-sm text-gray-600 truncate">
                {userProfile.email}
              </span>
            </div>
          )}

          {/* Show message if no additional info available */}
          {!userProfile?.name && !userProfile?.phone && (
            <div className="mt-1">
              <p className="text-sm text-gray-500">
                Additional profile information will appear after your first reservation
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SimpleUserProfile;

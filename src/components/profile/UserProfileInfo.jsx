"use client";
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import {
  User,
  Mail,
  Phone,
  CreditCard,
  MapPin,
  Shield,
  Calendar,
  Edit3,
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff,
  Clock
} from 'lucide-react';
import {
  fetchUserProfileData,
  formatPhoneNumber,
  formatAadharNumber,
  getUserInitials,
  getProfileCompleteness
} from '@/utils/userProfileService';
import ProfileEditModal from './ProfileEditModal';

const UserProfileInfo = ({ user, onEdit, onShowEventLayout }) => {
  const [userProfile, setUserProfile] = useState(null);
  const [profileCompletion, setProfileCompletion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showFullAadhar, setShowFullAadhar] = useState(false);
  const [error, setError] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    if (user?.uid) {
      loadUserProfile();
    }
  }, [user]);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const profileData = await fetchUserProfileData(user.uid);
      
      // Use auth email as fallback
      if (!profileData.email && user.email) {
        profileData.email = user.email;
      }
      
      setUserProfile(profileData);
      setProfileCompletion(getProfileCompleteness(profileData));
    } catch (err) {
      console.error('Error loading user profile:', err);
      setError('Failed to load profile information');
      // Set basic profile with just email
      setUserProfile({
        email: user.email,
        name: null,
        phone: null,
        aadhar: null,
        address: null,
        emergencyContact: null,
        bookingHistory: {
          totalBookings: 0,
          havanBookings: 0,
          showBookings: 0,
          stallBookings: 0,
          firstBookingDate: null,
          lastBookingDate: null
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = (updatedProfile) => {
    // Update the local profile state with the updated data
    setUserProfile(prev => ({
      ...prev,
      ...updatedProfile
    }));
    setProfileCompletion(getProfileCompleteness({
      ...userProfile,
      ...updatedProfile
    }));
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 animate-pulse">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-32"></div>
            <div className="h-3 bg-gray-200 rounded w-48"></div>
          </div>
        </div>
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-3 bg-gray-200 rounded w-20"></div>
              <div className="h-4 bg-gray-200 rounded w-32"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-center space-x-2 text-red-600">
          <AlertCircle className="w-5 h-5" />
          <p>{error}</p>
        </div>
      </div>
    );
  }

  const initials = getUserInitials(userProfile?.name, userProfile?.email);
  const hasBookingHistory = profileCompletion?.hasBookingHistory;

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Header Section */}
<div className="bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-8">
  <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
    {/* Avatar */}
    <div className="relative">
      <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg">
        <span className="text-2xl font-bold text-white">
          {initials}
        </span>
      </div>
      {profileCompletion?.isComplete && (
        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
          <CheckCircle className="w-4 h-4 text-white" />
        </div>
      )}
    </div>

    {/* Basic Info */}
    <div className="flex-1 text-center sm:text-left">
      <h2 className="text-2xl font-bold text-white mb-1">
        {userProfile?.name || 'Welcome!'}
      </h2>
      <p className="text-orange-100 text-sm mb-3">
        {userProfile?.email || 'No email available'}
      </p>
      
      {/* Profile Completion */}
      {profileCompletion && (
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 inline-block">
          <div className="flex items-center space-x-2 mb-2">
            <Shield className="w-4 h-4 text-white" />
            <span className="text-white text-sm font-medium">
              Profile {profileCompletion.completionPercentage}% Complete
            </span>
          </div>
          <div className="w-32 bg-white/20 rounded-full h-2">
            <div 
              className="bg-white rounded-full h-2 transition-all duration-300"
              style={{ width: `${profileCompletion.completionPercentage}%` }}
            ></div>
          </div>
          {!profileCompletion.isComplete && (
            <p className="text-orange-100 text-xs mt-1">
              Complete your profile for better booking experience
            </p>
          )}
        </div>
      )}
    </div>

    {/* Event Layout Button */}
    <div className="flex items-center">
      <button
        onClick={onShowEventLayout}
        className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl flex items-center space-x-2"
      >
        <MapPin className="w-4 h-4" />
        <span>Event Layout</span>
      </button>
    </div>
  </div>
</div>
      {/* Information Grid */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
              <User className="w-5 h-5 text-orange-500" />
              <span>Contact Information</span>
            </h3>
            
            <div className="space-y-4">
              {/* Email */}
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Mail className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Email Address</p>
                  <p className="text-sm font-medium text-gray-900">
                    {userProfile?.email || 'Not provided'}
                  </p>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <Phone className="w-5 h-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Phone Number</p>
                  <p className="text-sm font-medium text-gray-900">
                    {userProfile?.phone ? formatPhoneNumber(userProfile.phone) : (
                      <span className="text-gray-400 italic">Not provided</span>
                    )}
                  </p>
                </div>
                {!userProfile?.phone && hasBookingHistory && (
                  <div className="text-orange-500 text-xs bg-orange-50 px-2 py-1 rounded">
                    Available after booking
                  </div>
                )}
              </div>

              {/* Emergency Contact */}
              {userProfile?.emergencyContact && (
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                    <Shield className="w-5 h-5 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Emergency Contact</p>
                    <p className="text-sm font-medium text-gray-900">
                      {formatPhoneNumber(userProfile.emergencyContact)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Personal & Identity Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
              <CreditCard className="w-5 h-5 text-orange-500" />
              <span>Personal Details</span>
            </h3>
            
            <div className="space-y-4">
              {/* Aadhar */}
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-purple-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Aadhar Number</p>
                  <div className="flex items-center space-x-2">
                    <p className="text-sm font-medium text-gray-900 font-mono">
                      {userProfile?.aadhar ? (
                        showFullAadhar ? userProfile.aadhar : formatAadharNumber(userProfile.aadhar)
                      ) : (
                        <span className="text-gray-400 italic">Not provided</span>
                      )}
                    </p>
                    {userProfile?.aadhar && (
                      <button
                        onClick={() => setShowFullAadhar(!showFullAadhar)}
                        className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                        title={showFullAadhar ? 'Hide full number' : 'Show full number'}
                      >
                        {showFullAadhar ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    )}
                  </div>
                </div>
                {!userProfile?.aadhar && hasBookingHistory && (
                  <div className="text-orange-500 text-xs bg-orange-50 px-2 py-1 rounded">
                    Available after booking
                  </div>
                )}
              </div>

              {/* Address */}
              <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center mt-0.5">
                  <MapPin className="w-5 h-5 text-indigo-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Address</p>
                  <p className="text-sm text-gray-900 leading-relaxed">
                    {userProfile?.address || (
                      <span className="text-gray-400 italic">Not provided</span>
                    )}
                  </p>
                </div>
                {!userProfile?.address && hasBookingHistory && (
                  <div className="text-orange-500 text-xs bg-orange-50 px-2 py-1 rounded">
                    Available after booking
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Booking History Summary */}
        {userProfile?.bookingHistory && userProfile.bookingHistory.totalBookings > 0 && (
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2 mb-4">
              <Calendar className="w-5 h-5 text-orange-500" />
              <span>Booking History</span>
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {userProfile.bookingHistory.totalBookings}
                </div>
                <div className="text-sm text-blue-800 font-medium">Total Bookings</div>
              </div>
              
              <div className="bg-orange-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {userProfile.bookingHistory.havanBookings}
                </div>
                <div className="text-sm text-orange-800 font-medium">Havan Seats</div>
              </div>
              
              <div className="bg-purple-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {userProfile.bookingHistory.showBookings}
                </div>
                <div className="text-sm text-purple-800 font-medium">Show Seats</div>
              </div>
              
              <div className="bg-green-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-green-600">
                  {userProfile.bookingHistory.stallBookings}
                </div>
                <div className="text-sm text-green-800 font-medium">Stall Bookings</div>
              </div>
            </div>

            {userProfile.bookingHistory.firstBookingDate && (
              <div className="mt-4 flex items-center justify-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>Member since {format(userProfile.bookingHistory.firstBookingDate, 'MMMM yyyy')}</span>
                </div>
                {userProfile.bookingHistory.lastBookingDate && (
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>Last booking {format(userProfile.bookingHistory.lastBookingDate, 'MMM dd, yyyy')}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* No Booking History Message */}
        {userProfile?.bookingHistory && userProfile.bookingHistory.totalBookings === 0 && (
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Bookings Yet</h3>
              <p className="text-gray-600 mb-4">
                Your profile will be automatically populated with your information once you make your first Reservation.
              </p>
              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                <a
                  href="/booking"
                  className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  Book Havan Seats
                </a>
                <a
                  href="/booking/show"
                  className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  Book Show Seats
                </a>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Profile Edit Modal */}
      <ProfileEditModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        userProfile={userProfile}
        user={user}
        onSave={handleProfileUpdate}
      />
    </div>
  );
};

export default UserProfileInfo;

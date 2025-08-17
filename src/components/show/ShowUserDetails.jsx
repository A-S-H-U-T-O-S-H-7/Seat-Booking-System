"use client";
import { useAuth } from '@/context/AuthContext';
import { useShowSeatBooking } from '@/context/ShowSeatBookingContext';
import { User, Mail, Phone, CreditCard, MapPin, AlertCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

const ShowUserDetails = () => {
  const { user } = useAuth();
  const { setBookingData, bookingData } = useShowSeatBooking();
  const [details, setDetails] = useState({
    name: '',
    email: '',
    phone: '',
    aadhar: '',
    address: '',
    emergencyContact: ''
  });

  // Pre-fill email from user account
  useEffect(() => {
    if (user?.email && !details.email) {
      console.log('Pre-filling email from user account:', user.email);
      const newDetails = {
        ...details,
        email: user.email
      };
      setDetails(newDetails);
      
      if (typeof setBookingData === 'function') {
        console.log('Saving user details to context:', newDetails);
        setBookingData({ userDetails: newDetails });
      } else {
        console.error('setBookingData function is not available');
      }
    }
  }, [user, details.email]);

  // Sync local state with context when component mounts
  useEffect(() => {
    if (bookingData?.userDetails && Object.keys(bookingData.userDetails).length > 0) {
      console.log('Syncing local state with context:', bookingData.userDetails);
      setDetails(prev => ({
        ...prev,
        ...bookingData.userDetails
      }));
    }
  }, [bookingData]);

  const handleChange = (field, value) => {
    console.log('Field changed:', { field, value });
    const newDetails = {
      ...details,
      [field]: value
    };
    setDetails(newDetails);
    
    if (typeof setBookingData === 'function') {
      console.log('Saving updated user details to context:', newDetails);
      setBookingData({ userDetails: newDetails });
    } else {
      console.error('setBookingData function is not available');
    }
  };

  const validatePhone = (phone) => {
    const phoneRegex = /^[6-9]\d{9}$/;
    return phoneRegex.test(phone);
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateAadhar = (aadhar) => {
    const aadharRegex = /^\d{12}$/;
    return aadharRegex.test(aadhar);
  };

  const validateName = (name) => {
    return name && name.trim().length >= 3;
  };

  const validateAddress = (address) => {
    return address && address.trim().length >= 5;
  };

  // Export validation functions for use in booking flow
  const isFormValid = () => {
    return (
      validateName(details.name) &&
      validateEmail(details.email) &&
      validatePhone(details.phone) &&
      validateAadhar(details.aadhar) &&
      validateAddress(details.address)
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-full flex items-center justify-center">
          <User className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900">Your Details</h3>
          <p className="text-gray-600 text-sm">Please provide your information</p>
        </div>
      </div>
      
      <div className="space-y-4">
        {/* Full Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Full Name *
            </div>
          </label>
          <input
            type="text"
            value={details.name}
            onChange={(e) => handleChange('name', e.target.value)}
            className="w-full px-4 py-3 text-gray-900 bg-white border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 placeholder:text-gray-500"
            placeholder="Enter your full name (minimum 3 characters)"
            required
          />
          {details.name && !validateName(details.name) && (
            <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              Name must be at least 3 characters long
            </p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Email Address *
            </div>
          </label>
          <input
            type="email"
            value={details.email}
            onChange={(e) => handleChange('email', e.target.value)}
            className="w-full px-4 py-3 text-gray-900 bg-white border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 placeholder:text-gray-500"
            placeholder="Enter your email"
            required
          />
          {details.email && !validateEmail(details.email) && (
            <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              Please enter a valid email address
            </p>
          )}
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4" />
              Phone Number *
            </div>
          </label>
          <input
            type="tel"
            value={details.phone}
            onChange={(e) => handleChange('phone', e.target.value.replace(/\D/g, ''))}
            maxLength="10"
            className="w-full px-4 py-3 text-gray-900 bg-white border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 placeholder:text-gray-500"
            placeholder="Enter 10-digit mobile number"
            required
          />
          {details.phone && !validatePhone(details.phone) && (
            <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              Please enter a valid 10-digit mobile number
            </p>
          )}
        </div>

        {/* Aadhar Card */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              Aadhar Number *
            </div>
          </label>
          <input
            type="text"
            value={details.aadhar}
            onChange={(e) => handleChange('aadhar', e.target.value.replace(/\D/g, ''))}
            maxLength="12"
            className="w-full px-4 py-3 text-gray-900 bg-white border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 placeholder:text-gray-500"
            placeholder="Enter 12-digit Aadhar number"
            required
          />
          {details.aadhar && !validateAadhar(details.aadhar) && (
            <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              Please enter a valid 12-digit Aadhar number
              </p>
          )}
        </div>

        {/* Address */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Complete Address *
            </div>
          </label>
          <textarea
            value={details.address}
            onChange={(e) => handleChange('address', e.target.value)}
            rows="3"
            className="w-full px-4 py-3 text-gray-900 bg-white border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 placeholder:text-gray-500 resize-none"
            placeholder="Enter your complete address (minimum 5 characters)"
            required
          />
          {details.address && !validateAddress(details.address) && (
            <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              Address must be at least 5 characters long
            </p>
          )}
        </div>

        {/* Emergency Contact */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Emergency Contact Number (Optional)
            </div>
          </label>
          <input
            type="tel"
            value={details.emergencyContact}
            onChange={(e) => handleChange('emergencyContact', e.target.value.replace(/\D/g, ''))}
            maxLength="10"
            className="w-full px-4 py-3 text-gray-900 bg-white border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 placeholder:text-gray-500"
            placeholder="Enter emergency contact number (optional)"
          />
          {details.emergencyContact && details.emergencyContact.length > 0 && !validatePhone(details.emergencyContact) && (
            <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              Please enter a valid 10-digit mobile number
            </p>
          )}
        </div>
      </div>

      {/* Information Note */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start gap-3">
          <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-white text-xs font-bold">i</span>
          </div>
          <div>
            <h4 className="text-blue-700 font-medium mb-1">Important</h4>
            <p className="text-blue-600 text-sm">
              All information provided will be used for booking confirmation and emergency contact purposes only.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShowUserDetails;

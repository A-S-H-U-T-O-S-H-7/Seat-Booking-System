"use client";
import { useAuth } from '@/context/AuthContext';
import { Calendar, Clock, Info, Mail, Phone, RefreshCw, User, AlertCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const CustomerDetails = ({ details, onDetailsChange, onValidationChange }) => {
  const { user } = useAuth();
  const [errors, setErrors] = useState({});
  const [userDataLoaded, setUserDataLoaded] = useState(false);

  // Auto-fill user data from previous bookings or saved profile
  useEffect(() => {
    if (user?.uid && !userDataLoaded) {
      loadUserData();
    }
  }, [user, userDataLoaded]);

  // Pre-fill email from user account if not already filled
  useEffect(() => {
    if (user?.email && !details.email) {
      onDetailsChange(prev => ({
        ...prev,
        email: user.email
      }));
    }
  }, [user, details.email, onDetailsChange]);

  // Validate form and notify parent component
  useEffect(() => {
    const isValid = validateForm();
    if (onValidationChange) {
      onValidationChange(isValid);
    }
  }, [details, onValidationChange]);

  const loadUserData = async () => {
    try {
      const profile = {
        name: details.name || '',
        email: details.email || user?.email || '',
        phone: details.phone || '',
        aadhar: details.aadhar || '',
        pan: details.pan || '',
        address: details.address || ''
      };

      // First check userProfiles collection for manually saved data
      const userProfileRef = doc(db, 'userProfiles', user.uid);
      const userProfileDoc = await getDoc(userProfileRef);
      
      if (userProfileDoc.exists()) {
        const savedProfile = userProfileDoc.data();
        if (savedProfile.name && !profile.name) profile.name = savedProfile.name;
        if (savedProfile.email && !profile.email) profile.email = savedProfile.email;
        if (savedProfile.phone && !profile.phone) profile.phone = savedProfile.phone;
        if (savedProfile.aadhar && !profile.aadhar) profile.aadhar = savedProfile.aadhar;
        if (savedProfile.pan && !profile.pan) profile.pan = savedProfile.pan;
        if (savedProfile.address && !profile.address) profile.address = savedProfile.address;
      }

      // If we don't have complete data, check booking collections
      if (!profile.name || !profile.phone || !profile.aadhar || !profile.pan || !profile.address) {
        const bookingCollections = ['bookings', 'showBookings', 'stallBookings'];
        
        for (const collectionName of bookingCollections) {
          if (profile.name && profile.phone && profile.aadhar && profile.pan && profile.address) break;
          
          const q = query(
            collection(db, collectionName),
            where('userId', '==', user.uid)
          );
          
          const snapshot = await getDocs(q);
          
          snapshot.forEach((doc) => {
            if (profile.name && profile.phone && profile.aadhar && profile.pan && profile.address) return;
            
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
              if (!profile.aadhar && customerDetails.aadhar?.trim()) {
                profile.aadhar = customerDetails.aadhar.trim();
              }
              if (!profile.pan && customerDetails.pan?.trim()) {
                profile.pan = customerDetails.pan.trim().toUpperCase();
              }
              if (!profile.address && customerDetails.address?.trim()) {
                profile.address = customerDetails.address.trim();
              }
            }
          });
        }
      }

      // Update the form with found data
      onDetailsChange(prev => ({
        ...prev,
        ...profile
      }));
      
      setUserDataLoaded(true);
    } catch (error) {
      console.error('Error loading user data:', error);
      setUserDataLoaded(true);
    }
  };

  const handleChange = (field, value) => {
    // Format input for phone, aadhar, and pan
    if (field === 'phone') {
      value = value.replace(/\D/g, '').slice(0, 10);
    } else if (field === 'aadhar') {
      value = value.replace(/\D/g, '').slice(0, 12);
    } else if (field === 'pan') {
      // Format PAN: Allow only alphanumeric, convert to uppercase, max 10 chars
      value = value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 10);
    }

    onDetailsChange(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateName = (name) => {
    return name && name.trim().length >= 3;
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone) => {
    const phoneRegex = /^[6-9]\d{9}$/;
    return phoneRegex.test(phone);
  };

  const validateAadhar = (aadhar) => {
    // Check if it's 12 digits and doesn't start with 0 or 1
    const aadharRegex = /^[2-9]\d{11}$/;
    return aadharRegex.test(aadhar);
  };

  const validatePan = (pan) => {
    // PAN format: 5 letters, 4 digits, 1 letter (e.g., ABCDE1234F)
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    return panRegex.test(pan);
  };

  const validateAddress = (address) => {
    return address && address.trim().length >= 5;
  };

  const validateForm = () => {
    return (
      validateName(details.name) &&
      validateEmail(details.email) &&
      validatePhone(details.phone) &&
      validateAadhar(details.aadhar) &&
      (details.pan ? validatePan(details.pan) : true) && // PAN is optional
      validateAddress(details.address)
    );
  };

  const getFieldError = (field) => {
    switch (field) {
      case 'name':
        return details.name && !validateName(details.name) ? 'Name must be at least 3 characters long' : '';
      case 'email':
        return details.email && !validateEmail(details.email) ? 'Please enter a valid email address' : '';
      case 'phone':
        return details.phone && !validatePhone(details.phone) ? 'Please enter a valid 10-digit mobile number' : '';
      case 'aadhar':
        return details.aadhar && !validateAadhar(details.aadhar) ? 'Please enter a valid 12-digit Aadhar number (cannot start with 0 or 1)' : '';
      case 'pan':
        return details.pan && !validatePan(details.pan) ? 'Please enter a valid PAN number (e.g., ABCDE1234F)' : '';
      case 'address':
        return details.address && !validateAddress(details.address) ? 'Address must be at least 5 characters long' : '';
      default:
        return '';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 px-2 md:p-4">
      <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        👤 Customer Details
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Full Name */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Full Name *
          </label>
            <input
              type="text"
              value={details.name || ''}
              onChange={(e) => handleChange('name', e.target.value)}
              className={`w-full px-4 py-3 text-gray-900 bg-gray-50 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 placeholder-gray-500 ${
                getFieldError('name') ? 'border-red-300 bg-red-50' : 'border-gray-200'
              }`}
              placeholder="Enter your full name (minimum 3 characters)"
              required
            />
            {getFieldError('name') && (
              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {getFieldError('name')}
              </p>
            )}
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Address *
          </label>
          <input
            type="email"
            value={details.email || ''}
            onChange={(e) => handleChange('email', e.target.value)}
            className={`w-full px-4 py-3 text-gray-900 bg-gray-50 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 placeholder-gray-500 ${
              getFieldError('email') ? 'border-red-300 bg-red-50' : 'border-gray-200'
            }`}
            placeholder="Enter your email"
            required
          />
          {getFieldError('email') && (
            <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {getFieldError('email')}
            </p>
          )}
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number *
          </label>
          <input
            type="tel"
            value={details.phone || ''}
            onChange={(e) => handleChange('phone', e.target.value)}
            maxLength="10"
            className={`w-full px-4 py-3 text-gray-900 bg-gray-50 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 placeholder-gray-500 ${
              getFieldError('phone') ? 'border-red-300 bg-red-50' : 'border-gray-200'
            }`}
            placeholder="Enter 10-digit mobile number"
            required
          />
          {getFieldError('phone') && (
            <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {getFieldError('phone')}
            </p>
          )}
        </div>

        {/* Aadhar Card */}
<div>
  <label className="block text-sm font-medium text-gray-700 mb-2">
    Aadhar Card Number *
  </label>
  <input
    type="text"
    value={details.aadhar || ''}
    onChange={(e) => handleChange('aadhar', e.target.value)}
    maxLength="12"
    className={`w-full px-4 py-3 text-gray-900 bg-gray-50 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 placeholder-gray-500 ${
      getFieldError('aadhar') ? 'border-red-300 bg-red-50' : 'border-gray-200'
    }`}
    placeholder="Enter 12-digit Aadhar number (cannot start with 0 or 1)"
    required
  />
  {getFieldError('aadhar') && (
    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
      <AlertCircle className="w-3 h-3" />
      {getFieldError('aadhar')}
    </p>
  )}
</div>

        {/* PAN Number */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            PAN Card Number (Optional)
          </label>
          <input
            type="text"
            value={details.pan || ''}
            onChange={(e) => handleChange('pan', e.target.value)}
            maxLength="10"
            className={`w-full px-4 py-3 text-gray-900 bg-gray-50 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 placeholder-gray-500 ${
              getFieldError('pan') ? 'border-red-300 bg-red-50' : 'border-gray-200'
            }`}
            placeholder="Enter PAN number (e.g., ABCDE1234F)"
            style={{ textTransform: 'uppercase' }}
          />
          {getFieldError('pan') && (
            <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {getFieldError('pan')}
            </p>
          )}
        </div>

        {/* Address */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Address *
          </label>
          <textarea
            value={details.address || ''}
            onChange={(e) => handleChange('address', e.target.value)}
            rows="3"
            className={`w-full px-4 py-3 text-gray-900 bg-gray-50 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 placeholder-gray-500 resize-none ${
              getFieldError('address') ? 'border-red-300 bg-red-50' : 'border-gray-200'
            }`}
            placeholder="Enter your complete address (minimum 5 characters)"
            required
          />
          {getFieldError('address') && (
            <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {getFieldError('address')}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-4">
      {/* Terms and Conditions */}
      <div className="border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center border border-amber-300">
            <Info className="w-4 h-4 text-amber-600" />
          </div>
          <h4 className="text-base font-semibold text-amber-800">Important Information</h4>
        </div>
        
        <div className="grid gap-2">
          <div className="flex items-center gap-2 p-2 bg-white bg-opacity-60 rounded border border-amber-200">
            <Clock className="w-3 h-3 text-amber-600 flex-shrink-0" />
            <span className="text-xs text-gray-700">Arrive 45 minutes before event starts</span>
          </div>
          
          <div className="flex items-center gap-2 p-2 bg-white bg-opacity-60 rounded border border-amber-200">
            <Calendar className="w-3 h-3 text-amber-600 flex-shrink-0" />
            <span className="text-xs text-gray-700">Seats reserved for selected date and shift only</span>
          </div>
          
          
          
          <div className="flex items-center gap-2 p-2 bg-white bg-opacity-60 rounded border border-amber-200">
            <Mail className="w-3 h-3 text-amber-600 flex-shrink-0" />
            <span className="text-xs text-gray-700">Confirmation email sent to registered email</span>
          </div>
          
          <div className="flex items-center gap-2 p-2 bg-white bg-opacity-60 rounded border border-amber-200">
            <User className="w-3 h-3 text-amber-600 flex-shrink-0" />
            <span className="text-xs text-gray-700">Please carry valid ID for verification</span>
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="border  border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center border border-blue-300">
            <Phone className="w-4 h-4 text-blue-600" />
          </div>
          <h4 className="text-base font-semibold text-blue-800">Contact Information</h4>
        </div>
        
        <div className="p-3 bg-white bg-opacity-70 rounded border border-blue-200">
          <p className="text-xs font-medium text-blue-800 mb-2">Need help? Get in touch:</p>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
            <div className="flex items-center gap-2">
              <Mail className="w-3 h-3 text-blue-600 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <span className="text-xs text-gray-500 block">Email</span>
                <a href="mailto:info@svsamiti.com" className="text-xs font-medium text-gray-800 hover:text-blue-600 transition-colors">
                  info@svsamiti.com
                </a>
              </div>
            </div>
            
          
            
            <div className="flex items-center gap-2">
              <Phone className="w-3 h-3 text-blue-600 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <span className="text-xs text-gray-500 block">Phone</span>
                <a href="tel:01204348458" className="text-xs font-medium text-gray-800 hover:text-blue-600 transition-colors">
                  0120-4348458
                </a>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Phone className="w-3 h-3 text-blue-600 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <span className="text-xs text-gray-500 block">Mobile</span>
                <div className="space-y-1">
                  <a href="tel:+917303397090" className="text-xs font-medium text-gray-800 hover:text-blue-600 transition-colors block">
                    +91 730 339 7090
                  </a>
                  <a href="tel:+919438525025" className="text-xs font-medium text-gray-800 hover:text-blue-600 transition-colors block">
                    +91 943 852 5025
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
};

// Export validation function for use by parent components
CustomerDetails.validateForm = (details) => {
  const validateName = (name) => name && name.trim().length >= 3;
  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePhone = (phone) => /^[6-9]\d{9}$/.test(phone);
  const validateAadhar = (aadhar) => {
    // Check if it's 12 digits and doesn't start with 0 or 1
    return /^[2-9]\d{11}$/.test(aadhar);
  };
  const validatePan = (pan) => /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(pan);
  const validateAddress = (address) => address && address.trim().length >= 5;

  return (
    validateName(details.name) &&
    validateEmail(details.email) &&
    validatePhone(details.phone) &&
    validateAadhar(details.aadhar) &&
    (details.pan ? validatePan(details.pan) : true) && // PAN is optional
    validateAddress(details.address)
  );
};

export default CustomerDetails;

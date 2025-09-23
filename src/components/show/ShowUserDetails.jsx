"use client";
import { useAuth } from '@/context/AuthContext';
import { User, Mail, Phone, CreditCard, MapPin, AlertCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const ShowUserDetails = ({ details, onDetailsChange, onValidationChange }) => {
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
      onDetailsChange({
        ...details,
        email: user.email
      });
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
        address: details.address || '',
        emergencyContact: details.emergencyContact || ''
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
        if (savedProfile.emergencyContact && !profile.emergencyContact) profile.emergencyContact = savedProfile.emergencyContact;
      }

      // If we don't have complete data, check showBookings collection
      if (!profile.name || !profile.phone || !profile.aadhar || !profile.pan || !profile.address) {
        const q = query(
          collection(db, 'showBookings'),
          where('userId', '==', user.uid)
        );
        
        const snapshot = await getDocs(q);
        
        snapshot.forEach((doc) => {
          if (profile.name && profile.phone && profile.aadhar && profile.pan && profile.address) return;
          
          const data = doc.data();
          const userDetails = data.userDetails || data.customerDetails;
          
          if (userDetails) {
            if (!profile.name && userDetails.name?.trim()) {
              profile.name = userDetails.name.trim();
            }
            if (!profile.phone && userDetails.phone?.trim()) {
              profile.phone = userDetails.phone.trim();
            }
            if (!profile.email && userDetails.email?.trim()) {
              profile.email = userDetails.email.trim();
            }
            if (!profile.aadhar && userDetails.aadhar?.trim()) {
              profile.aadhar = userDetails.aadhar.trim();
            }
            if (!profile.pan && userDetails.pan?.trim()) {
              profile.pan = userDetails.pan.trim().toUpperCase();
            }
            if (!profile.address && userDetails.address?.trim()) {
              profile.address = userDetails.address.trim();
            }
            if (!profile.emergencyContact && userDetails.emergencyContact?.trim()) {
              profile.emergencyContact = userDetails.emergencyContact.trim();
            }
          }
        });
      }

      // Update the form with found data
      onDetailsChange({
        ...details,
        ...profile
      });
      
      setUserDataLoaded(true);
    } catch (error) {
      console.error('Error loading user data:', error);
      setUserDataLoaded(true);
    }
  };

  const handleChange = (field, value) => {
    // Format input for phone, aadhar, pan, and emergencyContact
    if (field === 'phone') {
      value = value.replace(/\D/g, '').slice(0, 10);
    } else if (field === 'aadhar') {
      value = value.replace(/\D/g, '').slice(0, 12);
    } else if (field === 'pan') {
      // Format PAN: Allow only alphanumeric, convert to uppercase, max 10 chars
      value = value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 10);
    } else if (field === 'emergencyContact') {
      value = value.replace(/\D/g, '').slice(0, 10);
    }

    onDetailsChange({
      ...details,
      [field]: value
    });

    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
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
    // Check if it's 12 digits and doesn't start with 0 or 1
    const aadharRegex = /^[2-9]\d{11}$/;
    return aadharRegex.test(aadhar);
  };

  const validatePan = (pan) => {
    // PAN format: 5 letters, 4 digits, 1 letter (e.g., ABCDE1234F)
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    return panRegex.test(pan);
  };

  const validateName = (name) => {
    return name && name.trim().length >= 3;
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
        return details.phone && !validatePhone(details.phone) ? 'Please enter a valid 10-digit mobile number starting with 6-9' : '';
      case 'aadhar':
        return details.aadhar && !validateAadhar(details.aadhar) ? 'Please enter a valid 12-digit Aadhar number (cannot start with 0 or 1)' : '';
      case 'pan':
        return details.pan && !validatePan(details.pan) ? 'Please enter a valid PAN number (e.g., ABCDE1234F)' : '';
      case 'address':
        return details.address && !validateAddress(details.address) ? 'Address must be at least 5 characters long' : '';
      case 'emergencyContact':
        return details.emergencyContact && details.emergencyContact.length > 0 && !validatePhone(details.emergencyContact) ? 'Please enter a valid 10-digit mobile number' : '';
      default:
        return '';
    }
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
            value={details.name || ''}
            onChange={(e) => handleChange('name', e.target.value)}
            className={`w-full px-4 py-3 text-gray-900 bg-white border-2 rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 placeholder:text-gray-500 ${
              details.name && !validateName(details.name)
                ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                : 'border-gray-300 focus:ring-purple-500 focus:border-purple-500'
            }`}
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
            value={details.email || ''}
            onChange={(e) => handleChange('email', e.target.value)}
            className={`w-full px-4 py-3 text-gray-900 bg-white border-2 rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 placeholder:text-gray-500 ${
              details.email && !validateEmail(details.email)
                ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                : 'border-gray-300 focus:ring-purple-500 focus:border-purple-500'
            }`}
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
            value={details.phone || ''}
            onChange={(e) => handleChange('phone', e.target.value.replace(/\D/g, ''))}
            maxLength="10"
            className={`w-full px-4 py-3 text-gray-900 bg-white border-2 rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 placeholder:text-gray-500 ${
              details.phone && !validatePhone(details.phone)
                ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                : 'border-gray-300 focus:ring-purple-500 focus:border-purple-500'
            }`}
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
            value={details.aadhar || ''}
            onChange={(e) => handleChange('aadhar', e.target.value.replace(/\D/g, ''))}
            maxLength="12"
            className={`w-full px-4 py-3 text-gray-900 bg-white border-2 rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 placeholder:text-gray-500 ${
              details.aadhar && !validateAadhar(details.aadhar)
                ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                : 'border-gray-300 focus:ring-purple-500 focus:border-purple-500'
            }`}
            placeholder="Enter 12-digit Aadhar number (cannot start with 0 or 1)"
            required
          />
          {details.aadhar && !validateAadhar(details.aadhar) && (
            <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              Please enter a valid 12-digit Aadhar number (cannot start with 0 or 1)
              </p>
          )}
        </div>

        {/* PAN Number */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              PAN Number (Optional)
            </div>
          </label>
          <input
            type="text"
            value={details.pan || ''}
            onChange={(e) => handleChange('pan', e.target.value)}
            maxLength="10"
            className={`w-full px-4 py-3 text-gray-900 bg-white border-2 rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 placeholder:text-gray-500 uppercase ${
              details.pan && !validatePan(details.pan)
                ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                : 'border-gray-300 focus:ring-purple-500 focus:border-purple-500'
            }`}
            placeholder="Enter PAN number (e.g., ABCDE1234F)"
            style={{ textTransform: 'uppercase' }}
          />
          {details.pan && !validatePan(details.pan) && (
            <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              Please enter a valid PAN number (e.g., ABCDE1234F)
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
            value={details.address || ''}
            onChange={(e) => handleChange('address', e.target.value)}
            rows="3"
            className={`w-full px-4 py-3 text-gray-900 bg-white border-2 rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 placeholder:text-gray-500 resize-none ${
              details.address && !validateAddress(details.address)
                ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                : 'border-gray-300 focus:ring-purple-500 focus:border-purple-500'
            }`}
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
            value={details.emergencyContact || ''}
            onChange={(e) => handleChange('emergencyContact', e.target.value.replace(/\D/g, ''))}
            maxLength="10"
            className={`w-full px-4 py-3 text-gray-900 bg-white border-2 rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 placeholder:text-gray-500 ${
              details.emergencyContact && details.emergencyContact.length > 0 && !validatePhone(details.emergencyContact)
                ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                : 'border-gray-300 focus:ring-purple-500 focus:border-purple-500'
            }`}
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

      
    </div>
  );
};

// Static validation method for external usage
ShowUserDetails.validateForm = (details) => {
  const validatePhone = (phone) => {
    const phoneRegex = /^[6-9]\d{9}$/;
    return phoneRegex.test(phone);
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
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

  const validateName = (name) => {
    return name && name.trim().length >= 3;
  };

  const validateAddress = (address) => {
    return address && address.trim().length >= 5;
  };

  return (
    validateName(details.name) &&
    validateEmail(details.email) &&
    validatePhone(details.phone) &&
    validateAadhar(details.aadhar) &&
    (details.pan ? validatePan(details.pan) : true) && // PAN is optional
    validateAddress(details.address)
  );
};

export default ShowUserDetails;

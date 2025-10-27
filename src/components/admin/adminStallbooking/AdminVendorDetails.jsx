"use client";
import { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Building, CreditCard, AlertCircle } from 'lucide-react';

const AdminVendorDetails = ({ details, onDetailsChange, onValidationChange }) => {
  const [errors, setErrors] = useState({});

  // Validate form and notify parent component
  useEffect(() => {
    const isValid = validateForm();
    if (onValidationChange) {
      onValidationChange(isValid);
    }
  }, [details, onValidationChange]);

  const businessTypes = [
    'Food & Beverages', 'Clothing & Textiles', 'Handicrafts & Art',
    'Jewelry & Accessories', 'Books & Literature', 'Religious Items',
    'Electronics & Gadgets', 'Health & Wellness', 'Beauty & Cosmetics',
    'Home & Garden', 'Toys & Games', 'Sports & Fitness', 'Other'
  ];

  const handleInputChange = (field, value) => {
    // Format input for phone, aadhar, and pan
    if (field === 'phone') {
      value = value.replace(/\D/g, '').slice(0, 10);
    } else if (field === 'aadhar') {
      value = value.replace(/\D/g, '').slice(0, 12);
    } else if (field === 'pan') {
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

  const validateBusinessType = (businessType) => {
    return businessType && businessType.trim() !== '';
  };

  const validateOwnerName = (ownerName) => {
    return ownerName && ownerName.trim().length >= 3;
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
    const cleanAadhar = aadhar.replace(/\s/g, '');
    const aadharRegex = /^[2-9]\d{11}$/;
    return aadharRegex.test(cleanAadhar);
  };

  const validatePan = (pan) => {
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    return panRegex.test(pan);
  };

  const validateAddress = (address) => {
    return address && address.trim().length >= 5;
  };

  const validateForm = () => {
    return (
      validateBusinessType(details.businessType) &&
      validateOwnerName(details.ownerName) &&
      validateEmail(details.email) &&
      validatePhone(details.phone) &&
      validateAadhar(details.aadhar) &&
      (details.pan ? validatePan(details.pan) : true) && // PAN is optional
      validateAddress(details.address)
    );
  };

  const getFieldError = (field) => {
    switch (field) {
      case 'businessType':
        return details.businessType && !validateBusinessType(details.businessType) ? 'Please select a business type' : '';
      case 'ownerName':
        return details.ownerName && !validateOwnerName(details.ownerName) ? 'Name must be at least 3 characters long' : '';
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
      default:
        return '';
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-2">
      {/* Compact Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg mb-3">
          <Building className="w-6 h-6 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-1">Vendor Information</h2>
        <p className="text-gray-600">Enter vendor booking details manually</p>
      </div>

      {/* Compact Form Card */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4">
        <div className="space-y-4">
          {/* Compact 3-column grid on larger screens */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            
            {/* Business Type */}
            <div className="lg:col-span-1">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Building className="w-4 h-4 text-blue-500" />
                Business Type *
              </label>
              <select
                value={details.businessType || ''}
                onChange={(e) => handleInputChange('businessType', e.target.value)}
                className={`w-full px-3 py-2.5 text-sm border-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors placeholder:text-gray-500 text-gray-700 ${
                  getFieldError('businessType') ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <option value="">Select business type</option>
                {businessTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              {getFieldError('businessType') && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {getFieldError('businessType')}
                </p>
              )}
            </div>

            {/* Contact Person Name */}
            <div className="lg:col-span-1">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <User className="w-4 h-4 text-green-500" />
                Contact Person *
              </label>
              <input
                type="text"
                value={details.ownerName || ''}
                onChange={(e) => handleInputChange('ownerName', e.target.value)}
                className={`w-full px-3 py-2.5 text-sm border-2 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors placeholder:text-gray-500 text-gray-700 ${
                  getFieldError('ownerName') ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                }`}
                placeholder="Vendor's full name"
                required
              />
              {getFieldError('ownerName') && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {getFieldError('ownerName')}
                </p>
              )}
            </div>

            {/* Mobile */}
            <div className="lg:col-span-1">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Phone className="w-4 h-4 text-orange-500" />
                Mobile Number *
              </label>
              <input
                type="tel"
                value={details.phone || ''}
                onChange={(e) => handleInputChange('phone', e.target.value.replace(/\D/g, ''))}
                className={`w-full px-3 py-2.5 text-sm border-2 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors placeholder:text-gray-500 text-gray-700 ${
                  getFieldError('phone') ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                }`}
                placeholder="Enter 10-digit mobile number"
                maxLength={10}
                required
              />
              {getFieldError('phone') && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {getFieldError('phone')}
                </p>
              )}
            </div>

            {/* Email - spans 2 columns on large screens - NO AUTO-FILL */}
            <div className="lg:col-span-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Mail className="w-4 h-4 text-purple-500" />
                Email Address *
                <span className="text-xs text-gray-500">(Manually enter vendor's email)</span>
              </label>
              <input
                type="email"
                value={details.email || ''}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={`w-full px-3 py-2.5 text-sm border-2 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors placeholder:text-gray-500 text-gray-700 ${
                  getFieldError('email') ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                }`}
                placeholder="vendor.email@example.com"
                required
              />
              {getFieldError('email') && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {getFieldError('email')}
                </p>
              )}
            </div>

            {/* Aadhar Number */}
            <div className="lg:col-span-1">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <CreditCard className="w-4 h-4 text-pink-500" />
                Aadhar Number *
              </label>
              <input
                type="text"
                value={details.aadhar || ''}
                onChange={(e) => {
                  let value = e.target.value.replace(/\D/g, '');
                  if (value.length > 12) value = value.slice(0, 12);
                  if (value.length > 4 && value.length <= 8) {
                    value = value.slice(0, 4) + ' ' + value.slice(4);
                  } else if (value.length > 8) {
                    value = value.slice(0, 4) + ' ' + value.slice(4, 8) + ' ' + value.slice(8);
                  }
                  handleInputChange('aadhar', value);
                }}
                className={`w-full px-3 py-2.5 text-sm border-2 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors placeholder:text-gray-500 text-gray-700 ${
                  getFieldError('aadhar') ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                }`}
                placeholder="Enter 12-digit Aadhar"
                maxLength={14}
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
            <div className="lg:col-span-1">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <CreditCard className="w-4 h-4 text-yellow-500" />
                PAN Number (Optional)
              </label>
              <input
                type="text"
                value={details.pan || ''}
                onChange={(e) => handleInputChange('pan', e.target.value)}
                className={`w-full px-3 py-2.5 text-sm border-2 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors placeholder:text-gray-500 text-gray-700 uppercase ${
                  getFieldError('pan') ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                }`}
                placeholder="ABCDE1234F"
                maxLength={10}
                style={{ textTransform: 'uppercase' }}
              />
              {getFieldError('pan') && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {getFieldError('pan')}
                </p>
              )}
            </div>

            {/* Address - Full width */}
            <div className="col-span-full">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <MapPin className="w-4 h-4 text-indigo-500" />
                Complete Address *
              </label>
              <textarea
                value={details.address || ''}
                onChange={(e) => handleInputChange('address', e.target.value)}
                className={`w-full px-3 py-2.5 text-sm border-2 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors resize-none placeholder:text-gray-500 text-gray-700 ${
                  getFieldError('address') ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                }`}
                rows={2}
                placeholder="Enter vendor's complete address"
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
        </div>

        {/* Compact Notes */}
        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
          <h4 className="font-medium text-blue-800 mb-2 flex items-center gap-1 text-sm">
            <span>ℹ️</span>
            Important Notes
          </h4>
          <ul className="text-xs text-blue-700 space-y-0.5">
            <li>• Valid for entire 5-day event</li>
            <li>• Email will receive booking confirmation</li>
            <li>• Booking will appear in vendor's profile</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AdminVendorDetails;

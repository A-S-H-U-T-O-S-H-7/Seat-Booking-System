"use client";
import { useState } from 'react';
import { User, Mail, Phone, MapPin, Building, CreditCard } from 'lucide-react';

const VendorDetails = ({ details, onDetailsChange }) => {
  const [errors, setErrors] = useState({});

  const businessTypes = [
    'Food & Beverages',
    'Clothing & Textiles',
    'Handicrafts & Art',
    'Jewelry & Accessories',
    'Books & Literature',
    'Religious Items',
    'Electronics & Gadgets',
    'Health & Wellness',
    'Beauty & Cosmetics',
    'Home & Garden',
    'Toys & Games',
    'Sports & Fitness',
    'Other'
  ];

  const handleInputChange = (field, value) => {
    onDetailsChange({
      ...details,
      [field]: value
    });

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors({
        ...errors,
        [field]: ''
      });
    }
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone) => {
    const phoneRegex = /^[6-9]\d{9}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  };

  const validateAadhar = (aadhar) => {
    const aadharRegex = /^[2-9]\d{3}\s?\d{4}\s?\d{4}$/;
    return !aadhar || aadharRegex.test(aadhar.replace(/\s/g, '')); // Optional field
  };

  const validateForm = () => {
    const newErrors = {};

    if (!details.businessType) {
      newErrors.businessType = 'Please select business type';
    }

    if (!details.ownerName?.trim()) {
      newErrors.ownerName = 'Contact person name is required';
    }

    if (!details.email?.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(details.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!details.address?.trim()) {
      newErrors.address = 'Address is required';
    }

    if (!details.phone?.trim()) {
      newErrors.phone = 'Mobile number is required';
    } else if (!validatePhone(details.phone)) {
      newErrors.phone = 'Please enter a valid 10-digit mobile number';
    }

    if (!details.aadhar?.trim()) {
      newErrors.aadhar = 'Aadhar number is required';
    } else if (details.aadhar && !validateAadhar(details.aadhar)) {
      newErrors.aadhar = 'Please enter a valid 12-digit Aadhar number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Beautiful Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 rounded-2xl shadow-lg mb-4">
          <Building className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-800 via-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
          Vendor Information
        </h2>
        <p className="text-gray-600 text-lg font-medium">
          Complete your booking details
        </p>
      </div>

      {/* Compact Form Card */}
      <div className="bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-6 md:p-8">
        <form className="space-y-8">
          {/* Compact Grid Layout with Only Required Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Business Type */}
            <div className="relative">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Building className="w-5 h-5 text-white" />
                </div>
                <label className="text-sm font-semibold text-gray-700">
                  Business Type *
                </label>
              </div>
              <select
                value={details.businessType || ''}
                onChange={(e) => handleInputChange('businessType', e.target.value)}
                className={`w-full px-4 py-4 text-gray-900 bg-white/80 backdrop-blur-sm border-2 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 shadow-sm hover:shadow-md ${
                  errors.businessType ? 'border-red-300 bg-red-50/80' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <option value="" className="text-gray-500">Select your business type</option>
                {businessTypes.map(type => (
                  <option key={type} value={type} className="text-gray-900">{type}</option>
                ))}
              </select>
              {errors.businessType && (
                <p className="mt-2 text-sm text-red-600 font-medium">{errors.businessType}</p>
              )}
            </div>

            {/* Contact Person Name */}
            <div className="relative">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                  <User className="w-5 h-5 text-white" />
                </div>
                <label className="text-sm font-semibold text-gray-700">
                  Contact Person Name *
                </label>
              </div>
              <input
                type="text"
                value={details.ownerName || ''}
                onChange={(e) => handleInputChange('ownerName', e.target.value)}
                className={`w-full px-4 py-4 text-gray-900 bg-white/80 backdrop-blur-sm border-2 rounded-xl focus:ring-4 focus:ring-green-500/20 focus:border-green-500 transition-all duration-300 shadow-sm hover:shadow-md ${
                  errors.ownerName ? 'border-red-300 bg-red-50/80' : 'border-gray-200 hover:border-gray-300'
                }`}
                placeholder="Enter your full name"
              />
              {errors.ownerName && (
                <p className="mt-2 text-sm text-red-600 font-medium">{errors.ownerName}</p>
              )}
            </div>

            {/* Email */}
            <div className="relative">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Mail className="w-5 h-5 text-white" />
                </div>
                <label className="text-sm font-semibold text-gray-700">
                  Email Address *
                </label>
              </div>
              <input
                type="email"
                value={details.email || ''}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={`w-full px-4 py-4 text-gray-900 bg-white/80 backdrop-blur-sm border-2 rounded-xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-300 shadow-sm hover:shadow-md ${
                  errors.email ? 'border-red-300 bg-red-50/80' : 'border-gray-200 hover:border-gray-300'
                }`}
                placeholder="your.email@example.com"
              />
              {errors.email && (
                <p className="mt-2 text-sm text-red-600 font-medium">{errors.email}</p>
              )}
            </div>

            {/* Mobile */}
            <div className="relative">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Phone className="w-5 h-5 text-white" />
                </div>
                <label className="text-sm font-semibold text-gray-700">
                  Mobile Number *
                </label>
              </div>
              <input
                type="tel"
                value={details.phone || ''}
                onChange={(e) => handleInputChange('phone', e.target.value.replace(/\D/g, ''))}
                className={`w-full px-4 py-4 text-gray-900 bg-white/80 backdrop-blur-sm border-2 rounded-xl focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-300 shadow-sm hover:shadow-md ${
                  errors.phone ? 'border-red-300 bg-red-50/80' : 'border-gray-200 hover:border-gray-300'
                }`}
                placeholder="9876543210"
                maxLength={10}
              />
              {errors.phone && (
                <p className="mt-2 text-sm text-red-600 font-medium">{errors.phone}</p>
              )}
            </div>

            {/* Aadhar Number */}
            <div className="relative">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                  <CreditCard className="w-5 h-5 text-white" />
                </div>
                <label className="text-sm font-semibold text-gray-700">
                  Aadhar Number *
                </label>
              </div>
              <input
                type="text"
                value={details.aadhar || ''}
                onChange={(e) => {
                  let value = e.target.value.replace(/\D/g, ''); // Only numbers
                  if (value.length > 12) value = value.slice(0, 12); // Max 12 digits
                  // Format as XXXX XXXX XXXX
                  if (value.length > 4 && value.length <= 8) {
                    value = value.slice(0, 4) + ' ' + value.slice(4);
                  } else if (value.length > 8) {
                    value = value.slice(0, 4) + ' ' + value.slice(4, 8) + ' ' + value.slice(8);
                  }
                  handleInputChange('aadhar', value);
                }}
                className={`w-full px-4 py-4 text-gray-900 bg-white/80 backdrop-blur-sm border-2 rounded-xl focus:ring-4 focus:ring-pink-500/20 focus:border-pink-500 transition-all duration-300 shadow-sm hover:shadow-md ${
                  errors.aadhar ? 'border-red-300 bg-red-50/80' : 'border-gray-200 hover:border-gray-300'
                }`}
                placeholder="1234 5678 9012"
                maxLength={14} // Including spaces
              />
              {errors.aadhar && (
                <p className="mt-2 text-sm text-red-600 font-medium">{errors.aadhar}</p>
              )}
            </div>

            {/* Address - Full Width */}
            <div className="relative md:col-span-2">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <label className="text-sm font-semibold text-gray-700">
                  Complete Address *
                </label>
              </div>
              <textarea
                value={details.address || ''}
                onChange={(e) => handleInputChange('address', e.target.value)}
                className={`w-full px-4 py-4 text-gray-900 bg-white/80 backdrop-blur-sm border-2 rounded-xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-300 shadow-sm hover:shadow-md resize-none ${
                  errors.address ? 'border-red-300 bg-red-50/80' : 'border-gray-200 hover:border-gray-300'
                }`}
                rows={3}
                placeholder="Enter your complete address with city, state and pincode"
              />
              {errors.address && (
                <p className="mt-2 text-sm text-red-600 font-medium">{errors.address}</p>
              )}
            </div>

          </div>
        </form>

        {/* Important Notes */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
            <span>ℹ️</span>
            Important Notes
          </h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Stall booking is valid for the entire 5-day event period</li>
            <li>• Basic facilities (electricity, water) are included in the price</li>
            <li>• Setup allowed 2 hours before event start time</li>
            <li>• Cancellation allowed up to 20 days before event start</li>
            <li>• Please ensure all information is accurate for booking confirmation</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default VendorDetails;

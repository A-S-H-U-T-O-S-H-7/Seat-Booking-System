"use client";
import { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Building, CreditCard } from 'lucide-react';

import { useAuth } from '@/context/AuthContext';

const VendorDetails = ({ details, onDetailsChange }) => {
  const [errors, setErrors] = useState({});
  const { user } = useAuth();

  // Auto-populate email when component mounts or user changes
  useEffect(() => {
    if (user?.email && (!details.email || details.email === '')) {
      onDetailsChange({
        ...details,
        email: user.email
      });
    }
  }, [user?.email, details.email, onDetailsChange]); // Include all dependencies

  const businessTypes = [
    'Food & Beverages', 'Clothing & Textiles', 'Handicrafts & Art',
    'Jewelry & Accessories', 'Books & Literature', 'Religious Items',
    'Electronics & Gadgets', 'Health & Wellness', 'Beauty & Cosmetics',
    'Home & Garden', 'Toys & Games', 'Sports & Fitness', 'Other'
  ];

  const handleInputChange = (field, value) => {
    onDetailsChange({
      ...details,
      [field]: value
    });

    if (errors[field]) {
      setErrors({
        ...errors,
        [field]: ''
      });
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
        <p className="text-gray-600">Complete your booking details</p>
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
                className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors hover:border-gray-400 placeholder:text-gray-500 text-gray-700"
              >
                <option value="">Select business type</option>
                {businessTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
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
                className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors hover:border-gray-400 placeholder:text-gray-500 text-gray-700"
                placeholder="Your full name"
              />
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
                className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors hover:border-gray-400 placeholder:text-gray-500 text-gray-700"
                placeholder="Your Mobile Number"
                maxLength={10}
              />
            </div>

            {/* Email - spans 2 columns on large screens */}
            <div className="lg:col-span-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Mail className="w-4 h-4 text-purple-500" />
                Email Address *
                {user?.email && details.email === user.email && (
                  <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded">Auto-filled from account</span>
                )}
              </label>
              <input
                type="email"
                value={details.email || ''}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={`w-full px-3 py-2.5 text-sm border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors placeholder:text-gray-500 text-gray-700 ${
                  user?.email && details.email === user.email ? 'bg-blue-50 border-blue-200' : 'border-gray-300 hover:border-gray-400'
                }`}
                placeholder="your.email@example.com"
              />
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
                className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors hover:border-gray-400 placeholder:text-gray-500 text-gray-700"
                placeholder="Enter Your Aadhar Number"
                maxLength={14}
              />
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
                className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors resize-none hover:border-gray-400 placeholder:text-gray-500 text-gray-700"
                rows={2}
                placeholder="Enter complete address with city, state and pincode"
              />
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
            <li>• Basic facilities included</li>
            <li>• Setup: 2hrs before start</li>
            <li>• Cancellation: 20 days prior</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default VendorDetails;
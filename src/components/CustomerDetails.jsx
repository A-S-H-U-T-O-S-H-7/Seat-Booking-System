"use client";
import { useAuth } from '@/context/AuthContext';
import { Calendar, Clock, Info, Mail, Phone, RefreshCw, User } from 'lucide-react';
import { useEffect } from 'react';

const CustomerDetails = ({ details, onDetailsChange }) => {
  const { user } = useAuth();

  // Pre-fill email from user account
  useEffect(() => {
    if (user?.email && !details.email) {
      onDetailsChange(prev => ({
        ...prev,
        email: user.email
      }));
    }
  }, [user, details.email, onDetailsChange]);

  const handleChange = (field, value) => {
    onDetailsChange(prev => ({
      ...prev,
      [field]: value
    }));
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
              value={details.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className="w-full px-4 py-3 text-gray-900 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 placeholder-gray-500"
              placeholder="Enter your full name"
              required
            />
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Address *
          </label>
          <input
            type="email"
            value={details.email}
            onChange={(e) => handleChange('email', e.target.value)}
            className="w-full px-4 py-3 text-gray-900 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 placeholder-gray-500"
            placeholder="Enter your email"
            required
          />
          {details.email && !validateEmail(details.email) && (
            <p className="text-red-500 text-xs mt-1">Please enter a valid email address</p>
          )}
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number *
          </label>
          <input
            type="tel"
            value={details.phone}
            onChange={(e) => handleChange('phone', e.target.value.replace(/\D/g, ''))}
            maxLength="10"
            className="w-full px-4 py-3 text-gray-900 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 placeholder-gray-500"
            placeholder="Enter 10-digit mobile number"
            required
          />
          {details.phone && !validatePhone(details.phone) && (
            <p className="text-red-500 text-xs mt-1">Please enter a valid 10-digit mobile number</p>
          )}
        </div>

        {/* Aadhar Card */}
<div>
  <label className="block text-sm font-medium text-gray-700 mb-2">
    Aadhar Card Number *
  </label>
  <input
    type="text"
    value={details.aadhar}
    onChange={(e) => handleChange('aadhar', e.target.value.replace(/\D/g, ''))}
    maxLength="12"
    className="w-full px-4 py-3 text-gray-900 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 placeholder-gray-500"
    placeholder="Enter 12-digit Aadhar number"
    required
  />
  {details.aadhar && !validateAadhar(details.aadhar) && (
    <p className="text-red-500 text-xs mt-1">Please enter a valid 12-digit Aadhar number</p>
  )}
</div>

        {/* Address */}
        <div >
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Address
          </label>
          <textarea
            value={details.address}
            onChange={(e) => handleChange('address', e.target.value)}
            rows="3"
            className="w-full px-4 py-3 text-gray-900 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 placeholder-gray-500 resize-none"
            placeholder="Enter your complete address"
          />
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
            <span className="text-xs text-gray-700">Arrive 15 minutes before event starts</span>
          </div>
          
          <div className="flex items-center gap-2 p-2 bg-white bg-opacity-60 rounded border border-amber-200">
            <Calendar className="w-3 h-3 text-amber-600 flex-shrink-0" />
            <span className="text-xs text-gray-700">Seats reserved for selected date and shift only</span>
          </div>
          
          <div className="flex items-center gap-2 p-2 bg-white bg-opacity-60 rounded border border-amber-200">
            <RefreshCw className="w-3 h-3 text-amber-600 flex-shrink-0" />
            <span className="text-xs text-gray-700">Full refund if canceled 15+ days before event</span>
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

export default CustomerDetails;

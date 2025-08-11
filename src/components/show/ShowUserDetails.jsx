"use client";
import { useState, useEffect } from 'react';
import { useShowSeatBooking } from '@/context/ShowSeatBookingContext';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { toast } from 'react-hot-toast';
import { ArrowLeftIcon, ArrowRightIcon, UserIcon, PhoneIcon, EnvelopeIcon } from '@heroicons/react/24/outline';

export default function ShowUserDetails({ onNext, onBack }) {
  const { setBookingData, selectedSeats, seats, totalPrice, totalCapacity } = useShowSeatBooking();
  const { user } = useAuth();
  const { isDarkMode } = useTheme();

  const [formData, setFormData] = useState({
    fullName: '',
    email: user?.email || '',
    phone: '',
    alternatePhone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    emergencyContact: {
      name: '',
      phone: '',
      relation: ''
    },
    specialRequests: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (user?.email) {
      setFormData(prev => ({
        ...prev,
        email: user.email
      }));
    }
  }, [user]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Please enter a valid 10-digit phone number';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }

    if (!formData.state.trim()) {
      newErrors.state = 'State is required';
    }

    if (!formData.pincode.trim()) {
      newErrors.pincode = 'Pincode is required';
    } else if (!/^\d{6}$/.test(formData.pincode)) {
      newErrors.pincode = 'Please enter a valid 6-digit pincode';
    }

    // Emergency contact validation
    if (formData.emergencyContact.name.trim() && !formData.emergencyContact.phone.trim()) {
      newErrors.emergencyPhone = 'Emergency contact phone is required if name is provided';
    }

    if (formData.emergencyContact.phone.trim() && !/^\d{10}$/.test(formData.emergencyContact.phone.replace(/\D/g, ''))) {
      newErrors.emergencyPhone = 'Please enter a valid emergency contact phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('emergencyContact.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        emergencyContact: {
          ...prev.emergencyContact,
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleContinue = () => {
    if (validateForm()) {
      setBookingData({ userDetails: formData });
      onNext();
    } else {
      toast.error('Please fill in all required fields correctly');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`p-6 rounded-lg border ${
        isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <div className="flex items-center gap-3 mb-4">
          <UserIcon className={`w-6 h-6 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`} />
          <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Contact Information
          </h2>
        </div>
        
        <div className={`p-4 rounded-lg ${
          isDarkMode ? 'bg-gray-700' : 'bg-blue-50'
        }`}>
          <div className="flex items-center justify-between text-sm">
            <span className={isDarkMode ? 'text-gray-300' : 'text-blue-800'}>
              Selected: {selectedSeats.length} seats for {totalCapacity} people
            </span>
            <span className={`font-semibold ${isDarkMode ? 'text-gray-300' : 'text-blue-800'}`}>
              Total: ₹{totalPrice.toLocaleString('en-IN')}
            </span>
          </div>
        </div>
      </div>

      {/* Personal Information */}
      <div className={`p-6 rounded-lg border ${
        isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Personal Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Full Name *
            </label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              className={`block w-full px-3 py-2 rounded-md border transition-colors focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                errors.fullName 
                  ? 'border-red-500' 
                  : isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
              placeholder="Enter your full name"
            />
            {errors.fullName && (
              <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>
            )}
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Email Address *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              disabled={!!user?.email}
              className={`block w-full px-3 py-2 rounded-md border transition-colors focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                errors.email 
                  ? 'border-red-500' 
                  : isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              } ${user?.email ? 'opacity-75 cursor-not-allowed' : ''}`}
              placeholder="Enter your email address"
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email}</p>
            )}
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Phone Number *
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className={`block w-full px-3 py-2 rounded-md border transition-colors focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                errors.phone 
                  ? 'border-red-500' 
                  : isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
              placeholder="Enter your phone number"
            />
            {errors.phone && (
              <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
            )}
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Alternate Phone
            </label>
            <input
              type="tel"
              name="alternatePhone"
              value={formData.alternatePhone}
              onChange={handleInputChange}
              className={`block w-full px-3 py-2 rounded-md border transition-colors focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
              placeholder="Enter alternate phone number"
            />
          </div>
        </div>
      </div>

      {/* Address Information */}
      <div className={`p-6 rounded-lg border ${
        isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Address Information
        </h3>

        <div className="space-y-4">
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Address *
            </label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              rows="2"
              className={`block w-full px-3 py-2 rounded-md border transition-colors focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                errors.address 
                  ? 'border-red-500' 
                  : isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
              placeholder="Enter your complete address"
            />
            {errors.address && (
              <p className="text-red-500 text-xs mt-1">{errors.address}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                City *
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                className={`block w-full px-3 py-2 rounded-md border transition-colors focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                  errors.city 
                    ? 'border-red-500' 
                    : isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
                placeholder="Enter your city"
              />
              {errors.city && (
                <p className="text-red-500 text-xs mt-1">{errors.city}</p>
              )}
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                State *
              </label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleInputChange}
                className={`block w-full px-3 py-2 rounded-md border transition-colors focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                  errors.state 
                    ? 'border-red-500' 
                    : isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
                placeholder="Enter your state"
              />
              {errors.state && (
                <p className="text-red-500 text-xs mt-1">{errors.state}</p>
              )}
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Pincode *
              </label>
              <input
                type="text"
                name="pincode"
                value={formData.pincode}
                onChange={handleInputChange}
                className={`block w-full px-3 py-2 rounded-md border transition-colors focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                  errors.pincode 
                    ? 'border-red-500' 
                    : isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
                placeholder="Enter your pincode"
              />
              {errors.pincode && (
                <p className="text-red-500 text-xs mt-1">{errors.pincode}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Emergency Contact */}
      <div className={`p-6 rounded-lg border ${
        isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Emergency Contact (Optional)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Contact Name
            </label>
            <input
              type="text"
              name="emergencyContact.name"
              value={formData.emergencyContact.name}
              onChange={handleInputChange}
              className={`block w-full px-3 py-2 rounded-md border transition-colors focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
              placeholder="Emergency contact name"
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Contact Phone
            </label>
            <input
              type="tel"
              name="emergencyContact.phone"
              value={formData.emergencyContact.phone}
              onChange={handleInputChange}
              className={`block w-full px-3 py-2 rounded-md border transition-colors focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                errors.emergencyPhone 
                  ? 'border-red-500' 
                  : isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
              placeholder="Emergency contact phone"
            />
            {errors.emergencyPhone && (
              <p className="text-red-500 text-xs mt-1">{errors.emergencyPhone}</p>
            )}
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Relation
            </label>
            <select
              name="emergencyContact.relation"
              value={formData.emergencyContact.relation}
              onChange={handleInputChange}
              className={`block w-full px-3 py-2 rounded-md border transition-colors focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="">Select relation</option>
              <option value="parent">Parent</option>
              <option value="spouse">Spouse</option>
              <option value="sibling">Sibling</option>
              <option value="child">Child</option>
              <option value="friend">Friend</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
      </div>

      {/* Special Requests */}
      <div className={`p-6 rounded-lg border ${
        isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Special Requests (Optional)
        </h3>

        <textarea
          name="specialRequests"
          value={formData.specialRequests}
          onChange={handleInputChange}
          rows="3"
          className={`block w-full px-3 py-2 rounded-md border transition-colors focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
            isDarkMode 
              ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
              : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
          }`}
          placeholder="Any special requirements, accessibility needs, or requests..."
        />
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <button
          onClick={onBack}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
            isDarkMode 
              ? 'bg-gray-700 hover:bg-gray-600 text-white' 
              : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
          }`}
        >
          <ArrowLeftIcon className="w-5 h-5" />
          Back to Seat Selection
        </button>

        <button
          onClick={handleContinue}
          className="flex items-center gap-2 px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-all duration-200 shadow-lg hover:scale-105"
        >
          Continue to Review
          <ArrowRightIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

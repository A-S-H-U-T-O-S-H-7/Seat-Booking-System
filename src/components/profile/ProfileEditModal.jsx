"use client";
import { useState, useEffect } from 'react';
import { X, Save, User, Mail, Phone, CreditCard, MapPin, Shield, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const ProfileEditModal = ({ isOpen, onClose, userProfile, user, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    aadhar: '',
    address: '',
    emergencyContact: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (userProfile && isOpen) {
      setFormData({
        name: userProfile.name || '',
        email: userProfile.email || user?.email || '',
        phone: userProfile.phone || '',
        aadhar: userProfile.aadhar || '',
        address: userProfile.address || '',
        emergencyContact: userProfile.emergencyContact || ''
      });
      setErrors({});
    }
  }, [userProfile, user, isOpen]);

  const validateField = (field, value) => {
    switch (field) {
      case 'name':
        return value.trim().length >= 3 ? '' : 'Name must be at least 3 characters';
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(value) ? '' : 'Please enter a valid email address';
      case 'phone':
        const phoneRegex = /^[6-9]\d{9}$/;
        return phoneRegex.test(value) ? '' : 'Please enter a valid 10-digit mobile number';
      case 'aadhar':
        if (!value.trim()) return ''; // Optional field
        const aadharRegex = /^\d{12}$/;
        return aadharRegex.test(value) ? '' : 'Please enter a valid 12-digit Aadhar number';
      case 'address':
        return value.trim().length >= 5 ? '' : 'Address must be at least 5 characters';
      case 'emergencyContact':
        if (!value.trim()) return ''; // Optional field
        const emergencyPhoneRegex = /^[6-9]\d{9}$/;
        return emergencyPhoneRegex.test(value) ? '' : 'Please enter a valid 10-digit mobile number';
      default:
        return '';
    }
  };

  const handleInputChange = (field, value) => {
    // Special formatting for phone numbers and aadhar
    if (field === 'phone' || field === 'emergencyContact') {
      value = value.replace(/\D/g, '').slice(0, 10);
    } else if (field === 'aadhar') {
      value = value.replace(/\D/g, '').slice(0, 12);
    }

    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Validate field on change
    const error = validateField(field, value);
    setErrors(prev => ({ ...prev, [field]: error }));
  };

  const handleSave = async () => {
    // Validate all fields
    const newErrors = {};
    Object.keys(formData).forEach(field => {
      if (field === 'email' || field === 'name' || field === 'phone' || field === 'address') {
        // Required fields
        const error = validateField(field, formData[field]);
        if (error) newErrors[field] = error;
      } else {
        // Optional fields
        if (formData[field].trim()) {
          const error = validateField(field, formData[field]);
          if (error) newErrors[field] = error;
        }
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error('Please fix the validation errors before saving');
      return;
    }

    setLoading(true);
    try {
      // Save user profile to Firestore
      const userProfileRef = doc(db, 'userProfiles', user.uid);
      const profileData = {
        ...formData,
        updatedAt: new Date(),
        userId: user.uid
      };

      await setDoc(userProfileRef, profileData, { merge: true });
      
      toast.success('Profile updated successfully!');
      onSave?.(profileData);
      onClose();
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Failed to save profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="relative bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white">Edit Profile</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-white hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="space-y-6">
            {/* Personal Information Section */}
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <User className="w-5 h-5 text-orange-500" />
                <span>Personal Information</span>
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Full Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors ${
                      errors.name ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'
                    }`}
                    placeholder="Enter your full name"
                  />
                  {errors.name && (
                    <p className="text-red-500 text-xs mt-1 flex items-center space-x-1">
                      <AlertCircle className="w-3 h-3" />
                      <span>{errors.name}</span>
                    </p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className={`w-full pl-12 pr-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors ${
                        errors.email ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'
                      }`}
                      placeholder="Enter your email"
                    />
                  </div>
                  {errors.email && (
                    <p className="text-red-500 text-xs mt-1 flex items-center space-x-1">
                      <AlertCircle className="w-3 h-3" />
                      <span>{errors.email}</span>
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Contact Information Section */}
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <Phone className="w-5 h-5 text-orange-500" />
                <span>Contact Information</span>
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      maxLength="10"
                      className={`w-full pl-12 pr-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors ${
                        errors.phone ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'
                      }`}
                      placeholder="10-digit mobile number"
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-red-500 text-xs mt-1 flex items-center space-x-1">
                      <AlertCircle className="w-3 h-3" />
                      <span>{errors.phone}</span>
                    </p>
                  )}
                </div>

                {/* Emergency Contact */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Emergency Contact (Optional)
                  </label>
                  <div className="relative">
                    <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="tel"
                      value={formData.emergencyContact}
                      onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
                      maxLength="10"
                      className={`w-full pl-12 pr-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors ${
                        errors.emergencyContact ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'
                      }`}
                      placeholder="Emergency contact number"
                    />
                  </div>
                  {errors.emergencyContact && (
                    <p className="text-red-500 text-xs mt-1 flex items-center space-x-1">
                      <AlertCircle className="w-3 h-3" />
                      <span>{errors.emergencyContact}</span>
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Identity & Address Section */}
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <CreditCard className="w-5 h-5 text-orange-500" />
                <span>Identity & Address</span>
              </h4>
              
              <div className="space-y-4">
                {/* Aadhar */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Aadhar Number (Optional)
                  </label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={formData.aadhar}
                      onChange={(e) => handleInputChange('aadhar', e.target.value)}
                      maxLength="12"
                      className={`w-full pl-12 pr-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors ${
                        errors.aadhar ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'
                      }`}
                      placeholder="12-digit Aadhar number"
                    />
                  </div>
                  {errors.aadhar && (
                    <p className="text-red-500 text-xs mt-1 flex items-center space-x-1">
                      <AlertCircle className="w-3 h-3" />
                      <span>{errors.aadhar}</span>
                    </p>
                  )}
                </div>

                {/* Address */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Complete Address *
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <textarea
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      rows="3"
                      className={`w-full pl-12 pr-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors resize-none ${
                        errors.address ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'
                      }`}
                      placeholder="Enter your complete address"
                    />
                  </div>
                  {errors.address && (
                    <p className="text-red-500 text-xs mt-1 flex items-center space-x-1">
                      <AlertCircle className="w-3 h-3" />
                      <span>{errors.address}</span>
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Information Note */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs font-bold">i</span>
                </div>
                <div>
                  <h4 className="text-blue-700 font-medium mb-1">Profile Information</h4>
                  <p className="text-blue-600 text-sm">
                    This information will be used to pre-fill future booking forms and for contact purposes. 
                    You can update it anytime from your profile page.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 text-gray-700 bg-white rounded-lg font-medium hover:bg-gray-50 transition-colors"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-6 py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Profile</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileEditModal;

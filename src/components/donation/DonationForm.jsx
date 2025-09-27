"use client"
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import { useLocationData } from '@/hooks/useLocationData';

export default function DonationForm({ donorType = 'indian', setDonorType }) {
  // Use props if provided, otherwise fallback to local state
  const [localDonorType, setLocalDonorType] = useState('indian');
  const currentDonorType = donorType || localDonorType;
  const currentSetDonorType = setDonorType || setLocalDonorType;
  const [processing, setProcessing] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    fullName: '',
    email: '',
    mobile: '',
    address: '',
    country: '',
    state: '',
    city: '',
    pincode: ''
  });
  const [errors, setErrors] = useState({});

  const router = useRouter();
  const { user } = useAuth();
  
  // Use location data hook similar to delegate form
  const { countries, states, cities, loading } = useLocationData(formData);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let updatedData = { ...formData, [name]: value };
    
    // Clear dependent fields when country or state changes
    if (name === 'country') {
      updatedData = { ...updatedData, state: '', city: '' };
    } else if (name === 'state') {
      updatedData = { ...updatedData, city: '' };
    }
    
    setFormData(updatedData);
  };

  const validateForm = () => {
    const fieldErrors = {};
    
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      fieldErrors.amount = 'Please enter a valid donation amount';
    }
    
    if (!formData.fullName || formData.fullName.trim().length < 2) {
      fieldErrors.fullName = 'Please enter your full name';
    }
    
    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      fieldErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.mobile || !/^[0-9]{10}$/.test(formData.mobile.replace(/\D/g, ''))) {
      fieldErrors.mobile = 'Please enter a valid 10-digit mobile number';
    }
    
    if (!formData.address || formData.address.trim().length < 10) {
      fieldErrors.address = 'Please enter a complete address';
    }
    
    if (!formData.country || formData.country.trim().length < 2) {
      fieldErrors.country = 'Please select your country';
    }
    
    if (!formData.state || formData.state.trim().length < 2) {
      fieldErrors.state = 'Please select your state';
    }
    
    if (!formData.city || formData.city.trim().length < 2) {
      fieldErrors.city = 'Please select your city';
    }
    
    if (!formData.pincode || !/^[0-9]{6}$/.test(formData.pincode)) {
      fieldErrors.pincode = 'Please enter a valid 6-digit pincode';
    }
    
    return fieldErrors;
  };

  const handleSubmit = async () => {
    if (processing) return;
    
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    setErrors({});
    setProcessing(true);
    
    try {
      // Create donation record in Firebase first
      const donationId = await createDonationRecord();
      
      // Initiate CCAvenue payment with existing API
      await initiatePayment(donationId);
      
    } catch (error) {
      console.error('Form submission error:', error);
      toast.error(error.message || 'Failed to process donation. Please try again.');
      setProcessing(false);
    }
  };
  
  const createDonationRecord = async () => {
    const donationId = 'DN' + Date.now();
    
    try {
      const { db } = await import('@/lib/firebase');
      const { doc, setDoc, serverTimestamp } = await import('firebase/firestore');
      
      const donationRef = doc(db, 'donations', donationId);
      
      await setDoc(donationRef, {
        id: donationId,
        donationId,
        userId: user?.uid || null,
        donorDetails: {
          name: formData.fullName,
          email: formData.email,
          mobile: formData.mobile.replace(/\D/g, ''),
          address: formData.address,
          city: formData.city,
          state: formData.state,
          country: formData.country,
          pincode: formData.pincode,
        donorType: currentDonorType
        },
        amount: parseFloat(formData.amount),
        currency: 'INR',
        status: 'pending_payment',
        paymentGateway: 'ccavenue',
        purpose: 'donation',
        donorType: currentDonorType,
        taxExemption: {
          eligible: true,
          section: '80G',
          certificateRequired: true
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        expiryTime: new Date(Date.now() + 15 * 60 * 1000)
      });
      
      return donationId;
      
    } catch (error) {
      console.error('Donation creation failed:', error);
      throw new Error('Failed to create donation record');
    }
  };
  
  const initiatePayment = async (donationId) => {
    try {
      // Prepare payment data for existing CCAvenue API
      const paymentData = {
        order_id: donationId,
        purpose: 'donation',
        amount: parseFloat(formData.amount),
        name: formData.fullName,
        email: formData.email,
        phone: formData.mobile.replace(/\D/g, ''),
        address: `${formData.address}, ${formData.city}, ${formData.state}, ${formData.pincode}`,
        donor_type: currentDonorType,
        country: formData.country || 'india'
      };
      
      // Use existing CCAvenue request API
      const response = await fetch('/api/payment/ccavenue-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.status) {
        const errorMessage = data.errors ? data.errors.join(', ') : 'Payment request failed';
        throw new Error(errorMessage);
      }
      
      if (!data.encRequest || !data.access_code) {
        throw new Error('Invalid response from payment API');
      }
      
      // Submit to CCAvenue (this will redirect to CCAvenue and eventually to success page)
      submitToCCAvenue(data.encRequest, data.access_code);
      
    } catch (error) {
      console.error('Payment initiation failed:', error);
      throw error;
    }
  };
  
  const submitToCCAvenue = (encRequest, accessCode) => {
    try {
      // Create form dynamically - same pattern as existing PaymentProcess.jsx
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = 'https://secure.ccavenue.com/transaction/transaction.do?command=initiateTransaction';
      form.target = '_self';
      form.style.display = 'none';
      
      // Add encrypted request input
      const encInput = document.createElement('input');
      encInput.type = 'hidden';
      encInput.name = 'encRequest';
      encInput.value = encRequest;
      form.appendChild(encInput);
      
      // Add access code input
      const accInput = document.createElement('input');
      accInput.type = 'hidden';
      accInput.name = 'access_code';
      accInput.value = accessCode;
      form.appendChild(accInput);
      
      // Append form to body and submit
      document.body.appendChild(form);
      form.submit();
      
      // Clean up
      setTimeout(() => {
        if (document.body.contains(form)) {
          document.body.removeChild(form);
        }
      }, 1000);
      
    } catch (error) {
      console.error('Form submission error:', error);
      throw new Error('Failed to redirect to payment gateway');
    }
  };

  return (
    <div className="lg:col-span-3 bg-gradient-to-br from-pink-50 via-rose-50 to-pink-100 rounded-xl shadow-lg p-4 border-2 border-pink-200 h-fit">
      <h2 className="text-2xl py-6 font-bold text-pink-700 mb-4 text-center">
        💝 Make a Difference Today
      </h2>
      
      <div className="space-y-3">
        {/* Donor Type and Amount in same row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Donor Type*
            </label>
            <select
              value={currentDonorType}
              onChange={(e) => currentSetDonorType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 text-sm"
            >
              <option value="indian">Indian Donors</option>
              <option value="foreign">NRI/Foreign Donors</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Donation Amount*
            </label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleInputChange}
              placeholder="Enter amount"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500 text-sm"
              required
            />
            {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount}</p>}
          </div>
        </div>

        {/* Full Name - No dropdown */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Full Name*
          </label>
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleInputChange}
            placeholder="Enter your full name"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500 text-sm"
            required
          />
          {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
        </div>

        {/* Email and Mobile in same row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Email Address*
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="your@email.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500 text-sm"
              required
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Mobile Number*
            </label>
            <input
              type="tel"
              name="mobile"
              value={formData.mobile}
              onChange={handleInputChange}
              placeholder="+91 9876543210"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500 text-sm"
              required
            />
            {errors.mobile && <p className="text-red-500 text-xs mt-1">{errors.mobile}</p>}
          </div>
        </div>

        {/* Address - Smaller */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Address*
          </label>
          <textarea
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            placeholder="Enter your complete address"
            rows="2"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500 resize-none text-sm"
            required
          />
          {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
        </div>

        {/* Country, State, City, Pincode in grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Country*
            </label>
            <select 
              name="country"
              value={formData.country}
              onChange={handleInputChange}
              className="w-full px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400 focus:border-transparent text-gray-900 text-xs"
              disabled={loading.countries}
            >
              <option value="">Select Country</option>
              {countries.map(country => (
                <option key={country.iso2} value={country.name}>{country.name}</option>
              ))}
            </select>
            {errors.country && <p className="text-red-500 text-xs mt-1">{errors.country}</p>}
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              State*
            </label>
            <select
              name="state"
              value={formData.state}
              onChange={handleInputChange}
              className="w-full px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400 focus:border-transparent text-gray-900 text-xs"
              disabled={!states.length || loading.states}
            >
              <option value="">Select State</option>
              {states.map(state => (
                <option key={state.iso2} value={state.name}>{state.name}</option>
              ))}
            </select>
            {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state}</p>}
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              City*
            </label>
            <select
              name="city"
              value={formData.city}
              onChange={handleInputChange}
              className="w-full px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400 focus:border-transparent text-gray-900 text-xs"
              disabled={!cities.length || loading.cities}
            >
              <option value="">Select City</option>
              {cities.map(city => (
                <option key={city.id} value={city.name}>{city.name}</option>
              ))}
            </select>
            {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Pincode*
            </label>
            <input
              type="text"
              name="pincode"
              value={formData.pincode}
              onChange={handleInputChange}
              placeholder="PIN"
              maxLength="6"
              className="w-full px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-400 text-xs"
              required
            />
            {errors.pincode && <p className="text-red-500 text-xs mt-1">{errors.pincode}</p>}
          </div>
        </div>

        {/* Submit Button - Proper Color */}
        <button
          onClick={handleSubmit}
          disabled={processing}
          className={`w-full font-bold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-[1.01] hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 mt-4 ${
            processing 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 cursor-pointer'
          } text-white`}
        >
          <span className="flex items-center justify-center">
            {processing ? (
              <>
                <svg className="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                </svg>
                Processing...
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
                </svg>
                Donate
              </>
            )}
          </span>
        </button>
      </div>
    </div>
  );
}
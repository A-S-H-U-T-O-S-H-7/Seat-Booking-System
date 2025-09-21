"use client"
import React, { useState, useEffect } from 'react';
import { Building } from 'lucide-react';
import PersonalInfo from './PersonalInfo';
import LocationInfo from './LocationInfo';
import ParticipationInfo from './ParticipationInfo';
import AdditionalDetails from './AdditionalDetails';
import SuccessModal from './SuccessModal';
import { validateForm, calculateAmount } from '@/utils/delegateValidation';
import { PRICING_CONFIG, fetchDelegatePricing, DEFAULT_PRICING_CONFIG } from '@/utils/delegatePricing';
import { useLocationData } from '@/hooks/useLocationData';
import DelegateBanner from './DelegateBanner';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { collection, addDoc, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { toast } from 'react-hot-toast';
import { uploadDelegateImage, validateImageFile } from '@/services/delegateImageService';
import { handleNormalDelegateEmail } from '@/services/normalDelegateEmailService';
import { sendDelegateConfirmationEmail } from '@/services/emailService';

 

const DelegateForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    companyname: '',
    email: '',
    mobile: '',
    country: 'india',
    state: '',
    city: '',
    address: '',
    pincode: '',
    participation: 'Delegate', 
    registrationType: '', 
    templename: '',
    designation: '',
    numberOfPersons: '1', 
    delegateType: 'normal',
    days: '', 
    brief: '',
    aadharno: '',
    passportno: '',
    pan: '',
    selfie: null
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState(null);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dynamicPricing, setDynamicPricing] = useState(DEFAULT_PRICING_CONFIG);
  const [pricingLoading, setPricingLoading] = useState(true);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const { user } = useAuth();

  // Use custom hook for location data
  const { countries, states, cities, loading } = useLocationData(formData);

  // Success modal handlers
  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
  };

  const handleProfileClick = () => {
    setShowSuccessModal(false);
    // Navigate to profile page - you can implement this based on your routing
    window.location.href = '/profile'; // or use router.push('/profile') if using Next.js router
  };

  // Form reset function
  const resetForm = () => {
    setFormData({
      name: '',
      companyname: '',
      email: '',
      mobile: '',
      country: 'india',
      state: '',
      city: '',
      address: '',
      pincode: '',
      participation: 'Delegate',
      registrationType: '',
      templename: '',
      designation: '',
      numberOfPersons: '1',
      delegateType: 'normal',
      days: '',
      brief: '',
      aadharno: '',
      passportno: '',
      pan: '',
      selfie: null
    });
    setSelectedFile(null);
    setImagePreview(null);
    setUploadedImageUrl(null);
    setErrors({});
  };

  // Fetch dynamic pricing on component mount
  useEffect(() => {
    const loadDynamicPricing = async () => {
      try {
        console.log('🔄 Loading dynamic delegate pricing...');
        setPricingLoading(true);
        const pricing = await fetchDelegatePricing();
        setDynamicPricing(pricing);
        console.log('✅ Dynamic pricing loaded:', pricing);
      } catch (error) {
        console.error('❌ Failed to load dynamic pricing:', error);
        setDynamicPricing(DEFAULT_PRICING_CONFIG);
        toast.error('Using default pricing due to loading error');
      } finally {
        setPricingLoading(false);
      }
    };

    loadDynamicPricing();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let updatedData = { ...formData, [name]: value };
    
    // Format PAN input
    if (name === 'pan') {
      updatedData[name] = value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 10);
    }
    
    // Format mobile input - only digits, max 10
    if (name === 'mobile') {
      updatedData[name] = value.replace(/\D/g, '').slice(0, 10);
    }
    
    // Format Aadhar input - only digits, max 12, cannot start with 0 or 1
    if (name === 'aadharno') {
      const cleanValue = value.replace(/\D/g, '').slice(0, 12);
      if (cleanValue.length > 0 && (cleanValue.startsWith('0') || cleanValue.startsWith('1'))) {
        // Don't update if it starts with 0 or 1
        return;
      }
      updatedData[name] = cleanValue;
    }

    // Auto-set days for without assistance and normal
    if (name === 'delegateType' && value === 'withoutAssistance') {
      updatedData.days = dynamicPricing.withoutAssistance.fixedDays;
    } else if (name === 'delegateType' && value === 'withAssistance') {
      updatedData.days = dynamicPricing.withAssistance.minDays;
    } else if (name === 'delegateType' && value === 'normal') {
      updatedData.days = dynamicPricing.normal.fixedDays;
      // Allow users to set numberOfPersons for normal delegate type
    }

    // Clear dependent fields when country or state changes
    if (name === 'country') {
      updatedData = { ...updatedData, state: '', city: '' };
    } else if (name === 'state') {
      updatedData = { ...updatedData, city: '' };
    }

    setFormData(updatedData);

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    
    if (!file) {
      setSelectedFile(null);
      setImagePreview(null);
      setUploadedImageUrl(null);
      setFormData(prev => ({ ...prev, selfie: null }));
      return;
    }

    // Validate file using the service
    const validation = await validateImageFile(file);
    if (!validation.isValid) {
      toast.error(validation.error);
      return;
    }
    
    // Set selected file and create preview
    setSelectedFile(file);
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
    
    setFormData(prev => ({ ...prev, selfie: file }));
    
    // Show upload success message
    toast.success('Image selected successfully!');
  };

  const calculateFormAmount = () => {
    return calculateAmount(formData, dynamicPricing);
  };

  // Generate booking ID for delegate registration
  const generateDelegateBookingId = () => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `DELEGATE-${timestamp}-${random}`;
  };

  // Submit form to CCAvenue payment gateway
  const submitToCCAvenue = (encRequest, accessCode, bookingId) => {
    console.log('🌐 Creating CCAvenue payment form for delegate...');
    
    try {
      // Create form dynamically
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
      
      console.log('🚀 Submitting delegate payment to CCAvenue...', {
        action: form.action,
        bookingId: bookingId
      });
      
      // Submit form
      form.submit();
      
      // Clean up
      setTimeout(() => {
        if (document.body.contains(form)) {
          document.body.removeChild(form);
        }
      }, 1000);
      
    } catch (error) {
      console.error('Form submission error:', error);
      toast.error('Failed to redirect to payment gateway');
      setIsSubmitting(false);
    }
  };

  // Process delegate booking and create Firebase record
  const processDelegateBooking = async (paymentData, bookingId) => {
    console.log('Processing delegate booking...', bookingId);
    
    try {
      // Prepare delegate details without the file object
      const { selfie, ...delegateDetailsWithoutFile } = formData;
      
      let imageUploadResult = null;
      
      // Upload image to Firebase Storage if file exists
      if (selectedFile) {
        console.log('📸 Uploading delegate image to Firebase Storage...');
        setImageUploading(true);
        
        imageUploadResult = await uploadDelegateImage(selectedFile, bookingId);
        
        if (!imageUploadResult.success) {
          console.error('Image upload failed:', imageUploadResult.error);
          toast.error('Failed to upload image: ' + imageUploadResult.error);
          throw new Error('Image upload failed: ' + imageUploadResult.error);
        }
        
        console.log('✅ Image uploaded successfully:', imageUploadResult.url);
        setUploadedImageUrl(imageUploadResult.url);
        setImageUploading(false);
      }
      
      // Add file information 
      const fileInfo = selectedFile && imageUploadResult ? {
        fileName: imageUploadResult.fileName,
        originalName: imageUploadResult.originalName,
        fileSize: imageUploadResult.size,
        fileType: imageUploadResult.type,
        fileUploaded: true,
        imageUrl: imageUploadResult.url
      } : {
        fileUploaded: false
      };
      
      // Create delegate booking in Firebase
      const bookingRef = doc(db, 'delegateBookings', bookingId);
      const bookingDataToSave = {
        id: bookingId,
        bookingId: bookingId,
        userId: user?.uid || 'guest',
        delegateDetails: {
          ...delegateDetailsWithoutFile,
          fileInfo: fileInfo
        },
        totalAmount: calculateFormAmount(),
        payment: {
          ...paymentData,
          amount: calculateFormAmount()
        },
        status: paymentData.status || 'pending_payment',
        type: 'delegate',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        expiryTime: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes expiry
        eventDetails: {
          participationType: formData.participation,
          delegateType: formData.delegateType,
          duration: formData.days,
          numberOfPersons: formData.numberOfPersons,
          designation: formData.designation,
          registrationType: formData.registrationType,
          companyName: formData.companyname,
          templeName: formData.templename,
          briefProfile: formData.brief
        }
      };
      
      await setDoc(bookingRef, bookingDataToSave);
      
      console.log('✅ Delegate booking created successfully:', bookingId);
      
      // Send confirmation email for successful registrations
      if (paymentData.status === 'confirmed') {
        try {
          // Use dedicated normal delegate email service for normal delegate type
          const isNormalDelegate = bookingDataToSave.eventDetails.delegateType === 'normal';
          
          let emailResult;
          if (isNormalDelegate) {
            console.log('📧 Using dedicated normal delegate email service...');
            emailResult = await handleNormalDelegateEmail(bookingDataToSave);
          } else {
            console.log('📧 Using general delegate email service...');
            const enrichedData = {
              ...bookingDataToSave,
              order_id: bookingId,
              amount: calculateFormAmount(),
              payment_id: paymentData.paymentId || 'paid_registration'
            };
            emailResult = await sendDelegateConfirmationEmail(enrichedData);
          }
          
          console.log('📧 Delegate email sent:', emailResult.success ? 'Success' : emailResult.error);
        } catch (emailError) {
          console.error('❌ Failed to send delegate email:', emailError);
        }
      }
      
    } catch (error) {
      console.error('❌ Error creating delegate booking:', error);
      
      // More detailed error logging
      if (error.code) {
        console.error('Firebase Error Code:', error.code);
      }
      if (error.message) {
        console.error('Firebase Error Message:', error.message);
      }
      
      // Re-throw with more user-friendly message
      throw new Error(`Failed to create booking: ${error.message || 'Unknown error'}`);
    }
  };

  // Initiate payment process
  const initiatePayment = async () => {
    const totalAmount = calculateFormAmount();
    
    if (totalAmount <= 0) {
      toast.error('No payment required for this registration');
      return;
    }
    
    if (!user) {
      toast.error('Please login to proceed with payment');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      console.log('Creating pending delegate booking...');
      
      // Create pending booking first
      const generatedBookingId = generateDelegateBookingId();
      
      // Create pending booking in Firebase
      await processDelegateBooking({
        paymentId: 'pending_' + Date.now(),
        orderId: generatedBookingId,
        amount: totalAmount,
        status: 'pending_payment'
      }, generatedBookingId);
      
      console.log('✅ Delegate booking created with ID:', generatedBookingId);
      
      // Prepare payment data for CCAvenue
      const paymentData = {
        order_id: generatedBookingId,
        purpose: 'delegate_booking', // Important: identifies this as delegate payment
        amount: totalAmount.toString(),
        name: formData.name,
        email: formData.email,
        phone: formData.mobile,
        address: `${formData.address}, ${formData.city}, ${formData.state}, ${formData.country} - ${formData.pincode}`
      };
      
      console.log('💳 Sending request to CCAvenue API...', paymentData);
      
      // Send request to CCAvenue API
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
      console.log('CCAvenue API Response:', data);
      
      if (!data.status) {
        const errorMessage = data.errors ? data.errors.join(', ') : 'Payment request failed';
        throw new Error(errorMessage);
      }
      
      if (!data.encRequest || !data.access_code) {
        throw new Error('Invalid response from payment API');
      }
      
      console.log('✅ CCAvenue request prepared successfully');
      
      // Redirect to CCAvenue
      submitToCCAvenue(data.encRequest, data.access_code, generatedBookingId);
      
    } catch (error) {
      console.error('Delegate Booking/Payment failed:', error);
      
      // More specific error handling
      if (error.message.includes('permission')) {
        toast.error('Permission denied. Please ensure you are logged in.');
      } else if (error.message.includes('network') || error.message.includes('fetch')) {
        toast.error('Network error. Please check your internet connection.');
      } else if (error.message.includes('validation')) {
        toast.error('Payment validation failed. Please try again.');
      } else {
        toast.error(error.message || 'Failed to initiate payment. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle blur validation for instant feedback
  const handleBlur = (e) => {
    const { name } = e.target;
    const fieldErrors = validateForm(formData);
    
    // Only show error for the specific field that lost focus
    if (fieldErrors[name]) {
      setErrors(prev => ({ ...prev, [name]: fieldErrors[name] }));
    } else {
      // Clear error if field is now valid
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationErrors = validateForm(formData);

    // Add photo validation (now optional)
    // Photo upload is no longer mandatory
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      // Scroll to first error
      const firstErrorField = document.querySelector('.border-red-500');
      if (firstErrorField) {
        firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    const amount = calculateFormAmount();
    
    // Special handling for normal delegate type - always confirmed regardless of amount
    const isNormalDelegate = formData.delegateType === 'normal';
    
    // If no payment required OR normal delegate type, submit directly
    if (amount <= 0 || isNormalDelegate) {
      setIsSubmitting(true);
      
      try {
        // Create registration (free for normal delegates, or other free registrations)
        const bookingId = generateDelegateBookingId();
        await processDelegateBooking({
          paymentId: isNormalDelegate ? 'normal_delegate_free' : 'free_registration',
          orderId: bookingId,
          amount: amount,
          status: 'confirmed' // Always confirmed for normal delegates and free registrations
        }, bookingId);
        
        // Show success modal for Normal option, toast for others
        if (formData.delegateType === 'normal') {
          setShowSuccessModal(true);
        } else {
          toast.success('Registration completed successfully!');
        }
        
        // Reset form
        resetForm();
        
      } catch (error) {
        console.error('Free registration error:', error);
        
        // Show more specific error message
        if (error.message.includes('permission')) {
          toast.error('Permission denied. Please ensure you are logged in.');
        } else if (error.message.includes('network')) {
          toast.error('Network error. Please check your internet connection.');
        } else {
          toast.error(`Registration failed: ${error.message}`);
        }
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // Proceed with payment
      await initiatePayment();
    }
  };

  // Check if form is valid for enabling submit button
  const isFormValid = () => {
    const requiredFields = ['name', 'email', 'mobile', 'country', 'participation', 'registrationType', 'address', 'pincode', 'delegateType'];
    
    // Check basic required fields
    for (const field of requiredFields) {
      if (!formData[field] || !formData[field].toString().trim()) {
        return false;
      }
    }
    
    // Check registration type specific fields
    if (formData.registrationType === 'Company' && (!formData.companyname || !formData.companyname.trim())) {
      return false;
    }
    
    if (formData.registrationType === 'Temple') {
      if (!formData.templename || !formData.templename.trim()) return false;
      if (!formData.brief || !formData.brief.trim()) return false;
    }
    
    // Check document requirements based on country
    const isIndianResident = formData.country && formData.country.toLowerCase().includes('india');
    if (isIndianResident) {
      if (!formData.aadharno || !formData.aadharno.trim()) return false;
    } else {
      if (!formData.passportno || !formData.passportno.trim()) return false;
    }
    
    // Check delegate specific fields
    if (formData.delegateType === 'withAssistance' && !formData.days) {
      return false;
    }
    // Photo upload is now optional
    // No need to check for photo
    
    return true;
  };

  const totalAmount = calculateFormAmount();

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-green-50 py-8 px-4">
              <DelegateBanner />

      <div className="max-w-6xl mx-auto ">
        


        {/* Form Container */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-6">
            <h2 className="text-xl font-bold text-white text-center">Registration Form</h2>
          </div>

          <div className="p-2 md:p-6 space-y-8">
            {/* Personal Information */}
            <PersonalInfo
              formData={formData}
              errors={errors}
              handleInputChange={handleInputChange}
              handleBlur={handleBlur}
            />

            {/* Location Information */}
            <LocationInfo
              formData={formData}
              errors={errors}
              handleInputChange={handleInputChange}
              handleBlur={handleBlur}
              countries={countries}
              states={states}
              cities={cities}
            />

            {/* Participation Information */}
            <ParticipationInfo
              formData={formData}
              errors={errors}
              handleInputChange={handleInputChange}
              handleBlur={handleBlur}
              calculateAmount={calculateFormAmount}
              pricingConfig={dynamicPricing}
            />

            {/* Additional Details */}
            <AdditionalDetails
              formData={formData}
              errors={errors}
              handleInputChange={handleInputChange}
              handleBlur={handleBlur}
              selectedFile={selectedFile}
              handleFileChange={handleFileChange}
              imagePreview={imagePreview}
              imageUploading={imageUploading}
            />

            {/* Pricing Summary */}
            {formData.participation === 'Delegate' && formData.delegateType && (
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-6 rounded-lg border border-emerald-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Pricing Summary</h3>
                
                <div className="space-y-4">
                  {formData.delegateType === 'normal' && (
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                      <h4 className="font-medium text-gray-900 mb-2">Normal Package</h4>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>• Price per person: Free</p>
                        <p>• Fixed duration: {dynamicPricing.normal.fixedDays} days</p>
                        <p>• Number of persons: {formData.numberOfPersons || 1}</p>
                      </div>
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <p className="font-semibold text-emerald-600">
                          Total Amount: Free
                        </p>
                      </div>
                      <div className="mt-3">
                        <h5 className="font-medium text-gray-800 mb-2">Benefits included:</h5>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {dynamicPricing.normal.benefits.map((benefit, index) => (
                            <li key={index}>• {benefit}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                  
                  {formData.delegateType === 'withoutAssistance' && (
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                      <h4 className="font-medium text-gray-900 mb-2">Without Assistance Package</h4>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>• Price per person: ₹{dynamicPricing.withoutAssistance.pricePerPerson.toLocaleString()}</p>
                        <p>• Fixed duration: {dynamicPricing.withoutAssistance.fixedDays} days</p>
                        <p>• Number of persons: {formData.numberOfPersons || 1}</p>
                      </div>
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <p className="font-semibold text-emerald-600">
                          Total Amount: ₹{totalAmount.toLocaleString()}
                        </p>
                      </div>
                      <div className="mt-3">
                        <h5 className="font-medium text-gray-800 mb-2">Benefits included:</h5>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {dynamicPricing.withoutAssistance.benefits.map((benefit, index) => (
                            <li key={index}>• {benefit}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  {formData.delegateType === 'withAssistance' && (
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                      <h4 className="font-medium text-gray-900 mb-2">With Assistance Package</h4>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>• Price per person per day: ₹{dynamicPricing.withAssistance.pricePerPersonPerDay.toLocaleString()}</p>
                        <p>• Duration: {formData.days || dynamicPricing.withAssistance.minDays} days</p>
                        <p>• Number of persons: {formData.numberOfPersons || 1}</p>
                      </div>
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <p className="font-semibold text-emerald-600">
                          Total Amount: ₹{totalAmount.toLocaleString()}
                        </p>
                      </div>
                      <div className="mt-3">
                        <h5 className="font-medium text-gray-800 mb-2">Benefits included:</h5>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {dynamicPricing.withAssistance.benefits.map((benefit, index) => (
                            <li key={index}>• {benefit}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-6 text-center">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting || loading.countries || !isFormValid()}
                className={`px-8 py-3 rounded-lg font-semibold shadow-lg transition-all duration-200 ${
                  isSubmitting || loading.countries || !isFormValid()
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 hover:shadow-xl transform hover:scale-105'
                } text-white`}
              >
                {isSubmitting ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {totalAmount > 0 ? 'Processing Payment...' : 'Submitting...'}
                  </span>
                ) : (
                  formData.participation === 'Delegate' && totalAmount > 0 
                    ? `Register and Pay ₹${totalAmount.toLocaleString()}`
                    : 'Submit Registration'
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Loading States */}
        {loading.countries && (
          <div className="fixed inset-0 bg-black/10 backdrop-blur-lg bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl">
              <div className="flex items-center space-x-3">
                <svg className="animate-spin h-6 w-6 text-emerald-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="text-gray-700">Loading countries...</span>
              </div>
            </div>
          </div>
        )}
        
        {/* Success Modal */}
        <SuccessModal
          isOpen={showSuccessModal}
          onClose={handleSuccessModalClose}
          onProfileClick={handleProfileClick}
        />
      </div>
    </div>
  );
};

export default DelegateForm;
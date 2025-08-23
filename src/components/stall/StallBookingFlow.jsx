"use client";
import { useState } from 'react';
import { Store, UserCheck, CreditCard, Check, ShoppingBag } from 'lucide-react';
import { useStallBooking } from '@/context/StallBookingContext';
import StallMap from './StallMap';
import VendorDetails from './VendorDetails';
import StallPaymentProcess from './StallPaymentProcess';
import DonateBar from '../donation/DonationBar';

const StallBookingFlow = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [vendorDetails, setVendorDetails] = useState({
    businessType: '',
    ownerName: '',
    email: '',
    address: '',
    phone: '',
    aadhar: ''
  });
  const [isVendorDetailsValid, setIsVendorDetailsValid] = useState(false);
  
  const {
    selectedStalls,
    setSelectedStalls
  } = useStallBooking();

  const steps = [
    { 
      id: 1, 
      title: 'Choose Stalls', 
      subtitle: 'Select your locations',
      icon: Store,
      component: 'stall' 
    },
    { 
      id: 2, 
      title: 'Vendor Details', 
      subtitle: 'Business information',
      icon: UserCheck,
      component: 'details' 
    },
    { 
      id: 3, 
      title: 'Payment', 
      subtitle: 'Complete booking',
      icon: CreditCard,
      component: 'payment' 
    }
  ];

  const canProceedToNext = () => {
    switch (currentStep) {
      case 1:
        return selectedStalls && selectedStalls.length > 0;
      case 2:
        return isVendorDetailsValid;
      case 3:
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (canProceedToNext() && currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <StallMap />
        );
      
      case 2:
        return (
          <VendorDetails 
            details={vendorDetails}
            onDetailsChange={setVendorDetails}
            onValidationChange={setIsVendorDetailsValid}
          />
        );
      
      case 3:
        return (
          <StallPaymentProcess 
            vendorDetails={vendorDetails}
          />
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen  bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="container  mx-auto px-2 py-4 md:py-8">
        <div className="max-w-7xl pb-5 md:pb-10 mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
  <div className="relative bg-gradient-to-br from-purple-200 via-white to-purple-200 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/60 overflow-hidden">
    
    {/* Stall Design Border at Top of Block */}
    <div 
      className="w-full h-8 sm:h-12 bg-repeat-x bg-center"
      style={{
        backgroundImage: 'url(/stalldesign.png)',
        backgroundSize: 'auto 100%'
      }}
      onError={(e) => {
        e.target.style.display = 'none';
      }}
    ></div>
    
    <div className="p-8">
      {/* Background Decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-400/5 via-purple-400/10 to-pink-400/5"></div>
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/50 to-transparent rounded-full transform translate-x-16 -translate-y-16"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-purple-400/50 to-transparent rounded-full transform -translate-x-12 translate-y-12"></div>
      
      <div className="relative z-10">
        {/* Main Icon */}
        <div className="inline-flex items-center justify-center w-16 h-16 ">
          <img src="/stall3.jpg" alt="Stall" className="w-12 h-12 object-contain" />
        </div>
       {/* DonateBar - Break out of padding constraint */}
        <div className='-mx-8 mb-4'>
          <div className='max-w-lg md:max-w-md mx-auto px-2'>
            <DonateBar/>
          </div>
        </div>
        
        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-bold mb-3">
          <span className="bg-gradient-to-r from-gray-900 via-blue-600 to-purple-600 bg-clip-text text-transparent">
            Pick Your Stall
          </span>
        </h1>
        
        {/* Subtitle */}
        <p className="text-lg md:text-xl text-gray-600 font-medium mb-6 max-w-2xl mx-auto">
          Secure your premium business space for the 5-day grand event
        </p>
        
        {/* Feature Pills */}
        <div className="flex flex-wrap justify-center gap-3 text-sm">
          <div className="flex items-center gap-2 bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 px-4 py-2 rounded-full border border-green-200/50 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="font-semibold">Prime Locations</span>
          </div>
          <div className="flex items-center gap-2 bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-700 px-4 py-2 rounded-full border border-blue-200/50 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <span className="font-semibold">5-Day Event Pass</span>
          </div>
          <div className="flex items-center gap-2 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 px-4 py-2 rounded-full border border-purple-200/50 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
            <span className="font-semibold">Premium Amenities</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

          {/* Progress Steps */}
          <div className="mb-8">
            {/* Mobile Progress */}
            <div className="block md:hidden">
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="text-center mb-3">
                  <div className="inline-flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full mb-2 shadow-md">
                    {(() => {
                      const IconComponent = steps[currentStep - 1].icon;
                      return <IconComponent className="w-5 h-5 text-white" />;
                    })()}
                  </div>
                  <h3 className="text-base font-semibold text-gray-800">{steps[currentStep - 1].title}</h3>
                  <p className="text-xs text-gray-600">{steps[currentStep - 1].subtitle}</p>
                </div>
                <div className="flex items-center justify-center space-x-1.5 mb-2">
                  {steps.map((_, index) => (
                    <div
                      key={index}
                      className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                        index + 1 <= currentStep ? 'bg-blue-400' : 'bg-gray-200'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-center text-xs text-gray-500">Step {currentStep} of {steps.length}</p>
              </div>
            </div>
            
            {/* Desktop Progress */}
            <div className="hidden md:block">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between relative px-6">
                  {/* Progress Line - Fixed positioning */}
                  <div className="absolute top-6 left-12 right-12 h-0.5 bg-gray-200">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-400 to-purple-500 transition-all duration-500 rounded-full"
                      style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
                    />
                  </div>
                  
                  {steps.map((step, index) => {
                    const isActive = currentStep === step.id;
                    const isCompleted = currentStep > step.id;
                    const IconComponent = step.icon;
                    
                    return (
                      <div key={step.id} className="flex flex-col items-center relative z-10">
                        <div
                          className={`flex items-center justify-center w-12 h-12 rounded-full font-semibold transition-all duration-300 ${
                            isCompleted
                              ? 'bg-gradient-to-br from-green-400 to-emerald-500 text-white shadow-lg'
                              : isActive
                              ? 'bg-gradient-to-br from-blue-400 to-purple-500 text-white shadow-lg scale-110'
                              : 'bg-gray-100 text-gray-400 border-2 border-gray-200'
                          }`}
                        >
                          {isCompleted ? (
                            <Check className="w-6 h-6" />
                          ) : (
                            <IconComponent className="w-6 h-6" />
                          )}
                        </div>
                        <div className="mt-3 text-center">
                          <div className={`text-sm font-semibold ${isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-500'}`}>
                            {step.title}
                          </div>
                          <div className={`text-xs ${isActive ? 'text-blue-500' : isCompleted ? 'text-green-500' : 'text-gray-400'}`}>
                            {step.subtitle}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Step Content */}
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-purple-300 p-2 md:p-4 mb-8">
            {renderStepContent()}
          </div>

          {/* Navigation */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className={`flex items-center justify-center px-6 py-3 rounded-xl font-medium transition-all duration-200 w-full sm:w-auto ${
                currentStep === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white border-2 border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 shadow-sm hover:shadow-md'
              }`}
            >
              ← Previous
            </button>

            <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-500">
              <span>Step {currentStep} of {steps.length}</span>
            </div>

            <button
              onClick={handleNext}
              disabled={!canProceedToNext() || currentStep === 3}
              className={`flex items-center justify-center px-6 py-3 rounded-xl font-medium transition-all duration-200 w-full sm:w-auto ${
                !canProceedToNext() || currentStep === 3
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-500 to-purple-500 cursor-pointer text-white hover:from-blue-600 hover:to-purple-600 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
              }`}
            >
              {currentStep === 3 ? 'Complete Booking' : 'Next →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StallBookingFlow;
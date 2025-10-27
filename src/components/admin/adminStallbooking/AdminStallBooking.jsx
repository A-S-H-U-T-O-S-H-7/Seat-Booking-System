"use client";
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useTheme } from '@/context/ThemeContext';
import { useStallBooking } from '@/context/StallBookingContext';
import { 
  Store, 
  User, 
  CreditCard, 
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  Check
} from 'lucide-react';

// Import admin-specific components
import AdminStallMap from './AdminStallMap';
import AdminVendorDetails from './AdminVendorDetails';
import AdminStallPayment from './AdminStallPayment';

export default function AdminStallBooking() {
  const { isDarkMode } = useTheme();
  const { selectedStalls, clearSelection } = useStallBooking();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [vendorDetails, setVendorDetails] = useState({
    businessType: '',
    ownerName: '',
    email: '',
    address: '',
    phone: '',
    aadhar: '',
    pan: ''
  });
  const [isVendorDetailsValid, setIsVendorDetailsValid] = useState(false);

  const steps = [
    { id: 1, title: 'Select Stalls', icon: Store },
    { id: 2, title: 'Vendor Details', icon: User },
    { id: 3, title: 'Confirm Booking', icon: CreditCard }
  ];

  // Handle booking completion
  const handleBookingComplete = (bookingId) => {
    // Reset form
    setVendorDetails({
      businessType: '',
      ownerName: '',
      email: '',
      address: '',
      phone: '',
      aadhar: '',
      pan: ''
    });
    setCurrentStep(1);
    toast.success('Booking completed successfully!');
  };

  const canProceedToNext = () => {
    switch (currentStep) {
      case 1:
        return selectedStalls.length > 0;
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
        return <AdminStallMap />;
      case 2:
        return (
          <AdminVendorDetails 
            details={vendorDetails}
            onDetailsChange={setVendorDetails}
            onValidationChange={setIsVendorDetailsValid}
          />
        );
      case 3:
        return (
          <AdminStallPayment 
            vendorDetails={vendorDetails}
            onBookingComplete={handleBookingComplete}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-2 py-4 md:py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header - No Banner */}
          <div className="text-center mb-6">
            <h1 className={`text-2xl md:text-3xl lg:text-4xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Admin Stall Booking
            </h1>
            <p className={`text-sm md:text-base ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Book stalls on behalf of vendors - Direct booking without payment gateway
            </p>
          </div>

          {/* Progress Steps - Desktop and Mobile */}
          <div className="mb-8">
            {/* Mobile Progress */}
            <div className="block md:hidden">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="text-center mb-3">
                  <div className="inline-flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full mb-2 shadow-md">
                    {(() => {
                      const IconComponent = steps[currentStep - 1].icon;
                      return <IconComponent className="w-5 h-5 text-white" />;
                    })()}
                  </div>
                  <h3 className={`text-base font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                    {steps[currentStep - 1].title}
                  </h3>
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
                <p className={`text-center text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Step {currentStep} of {steps.length}
                </p>
              </div>
            </div>
            
            {/* Desktop Progress */}
            <div className="hidden md:block">
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between relative px-6">
                  {/* Progress Line */}
                  <div className="absolute top-6 left-12 right-12 h-0.5 bg-gray-200 dark:bg-gray-700">
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
                              : isDarkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-400 border-2 border-gray-200'
                          }`}
                        >
                          {isCompleted ? (
                            <Check className="w-6 h-6" />
                          ) : (
                            <IconComponent className="w-6 h-6" />
                          )}
                        </div>
                        <div className="mt-3 text-center">
                          <div className={`text-sm font-semibold ${
                            isActive ? 'text-blue-600 dark:text-blue-400' : 
                            isCompleted ? 'text-green-600 dark:text-green-400' : 
                            isDarkMode ? 'text-gray-400' : 'text-gray-500'
                          }`}>
                            {step.title}
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
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-3xl shadow-xl border border-purple-300 dark:border-purple-700 p-2 md:p-4 mb-8">
            {renderStepContent()}
          </div>

          {/* Navigation */}
          {currentStep < 3 && (
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <button
                onClick={handlePrevious}
                disabled={currentStep === 1}
                className={`flex items-center justify-center px-6 py-3 rounded-xl font-medium transition-all duration-200 w-full sm:w-auto ${
                  currentStep === 1
                    ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                    : 'bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 hover:border-gray-300 shadow-sm hover:shadow-md'
                }`}
              >
                ← Previous
              </button>

              <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                <span>Step {currentStep} of {steps.length}</span>
              </div>

              <button
                onClick={handleNext}
                disabled={!canProceedToNext()}
                className={`flex items-center justify-center px-6 py-3 rounded-xl font-medium transition-all duration-200 w-full sm:w-auto ${
                  !canProceedToNext()
                    ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-500 to-purple-500 cursor-pointer text-white hover:from-blue-600 hover:to-purple-600 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                }`}
              >
                Next →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

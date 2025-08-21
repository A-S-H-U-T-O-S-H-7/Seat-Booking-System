"use client";
import { useState } from 'react';
import { Calendar, Clock, Users, UserCheck, CreditCard, Check } from 'lucide-react';
import { useBooking } from '@/context/BookingContext';
import SelectDate from './SelectDate';
import SelectShift from './SelectShift';
import SeatMap from './SeatMap';
import CustomerDetails from './CustomerDetails';
import PaymentProcess from './PaymentProcess';

const BookingFlow = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [customerDetails, setCustomerDetails] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    aadhar: ''
  });
  const [isCustomerDetailsValid, setIsCustomerDetailsValid] = useState(false);
  
  const {
    selectedDate,
    selectedShift,
    selectedSeats,
    setSelectedDate,
    setSelectedShift,
    toggleSeat,
    isBookingComplete,
  } = useBooking();

  const steps = [
    { 
      id: 1, 
      title: 'Select Date', 
      subtitle: 'Choose your day',
      icon: Calendar,
      component: 'date' 
    },
    { 
      id: 2, 
      title: 'Select Shift', 
      subtitle: 'Pick timing',
      icon: Clock,
      component: 'shift' 
    },
    { 
      id: 3, 
      title: 'Choose Your Spots', 
      subtitle: 'Reserve spots',
      icon: Users,
      component: 'seats' 
    },
    { 
      id: 4, 
      title: 'Your Details', 
      subtitle: 'Personal info',
      icon: UserCheck,
      component: 'details' 
    },
    { 
      id: 5, 
      title: 'Payment', 
      subtitle: 'Complete payment',
      icon: CreditCard,
      component: 'payment' 
    }
  ];

  const canProceedToNext = () => {
    switch (currentStep) {
      case 1:
        return selectedDate !== null;
      case 2:
        return selectedShift !== null;
      case 3:
        return selectedSeats.length > 0;
      case 4:
        return isCustomerDetailsValid;
      case 5:
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (canProceedToNext() && currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Dynamic container width based on current step
  const getContainerMaxWidth = () => {
    return currentStep === 3 ? 'max-w-8xl' : 'max-w-6xl';
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <SelectDate 
            selectedDate={selectedDate}
            onDateSelect={setSelectedDate}
          />
        );
      
      case 2:
        return (
          <SelectShift 
            selectedDate={selectedDate}
            selectedShift={selectedShift}
            onShiftSelect={setSelectedShift}
          />
        );
      
      case 3:
        return (
          <SeatMap 
            selectedDate={selectedDate}
            selectedShift={selectedShift}
            selectedSeats={selectedSeats}
            onSeatSelect={toggleSeat}
          />
        );

      case 4:
        return (
          <CustomerDetails 
            details={customerDetails}
            onDetailsChange={setCustomerDetails}
            onValidationChange={setIsCustomerDetailsValid}
          />
        );
      
      case 5:
  return (
    <PaymentProcess 
      customerDetails={customerDetails}
    />
  );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50">
      <div className="container mx-auto px-1  py-8">
        <div className={`${getContainerMaxWidth()} mx-auto`}>
          {/* Progress Steps */}
          <div className="mb-8"> 
            {/* Mobile Progress */}
            <div className="block md:hidden">
              <div className="bg-gradient-to-br from-blue-50/30 to-blue-50 rounded-xl p-4 shadow-sm border border-blue-200">
                <div className="text-center mb-3">
                  <div className="inline-flex items-center justify-center w-10 h-10 bg-gradient-to-br from-orange-400 to-amber-500 rounded-full mb-2 shadow-md">
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
                        index + 1 <= currentStep ? 'bg-orange-400' : 'bg-gray-200'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-center text-xs text-gray-500">Step {currentStep} of {steps.length}</p>
              </div>
            </div>
            
            {/* Desktop Progress */}
            <div className="hidden md:block">
              <div className="bg-gradient-to-br from-blue-50/30 to-blue-50 rounded-2xl p-6 shadow-sm border border-blue-200">
                <div className="flex items-center justify-between relative px-6">
                  {/* Progress Line - Fixed positioning */}
                  <div className="absolute top-6 left-12 right-12 h-0.5 bg-gray-200">
                    <div 
                      className="h-full bg-gradient-to-r from-orange-400 to-amber-500 transition-all duration-500 rounded-full"
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
                              ? 'bg-gradient-to-br from-orange-400 to-amber-500 text-white shadow-lg scale-110'
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
                          <div className={`text-sm font-semibold ${isActive ? 'text-orange-600' : isCompleted ? 'text-green-600' : 'text-gray-500'}`}>
                            {step.title}
                          </div>
                          <div className={`text-xs ${isActive ? 'text-orange-500' : isCompleted ? 'text-green-500' : 'text-gray-400'}`}>
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
          <div className="bg-white  rounded-2xl shadow-sm border border-orange-200 p-2 md:p-2 mb-8">
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
              disabled={!canProceedToNext() || currentStep === 5}
              className={`flex items-center justify-center px-6 py-3 rounded-xl font-medium transition-all duration-200 w-full sm:w-auto ${
                !canProceedToNext() || currentStep === 5
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-orange-500 to-amber-500 cursor-pointer text-white hover:from-orange-600 hover:to-amber-600 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
              }`}
            >
              {currentStep === 5 ? 'Complete Booking' : 'Next →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingFlow;
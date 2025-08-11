"use client";
import { useState } from 'react';
import { ShowSeatBookingProvider } from '@/context/ShowSeatBookingContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useTheme } from '@/context/ThemeContext';
import ShowDateTimeSelection from '@/components/show/ShowDateTimeSelection';
import ShowSeatSelection from '@/components/show/ShowSeatSelection';
import ShowUserDetails from '@/components/show/ShowUserDetails';
import ShowBookingSummary from '@/components/show/ShowBookingSummary';
import ShowPaymentProcess from '@/components/show/ShowPaymentProcess';
import { ArrowLeftIcon, CalendarDaysIcon, UserIcon, CreditCardIcon, CheckCircleIcon, TicketIcon } from '@heroicons/react/24/outline';

const STEPS = [
  { 
    id: 1, 
    title: 'Select Date & Time', 
    icon: CalendarDaysIcon,
    description: 'Choose your preferred date and show timing'
  },
  { 
    id: 2, 
    title: 'Choose Seats', 
    icon: TicketIcon,
    description: 'Select your seats from the auditorium layout'
  },
  { 
    id: 3, 
    title: 'User Details', 
    icon: UserIcon,
    description: 'Confirm your booking information'
  },
  { 
    id: 4, 
    title: 'Review Booking', 
    icon: CheckCircleIcon,
    description: 'Review your booking details and pricing'
  },
  { 
    id: 5, 
    title: 'Payment', 
    icon: CreditCardIcon,
    description: 'Complete secure payment to confirm booking'
  }
];

function ShowSeatBookingContent() {
  const { isDarkMode } = useTheme();
  const [currentStep, setCurrentStep] = useState(1);

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <ShowDateTimeSelection onNext={() => setCurrentStep(2)} />;
      case 2:
        return (
          <ShowSeatSelection 
            onNext={() => setCurrentStep(3)} 
            onBack={() => setCurrentStep(1)} 
          />
        );
      case 3:
        return (
          <ShowUserDetails 
            onNext={() => setCurrentStep(4)} 
            onBack={() => setCurrentStep(2)} 
          />
        );
      case 4:
        return (
          <ShowBookingSummary 
            onNext={() => setCurrentStep(5)} 
            onBack={() => setCurrentStep(3)} 
          />
        );
      case 5:
        return (
          <ShowPaymentProcess 
            onBack={() => setCurrentStep(4)} 
            onComplete={() => {
              // Reset to step 1 or redirect as needed
              setCurrentStep(1);
            }}
          />
        );
      default:
        return <ShowDateTimeSelection onNext={() => setCurrentStep(2)} />;
    }
  };

  return (
    <div className={`min-h-screen ${
      isDarkMode 
        ? 'bg-gradient-to-br from-gray-900 via-purple-900 to-pink-900' 
        : 'bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => window.history.back()}
              className={`p-2 rounded-lg transition-colors ${
                isDarkMode 
                  ? 'bg-gray-800 hover:bg-gray-700 text-white' 
                  : 'bg-white hover:bg-gray-50 text-gray-900'
              } shadow-md`}
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </button>
            <div>
              <h1 className={`text-3xl font-bold ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Book Show Seats 🎭
              </h1>
              <p className={`mt-1 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Reserve your seats for cultural shows and entertainment programs
              </p>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="mb-6">
            {/* Progress Bar Container */}
            <div className={`rounded-xl p-4 ${
              isDarkMode ? 'bg-gray-800' : 'bg-white'
            } shadow-lg border border-gray-200`}>
              
              {/* Progress Line */}
              <div className="relative mb-4">
                <div className="h-2 bg-gray-200 rounded-full">
                  <div 
                    className="h-2 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
                  ></div>
                </div>
              </div>
              
              {/* Steps */}
              <div className="flex justify-between">
                {STEPS.map((step) => {
                  const IconComponent = step.icon;
                  const isActive = step.id === currentStep;
                  const isCompleted = step.id < currentStep;
                  
                  return (
                    <div key={step.id} className="flex flex-col items-center flex-1">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                        isActive 
                          ? 'bg-purple-600 text-white scale-105' 
                          : isCompleted
                            ? 'bg-green-500 text-white'
                            : isDarkMode
                              ? 'bg-gray-600 text-gray-300'
                              : 'bg-gray-300 text-gray-600'
                      }`}>
                        {isCompleted ? (
                          <CheckCircleIcon className="w-4 h-4" />
                        ) : (
                          <IconComponent className="w-4 h-4" />
                        )}
                      </div>
                      <div className="mt-2 text-center">
                        <div className={`text-xs font-medium ${
                          isActive 
                            ? 'text-purple-600' 
                            : isCompleted
                              ? 'text-green-600'
                              : isDarkMode
                                ? 'text-gray-400'
                                : 'text-gray-500'
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
        <div className="space-y-8">
          {renderStepContent()}
        </div>
      </div>
    </div>
  );
}

export default function ShowSeatBookingPage() {
  return (
    <ProtectedRoute>
      <ShowSeatBookingProvider>
        <ShowSeatBookingContent />
      </ShowSeatBookingProvider>
    </ProtectedRoute>
  );
}

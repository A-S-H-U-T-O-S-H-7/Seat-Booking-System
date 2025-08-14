"use client";
import { useState } from "react";
import { Calendar, Users, UserCheck, CreditCard, Check } from "lucide-react";
import { useShowSeatBooking } from "@/context/ShowSeatBookingContext";
import ShowDateSelection from "./ShowDateSelection";
import ShowSeatSelection from "./ShowSeatSelection";
import ShowUserDetails from "./ShowUserDetails";
import ShowPaymentProcess from "./ShowPaymentProcess";

const ShowBookingFlow = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const {
    selectedDate,
    selectedSeats,
    bookingData,
  } = useShowSeatBooking();

  const userDetails = bookingData.userDetails || {};

  const steps = [
    {
      id: 1,
      title: "Select Date",
      subtitle: "Choose your day",
      icon: Calendar,
    },
    {
      id: 2,
      title: "Choose Seats",
      subtitle: "Reserve spots",
      icon: Users,
    },
    {
      id: 3,
      title: "Your Details",
      subtitle: "Personal info",
      icon: UserCheck,
    },
    {
      id: 4,
      title: "Payment",
      subtitle: "Complete booking",
      icon: CreditCard,
    },
  ];

  const canProceedToNext = () => {
    const canProceed = (() => {
      switch (currentStep) {
        case 1:
          // Check if a date is selected (either Date object or string)
          const dateSelected = selectedDate !== null && selectedDate !== "" && selectedDate !== undefined;
          console.log('Step 1 validation:', { selectedDate, dateSelected });
          return dateSelected;
        case 2:
          const seatsSelected = Array.isArray(selectedSeats) && selectedSeats.length > 0;
          console.log('Step 2 validation:', { selectedSeats, seatsSelected });
          return seatsSelected;
        case 3:
          const detailsComplete = (
            userDetails.name &&
            userDetails.email &&
            userDetails.phone &&
            userDetails.aadhar &&
            userDetails.address &&
            userDetails.emergencyContact
          );
          console.log('Step 3 validation:', { userDetails, detailsComplete });
          return detailsComplete;
        case 4:
          console.log('Step 4 validation: always true');
          return true; // On payment step, can proceed
        default:
          return false;
      }
    })();
    
    console.log(`Step ${currentStep} can proceed:`, canProceed);
    return canProceed;
  };

  const handleNext = () => {
    if (canProceedToNext() && currentStep < steps.length) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const getContainerMaxWidth = () => {
    return currentStep === 2 ? "max-w-8xl" : "max-w-6xl";
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <ShowDateSelection />;
      case 2:
        return <ShowSeatSelection />;
      case 3:
        return <ShowUserDetails />;
      case 4:
        return <ShowPaymentProcess />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <div className="container mx-auto px-2 py-8">
        <div className={`${getContainerMaxWidth()} mx-auto`}>
          {/* Progress Steps */}
          <div className="mb-8">
            {/* Mobile */}
            <div className="block md:hidden">
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                <div className="text-center mb-3">
                  <div className="inline-flex items-center justify-center w-10 h-10 bg-gradient-to-br from-pink-400 to-pink-600 rounded-full mb-2 shadow-md">
                    {(() => {
                      const IconComponent = steps[currentStep - 1].icon;
                      return <IconComponent className="w-5 h-5 text-white" />;
                    })()}
                  </div>
                  <h3 className="text-base font-semibold text-gray-900">
                    {steps[currentStep - 1].title}
                  </h3>
                  <p className="text-xs text-gray-600">
                    {steps[currentStep - 1].subtitle}
                  </p>
                </div>
                <div className="flex items-center justify-center space-x-1.5 mb-2">
                  {steps.map((_, index) => (
                    <div
                      key={index}
                      className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                        index + 1 <= currentStep
                          ? "bg-pink-400"
                          : "bg-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-center text-xs text-gray-500">
                  Step {currentStep} of {steps.length}
                </p>
              </div>
            </div>

            {/* Desktop */}
            <div className="hidden md:block">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between relative px-6">
                  {/* Progress Line */}
                  <div className="absolute top-6 left-12 right-12 h-0.5 bg-gray-300">
                    <div
                      className="h-full bg-gradient-to-r from-pink-400 to-pink-600 transition-all duration-500 rounded-full"
                      style={{
                        width: `${
                          ((currentStep - 1) / (steps.length - 1)) * 100
                        }%`,
                      }}
                    />
                  </div>

                  {steps.map((step) => {
                    const isActive = currentStep === step.id;
                    const isCompleted = currentStep > step.id;
                    const IconComponent = step.icon;

                    return (
                      <div
                        key={step.id}
                        className="flex flex-col items-center relative z-10"
                      >
                        <div
                          className={`flex items-center justify-center w-12 h-12 rounded-full font-semibold transition-all duration-300 ${
                            isCompleted
                              ? "bg-gradient-to-br from-green-400 to-emerald-500 text-white shadow-lg"
                              : isActive
                              ? "bg-gradient-to-br from-pink-400 to-pink-600 text-white shadow-lg scale-110"
                              : "bg-gray-200 text-gray-600 border-2 border-gray-300"
                          }`}
                        >
                          {isCompleted ? (
                            <Check className="w-6 h-6" />
                          ) : (
                            <IconComponent className="w-6 h-6" />
                          )}
                        </div>
                        <div className="mt-3 text-center">
                          <div
                            className={`text-sm font-semibold ${
                              isActive
                                ? "text-pink-600"
                                : isCompleted
                                ? "text-green-600"
                                : "text-gray-500"
                            }`}
                          >
                            {step.title}
                          </div>
                          <div
                            className={`text-xs ${
                              isActive
                                ? "text-pink-500"
                                : isCompleted
                                ? "text-green-500"
                                : "text-gray-400"
                            }`}
                          >
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
          <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-3 md:p-4 mb-8">
            {renderStepContent()}
          </div>

          {/* Navigation */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className={`flex items-center justify-center px-6 py-3 rounded-xl font-medium transition-all duration-200 w-full sm:w-auto ${
                currentStep === 1
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-white border-2 border-gray-400 text-gray-700 hover:bg-gray-50 hover:border-gray-500 shadow-sm hover:shadow-md"
              }`}
            >
              ← Previous
            </button>

            <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-500">
              <span>
                Step {currentStep} of {steps.length}
              </span>
            </div>

            <button
              onClick={handleNext}
              disabled={!canProceedToNext()}
              className={`flex items-center justify-center px-6 py-3 rounded-xl font-medium transition-all duration-200 w-full sm:w-auto ${
                !canProceedToNext()
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-gradient-to-r from-pink-500 to-pink-600 cursor-pointer text-white hover:from-pink-600 hover:to-pink-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              }`}
            >
              {currentStep === steps.length
                ? "Complete Booking"
                : "Next →"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShowBookingFlow;

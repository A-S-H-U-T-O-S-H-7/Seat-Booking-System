"use client";

import { useState } from "react";
import { useRouter } from 'next/navigation';
import { Minus, Plus, ArrowLeft } from "lucide-react";

const FAQ = () => {
  const [activeIndex, setActiveIndex] = useState(null);
  const router = useRouter();
  
  const faqs = [
    {
      question: "What is INTERNATIONAL SRI JAGANNATH PANCH RATRA?",
      answer: "INTERNATIONAL SRI JAGANNATH PANCH RATRA is an international event focused on Sri Jagannath Sanskriti. It will take place on (November-December) exact date to be declared soon at RAM LILA GROUND, SECTOR-21A, NOIDA STADIUM, NOIDA."
    },
    {
      question: "How do I register for the event?",
      answer: "You can register for INTERNATIONAL SRI JAGANNATH PANCH RATRA by visiting our official website at www.svsamiti.com. Please complete the registration form and submit your payment to secure your spot."
    },
    {
      question: "What are the registration fees?",
      answer: "Registration fees is RS.1100. However for booking Havan Kund Puja seat it vary based on the category (e.g., early bird, standard) and can be found on the registration page of our website."
    },
    {
      question: "Is there a deadline for registration?",
      answer: "Yes, the deadline for registration is 10 days before the event. We recommend registering early, as spaces may be limited."
    },
    {
      question: "Can I cancel my registration?",
      answer: "If you need to cancel your registration, please refer to our Cancellation and Refund Policy outlined in the Terms and Conditions. Generally, registration fees are non-refundable."
    },
    {
      question: "Will there be accommodations available?",
      answer: "Yes, we have partnered with local hotels to offer discounted rates for attendees. A list of recommended accommodations can be found on our website under the 'Accommodation' section."
    },
    {
      question: "What is the event schedule?",
      answer: "The event schedule, including sessions, speakers, and activities, will be available on our website closer to the event date. Participants will receive updates via email as well."
    },
    {
      question: "Will meals be provided?",
      answer: "Yes, on paid basis and will be included in your Delegation fee. Please inform us of any dietary restrictions during registration."
    },
    {
      question: "What is the dress code for the event?",
      answer: "The dress code for INTERNATIONAL SRI JAGANNATH PANCH RATRA is Dhoti Kurta. We recommend dressing comfortably while maintaining a professional appearance."
    },
    {
      question: "Is there a virtual attendance option?",
      answer: "Yes, Please select the virtual option during registration to receive access to live-streamed sessions and recordings."
    },
    {
      question: "How do I get to the event venue?",
      answer: "Yes by Air, Metro, Rail, buses, Taxi etc."
    },
    {
      question: "Who can I contact for more information?",
      answer: "For any further questions or inquiries, please contact us at 0120-4348458, 9999589202 or visit our website's 'Contact Us' page."
    },
    {
      question: "What health and safety measures will be in place?",
      answer: "We are committed to ensuring the health and safety of all participants."
    }
  ];

  const toggleFAQ = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="mb-6 flex items-center text-purple-600 hover:text-purple-800 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back
        </button>

        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-6 shadow-lg mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-white text-center">
            Frequently Asked Questions
          </h1>
          <p className="text-purple-100 text-center mt-2">
            INTERNATIONAL SRI JAGANNATH PANCH RATRA
          </p>
        </div>
      {faqs.length > 0 ? (
        <div className="space-y-4 max-w-4xl mx-auto">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="border border-purple-200 rounded-lg p-4 shadow-md hover:shadow-lg transition-all duration-300 bg-white"
            >
              <div
                className="flex justify-between items-center cursor-pointer"
                onClick={() => toggleFAQ(index)}
              >
                <h3 className="text-md md:text-lg font-medium font-body text-gray-700">
                  {faq.question}
                </h3>

                <span
                  className={`text-md md:text-lg text-gray-700 font-bold transform transition-transform duration-300 ${
                    activeIndex === index ? "rotate-180" : ""
                  }`}
                >
                  {activeIndex === index ? <Minus size={18} /> : <Plus size={18} />}
                </span>
              </div>
              <div
                className={`overflow-hidden transition-all duration-300 ${
                  activeIndex === index
                    ? "max-h-[300px] opacity-100"
                    : "max-h-0 opacity-0"
                }`}
              >
                <p className="mt-4 font-body text-gray-600">
                  {faq.answer}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-600">No FAQs available.</p>
      )}
        <p className="text-center mt-8 font-medium text-gray-700">
          SVS Team
        </p>
      </div>
    </div>
  );
};

export default FAQ;
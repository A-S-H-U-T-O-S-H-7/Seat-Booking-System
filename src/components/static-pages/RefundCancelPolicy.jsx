"use client";

import { useState } from "react";
import { useRouter } from 'next/navigation';
import { ArrowLeft, FileText, Phone, Mail, Globe, Ban } from "lucide-react";

const RefundCancellationPolicy = () => {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="mb-6 flex items-center text-blue-600 hover:text-blue-800 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back
        </button>

        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 shadow-lg mb-8">
          <div className="flex items-center justify-center mb-4">
            <FileText className="h-10 w-10 text-white mr-3" />
            <h1 className="text-3xl sm:text-4xl font-bold text-white text-center">
              Refund & Cancellation Policy
            </h1>
          </div>
          <p className="text-blue-100 text-center text-lg font-medium">
            INTERNATIONAL SRI JAGANNATH PANCH RATRA
          </p>
        </div>

        {/* Cancellation Policy */}
        <div className="bg-white rounded-xl shadow-lg border-l-8 border-red-500 mb-8">
          <div className="p-6 sm:p-8">
            <div className="flex items-center mb-6">
              <Ban className="h-8 w-8 text-red-500 mr-3" />
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
                Cancellation Policy
              </h2>
            </div>
            
            <div className="bg-red-50 border-l-4 border-red-400 p-6 rounded-r-lg">
              <p className="text-gray-700 leading-relaxed text-lg">
                <strong>Donation once paid and Receipt issued cannot be Refunded/Cancelled under any circumstances.</strong> 
                All donations made to INTERNATIONAL SRI JAGANNATH PANCH RATRA are considered final and irrevocable. 
                Your generous contribution supports Child Education, Women Empowerment, Senior Citizen Welfare, and Poor Children Support. 
                Please ensure you have reviewed all details before making your donation.
              </p>
            </div>
          </div>
        </div>

        {/* Contact Information Block */}
        <div className="bg-gradient-to-r from-green-600 to-teal-600 rounded-xl shadow-lg text-white">
          <div className="p-6 sm:p-8">
            <h3 className="text-2xl font-bold text-center mb-6 flex items-center justify-center">
              <Phone className="h-6 w-6 mr-2" />
              Contact Details
            </h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              {/* Phone Numbers */}
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="flex items-center mb-3">
                  <Phone className="h-5 w-5 mr-2 text-green-200" />
                  <h4 className="font-semibold text-lg">Phone Numbers</h4>
                </div>
                <div className="space-y-2">
                  <p className="flex items-center">
                    <span className="font-medium mr-2">Tel:</span>
                    <a href="tel:01204348458" className="hover:text-green-200 transition-colors">
                      0120-4348458
                    </a>
                  </p>
                  <p className="flex items-center">
                    <span className="font-medium mr-2">Phone:</span>
                    <a href="tel:+917303397090" className="hover:text-green-200 transition-colors">
                      +91 730 339 7090
                    </a>
                  </p>
                </div>
              </div>

              {/* Email & Website */}
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="flex items-center mb-3">
                  <Mail className="h-5 w-5 mr-2 text-blue-200" />
                  <h4 className="font-semibold text-lg">Digital Contact</h4>
                </div>
                <div className="space-y-2">
                  <p className="flex items-center">
                    <span className="font-medium mr-2">Email:</span>
                    <a href="mailto:info@svsamiti.com" className="hover:text-blue-200 transition-colors break-all">
                      info@svsamiti.com
                    </a>
                  </p>
                  <p className="flex items-center">
                    <Globe className="h-4 w-4 mr-2 text-yellow-200" />
                    <span className="font-medium mr-2">Website:</span>
                    <a href="https://www.svsamiti.com" target="_blank" rel="noopener noreferrer" className="hover:text-yellow-200 transition-colors">
                      www.svsamiti.com
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-gray-600 font-medium text-lg">
            🙏 Jay Jagannath 🙏
          </p>
          <p className="text-sm text-gray-500 mt-2">
            SVS Team
          </p>
          
        </div>
      </div>
    </div>
  );
};

export default RefundCancellationPolicy;
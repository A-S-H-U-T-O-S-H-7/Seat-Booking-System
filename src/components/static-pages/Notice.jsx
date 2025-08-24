"use client";

import { useState } from "react";
import { useRouter } from 'next/navigation';
import { ArrowLeft, AlertTriangle, Phone, Mail, Globe, Shield } from "lucide-react";

const Notice = () => {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="mb-6 flex items-center text-red-600 hover:text-red-800 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back
        </button>

        {/* Header */}
        <div className="bg-gradient-to-r from-rose-600 to-fuchsia-600 rounded-xl p-6 shadow-lg mb-8">
          <div className="flex items-center justify-center mb-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-white text-center">
              Important Warning
            </h1>
          </div>
          <p className="text-red-100 text-center text-lg font-medium">
            PUBLIC NOTICE
          </p>
        </div>

        {/* Notice Content */}
        <div className="bg-white rounded-xl shadow-lg border-l-8 border-red-500 mb-8">
          <div className="p-6 sm:p-8">
            <div className="flex items-center mb-6">
              <Shield className="h-8 w-8 text-red-500 mr-3" />
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
                Website Security Alert
              </h2>
            </div>
            
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-700 leading-relaxed mb-4">
                This is to inform you all, our website <span className="font-semibold text-red-600">www.svsamiti.org</span> has been hacked by some person and hosted with some defaming remarks on this site. Please beware of any misleading message/communication from E-mail ID <span className="font-semibold text-red-600">@svsamiti.org</span>.
              </p>
              
              <p className="text-gray-700 leading-relaxed mb-4">
                <strong>We will not be held responsible</strong> for any message or other information communicated through this id. In case you receive any mail from this id, please <strong>do not act on it</strong>.
              </p>
              
              <p className="text-gray-700 leading-relaxed mb-6">
                Please immediately contact us or communicate with us at <span className="font-semibold text-blue-600">info@svsamiti.com</span> and <span className="font-semibold text-blue-600">mail.camm@gmail.com</span> for any further information and communication.
              </p>
              
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg mb-6">
                <p className="text-gray-700 leading-relaxed">
                  <strong>Legal Action:</strong> We have already filed a complaint to the cyber cell and Police Station. We are in process of filing FIR and defamation suit against the person who committed such criminal acts and hacked the website.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Information Block */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg text-white">
          <div className="p-6 sm:p-8">
            <h3 className="text-2xl font-bold text-center mb-6 flex items-center justify-center">
              <Phone className="h-6 w-6 mr-2" />
              Official Contact Details
            </h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              {/* Phone Numbers */}
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="flex items-center mb-3">
                  <Phone className="h-5 w-5 mr-2 text-blue-200" />
                  <h4 className="font-semibold text-lg">Phone Numbers</h4>
                </div>
                <div className="space-y-2">
                  <p className="flex items-center">
                    <span className="font-medium mr-2">Tel:</span>
                    <a href="tel:01204348458" className="hover:text-blue-200 transition-colors">
                      0120-4348458
                    </a>
                  </p>
                  <p className="flex items-center">
                    <span className="font-medium mr-2">Phone:</span>
                    <a href="tel:+917303397090" className="hover:text-blue-200 transition-colors">
                      +91 730 339 7090
                    </a>
                  </p>
                </div>
              </div>

              {/* Email & Website */}
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="flex items-center mb-3">
                  <Mail className="h-5 w-5 mr-2 text-green-200" />
                  <h4 className="font-semibold text-lg">Digital Contact</h4>
                </div>
                <div className="space-y-2">
                  <p className="flex items-center">
                    <span className="font-medium mr-2">Email:</span>
                    <a href="mailto:info@svsamiti.com" className="hover:text-green-200 transition-colors break-all">
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

            {/* Emergency Contact Highlight */}
            <div className="mt-6 bg-red-500/20 border border-red-300/30 rounded-lg p-4 text-center">
              <p className="font-semibold text-lg mb-2">
                ⚠️ For Immediate Assistance ⚠️
              </p>
              <p className="text-sm">
                If you have received any suspicious communication from @svsamiti.org, 
                please contact us immediately at the above official channels.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-gray-600 font-medium">
            Stay Safe & Verify Before You Trust
          </p>
          <p className="text-sm text-gray-500 mt-2">
            SVS Team
          </p>
        </div>
      </div>
    </div>
  );
};

export default Notice;
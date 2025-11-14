"use client";

import { useState, useEffect } from "react";
import { X, AlertCircle, Phone, Mail } from "lucide-react";

export default function NoticePopup() {
  const [open, setOpen] = useState(false);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    setOpen(true);
    setTimeout(() => {
      setAnimate(true);
    }, 50);
  }, []);

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-black/60 via-black/50 to-black/60 backdrop-blur-md flex items-center justify-center z-50 p-3 overflow-y-auto">
      
      <div
        className={`
          relative max-w-2xl w-full rounded-3xl shadow-2xl overflow-hidden
          transform transition-all duration-700 ease-out
          ${animate ? "scale-100 opacity-100 translate-y-0" : "scale-90 opacity-0 translate-y-8"}
        `}
      >
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-white to-amber-50"></div>
        
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-orange-200/30 to-red-200/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-amber-200/30 to-yellow-200/30 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

        {/* Content */}
        <div className="relative p-4 md:p-6">
          {/* Close Button */}
          <button
            onClick={() => setOpen(false)}
            className="absolute top-2 right-2 p-1.5 rounded-full bg-white/80 hover:bg-white shadow-md hover:shadow-lg transition-all duration-300 group"
          >
            <X className="w-4 h-4 text-gray-600 group-hover:text-gray-900 group-hover:rotate-90 transition-all duration-300" />
          </button>

          {/* Alert Icon */}
          <div className="flex justify-center mb-3">
            <div className="relative">
              <div className="absolute inset-0 bg-red-400 rounded-full blur-xl opacity-30 animate-pulse"></div>
              <div className="relative bg-gradient-to-br from-red-500 to-red-600 p-2 rounded-xl shadow-lg">
                <AlertCircle className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>

          {/* Title */}
          <h2 className="text-xl md:text-2xl font-bold text-center mb-1 bg-gradient-to-r from-red-600 via-red-700 to-orange-600 bg-clip-text text-transparent leading-tight">
            Event Postponed
          </h2>
          <p className="text-center text-gray-600 text-xs md:text-sm mb-3">International Sri Jagannath Pancha Ratra</p>

          {/* Main Content Card */}
          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-3 md:p-4 shadow-lg border border-orange-100/50 mb-3">
            <p className="text-sm md:text-base text-gray-700 leading-relaxed mb-2">
              In view of the <span className="font-semibold text-red-600">recent incident in Delhi</span> and the <span className="font-semibold text-red-600">security alerts</span> indicating a possible threat around early December, <span className="font-semibold text-gray-900">Samudayik Vikas Samiti</span> has decided to postpone the International Sri Jagannath Pancha Ratra originally scheduled for <span className="font-medium text-gray-800">December 3–7, 2025</span>.
            </p>

            <p className="text-sm md:text-base text-gray-700 leading-relaxed mb-2">
              We sincerely regret the inconvenience caused.
            </p>
            
            <p className="text-sm md:text-base text-gray-700 leading-relaxed mb-2">
              <span className="font-semibold text-red-600">Public safety remains our highest priority.</span>
            </p>

            <p className="text-sm md:text-base text-gray-700 leading-relaxed">
              We are planning to organize the event in <span className="font-medium text-gray-800">late February or early March 2026</span>. The confirmed dates will be announced shortly.
            </p>
          </div>

          {/* Contact Information */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-3 shadow-md border border-blue-100">
            <p className="font-semibold text-gray-800 mb-2 text-center text-xs md:text-sm">For Queries, Please Contact:</p>
            
            <div className="text-center space-y-1.5">
              <p className="font-medium text-gray-700 text-sm md:text-base">FCA (Dr.) Manoranjan Mohanty</p>
              
              <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs md:text-sm">
                <a href="tel:9971322458" className="flex items-center gap-1 text-blue-600 hover:text-blue-700 transition-colors">
                  <Phone className="w-3 h-3" />
                  <span>9971322458</span>
                </a>
                <a href="mailto:info@svsamiti.com" className="flex items-center gap-1 text-blue-600 hover:text-blue-700 transition-colors">
                  <Mail className="w-3 h-3" />
                  <span>info@svsamiti.com</span>
                </a>
                <a href="mailto:svsamiti01@gmail.com" className="flex items-center gap-1 text-blue-600 hover:text-blue-700 transition-colors">
                  <Mail className="w-3 h-3" />
                  <span>svsamiti01@gmail.com</span>
                </a>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-3">
            <div className="inline-block bg-gradient-to-r from-orange-500 via-red-500 to-orange-500 bg-clip-text text-transparent font-bold text-base md:text-lg animate-pulse">
              🙏 Jai Jagannath 🙏
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
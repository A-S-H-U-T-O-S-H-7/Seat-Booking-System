"use client";

import { useState, useEffect } from "react";
import { Calendar, Phone, Mail, ArrowRight, Flower2 } from "lucide-react";

export default function NoticePopup() {
  const [open, setOpen] = useState(true);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
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
          {/* Alert Icon */}
          <div className="flex justify-center mb-3">
            <div className="relative">
              <div className="absolute inset-0 bg-orange-400 rounded-full blur-xl opacity-30 animate-pulse"></div>
              <div className="relative bg-gradient-to-br from-orange-500 to-amber-600 p-2 rounded-xl shadow-lg">
                <Calendar className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>

          {/* Title */}
          <h2 className="text-xl md:text-2xl font-bold text-center mb-1 bg-gradient-to-r from-orange-600 via-amber-600 to-orange-600 bg-clip-text text-transparent leading-tight">
            Coming Soon in 2026!
          </h2>
          <p className="text-center text-gray-600 text-xs md:text-sm mb-3">International Sri Jagannath Pancha Ratra</p>

          {/* Main Content Card */}
          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-3 md:p-4 shadow-lg border border-orange-100/50 mb-3">
            <p className="text-sm md:text-base text-gray-700 leading-relaxed mb-2">
              <span className="font-semibold text-orange-600">Samudayik Vikas Samiti</span> is excited to announce the upcoming 
              <span className="font-semibold text-gray-900"> International Sri Jagannath Pancha Ratra</span> festival in 2026.
            </p>

            <p className="text-sm md:text-base text-gray-700 leading-relaxed mb-2">
              Get ready for five days of divine celebrations, cultural programs, and spiritual enlightenment celebrating Lord Jagannath.
            </p>
            
            <p className="text-sm md:text-base text-gray-700 leading-relaxed">
              <span className="font-semibold text-orange-600">Exact dates will be announced soon.</span> Stay tuned for updates!
            </p>
          </div>

          {/* Raja Parba Section - FESTIVE VERSION */}
<div className="relative bg-gradient-to-br from-rose-100 via-pink-100 to-orange-100 rounded-2xl p-4 md:p-6 shadow-xl border border-red-200 mb-4 overflow-hidden">

  {/* 🌿 Corner Decorations */}
  <img 
    src="/greencorner.png"
    alt="corner"
    className="absolute rotate-90  -top-5 left-0 w-16 md:w-24 opacity-80"
  />
  <img 
    src="/greencorner.png"
    alt="corner"
    className="absolute -bottom-5 right-0 w-16 md:w-24 scale-x-[-1] opacity-80"
  />
  <img 
    src="/raja-logo.png"
    alt="corner"
    className="absolute bottom-1 left-1 bg-white rounded-full p-2 border-2 border-rose-400 w-16 md:w-24 scale-x-[-1] opacity-80"
  />

  {/* Subtle Glow Background */}
  <div className="absolute inset-0 bg-gradient-to-r from-pink-300/20 via-red-300/20 to-orange-300/20 blur-2xl animate-pulse"></div>

  <div className="relative text-center">

    {/* Animated Festival Title */}
    <h3 className="text-lg md:text-2xl font-extrabold bg-gradient-to-r from-pink-600 via-red-600 to-orange-600 bg-clip-text text-transparent animate-pulse tracking-wide">
      🌺 RAJA PARBA 2026 🌺
    </h3>

    <p className="text-sm md:text-base font-semibold text-gray-700 mt-1">
      Festival of Womanhood • Pride of Odisha
    </p>

    <p className="text-sm md:text-base font-bold text-red-700 mt-2">
      📅 June 13 – 15, 2026
    </p>

    {/* Festive CTA Button */}
    <a 
      href="https://raja-parba.vercel.app" 
      target="_blank" 
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 mt-3 bg-gradient-to-r from-pink-600 via-red-600 to-orange-600 text-white px-5 py-2.5 rounded-full text-sm md:text-base font-semibold shadow-lg hover:shadow-2xl transform hover:scale-110 transition-all duration-300"
    >
      Celebrate With Us
      <ArrowRight className="w-4 h-4 animate-bounce" />
    </a>

  </div>
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
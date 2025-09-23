import React from 'react';
import { Facebook, Twitter, Youtube } from 'lucide-react';
import Link from 'next/link';

function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="w-full">
      {/* Main Footer Section */}
      <div className="bg-gradient-to-b from-slate-900 to-blue-950 text-gray-300">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 md:gap-8 mb-2">
          
          {/* Company Logo and About - Takes 2 columns on large screens */}
          <div className="lg:col-span-2 space-y-4">
            {/* Logo */}
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg">
                <img 
                  src="/header-logo.png" 
                  alt="Samudayik Vikas Samiti Logo" 
                  className="object-contain "
                  onError={(e) => {
                    // Fallback to text if image fails to load
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'block';
                  }}
                />
                <span className="text-white font-bold text-lg hidden">SVS</span>
              </div>
            </div>
            
            {/* About Company */}
            <div>
              <h4 className="text-lg font-semibold text-white relative pb-2 after:content-[''] after:absolute after:left-0 after:bottom-0 after:h-0.5 after:w-16 after:bg-teal-500 mb-4">About Us</h4>
              <p className="text-gray-400 text-sm leading-relaxed">
                <span className="font-semibold text-gray-300">
                  The Samudayik Vikas Samiti
                </span>{" "}
                is a registered society under societies registration act XXI, 1860, 
                registered on dated 16th March 1999 to promote, facilitate, conduct and co-ordinate social 
                actions/programs for the emancipation and uplift of the weaker sections particularly those 
                socially challenged.
              </p>
            </div>

            {/* Social Media */}
            <div className="mt-6">
              <p className="text-sm font-medium mb-3 text-gray-300">
                Follow Us
              </p>
              <div className="flex gap-4">
                <a 
                  href="https://www.facebook.com/svsindia/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center bg-gray-300 p-2 rounded-full hover:bg-slate-700 transition-colors duration-300 group"
                  style={{ width: "46px", height: "46px" }}
                >
                  <Facebook size={20} className="text-slate-800 group-hover:text-white" />
                </a>
                <a 
                  href="https://x.com/svsamiti" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center bg-gray-300 p-2 rounded-full hover:bg-slate-700 transition-colors duration-300 group"
                  style={{ width: "46px", height: "46px" }}
                >
                  <Twitter size={20} className="text-slate-800 group-hover:text-white" />
                </a>
                <a 
                  href="https://www.youtube.com/channel/UCLS9IOa-Gkh0PTGD81givxA?view_as=subscriber" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center bg-gray-300 p-2 rounded-full hover:bg-slate-700 transition-colors duration-300 group"
                  style={{ width: "46px", height: "46px" }}
                >
                  <Youtube size={20} className="text-slate-800 group-hover:text-white" />
                </a>
              </div>
            </div>
          </div>

          {/* Contact Details */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white relative pb-2 after:content-[''] after:absolute after:left-0 after:bottom-0 after:h-0.5 after:w-16 after:bg-teal-500">Contact Details</h4>
            <div className="space-y-3 text-gray-400">
              <div className="flex items-start space-x-2">
                <span className="text-gray-300 font-medium min-w-[60px]">Tel:</span>
                <span className="text-sm lg:text-base">0120-4348458</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-gray-300 font-medium min-w-[60px]">Phone:</span>
                <span className="text-sm lg:text-base">+91 730 339 7090</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-gray-300 font-medium min-w-[60px]">Email:</span>
                <a href="mailto:info@svsamiti.com" className="text-sm lg:text-base hover:text-teal-300 transition-colors">
                  info@svsamiti.com
                </a>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-gray-300 font-medium min-w-[60px]">Website:</span>
                <a href="http://www.svsamiti.com" className="text-sm lg:text-base hover:text-teal-300 transition-colors">
                  www.svsamiti.com
                </a>
              </div>
            </div>
          </div>

          {/* Addresses */}
          <div className="space-y-6">
            {/* Corporate Address */}
            <div>
              <h4 className="text-lg font-semibold text-white relative pb-2 after:content-[''] after:absolute after:left-0 after:bottom-0 after:h-0.5 after:w-16 after:bg-teal-500 mb-4">Corporate Address</h4>
              <div className="text-gray-400 text-sm lg:text-base leading-relaxed">
                <p>C-316 B & C, C Block,</p>
                <p>Sector 10, Noida,</p>
                <p>Uttar Pradesh 201301</p>
              </div>
            </div>

            {/* Registered Address */}
            <div>
              <h4 className="text-lg font-semibold text-white relative pb-2 after:content-[''] after:absolute after:left-0 after:bottom-0 after:h-0.5 after:w-16 after:bg-teal-500 mb-4">Registered Address</h4>
              <div className="text-gray-400 text-sm lg:text-base leading-relaxed">
                <p>A 86/B, 2nd Floor,</p>
                <p>School Block, Chander Vihar,</p>
                <p>Delhi-110092</p>
              </div>
            </div>
          </div>

          {/* Important Links - New Column */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white relative pb-2 after:content-[''] after:absolute after:left-0 after:bottom-0 after:h-0.5 after:w-16 after:bg-teal-500 mb-4">Important Links</h4>
            <div className="space-y-3">
              <Link href="/faqs" className="block text-gray-400 text-sm lg:text-base hover:text-teal-300 hover:translate-x-1 transition-all duration-300">
                FAQs
              </Link>
              <Link href="/privacy-policy" className="block text-gray-400 text-sm lg:text-base hover:text-teal-300 hover:translate-x-1 transition-all duration-300">
                Privacy Policy
              </Link>
              <Link href="/terms-and-conditions" className="block text-gray-400 text-sm lg:text-base hover:text-teal-300 hover:translate-x-1 transition-all duration-300">
                Terms & Conditions
              </Link>
              {/* <Link href="/notice" className="block text-gray-400 text-sm lg:text-base hover:text-teal-300 hover:translate-x-1 transition-all duration-300">
                Notice
              </Link> */}
              <Link href="/refund-cancel-policy" className="block text-gray-400 text-sm lg:text-base hover:text-teal-300 hover:translate-x-1 transition-all duration-300">
                Refund & Cancellation Policy
              </Link>
            </div>
          </div>

          </div>
        </div>
      </div>

      {/* Bottom Footer Section */}
      <div className="bg-slate-950 text-gray-400">
        <div className="container mx-auto">
          {/* Copyright */}
          <div className="text-center py-6 text-xs space-y-2">
            <p className="text-sm">
              &copy; {currentYear} Samudayik Vikas Samiti. All Rights Reserved.
            </p>
            <p className="text-gray-500">
              For support, contact us at{' '}
              <a href="mailto:info@svsamiti.com" className="hover:text-teal-300 transition-colors underline">
                info@svsamiti.com
              </a>
            </p>
            
          </div>
        </div>
      </div>
    </footer>
  );
} 

export default Footer;
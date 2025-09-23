// SponsorModal.jsx
import React from 'react';
import { X, Heart, User, Mail, Phone, MapPin } from 'lucide-react';

const SponsorModal = ({ 
  showSponsorModal, 
  setShowSponsorModal, 
  sponsorForm, 
  setSponsorForm, 
  handleSponsorSubmit 
}) => {
  if (!showSponsorModal) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-3xl transform animate-slideUp">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mr-3">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800">Sponsor Application</h3>
          </div>
          <button
            onClick={() => setShowSponsorModal(false)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Full Name"
              value={sponsorForm.name}
              onChange={(e) => setSponsorForm({...sponsorForm, name: e.target.value})}
              className="w-full text-gray-800 pl-11 pr-4 py-3 border border-gray-400 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              required
            />
          </div>

          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="email"
              placeholder="Email Address"
              value={sponsorForm.email}
              onChange={(e) => setSponsorForm({...sponsorForm, email: e.target.value})}
              className="w-full text-gray-800 pl-11 pr-4 py-3 border border-gray-400 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              required
            />
          </div>

          <div className="relative">
            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="tel"
              placeholder="Phone Number"
              value={sponsorForm.phone}
              onChange={(e) => setSponsorForm({...sponsorForm, phone: e.target.value})}
              className="w-full text-gray-800 pl-11 pr-4 py-3 border border-gray-400 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              required
            />
          </div>

          <div className="relative">
            <MapPin className="absolute left-3 top-4 w-5 h-5 text-gray-400" />
            <textarea
              placeholder="Organization Address"
              value={sponsorForm.address}
              onChange={(e) => setSponsorForm({...sponsorForm, address: e.target.value})}
              className="w-full text-gray-800 pl-11 pr-4 py-3 border border-gray-400 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all h-20 resize-none"
              required
            />
          </div>

          <button
            onClick={handleSponsorSubmit}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold py-3 rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-300 mt-6"
          >
            Submit Partnership Request
          </button>

          <p className='italic text-gray-700'>Once the form is submitted, our team will contact you within 24 hours.🙂</p>
        </div>
      </div>
    </div>
  );
};

export default SponsorModal;
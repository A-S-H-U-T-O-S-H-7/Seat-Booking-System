// PerformerModal.jsx
import React from 'react';
import { X, Mic, User, Mail, Phone, MapPin, Sparkles } from 'lucide-react';

const PerformerModal = ({ 
  showPerformerModal, 
  setShowPerformerModal, 
  performerForm, 
  setPerformerForm, 
  handlePerformerSubmit 
}) => {
  if (!showPerformerModal) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-3xl transform animate-slideUp">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-cyan-500 rounded-xl flex items-center justify-center mr-3">
              <Mic className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800">Performer Application</h3>
          </div>
          <button
            onClick={() => setShowPerformerModal(false)}
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
              value={performerForm.name}
              onChange={(e) => setPerformerForm({...performerForm, name: e.target.value})}
              className="w-full text-gray-800 pl-11 pr-4 py-3 border border-gray-400 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              required
            />
          </div>

          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="email"
              placeholder="Email Address"
              value={performerForm.email}
              onChange={(e) => setPerformerForm({...performerForm, email: e.target.value})}
              className="w-full text-gray-800 pl-11 pr-4 py-3 border border-gray-400 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              required
            />
          </div>

          <div className="relative">
            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="tel"
              placeholder="Phone Number"
              value={performerForm.phone}
              onChange={(e) => setPerformerForm({...performerForm, phone: e.target.value})}
              className="w-full text-gray-800 pl-11 pr-4 py-3 border border-gray-400 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              required
            />
          </div>

          <div className="relative">
            <MapPin className="absolute left-3 top-4 w-5 h-5 text-gray-400" />
            <textarea
              placeholder="Your Address"
              value={performerForm.address}
              onChange={(e) => setPerformerForm({...performerForm, address: e.target.value})}
              className="w-full text-gray-800 pl-11 pr-4 py-3 border border-gray-400 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all h-20 resize-none"
              required
            />
          </div>

          <div className="relative">
  <Sparkles className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
  <input
    type="text"
    value={performerForm.performanceType}
    onChange={(e) =>
      setPerformerForm({ ...performerForm, performanceType: e.target.value })
    }
    placeholder="Enter Performance Type"
    className="w-full text-gray-800 pl-11 pr-4 py-3 border border-gray-400 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white"
    required
  />
</div>


          <button
            onClick={handlePerformerSubmit}
            className="w-full bg-gradient-to-r from-indigo-600 to-cyan-600 text-white font-semibold py-3 rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-300 mt-6"
          >
            Submit Talent Application
          </button>
        </div>
                  <p className='italic mt-2 text-gray-700'>Once the form is submitted, our team will contact you within 24 hours.🙂</p>

      </div>
      
    </div>
  );
};

export default PerformerModal;
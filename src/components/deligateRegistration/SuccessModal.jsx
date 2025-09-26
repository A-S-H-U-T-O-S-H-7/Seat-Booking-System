import React from 'react';
import { CheckCircle, X } from 'lucide-react';
import DonationPart from '../DonatePart';

const SuccessModal = ({ isOpen, onClose, onProfileClick }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-md bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-2 max-w-md w-full mx-4 shadow-2xl relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Success Icon */}
        <div className="text-center mb-6">
          <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          
          {/* Success Message */}
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Successfully Submitted!
          </h2>
          <p className="text-gray-600 text-sm">
            Your delegate registration has been completed successfully. You can now access your Free Entry Pass.
          </p>
        </div>

        {/* Action Button */}
        <div className="text-center">
          <button
            onClick={onProfileClick}
            className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 cursor-pointer text-white font-semibold px-8 py-3 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            Check your Free Entry Pass
          </button>
        </div>
<div className='mt-7'>
        <DonationPart />
        </div>
      </div>
    </div>
  );
};

export default SuccessModal;
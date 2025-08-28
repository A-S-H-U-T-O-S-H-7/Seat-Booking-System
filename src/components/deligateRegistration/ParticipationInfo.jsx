import React from 'react';
import { FileText } from 'lucide-react';
import DelegateOptions from './DelegateOptions';

const ParticipationInfo = ({ formData, errors, handleInputChange, handleBlur, calculateAmount }) => (
  <div className="space-y-4 border-2 border-emerald-200 rounded-xl p-4">
    <h3 className="text-lg font-semibold text-gray-800 border-b border-emerald-200 pb-2 flex items-center">
      <FileText className="w-4 h-4 mr-2 text-emerald-600" />
      Delegate Registration Options
    </h3>
    
    <DelegateOptions 
      formData={formData} 
      errors={errors} 
      handleInputChange={handleInputChange} 
      calculateAmount={calculateAmount} 
    />
  </div>
);

export default ParticipationInfo;
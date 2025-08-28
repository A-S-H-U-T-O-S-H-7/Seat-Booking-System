import React from 'react';
import { FileText } from 'lucide-react';
import DelegateOptions from './DelegateOptions';

const ParticipationInfo = ({ formData, errors, handleInputChange, handleBlur, calculateAmount }) => (
  <div className="space-y-4 border-2 border-emerald-200 rounded-xl p-4">
    <h3 className="text-lg font-semibold text-gray-800 border-b border-emerald-200 pb-2 flex items-center">
      <FileText className="w-4 h-4 mr-2 text-emerald-600" />
      Participation Details
    </h3>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Participation As *</label>
        <select
          name="participation"
          value={formData.participation}
          onChange={handleInputChange}
          className={`w-full text-gray-800 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all ${
            errors.participation ? 'border-red-500' : 'border-gray-300'
          }`}
          onBlur={handleBlur}
        >
          <option value="">Select Participation Type</option>
          <option value="Delegate">Delegate</option>
          <option value="Sponsor">Sponsor</option>
          <option value="Cultural performer">Cultural Performer</option>
        </select>
        {errors.participation && <p className="text-red-500 text-xs mt-1">{errors.participation}</p>}
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Designation</label>
        <input
          type="text"
          name="designation"
          value={formData.designation}
          onChange={handleInputChange}
          className="w-full text-gray-800 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
          placeholder="Your designation"
        />
      </div>
    </div>

    {formData.participation === 'Delegate' && (
      <DelegateOptions 
        formData={formData} 
        errors={errors} 
        handleInputChange={handleInputChange} 
        calculateAmount={calculateAmount} 
      />
    )}

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Brief Profile</label>
      <input
        type="text"
        name="brief"
        value={formData.brief}
        onChange={handleInputChange}
        className="w-full text-gray-800 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
        placeholder="Brief description about yourself"
      />
    </div>
  </div>
);

export default ParticipationInfo;
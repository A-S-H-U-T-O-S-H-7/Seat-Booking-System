import React from 'react';
import { User, Mail, Phone, Building, FileText } from 'lucide-react';

const PersonalInfo = ({ formData, errors, handleInputChange, handleBlur }) => {
  // Function to count words
  const countWords = (text) => {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  // Handle brief profile change with word limit
  const handleBriefChange = (e) => {
    const text = e.target.value;
    const wordCount = countWords(text);
    
    if (wordCount <= 50) {
      handleInputChange(e);
    }
  };

  return (
    <div className="space-y-4 border-2 border-emerald-200 rounded-xl p-4">
      <h3 className="text-lg font-semibold text-gray-800 border-b border-emerald-200 pb-2 flex items-center">
        <User className="w-4 h-4 mr-2 text-emerald-600" />
        Personal Information
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-gray-800 ${
              errors.name ? 'border-red-500' : 'border-gray-300'
            }`}
            onBlur={handleBlur}
            placeholder="Enter your full name"
          />
          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number *</label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              name="mobile"
              value={formData.mobile}
              onChange={handleInputChange}
              className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-gray-800 ${
                errors.mobile ? 'border-red-500' : 'border-gray-300'
              }`}
              onBlur={handleBlur}
              placeholder="Mobile number"
            />
          </div>
          {errors.mobile && <p className="text-red-500 text-xs mt-1">{errors.mobile}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-gray-800 ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
              onBlur={handleBlur}
              placeholder="Enter your email"
            />
          </div>
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Registration Type *</label>
          <div className="relative">
            <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <select
              name="registrationType"
              value={formData.registrationType || ''}
              onChange={handleInputChange}
              className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-gray-800 ${
                errors.registrationType ? 'border-red-500' : 'border-gray-300'
              }`}
              onBlur={handleBlur}
            >
              <option value="">Select Registration Type</option>
              <option value="Company">Company</option>
              <option value="Temple">Temple</option>
              <option value="Individual">Individual</option>
            </select>
          </div>
          {errors.registrationType && <p className="text-red-500 text-xs mt-1">{errors.registrationType}</p>}
        </div>
      </div>

      {/* Conditional inputs based on registration type */}
      {formData.registrationType === 'Company' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Company Name *</label>
          <input
            type="text"
            name="companyname"
            value={formData.companyname}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-gray-800 ${
              errors.companyname ? 'border-red-500' : 'border-gray-300'
            }`}
            onBlur={handleBlur}
            placeholder="Enter your company name"
          />
          {errors.companyname && <p className="text-red-500 text-xs mt-1">{errors.companyname}</p>}
        </div>
      )}

      {formData.registrationType === 'Temple' && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Temple Name *</label>
            <input
              type="text"
              name="templename"
              value={formData.templename || ''}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-gray-800 ${
                errors.templename ? 'border-red-500' : 'border-gray-300'
              }`}
              onBlur={handleBlur}
              placeholder="Enter temple name"
            />
            {errors.templename && <p className="text-red-500 text-xs mt-1">{errors.templename}</p>}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Brief Profile * 
              <span className="text-xs text-gray-500">
                ({countWords(formData.brief || '')}/50 words)
              </span>
            </label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
              <textarea
                name="brief"
                value={formData.brief || ''}
                onChange={handleBriefChange}
                rows="3"
                className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-gray-800 resize-none ${
                  errors.brief ? 'border-red-500' : 'border-gray-300'
                }`}
                onBlur={handleBlur}
                placeholder="Brief description about your temple and profile (max 50 words)"
              />
            </div>
            {errors.brief && <p className="text-red-500 text-xs mt-1">{errors.brief}</p>}
            {countWords(formData.brief || '') === 50 && (
              <p className="text-amber-600 text-xs mt-1">Word limit reached (50/50)</p>
            )}
          </div>
        </>
      )}

      {/* Designation field for all registration types */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Designation</label>
        <input
          type="text"
          name="designation"
          value={formData.designation || ''}
          onChange={handleInputChange}
          className="w-full text-gray-800 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
          placeholder="Your designation"
        />
      </div>
    </div>
  );
};

export default PersonalInfo;
import React from 'react';
import { User, Mail, Phone } from 'lucide-react';

const PersonalInfo = ({ formData, errors, handleInputChange, handleBlur }) => (
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
        <label className="block text-sm font-medium text-gray-700 mb-1">Company / Temple</label>
        <input
          type="text"
          name="companyname"
          value={formData.companyname}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-gray-800"
          placeholder="Company or temple name"
        />
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
  </div>
);

export default PersonalInfo;
import React from 'react';
import { MapPin } from 'lucide-react';

const LocationInfo = ({ formData, errors, handleInputChange, handleBlur, countries, states, cities }) => (
  <div className="space-y-4 border-2 border-emerald-200 rounded-xl p-4">
    <h3 className="text-lg font-semibold text-gray-800 border-b border-emerald-200 pb-2 flex items-center">
      <MapPin className="w-4 h-4 mr-2 text-emerald-600" />
      Location Details
    </h3>
    
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Country *</label>
        <select
          name="country"
          value={formData.country}
          onChange={handleInputChange}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-gray-800 ${
            errors.country ? 'border-red-500' : 'border-gray-300'
          }`}
          onBlur={handleBlur}
        >
          <option value="">Select Country</option>
          {countries.map(country => (
            <option key={country.iso2} value={country.name}>{country.name}</option>
          ))}
        </select>
        {errors.country && <p className="text-red-500 text-xs mt-1">{errors.country}</p>}
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
        <select
          name="state"
          value={formData.state}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-gray-800"
          disabled={!states.length}
        >
          <option value="">Select State</option>
          {states.map(state => (
            <option key={state.iso2} value={state.name}>{state.name}</option>
          ))}
        </select>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
        <select
          name="city"
          value={formData.city}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-gray-800"
          disabled={!cities.length}
        >
          <option value="">Select City</option>
          {cities.map(city => (
            <option key={city.id} value={city.name}>{city.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Pincode *</label>
        <input
          type="text"
          name="pincode"
          value={formData.pincode}
          onChange={handleInputChange}
          onBlur={handleBlur}
          maxLength="6"
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-gray-800 ${
            errors.pincode ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Enter 6-digit pincode"
        />
        {errors.pincode && <p className="text-red-500 text-xs mt-1">{errors.pincode}</p>}
      </div>

    </div>
    
    <div className="grid grid-cols-1  gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Complete Address *</label>
        <textarea
          name="address"
          value={formData.address}
          onChange={handleInputChange}
          onBlur={handleBlur}
          rows="2"
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all resize-none text-gray-800 ${
            errors.address ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Enter your complete address"
        />
        {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
      </div>
      
      
    </div>
  </div>
);

export default LocationInfo;
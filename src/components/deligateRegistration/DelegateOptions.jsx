import React from 'react';
import { Calendar, Users } from 'lucide-react';
import { PRICING_CONFIG } from '@/utils/delegatePricing';

const DelegateOptions = ({ formData, errors, handleInputChange, calculateAmount, pricingConfig = PRICING_CONFIG }) => (
  <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-2 md:p-4 rounded-lg border border-emerald-200">
    <h4 className="font-medium text-gray-800 mb-4">Delegate Options</h4>
    
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">Choose Delegate Type *</label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Normal Block */}
          <div className={`p-2 md:p-4 rounded-lg border-2 cursor-pointer transition-all ${
            formData.delegateType === 'normal' 
              ? 'border-emerald-500 bg-emerald-50' 
              : 'border-gray-300 bg-white hover:border-emerald-300'
          }`}>
            <label className="flex items-start space-x-3 cursor-pointer">
              <input
                type="radio"
                name="delegateType"
                value="normal"
                checked={formData.delegateType === 'normal'}
                onChange={handleInputChange}
                className="mt-1 text-emerald-600 focus:ring-emerald-500"
              />
              <div className="flex-1">
                <h5 className="font-bold text-gray-800 text-base mb-2">Normal</h5>
                <p className="text-sm font-medium text-emerald-600 mb-2">
                  Free for 5 days
                </p>
                <ul className="text-sm text-gray-600 space-y-1">
                  {pricingConfig.normal.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-emerald-500 mr-2">•</span>
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>
            </label>
          </div>
          
          {/* Without Assistance Block */}
          <div className={`p-2 md:p-4 rounded-lg border-2 cursor-pointer transition-all ${
            formData.delegateType === 'withoutAssistance' 
              ? 'border-emerald-500 bg-emerald-50' 
              : 'border-gray-300 bg-white hover:border-emerald-300'
          }`}>
            <label className="flex items-start space-x-3 cursor-pointer">
              <input
                type="radio"
                name="delegateType"
                value="withoutAssistance"
                checked={formData.delegateType === 'withoutAssistance'}
                onChange={handleInputChange}
                className="mt-1 text-emerald-600 focus:ring-emerald-500"
              />
              <div className="flex-1">
                <h5 className="font-bold text-gray-800 text-base mb-2">Without Assistance</h5>
                <p className="text-sm font-medium text-emerald-600 mb-2">
                  ₹{pricingConfig.withoutAssistance.pricePerPerson.toLocaleString()}/person for 5 days
                </p>
                <ul className="text-sm text-gray-600 space-y-1">
                  {pricingConfig.withoutAssistance.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-emerald-500 mr-2">•</span>
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>
            </label>
          </div>
          
          {/* With Assistance Block */}
          <div className={`p-2 md:p-4 rounded-lg border-2 cursor-pointer transition-all ${
            formData.delegateType === 'withAssistance' 
              ? 'border-emerald-500 bg-emerald-50' 
              : 'border-gray-300 bg-white hover:border-emerald-300'
          }`}>
            <label className="flex items-start space-x-3 cursor-pointer">
              <input
                type="radio"
                name="delegateType"
                value="withAssistance"
                checked={formData.delegateType === 'withAssistance'}
                onChange={handleInputChange}
                className="mt-1 text-emerald-600 focus:ring-emerald-500"
              />
              <div className="flex-1">
                <h5 className="font-bold text-gray-800 text-base mb-2">With Assistance</h5>
                <p className="text-sm font-medium text-emerald-600 mb-2">
                  ₹{pricingConfig.withAssistance.pricePerPersonPerDay.toLocaleString()}/person/day
                </p>
                <ul className="text-sm text-gray-600 space-y-1">
                  {pricingConfig.withAssistance.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-emerald-500 mr-2">•</span>
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>
            </label>
          </div>
        </div>
        {errors.delegateType && <p className="text-red-500 text-xs mt-2">{errors.delegateType}</p>}
      </div>

      {formData.delegateType && formData.delegateType !== 'normal' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {formData.delegateType === 'withAssistance' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Number of Days *</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="number"
                  name="days"
                  value={formData.days}
                  onChange={handleInputChange}
                  min={pricingConfig.withAssistance.minDays}
                  max={pricingConfig.withAssistance.maxDays}
                  className={`w-full text-gray-800 pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all ${
                    errors.days ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Days (2-5)"
                />
              </div>
              {errors.days && <p className="text-red-500 text-xs mt-1">{errors.days}</p>}
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Number of Persons *</label>
            <div className="relative">
              <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="number"
                name="numberOfPersons"
                value={formData.numberOfPersons || '1'}
                onChange={handleInputChange}
                min="1"
                className={`w-full text-gray-800 pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all ${
                  errors.numberOfPersons ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="1"
              />
            </div>
            {errors.numberOfPersons && <p className="text-red-500 text-xs mt-1">{errors.numberOfPersons}</p>}
          </div>
        </div>
      )}
      
     
      {formData.delegateType && (
        <div className="bg-white p-4 rounded-lg border-2 border-emerald-300 shadow-sm">
          <div className="text-center">
            <p className="text-xl font-bold text-emerald-700 mb-1">
              Total Amount: {formData.delegateType === 'normal' ? 'Free' : `₹${calculateAmount().toLocaleString()}`}
            </p>
            <p className="text-sm text-gray-600">
              {formData.delegateType === 'normal' 
                ? `${formData.numberOfPersons || 1} person(s) × ${pricingConfig.normal.fixedDays} days × Free`
                : formData.delegateType === 'withoutAssistance' 
                ? `${formData.numberOfPersons || 1} person(s) × ${pricingConfig.withoutAssistance.fixedDays} days × ₹${pricingConfig.withoutAssistance.pricePerPerson.toLocaleString()}`
                : `${formData.numberOfPersons || 1} person(s) × ${formData.days || pricingConfig.withAssistance.minDays} day(s) × ₹${pricingConfig.withAssistance.pricePerPersonPerDay.toLocaleString()}`
              }
            </p>
          </div>
        </div>
      )}
    </div>
  </div>
);

export default DelegateOptions;
"use client";
import { UserGroupIcon, PlusIcon } from '@heroicons/react/24/outline';

export default function DelegatePriceSection({ settings, onUpdate, isDarkMode }) {
  // Handle price changes for delegate types
  const handleWithoutAssistanceChange = (field, value) => {
    const updatedSettings = {
      ...settings,
      withoutAssistance: {
        ...settings.withoutAssistance,
        [field]: field === 'benefits' ? value : (field === 'pricePerPerson' || field === 'fixedDays' ? parseInt(value) || 0 : value)
      }
    };
    onUpdate(updatedSettings);
  };

  const handleWithAssistanceChange = (field, value) => {
    const updatedSettings = {
      ...settings,
      withAssistance: {
        ...settings.withAssistance,
        [field]: field === 'benefits' ? value : (field.includes('Days') || field === 'pricePerPersonPerDay' ? parseInt(value) || 0 : value)
      }
    };
    onUpdate(updatedSettings);
  };

  // Handle benefit management
  const handleBenefitAdd = (type) => {
    const newBenefit = '';
    const currentBenefits = settings[type]?.benefits || [];
    const updatedBenefits = [...currentBenefits, newBenefit];
    
    if (type === 'withoutAssistance') {
      handleWithoutAssistanceChange('benefits', updatedBenefits);
    } else {
      handleWithAssistanceChange('benefits', updatedBenefits);
    }
  };

  const handleBenefitChange = (type, index, value) => {
    const currentBenefits = [...(settings[type]?.benefits || [])];
    currentBenefits[index] = value;
    
    if (type === 'withoutAssistance') {
      handleWithoutAssistanceChange('benefits', currentBenefits);
    } else {
      handleWithAssistanceChange('benefits', currentBenefits);
    }
  };

  const handleBenefitRemove = (type, index) => {
    const currentBenefits = settings[type]?.benefits || [];
    const updatedBenefits = currentBenefits.filter((_, i) => i !== index);
    
    if (type === 'withoutAssistance') {
      handleWithoutAssistanceChange('benefits', updatedBenefits);
    } else {
      handleWithAssistanceChange('benefits', updatedBenefits);
    }
  };

  const BenefitEditor = ({ type, benefits = [], title }) => (
    <div className={`mt-4 p-4 rounded-lg border ${
      isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
    }`}>
      <div className="flex items-center justify-between mb-3">
        <h4 className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          {title} Benefits
        </h4>
        <button
          onClick={() => handleBenefitAdd(type)}
          className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-md transition-colors ${
            isDarkMode
              ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
              : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-700'
          }`}
        >
          <PlusIcon className="w-3 h-3 mr-1" />
          Add Benefit
        </button>
      </div>
      <div className="space-y-2">
        {benefits.map((benefit, index) => (
          <div key={index} className="flex items-center space-x-2">
            <input
              type="text"
              value={benefit}
              onChange={(e) => handleBenefitChange(type, index, e.target.value)}
              placeholder="Enter benefit description (e.g., 🍴 Complimentary lunch)"
              className={`flex-1 px-3 py-2 text-sm rounded-md border transition-colors focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
                isDarkMode 
                  ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
            />
            <button
              onClick={() => handleBenefitRemove(type, index)}
              className={`px-2 py-2 text-xs font-medium rounded-md transition-colors ${
                isDarkMode
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-red-100 hover:bg-red-200 text-red-700'
              }`}
            >
              ×
            </button>
          </div>
        ))}
        {benefits.length === 0 && (
          <p className={`text-xs italic ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            No benefits added yet. Click "Add Benefit" to add benefits.
          </p>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className={`text-lg font-semibold mb-2 flex items-center ${
          isDarkMode ? 'text-white' : 'text-gray-900'
        }`}>
          <UserGroupIcon className="w-5 h-5 mr-2 text-emerald-500" />
          Delegate Registration Pricing
        </h3>
        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Configure pricing for delegate registration packages with and without assistance
        </p>
      </div>

      {/* Without Assistance Package */}
      <div className={`p-6 rounded-xl border ${
        isDarkMode ? 'bg-gray-750 border-gray-600' : 'bg-gray-50 border-gray-200'
      }`}>
        <h4 className={`text-base font-semibold mb-4 flex items-center ${
          isDarkMode ? 'text-white' : 'text-gray-900'
        }`}>
          🎫 Without Assistance Package
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Price Per Person (₹)
            </label>
            <input
              type="number"
              value={settings.withoutAssistance?.pricePerPerson || 0}
              onChange={(e) => handleWithoutAssistanceChange('pricePerPerson', e.target.value)}
              placeholder="Enter price per person"
              className={`w-full px-3 py-2 text-sm rounded-lg border transition-colors focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
            />
          </div>
          
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Fixed Days
            </label>
            <input
              type="number"
              value={settings.withoutAssistance?.fixedDays || 5}
              onChange={(e) => handleWithoutAssistanceChange('fixedDays', e.target.value)}
              placeholder="Number of days"
              min="1"
              max="10"
              className={`w-full px-3 py-2 text-sm rounded-lg border transition-colors focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
            />
          </div>
        </div>

        <BenefitEditor 
          type="withoutAssistance" 
          benefits={settings.withoutAssistance?.benefits || []}
          title="Without Assistance"
        />
      </div>

      {/* With Assistance Package */}
      <div className={`p-6 rounded-xl border ${
        isDarkMode ? 'bg-gray-750 border-gray-600' : 'bg-gray-50 border-gray-200'
      }`}>
        <h4 className={`text-base font-semibold mb-4 flex items-center ${
          isDarkMode ? 'text-white' : 'text-gray-900'
        }`}>
          🏨 With Assistance Package
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Price Per Person Per Day (₹)
            </label>
            <input
              type="number"
              value={settings.withAssistance?.pricePerPersonPerDay || 0}
              onChange={(e) => handleWithAssistanceChange('pricePerPersonPerDay', e.target.value)}
              placeholder="Enter price per person per day"
              className={`w-full px-3 py-2 text-sm rounded-lg border transition-colors focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
            />
          </div>
          
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Minimum Days
            </label>
            <input
              type="number"
              value={settings.withAssistance?.minDays || 2}
              onChange={(e) => handleWithAssistanceChange('minDays', e.target.value)}
              placeholder="Minimum days"
              min="1"
              max="10"
              className={`w-full px-3 py-2 text-sm rounded-lg border transition-colors focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
            />
          </div>
          
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Maximum Days
            </label>
            <input
              type="number"
              value={settings.withAssistance?.maxDays || 5}
              onChange={(e) => handleWithAssistanceChange('maxDays', e.target.value)}
              placeholder="Maximum days"
              min="1"
              max="10"
              className={`w-full px-3 py-2 text-sm rounded-lg border transition-colors focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
            />
          </div>
        </div>

        <BenefitEditor 
          type="withAssistance" 
          benefits={settings.withAssistance?.benefits || []}
          title="With Assistance"
        />
      </div>

      {/* Preview */}
      <div className={`p-4 rounded-xl border ${
        isDarkMode ? 'bg-emerald-900/20 border-emerald-700' : 'bg-emerald-50 border-emerald-200'
      }`}>
        <h4 className={`text-sm font-semibold mb-2 ${
          isDarkMode ? 'text-emerald-300' : 'text-emerald-800'
        }`}>
          💰 Pricing Preview
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className={`text-xs font-medium ${isDarkMode ? 'text-emerald-400' : 'text-emerald-700'}`}>
              Without Assistance:
            </p>
            <p className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              ₹{(settings.withoutAssistance?.pricePerPerson || 0).toLocaleString()}/person 
              <span className="text-sm font-normal"> for {settings.withoutAssistance?.fixedDays || 5} days</span>
            </p>
          </div>
          <div>
            <p className={`text-xs font-medium ${isDarkMode ? 'text-emerald-400' : 'text-emerald-700'}`}>
              With Assistance:
            </p>
            <p className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              ₹{(settings.withAssistance?.pricePerPersonPerDay || 0).toLocaleString()}/person/day
            </p>
            <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              ({settings.withAssistance?.minDays || 2} - {settings.withAssistance?.maxDays || 5} days range)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

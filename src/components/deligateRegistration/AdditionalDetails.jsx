import React from 'react';
import { CreditCard, Camera } from 'lucide-react';

const AdditionalDetails = ({ formData, errors, handleInputChange, handleBlur, selectedFile, handleFileChange, imagePreview, imageUploading }) => {
  const isIndianResident = formData.country && formData.country.toLowerCase().includes('india');
  
  return (
  <div className="space-y-4 border-2 border-emerald-200 rounded-xl p-4">
    <h3 className="text-lg font-semibold text-gray-800 border-b border-emerald-200 pb-2 flex items-center">
      <CreditCard className="w-4 h-4 mr-2 text-emerald-600" />
      Additional Details
    </h3>
    
    {isIndianResident ? (
      // Indian Resident Fields
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Aadhar Number *</label>
          <input
            type="text"
            name="aadharno"
            value={formData.aadharno}
            onChange={handleInputChange}
            onBlur={handleBlur}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-gray-800 ${
              errors.aadharno ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter 12-digit Aadhar number"
            maxLength="12"
          />
          {errors.aadharno && <p className="text-red-500 text-xs mt-1">{errors.aadharno}</p>}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">PAN Number</label>
          <input
            type="text"
            name="pan"
            value={formData.pan}
            onChange={handleInputChange}
            onBlur={handleBlur}
            maxLength="10"
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all uppercase text-gray-800 ${
              errors.pan ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="ABCDE1234F (optional)"
            style={{ textTransform: 'uppercase' }}
          />
          {errors.pan && <p className="text-red-500 text-xs mt-1">{errors.pan}</p>}
        </div>
      </div>
    ) : (
      // International Delegate Fields
      <div className="grid grid-cols-1 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Passport Number *</label>
          <input
            type="text"
            name="passportno"
            value={formData.passportno}
            onChange={handleInputChange}
            onBlur={handleBlur}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-gray-800 ${
              errors.passportno ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter passport number"
          />
          {errors.passportno && <p className="text-red-500 text-xs mt-1">{errors.passportno}</p>}
        </div>
      </div>
    )}

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Upload Photo</label>
      <div className="space-y-3">
        {/* Upload Area */}
        <div className="relative">
          <input
            type="file"
            name="selfie"
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
            id="photo-upload"
          />
          <label
            htmlFor="photo-upload"
            className={`flex items-center justify-center w-full px-4 py-4 border-2 border-dashed rounded-lg cursor-pointer transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
              selectedFile 
                ? 'border-emerald-500 bg-emerald-50' 
                : 'border-gray-300 hover:border-emerald-500 hover:bg-emerald-50'
            }`}
          >
            <div className="text-center">
              <Camera className={`w-6 h-6 mx-auto mb-1 ${
                selectedFile ? 'text-emerald-600' : 'text-gray-400'
              }`} />
              <p className={`text-sm ${
                selectedFile ? 'text-emerald-700 font-medium' : 'text-gray-600'
              }`}>
                {selectedFile ? `✅ ${selectedFile.name}` : 'Click to upload photo'}
              </p>
              {selectedFile && (
                <p className="text-xs text-emerald-600 mt-1">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              )}
            </div>
          </label>
        </div>
        
        {/* Image Preview */}
        {imagePreview && (
          <div className="mt-3">
            <div className="relative inline-block">
              <img 
                src={imagePreview} 
                alt="Preview" 
                className="w-24 h-24 object-cover rounded-lg border-2 border-emerald-200 shadow-sm"
              />
              <button
                type="button"
                onClick={() => {
                  setSelectedFile(null);
                  setImagePreview(null);
                  const input = document.getElementById('photo-upload');
                  if (input) input.value = '';
                }}
                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
              >
                ×
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">Image preview</p>
          </div>
        )}
        
        {/* Upload Status */}
        {imageUploading && (
          <div className="flex items-center gap-2 text-sm text-emerald-600">
            <div className="animate-spin w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full"></div>
            <span>Uploading image...</span>
          </div>
        )}
      </div>
    </div>
  </div>
  );
};

export default AdditionalDetails;
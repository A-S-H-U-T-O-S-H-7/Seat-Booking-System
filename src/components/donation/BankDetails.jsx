"use client"
import { useState, useEffect } from 'react';

export default function BankDetails({ donorType = 'indian' }) {
  const [activeTab, setActiveTab] = useState('indian');
  
  // Update active tab when donor type changes
  useEffect(() => {
    setActiveTab(donorType === 'foreign' ? 'international' : 'indian');
  }, [donorType]);

  const indianBankDetails = {
    accountName: "Samudayik Vikas Samiti",
    accountNo: "083101002804",
    ifscCode: "ICIC0000831",
    accountType: "SAVING",
    bankName: "ICICI BANK",
    branch: "LAXMI NAGAR BRANCH",
    city: "DELHI"
  };

  const internationalBankDetails = {
    accountName: "FCRA Samudayik Vikas Samiti",
    accountNo: "40052522428",
    swiftCode: "SBININBB104",
    accountType: "SAVING",
    bankName: "SBI BANK",
    branch: "FCRA Cell,4th Floor,State Bank of India,New Delhi Main Branch,11,sansad Marg,New Delhi-110001",
    city: "DELHI"
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
      <div className="p-4">
        <h2 className="text-lg font-bold text-gray-800 mb-3 text-center">
          Bank Details
        </h2>

        {/* Tabs */}
        <div className="flex bg-gray-100 rounded-lg p-1 mb-3">
          <button
            onClick={() => setActiveTab('indian')}
            className={`flex-1 py-2 px-2 rounded-md font-medium transition-all duration-200 text-xs ${
              activeTab === 'indian'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Indian
          </button>
          <button
            onClick={() => setActiveTab('international')}
            className={`flex-1 py-2 px-2 rounded-md font-medium transition-all duration-200 text-xs ${
              activeTab === 'international'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            International
          </button>
        </div>

        {/* Bank Details Content */}
        <div className="space-y-2">
          {activeTab === 'indian' && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-3 rounded-lg border-l-4 border-blue-500">
              <div className="space-y-1 text-xs">
                <div className="grid grid-cols-3 gap-1">
                  <span className="font-semibold text-gray-700">ACCOUNT:</span>
                  <span className="col-span-2 text-gray-600 break-words">{indianBankDetails.accountName}</span>
                </div>
                <div className="grid grid-cols-3 gap-1">
                  <span className="font-semibold text-gray-700">A/C NO:</span>
                  <span className="col-span-2 text-gray-600 font-mono">{indianBankDetails.accountNo}</span>
                </div>
                <div className="grid grid-cols-3 gap-1">
                  <span className="font-semibold text-gray-700">IFSC:</span>
                  <span className="col-span-2 text-gray-600 font-mono">{indianBankDetails.ifscCode}</span>
                </div>
                <div className="grid grid-cols-3 gap-1">
                  <span className="font-semibold text-gray-700">BANK:</span>
                  <span className="col-span-2 text-gray-600">{indianBankDetails.bankName}</span>
                </div>
                <div className="grid grid-cols-3 gap-1">
                  <span className="font-semibold text-gray-700">BRANCH:</span>
                  <span className="col-span-2 text-gray-600">{indianBankDetails.branch}</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'international' && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-3 rounded-lg border-l-4 border-green-500">
              <div className="space-y-1 text-xs">
                <div className="grid grid-cols-3 gap-1">
                  <span className="font-semibold text-gray-700">ACCOUNT:</span>
                  <span className="col-span-2 text-gray-600 break-words">{internationalBankDetails.accountName}</span>
                </div>
                <div className="grid grid-cols-3 gap-1">
                  <span className="font-semibold text-gray-700">A/C NO:</span>
                  <span className="col-span-2 text-gray-600 font-mono">{internationalBankDetails.accountNo}</span>
                </div>
                <div className="grid grid-cols-3 gap-1">
                  <span className="font-semibold text-gray-700">SWIFT:</span>
                  <span className="col-span-2 text-gray-600 font-mono">{internationalBankDetails.swiftCode}</span>
                </div>
                <div className="grid grid-cols-3 gap-1">
                  <span className="font-semibold text-gray-700">BANK:</span>
                  <span className="col-span-2 text-gray-600">{internationalBankDetails.bankName}</span>
                </div>
                <div className="grid grid-cols-3 gap-1">
                  <span className="font-semibold text-gray-700">BRANCH:</span>
                  <span className="col-span-2 text-gray-600 text-xs break-words">{internationalBankDetails.branch}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
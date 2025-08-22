import React, { useState } from 'react';
import { Copy, Check, Building2, Globe, CreditCard, MapPin, Hash, User, Landmark } from 'lucide-react';

export default function DonationBankDetails() {
  const [copiedField, setCopiedField] = useState('');

  const copyToClipboard = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(''), 2000);
  };

  const DetailRow = ({ icon: Icon, label, value, copyValue, fieldKey }) => (
    <div className="flex items-center justify-between py-4 px-6 bg-gray-50/50 hover:bg-gray-100/50 transition-colors duration-200 rounded-lg">
      <div className="flex items-center space-x-4 flex-1">
        <div className="p-2 bg-blue-100 rounded-lg">
          <Icon className="w-5 h-5 text-blue-600" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{label}</p>
          <p className="text-lg font-semibold text-gray-900">{value}</p>
        </div>
      </div>
      {copyValue && (
        <button
          onClick={() => copyToClipboard(copyValue, fieldKey)}
          className="ml-4 p-2 hover:bg-white rounded-lg transition-colors duration-200 group"
        >
          {copiedField === fieldKey ? (
            <Check className="w-5 h-5 text-green-500" />
          ) : (
            <Copy className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
          )}
        </button>
      )}
    </div>
  );

  const BankDetailsCard = ({ title, icon: TitleIcon, details, gradient }) => (
    <div className={`relative overflow-hidden rounded-2xl shadow-xl bg-gradient-to-br ${gradient}`}>
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-black/5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }} />
      </div>
      
      <div className="relative z-10 p-8">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-8">
          <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
            <TitleIcon className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">{title}</h2>
            <p className="text-white/80 text-sm mt-1">Secure banking information</p>
          </div>
        </div>

        {/* Details */}
        <div className="bg-white/95 backdrop-blur-sm rounded-xl p-6">
          <div className="space-y-3">
            {details.map((detail, index) => (
              <DetailRow
                key={index}
                icon={detail.icon}
                label={detail.label}
                value={detail.value}
                copyValue={detail.copyValue}
                fieldKey={`${title}-${index}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const indianBankDetails = [
    {
      icon: User,
      label: "Account Name",
      value: "Samudayik Vikas Samiti",
      copyValue: "Samudayik Vikas Samiti"
    },
    {
      icon: Hash,
      label: "Account Number",
      value: "083101002804",
      copyValue: "083101002804"
    },
    {
      icon: CreditCard,
      label: "IFSC Code",
      value: "ICIC0000831",
      copyValue: "ICIC0000831"
    },
    {
      icon: Landmark,
      label: "Account Type",
      value: "Saving",
      copyValue: "Saving"
    },
    {
      icon: Building2,
      label: "Bank Name",
      value: "ICICI Bank",
      copyValue: "ICICI Bank"
    },
    {
      icon: MapPin,
      label: "Branch",
      value: "Laxmi Nagar Branch",
      copyValue: "Laxmi Nagar Branch"
    },
    {
      icon: MapPin,
      label: "City",
      value: "Delhi",
      copyValue: "Delhi"
    }
  ];

  const internationalBankDetails = [
    {
      icon: User,
      label: "Account Name",
      value: "FCRA Samudayik Vikas Samiti",
      copyValue: "FCRA Samudayik Vikas Samiti"
    },
    {
      icon: Hash,
      label: "Account Number",
      value: "40052522428",
      copyValue: "40052522428"
    },
    {
      icon: Globe,
      label: "SWIFT Code",
      value: "SBININBB104",
      copyValue: "SBININBB104"
    },
    {
      icon: Landmark,
      label: "Account Type",
      value: "Saving",
      copyValue: "Saving"
    },
    {
      icon: Building2,
      label: "Bank Name",
      value: "SBI Bank",
      copyValue: "SBI Bank"
    },
    {
      icon: MapPin,
      label: "Branch",
      value: "FCRA Cell, 4th Floor, State Bank of India, New Delhi Main Branch, 11, Sansad Marg, New Delhi-110001",
      copyValue: "FCRA Cell, 4th Floor, State Bank of India, New Delhi Main Branch, 11, Sansad Marg, New Delhi-110001"
    },
    {
      icon: MapPin,
      label: "City",
      value: "Delhi",
      copyValue: "Delhi"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800">
        <div className="absolute inset-0 bg-black/10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M50 50c0-5.5 4.5-10 10-10s10 4.5 10 10-4.5 10-10 10-10-4.5-10-10zM10 10c0-5.5 4.5-10 10-10s10 4.5 10 10-4.5 10-10 10-10-4.5-10-10z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }} />
        </div>
        
        <div className="relative z-10 max-w-6xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl">
                <Landmark className="w-12 h-12 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Donation Bank Details
            </h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto leading-relaxed">
              Secure and transparent banking information for your generous contributions
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Indian Donation Details */}
          <BankDetailsCard
            title="Indian Donations"
            icon={Building2}
            details={indianBankDetails}
            gradient="from-orange-500 via-red-500 to-pink-500"
          />

          {/* International Donation Details */}
          <BankDetailsCard
            title="International Donations"
            icon={Globe}
            details={internationalBankDetails}
            gradient="from-blue-500 via-indigo-500 to-purple-500"
          />
        </div>

        {/* Footer Note */}
        <div className="mt-16 text-center">
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-green-100 rounded-full">
                <Check className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Secure Donations</h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              All donations are processed through secure banking channels. Click the copy icon next to any field to copy the banking details to your clipboard for easy reference.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
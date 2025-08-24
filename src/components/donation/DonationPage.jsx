"use client"
import DonationForm from './DonationForm';
import BankDetails from './BankDetails';
import QRCodeSection from './QrCodeSection';
import Banner from './Banner';

export default function DonationComponent() {
  return (
    <div className="w-full  p-2 sm:p-4 bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen">
      <Banner/>
      <div className="grid grid-cols-1 lg:grid-cols-5 mb-10 gap-4 max-w-8xl mx-auto">
        {/* Donation Form - More Compact */}
        <DonationForm />

        {/* Right Side - QR Code and Bank Details - Wider */}
        <div className="lg:col-span-2 space-y-4">
          {/* QR Code Section */}
          <QRCodeSection/>

          {/* Bank Details - Wider */}
          <BankDetails />
        </div>
      </div>
    </div>
  );
}
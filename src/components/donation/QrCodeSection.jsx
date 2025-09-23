export default function QRCodeSection() {
  return (
    <div className="bg-white rounded-xl shadow-lg p-2 border border-gray-100 text-center">
      <h3 className="text-lg font-bold text-gray-800 mb-3">Quick Donation</h3>
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-3 rounded-lg">
        <img 
          src="/donationqr.jpg" 
          alt="Donation QR Code"
          className="w-32 h-46 sm:w-43 sm:h-52 mx-auto rounded-lg object-cover mb-3"
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'flex';
          }}
        />
        <div className="hidden w-32 h-32 sm:w-40 sm:h-40 mx-auto bg-gray-200 rounded-lg items-center justify-center mb-3">
          <div className="text-center">
            <svg className="w-12 h-12 mx-auto text-gray-400 mb-2" fill="currentColor" viewBox="0 0 20 20">
              <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"/>
            </svg>
            <p className="text-xs text-gray-500">QR Code</p>
          </div>
        </div>
        <p className="text-sm text-gray-600">Scan to donate instantly</p>
      </div>
    </div>
  );
}
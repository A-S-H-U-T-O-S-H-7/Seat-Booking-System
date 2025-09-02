const ContactInfo = () => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-bold text-gray-800 mb-4">Contact Support</h3>
      <div className="space-y-4 text-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-blue-600">📞</span>
          </div>
          <div>
            <p className="font-medium text-gray-700">Phone Support</p>
            <p className="text-gray-600">+91 730 339 7090</p>
            <p className="text-gray-600">0120-4348458</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
            <span className="text-green-600">✉️</span>
          </div>
          <div>
            <p className="font-medium text-gray-700">Email Support</p>
            <p className="text-gray-600">info@svsamiti.com</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
            <span className="text-purple-600">🌐</span>
          </div>
          <div>
            <p className="font-medium text-gray-700">Website</p>
            <p className="text-gray-600">www.svsamiti.com</p>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 leading-relaxed">
            For reservation-related queries, please contact us with your Reservation ID. 
            Support is available Monday to Saturday, 9 AM to 6 PM.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ContactInfo;
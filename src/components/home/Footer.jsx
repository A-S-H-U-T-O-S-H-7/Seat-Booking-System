function Footer() {
  return (
    <footer className="bg-gradient-to-r from-gray-800 via-gray-900 to-gray-800 text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-6 sm:mb-8">
          {/* Contact Info */}
          <div>
            <h4 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-orange-300">Contact Details</h4>
            <div className="space-y-2 text-sm sm:text-base text-gray-300">
              <p><strong className="text-white">Tel:</strong> 0120-4348458</p>
              <p><strong className="text-white">Phone:</strong> +91 730 339 7090</p>
              <p><strong className="text-white">Email:</strong> info@svsamiti.com</p>
              <p><strong className="text-white">Website:</strong> www.svsamiti.com</p>
            </div>
          </div>

          {/* Corporate Address */}
          <div>
            <h4 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-orange-300">Corporate Address</h4>
            <p className="text-sm sm:text-base text-gray-300 leading-relaxed">
              C-316 B & C, C Block,<br />
              Sector 10, Noida,<br />
              Uttar Pradesh 201301
            </p>
          </div>

          {/* Registered Address */}
          <div className="md:col-span-2 lg:col-span-1">
            <h4 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-orange-300">Registered Address</h4>
            <p className="text-sm sm:text-base text-gray-300 leading-relaxed">
              A 86/B, 2nd Floor,<br />
              School Block, Chander Vihar,<br />
              Delhi-110092
            </p>
          </div>
        </div>

        <div className="border-t border-gray-700 pt-6 sm:pt-8 text-center">
          <p className="text-sm sm:text-base">&copy; 2024 Sri Jagannatha Pancha Ratra Havan Seat Booking System. All rights reserved.</p>
          <p className="text-gray-400 text-xs sm:text-sm mt-2">
            For support, contact us at info@svsamiti.com
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
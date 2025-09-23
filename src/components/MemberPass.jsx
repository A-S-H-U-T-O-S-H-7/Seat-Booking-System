import React, { useState } from 'react';

const EventPass = ({ booking, participantName, purpose, startDate, endDate }) => {
  
  // Extract data from booking or use fallback props - try multiple possible fields
  const name = booking?.delegateDetails?.name ||
               booking?.userDetails?.name || 
               booking?.userDetails?.displayName ||
               booking?.user?.name ||
               booking?.user?.displayName ||
               booking?.customerDetails?.name ||
               booking?.customerDetails?.displayName ||
               booking?.vendorDetails?.name ||
               booking?.vendorDetails?.ownerName ||
               booking?.name ||
               booking?.displayName ||
               participantName || 
               "Participant";

  const eventPurpose = booking?.showDetails ? "Show Reservation" : 
                       booking?.stallIds ? "Stall Reservation" : 
                       booking?.delegateDetails ? "Delegate Registration" :
                       booking?.eventDetails ? "Havan Ceremony" : 
                       purpose || "Cultural Event";
  
  // Hardcode dates for delegate registration
  const eventStartDate = eventPurpose === "Delegate Registration" ? "Dec 3, 2025" :
                         booking?.showDetails?.date ? new Date(booking.showDetails.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) :
                         booking?.eventDetails?.date ? new Date(booking.eventDetails.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) :
                         startDate || "Dec 3, 2025";
  
  const eventEndDate = eventPurpose === "Delegate Registration" ? "Dec 7, 2025" :
                       booking?.eventDetails?.endDate ? new Date(booking.eventDetails.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) :
                       endDate || eventStartDate;

const [isFlipped, setIsFlipped] = useState(false);

const styles = `
  .perspective-1000 { perspective: 1000px; }
  .transform-style-preserve-3d { transform-style: preserve-3d; }
  .backface-hidden { backface-visibility: hidden; }
  .rotate-y-180 { transform: rotateY(180deg); }
  
  @keyframes pulse-glow {
    0%, 100% { 
      opacity: 0.6;
      transform: scale(1);
    }
    50% { 
      opacity: 1;
      transform: scale(1.1);
    }
  }
  
  @keyframes finger-bounce {
    0%, 100% { transform: translateY(0px) rotate(-15deg); }
    50% { transform: translateY(-3px) rotate(-15deg); }
  }
  
  .pulse-animation {
    animation: pulse-glow 2s ease-in-out infinite;
  }
  
  .finger-bounce {
    animation: finger-bounce 1.5s ease-in-out infinite;
  }
`;

  return (
    <>
    <style>{styles}</style>

    <div className="min-h-65 pb-80 md:min-h-0 p-2 sm:p-4 flex items-center justify-center">
      <div className="w-full max-w-4xl h-auto sm:h-80 relative perspective-1000">
        <div 
          className={`w-full h-full transform-style-preserve-3d transition-transform duration-700 cursor-pointer ${isFlipped ? 'rotate-y-180' : ''}`}
          onClick={() => setIsFlipped(!isFlipped)}
        >
          {/* FRONT SIDE */}
          <div className="absolute inset-0 w-full h-full backface-hidden">
            <div className="w-full h-full bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50 rounded-xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-row border-2 border-orange-200 relative min-h-[240px] sm:min-h-[280px] md:min-h-[320px]">
            
              {/* Tap Indicator - Top Right Corner */}
              <div className="absolute top-2 right-2 sm:top-3 sm:right-3 md:top-4 md:right-4 z-10 flex items-center space-x-1">
                <span className="text-white font-bold text-xs sm:text-sm bg-blue-900 px-2 py-2 rounded-full shadow-md animate-bounce">
                  TAP 👆🏻
                </span>
              </div>
              
              {/* Left Section - Responsive widths */}
              <div className="w-2/3 sm:w-3/5 md:flex-1 relative p-2 bg-gradient-to-br from-orange-50 to-yellow-50 overflow-hidden">
                
                {/* Decorative Flowers - All corners with responsive sizes */}
                <div className="absolute top-0 left-0 w-6 sm:w-12 md:w-16 lg:w-24 h-6 sm:h-12 md:h-16 lg:h-24">
                  <img 
                    src="/cornerflower.png" 
                    alt="Flower" 
                    className="w-full h-full object-contain rotate-90"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      document.getElementById('top-left-flower-fallback').style.display = 'block';
                    }}
                  />
                  <div id="top-left-flower-fallback" className="w-full h-full hidden">
                    <div className="w-6 sm:w-8 h-6 sm:h-8 bg-orange-400 rounded-full"></div>
                    <div className="w-4 sm:w-6 h-4 sm:h-6 bg-yellow-400 rounded-full -mt-1 sm:-mt-2 ml-1 sm:ml-2"></div>
                  </div>
                </div>

                <div className="absolute top-0 right-0 w-6 sm:w-12 md:w-16 lg:w-24 h-6 sm:h-12 md:h-16 lg:h-24">
                  <img 
                    src="/cornerflower.png" 
                    alt="Flower" 
                    className="w-full h-full object-contain rotate-180"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      document.getElementById('top-right-flower-fallback').style.display = 'block';
                    }}
                  />
                  <div id="top-right-flower-fallback" className="w-full h-full hidden">
                    <div className="w-6 sm:w-8 h-6 sm:h-8 bg-orange-400 rounded-full ml-auto"></div>
                    <div className="w-4 sm:w-6 h-4 sm:h-6 bg-yellow-400 rounded-full -mt-1 sm:-mt-2 mr-1 sm:mr-2"></div>
                  </div>
                </div>

                <div className="absolute bottom-0 left-0 w-6 sm:w-12 md:w-16 lg:w-24 h-6 sm:h-12 md:h-16 lg:h-24">
                  <img 
                    src="/cornerflower.png" 
                    alt="Flower" 
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      document.getElementById('bottom-left-flower-fallback').style.display = 'block';
                    }}
                  />
                  <div id="bottom-left-flower-fallback" className="w-full h-full hidden">
                    <div className="w-6 sm:w-8 h-6 sm:h-8 bg-orange-400 rounded-full"></div>
                    <div className="w-4 sm:w-6 h-4 sm:h-6 bg-yellow-400 rounded-full mt-1 sm:mt-2 ml-1 sm:ml-2"></div>
                  </div>
                </div>

                <div className="absolute bottom-0 right-0 w-6 sm:w-12 md:w-16 lg:w-24 h-6 sm:h-12 md:h-16 lg:h-24">
                  <img 
                    src="/cornerflower.png" 
                    alt="Flower" 
                    className="w-full h-full object-contain -rotate-90"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      document.getElementById('bottom-right-flower-fallback').style.display = 'block';
                    }}
                  />
                  <div id="bottom-right-flower-fallback" className="w-full h-full hidden">
                    <div className="w-6 sm:w-8 h-6 sm:h-8 bg-orange-400 rounded-full ml-auto"></div>
                    <div className="w-4 sm:w-6 h-4 sm:h-6 bg-yellow-400 rounded-full mt-1 sm:mt-2 mr-1 sm:mr-2"></div>
                  </div>
                </div>

                {/* Header with Logo - Centered */}
                <div className="flex items-center justify-center mb-2">
                  <div className="flex items-center space-x-1 sm:space-x-2">
                    {/* Logo Circle */}
                    <div className="w-5 sm:w-8 md:w-10 lg:w-14 h-5 sm:h-8 md:h-10 lg:h-14 bg-white rounded-full flex items-center justify-center shadow-lg border-2 border-orange-300">
                      <img 
                        src="/logo.png" 
                        alt="Logo" 
                        className="w-3 sm:w-6 md:w-8 lg:w-10 h-3 sm:h-6 md:h-8 lg:h-10 object-contain"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                      <div className="w-3 sm:w-6 md:w-8 lg:w-10 h-3 sm:h-6 md:h-8 lg:h-10 bg-orange-500 rounded-full hidden items-center justify-center text-white font-bold text-xs md:text-sm">
                        SVS
                      </div>
                    </div>
                    
                    <div>
                      <h1 className="text-xs sm:text-sm md:text-xl font-bold text-slate-700 tracking-wide">SAMUDAYIK VIKAS SAMITI</h1>
                    </div>
                  </div>
                </div>

                <div className="flex flex-row items-center h-full">
                  {/* Temple Image */}
                  <div className="w-14 sm:w-20 md:w-28 lg:w-60 h-20 sm:h-20 md:h-28 lg:h-60 flex-shrink-0 mr-1 sm:mr-3 md:mr-1 lg:-ml-6 -mt-12 sm:-mt-16 lg:-mt-30 -ml-1 sm:-ml-2">
                    <img 
                      src="/jaga1.png" 
                      alt="Sri Mandir" 
                      className="w-full h-full object-contain drop-shadow-xl"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                    <div className="w-full h-full bg-gradient-to-t from-orange-300 to-yellow-300 rounded-lg hidden items-center justify-center text-orange-800 font-semibold text-xs sm:text-sm md:text-lg">
                      Sri Mandir
                    </div>
                  </div>

                  {/* Event Title and Participant Info */}
                  <div className='flex flex-col items-center justify-center text-center -mt-8 sm:-mt-10 md:-mt-18 md:-ml-38 -ml-0 flex-1'>
                    <div className="mb-2 sm:mb-3 md:mb-6">
                      <h2 className="text-xs sm:text-sm md:text-lg lg:text-3xl font-bold text-emerald-600 mb-0.5 md:mb-1 lg:mb-2">International</h2>
                      <h3 className="text-xs sm:text-sm md:text-base lg:text-2xl font-bold text-orange-700 mb-0.5 md:mb-1">Śrī Jagannātha Pāñcharātra</h3>
                    </div>

                    {/* Participant Info */}
                    <div>
                      <h4 className="text-xs sm:text-base md:text-lg lg:text-2xl font-bold text-gray-900">{name}</h4>
                      <p className="text-xs sm:text-sm md:text-base mb-1 lg:text-lg text-gray-700 font-medium">Purpose: {eventPurpose}</p>
                      
                      {/* Delegate-specific information */}
                      {booking?.delegateDetails && (
                        <div className="text-xs md:text-sm text-gray-700 space-y-0.5">
                          <p><span className="font-medium">Package:</span> {(() => {
                            const type = booking?.eventDetails?.delegateType;
                            switch(type) {
                              case 'normal': return 'Normal';
                              case 'withAssistance': return 'With Assistance';
                              case 'withoutAssistance': return 'Without Assistance';
                              default: return type || 'Standard';
                            }
                          })()}</p>
                          <p><span className="font-medium">Duration:</span> {booking?.eventDetails?.duration || '5'} days</p>
                          {booking?.eventDetails?.numberOfPersons && booking.eventDetails.numberOfPersons !== '1' && (
                            <p><span className="font-medium">Persons:</span> {booking.eventDetails.numberOfPersons}</p>
                          )}
                        </div>
                      )}
                      
                      <p className="text-xs md:text-sm font-semibold text-gray-700 mt-1">Valid From: {eventStartDate} - {eventEndDate}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Dashed Divider Line */}
              <div className="w-px h-full relative bg-transparent">
                <div className="absolute inset-0 flex flex-col justify-center items-center space-y-1">
                  {Array.from({length: 30}).map((_, i) => (
                    <div 
                      key={i} 
                      className={`w-0.5 h-2 rounded-full opacity-100 ${
                        (booking?.delegateDetails && booking?.eventDetails?.delegateType === 'normal') || 
                        (booking?.totalAmount || 0) === 0
                          ? 'bg-emerald-600'
                          : 'bg-orange-600'
                      }`}
                    ></div>
                  ))}
                </div>
              </div>

              {/* Right Section - Member Pass - Responsive width */}
              <div className={`w-1/3 sm:w-24 md:w-32 lg:w-70 ${
                booking?.delegateDetails && booking?.eventDetails?.delegateType === 'normal' 
                  ? 'bg-gradient-to-br from-emerald-500 to-emerald-600'
                  : 'bg-gradient-to-br from-red-600 to-orange-600'
              } flex flex-col items-center justify-center text-white relative overflow-hidden py-2 sm:py-4 lg:py-0`}>
                
                {/* Background Decorative Pattern */}
                <div className="absolute inset-0 opacity-10">
                  <div className="w-full h-full" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M20 20c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10zm10 0c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10z'/%3E%3C/g%3E%3C/svg%3E")`,
                  }}></div>
                </div>

                {/* Jagannath Image */}
                <div className="mb-1 sm:mb-2 md:mb-2 lg:mt-8">
                  <div className="w-8 sm:w-8 md:w-10 lg:w-16 h-8 sm:h-8 md:h-10 lg:h-16 bg-white rounded-full shadow-lg">
                    <img 
                      src="/srimandir.png" 
                      alt="Lord Jagannath" 
                      className="w-full h-full object-contain rounded-full"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                    <div className="w-full h-full bg-orange-200 rounded-full hidden items-center justify-center text-orange-800 font-bold text-sm md:text-base lg:text-lg">
                      ॐ
                    </div>
                  </div>
                </div>

                {/* Member Pass Text */}
                <div className="text-center mb-1 sm:mb-2 md:mb-3 lg:mb-4">
                  <h5 className="text-xs sm:text-sm md:text-base lg:text-2xl font-bold tracking-wide">
                    {(booking?.delegateDetails && booking?.eventDetails?.delegateType === 'normal') || 
                     (booking?.totalAmount || 0) === 0
                      ? 'FREE ENTRY PASS'
                      : 'MEMBER PASS'}
                  </h5> 
                </div>

                {/* QR Code */}
                <div className="bg-white p-1 sm:p-1 md:p-2 rounded-lg lg:rounded-lg shadow-lg mb-1 sm:mb-2 md:mb-3 lg:mb-4">
                  <div className="w-12 sm:w-12 md:w-16 lg:w-24 h-12 sm:h-12 md:h-16 lg:h-24 bg-black rounded-sm lg:rounded-lg relative overflow-hidden">
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent((() => {
                        // Generate QR data based on booking type
                        let qrData = `SVS PASS | Name: ${name} | Purpose: ${eventPurpose} | Event Date: ${eventStartDate}${eventEndDate !== eventStartDate ? ' - ' + eventEndDate : ''}`;
                        
                        if (booking?.delegateDetails) {
                          // Delegate booking
                          const regType = booking?.eventDetails?.registrationType || 'Individual';
                          const packageType = booking?.eventDetails?.delegateType || 'Standard';
                          const duration = booking?.eventDetails?.duration || '5';
                          const persons = booking?.eventDetails?.numberOfPersons || '1';
                          qrData += ` | Registration: ${regType} | Package: ${packageType} | Duration: ${duration} days | Persons: ${persons}`;
                        } else if (booking?.stallIds) {
                          // Stall booking
                          qrData += ` | Stalls: ${booking.stallIds.join(', ')} | Count: ${booking.stallIds.length}`;
                        } else if (booking?.showDetails?.selectedSeats) {
                          // Show booking
                          qrData += ` | Seats: ${booking.showDetails.selectedSeats.join(', ')} | Count: ${booking.showDetails.selectedSeats.length}`;
                        } else {
                          // General booking
                          qrData += ` | Type: General | Count: 1`;
                        }
                        
                        qrData += ` | ID: ${booking?.id || booking?.bookingId || 'N/A'}`;
                        return qrData;
                      })())}`}
                      alt="QR Code"
                      className="w-full h-full object-contain rounded-sm lg:rounded-lg"
                    />
                  </div>
                </div>

                {/* Sanskrit Text */}
                <div className="text-center px-1 sm:px-2 lg:px-4 mb-1 sm:mb-2 md:mb-3 lg:mb-4">
                  <p className="text-xs md:text-sm font-medium italic leading-tight">
                    सर्वे भवन्तु सुखिनः<br />
                    सर्वे सन्तु निरामयाः
                  </p>
                  <p className="text-xs mt-1 opacity-80 hidden md:block lg:block">May all be happy, may all be free from illness</p>
                </div>

                {/* Decorative Lines */}
                <div className="space-y-0.5 sm:space-y-1">
                  <div className="w-8 sm:w-8 md:w-12 lg:w-16 h-0.5 bg-white opacity-60"></div>
                  <div className="w-6 sm:w-6 md:w-8 lg:w-12 h-0.5 bg-white opacity-40 mx-auto"></div>
                  <div className="w-10 sm:w-10 md:w-16 lg:w-20 h-0.5 bg-white opacity-60"></div>
                </div>
              </div>

            </div>
          </div>

          {/* BACK SIDE - Terms & Conditions */}
          <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180">
            <div className="w-full h-full bg-slate-800 rounded-xl sm:rounded-2xl shadow-2xl overflow-hidden flex items-center justify-center p-4 border-2 border-orange-200 min-h-[240px] sm:min-h-[280px] md:min-h-[320px]">
              <div className="text-white w-full h-full overflow-y-auto">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-4 text-center text-orange-300">Terms & Conditions</h2>
                <ul className="space-y-3 text-xs sm:text-sm md:text-base leading-relaxed">
                  <li>• For security reasons, firearms, cameras, audio and video recorders are strictly not permitted inside the venue.</li>
                  <li>• The complimentary pass (valid for one person only) must be produced for entry to any event.</li>
                  <li>• The organizers reserve the right to add, withdraw or substitute artists and/or vary advertised programs, prices, venues, seating arrangements, and audience capacity without prior notice.</li>
                  <li>• Admission is subject to the organizers and the venue's terms of admission. Late arrivals may result in non-admittance until a suitable break in the performance.</li>
                  <li>• It may be a condition of entry that a search of person and/or their possessions is required at the time of entry.</li>
                  <li>• Entry may be refused if passes are damaged, defaced, or not issued by the organizers.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    </>
  );
};

export default EventPass;
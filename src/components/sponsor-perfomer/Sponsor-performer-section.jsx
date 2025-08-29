// SponsorPerformerSection.jsx (Main Component)
import { useState } from 'react';
import { Star, Heart, Users, Sparkles, Mic } from 'lucide-react';
import ToastNotification from './ToastNotification';
import SponsorModal from './SponsorModal';
import PerformerModal from './PerformerModal';
import { createSponsorApplication, createPerformerApplication } from '@/services/sponsorPerformerService';

export default function SponsorPerformerSection() {
  const [showSponsorModal, setShowSponsorModal] = useState(false);
  const [showPerformerModal, setShowPerformerModal] = useState(false);
  const [sponsorForm, setSponsorForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });
  const [performerForm, setPerformerForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    performanceType: ''
  });
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const showToastMessage = (message) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 5000);
  };

  const handleSponsorSubmit = async () => {
    if (sponsorForm.name && sponsorForm.email && sponsorForm.phone && sponsorForm.address) {
      try {
        await createSponsorApplication(sponsorForm);
        
        // Send confirmation email
        try {
          const { sendSponsorConfirmationEmail } = await import('@/services/emailService');
          const emailResult = await sendSponsorConfirmationEmail(sponsorForm);
          console.log('📧 Sponsor email sent:', emailResult.success ? 'Success' : emailResult.error);
        } catch (emailError) {
          console.error('❌ Failed to send sponsor email:', emailError);
        }
        
        showToastMessage("Thank you for your interest in sponsoring! Our partnership team will reach out to you within 24 hours to discuss exciting collaboration opportunities.");
        setSponsorForm({ name: '', email: '', phone: '', address: '' });
        setShowSponsorModal(false);
      } catch (error) {
        console.error('Error submitting sponsor application:', error);
        showToastMessage("Sorry, there was an error submitting your application. Please try again later.");
      }
    }
  };

  const handlePerformerSubmit = async () => {
    if (performerForm.name && performerForm.email && performerForm.phone && performerForm.address && performerForm.performanceType) {
      try {
        await createPerformerApplication(performerForm);
        
        // Send confirmation email
        try {
          const { sendPerformerConfirmationEmail } = await import('@/services/emailService');
          const emailResult = await sendPerformerConfirmationEmail(performerForm);
          console.log('📧 Performer email sent:', emailResult.success ? 'Success' : emailResult.error);
        } catch (emailError) {
          console.error('❌ Failed to send performer email:', emailError);
        }
        
        showToastMessage("We're thrilled about your performance application! Our talent acquisition team will contact you soon to discuss your artistic journey with us.");
        setPerformerForm({ name: '', email: '', phone: '', address: '', performanceType: '' });
        setShowPerformerModal(false);
      } catch (error) {
        console.error('Error submitting performer application:', error);
        showToastMessage("Sorry, there was an error submitting your application. Please try again later.");
      }
    }
  };

  return (
    <div className="relative mt-10 bg-gradient-to-br from-indigo-50 via-white to-cyan-50   rounded-2xl overflow-hidden">
      {/* Background Elements */}
      {/* <div className="absolute inset-0">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
      </div> */}

      {/* Main Content */}
      <div className="relative z-10  py-4 px-2 lg:px-4">
        <div className="max-w-6xl mx-auto text-center">
          {/* Header Section */}
          <div className="mb-10">
            
            
            <h1 className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 bg-clip-text text-transparent leading-tight mb-2">
              Where Dreams Meet Opportunity
            </h1>
            
            <p className="text-md sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Whether you wish to empower as a Sponsor or inspire as a Performer, your journey starts here.
            </p>
          </div>

          {/* CTA Cards */}
          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {/* Sponsor Card */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl blur-lg opacity-25 group-hover:opacity-40 transition-opacity duration-500"></div>
              <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl p-4 border border-white/50 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:-translate-y-2">
              
              <div className='flex justify-center gap-4 '>
                <div className=" w-6 h-6 md:w-8 md:h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center   transform group-hover:scale-110 transition-transform duration-300">
                  <Heart className="w-4 h-4 text-white" />
                </div>
                
                <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-4">Become a Sponsor</h3>
                </div>

                <p className="text-gray-600 mb-8 text-sm md:text-base leading-relaxed">
Join us in shaping unforgettable moments. Your support lets dreams soar and communities flourish through artistic expression                 </p>

                <button
                  onClick={() => setShowSponsorModal(true)}
                  className="w-full cursor-pointer bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold py-3 md:py-4 px-4 md:px-8 rounded-xl md:rounded-2xl hover:shadow-lg  flex items-center justify-center group-hover:shadow-purple-500/25"
                >
                  <Star className="w-5 h-5 mr-2" />
                  Partner With Us
                </button>
              </div>
            </div>

            {/* Performer Card */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-cyan-600 rounded-3xl blur-lg opacity-25 group-hover:opacity-40 transition-opacity duration-500"></div>
              <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl p-4 border border-white/50 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:-translate-y-2">
              
              <div className='flex justify-center gap-4 '>
                <div className="w-6 h-6 md:w-8 md:h-8 bg-gradient-to-br from-indigo-500 to-cyan-500 rounded-2xl flex items-center justify-center ">
                  <Mic className="w-4 h-4 text-white" />
                </div>
                
                <h3 className=" text-xl md:text-2xl font-bold text-gray-800 mb-4">Join as Performer</h3>
                </div>

                <p className="text-gray-600 text-sm md:text-base mb-8 leading-relaxed">
                  Showcase your talent to the world. Whether you sing, dance, or create magic, we're here to amplify your artistic voice.
                </p>
                
                <button
                  onClick={() => setShowPerformerModal(true)}
                  className="w-full cursor-pointer bg-gradient-to-r from-indigo-600 to-cyan-600 text-white font-semibold py-3 md:py-4 px-4 md:px-8 rounded-xl md:rounded-2xl hover:shadow-lg  flex items-center justify-center group-hover:shadow-indigo-500/25"
                >
                  <Users className="w-5 h-5 mr-2" />
                  Share Your Talent
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals and Toast */}
      <SponsorModal 
        showSponsorModal={showSponsorModal}
        setShowSponsorModal={setShowSponsorModal}
        sponsorForm={sponsorForm}
        setSponsorForm={setSponsorForm}
        handleSponsorSubmit={handleSponsorSubmit}
      />

      <PerformerModal 
        showPerformerModal={showPerformerModal}
        setShowPerformerModal={setShowPerformerModal}
        performerForm={performerForm}
        setPerformerForm={setPerformerForm}
        handlePerformerSubmit={handlePerformerSubmit}
      />

      <ToastNotification 
        showToast={showToast}
        toastMessage={toastMessage}
      />

      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        
        .animate-blob {
          animation: blob 7s infinite;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
        .animate-slideUp { animation: slideUp 0.4s ease-out; }
        .animate-slideDown { animation: slideDown 0.4s ease-out; }
      `}</style>
    </div>
  );
}
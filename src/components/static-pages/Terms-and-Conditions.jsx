"use client"
import { useRouter } from "next/navigation";
import { ArrowLeft } from 'lucide-react';

export default function TermsAndConditions() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="mb-6 flex items-center text-indigo-600 hover:text-indigo-800 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back
        </button>

        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500 to-blue-600 rounded-xl p-6 shadow-lg mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-white text-center">
            Terms and Conditions
          </h1>
          <p className="text-purple-100 text-center mt-2">
            for INTERNATIONAL SRI JAGANNATH PANCH RATRA
          </p>
          <p className="text-purple-50 text-sm text-center mt-4">
            Effective Date: NOVEMBER AND DECEMBER, 2025
          </p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-xl shadow-md p-6 sm:p-8">
          {/* Section 1 */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b-2 border-purple-100 pb-2">
              1. Introduction
            </h2>
            <p className="text-gray-700">
              These Terms and Conditions govern the participation in and attendance at INTERNATIONAL SRI JAGANNATH PANCH RATRA.
              INTERNATIONAL SRI JAGANNATH PANCH RATRA
              hosted by SAMUDAYIK VIKAS SAMITI ("Organizer"). By registering for or attending the Event, you agree to comply with these Terms and Conditions.
            </p>
          </div>

          {/* Section 2 */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b-2 border-purple-100 pb-2">
              2. Registration
            </h2>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start">
                <span className="text-purple-500 mr-2">•</span>
                All participants must register for the Event through the official website or designated registration platform.
              </li>
              <li className="flex items-start">
                <span className="text-purple-500 mr-2">•</span>
                Registration fees, if applicable, must be paid in full at the time of registration.
              </li>
              <li className="flex items-start">
                <span className="text-purple-500 mr-2">•</span>
                Registration is non-transferable unless explicitly permitted by the Organizer.
              </li>
            </ul>
          </div>

          {/* Section 3 */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b-2 border-purple-100 pb-2">
              3. Payment
            </h2>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start">
                <span className="text-purple-500 mr-2">•</span>
                Payment for registration is due upon registration.
              </li>
              <li className="flex items-start">
                <span className="text-purple-500 mr-2">•</span>
                Accepted payment methods include credit card, bank transfer, UPI.
              </li>
              <li className="flex items-start">
                <span className="text-purple-500 mr-2">•</span>
                All fees are non-refundable unless the Event is canceled by the Organizer.
              </li>
            </ul>
          </div>

          {/* Section 4 */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b-2 border-purple-100 pb-2">
              4. Code of Conduct
            </h2>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start">
                <span className="text-purple-500 mr-2">•</span>
                Participants are expected to behave professionally and respectfully towards others.
              </li>
              <li className="flex items-start">
                <span className="text-purple-500 mr-2">•</span>
                Harassment, discrimination, or any form of inappropriate behavior will not be tolerated.
              </li>
              <li className="flex items-start">
                <span className="text-purple-500 mr-2">•</span>
                The Organizer reserves the right to remove any participant who violates this code of conduct.
              </li>
            </ul>
          </div>

          {/* Section 5 */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b-2 border-purple-100 pb-2">
              5. Cancellation and Refund Policy
            </h2>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start">
                <span className="text-purple-500 mr-2">•</span>
                The Organizer reserves the right to cancel the Event for any reason, including but not limited to unforeseen circumstances.
              </li>
              <li className="flex items-start">
                <span className="text-purple-500 mr-2">•</span>
                In the event of cancellation, participants will be notified promptly, and registration fees will be refunded in full.
              </li>
              <li className="flex items-start">
                <span className="text-purple-500 mr-2">•</span>
                No refunds will be issued for no-shows or cancellations made by participants after event date or before 10 days of the event for cancellation.
              </li>
            </ul>
          </div>

          {/* Section 6 */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b-2 border-purple-100 pb-2">
              6. Intellectual Property
            </h2>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start">
                <span className="text-purple-500 mr-2">•</span>
                All content shared during the Event, including presentations, materials, and recordings, is the intellectual property of the Organizer or the respective speakers.
              </li>
              <li className="flex items-start">
                <span className="text-purple-500 mr-2">•</span>
                Participants may not record or distribute any materials without prior written consent from the Organizer.
              </li>
            </ul>
          </div>

          {/* Section 7 */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b-2 border-purple-100 pb-2">
              7. Liability
            </h2>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start">
                <span className="text-purple-500 mr-2">•</span>
                The Organizer is not responsible for any loss, damage, or injury incurred during the Event.
              </li>
              <li className="flex items-start">
                <span className="text-purple-500 mr-2">•</span>
                Participants are responsible for their own travel arrangements, accommodations, and any associated costs.
              </li>
            </ul>
          </div>

          {/* Section 8 */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b-2 border-purple-100 pb-2">
              8. Privacy Policy
            </h2>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start">
                <span className="text-purple-500 mr-2">•</span>
                Personal information collected during registration will be used in accordance with the Organizer's Privacy Policy.
              </li>
              <li className="flex items-start">
                <span className="text-purple-500 mr-2">•</span>
                Participants consent to the collection and use of their information as outlined in the Privacy Policy.
              </li>
            </ul>
          </div>

          {/* Section 9 */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b-2 border-purple-100 pb-2">
              9. Governing Law
            </h2>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start">
                <span className="text-purple-500 mr-2">•</span>
                These Terms and Conditions shall be governed by and construed in accordance with the laws of India.
              </li>
              <li className="flex items-start">
                <span className="text-purple-500 mr-2">•</span>
                Any disputes arising from these Terms and Conditions shall be resolved in the courts of G B Nagar.
              </li>
            </ul>
          </div>

          {/* Section 10 */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b-2 border-purple-100 pb-2">
              10. Amendments
            </h2>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start">
                <span className="text-purple-500 mr-2">•</span>
                The Organizer reserves the right to amend these Terms and Conditions at any time. Participants will be notified of significant changes.
              </li>
            </ul>
          </div>

          {/* Section 11 */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b-2 border-purple-100 pb-2">
              11. Contact Information
            </h2>
            <p className="text-gray-700 mb-4">
              For questions regarding these Terms and Conditions, please contact at 0120-4348458 www.svsamiti.com
            </p>
            <p className="text-gray-700 font-medium">
              SVS TEAM
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
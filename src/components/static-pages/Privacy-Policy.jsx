"use client"
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPolicy() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-8 px-4 sm:px-6 lg:px-8">
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
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 shadow-lg mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-white text-center">
            Privacy Policy
          </h1>
          <p className="text-blue-100 text-center mt-2">
            Samudayik Vikas Samiti
          </p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-xl shadow-md p-6 sm:p-8">
          <p className="text-gray-700 mb-8">
            Samudayik Vikas Samiti is committed to the virtuous collection, retention and use of information that you provide to us about yourself (Personal Information) on this site www.svsamiti.com.
          </p>

          {/* Section 1 */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b-2 border-blue-100 pb-2">
              1. Your Personal Information may integrate the following:-
            </h2>
            <ul className="space-y-2 text-gray-700 list-disc pl-5">
              <li>Your name</li>
              <li>Your age</li>
              <li>Your occupation</li>
              <li>A user ID and password of your choice</li>
              <li>Your email and mailing address</li>
              <li>Your mobile number</li>
              <li>Your payment processing details</li>
              <li>Limited personal details</li>
              <li>Any other data as Samudayik Vikas Samiti may require.</li>
            </ul>
          </div>

          {/* Section 2 */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b-2 border-blue-100 pb-2">
              2. Privacy Policy Overview
            </h2>
            <p className="text-gray-700">
              The following Privacy Policy sets forth our understanding with you on the cumulation, use and protection of your Patented Information. Please read the entire Privacy Policy.
            </p>
          </div>

          {/* Section 3 */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b-2 border-blue-100 pb-2">
              3. Consent
            </h2>
            <p className="text-gray-700">
              Your use of the website constitutes your consent to the all the terms and conditions contained in this privacy policy (as amended from time to time) and you shall be bound by the same.
            </p>
          </div>

          {/* Section 4 */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b-2 border-blue-100 pb-2">
              4. Collection of Information
            </h2>
            
            <h3 className="font-medium text-gray-800 mt-4">4.1 Site Browsing:</h3>
            <p className="text-gray-700">
              You browse the Site anonymously. We do not require you to distinguish yourself or reveal any Personal Information while browsing through the website. However, you may not be able to access certain sections of the Site or interact with us without supplying us with Personal Information. For instance, you would not be able to transact at the Site or make any donations only at the Site, without providing the site with Personal Information. If you desire to register yourself at the Site, you would be required to provide your Personal Information.
            </p>

            <h3 className="font-medium text-gray-800 mt-4">4.2 Automatic Information Collection:</h3>
            <p className="text-gray-700">
              While you are browsing through the Site, the Site operating system may automatically record some general information (General Information) about your visit such as:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1 text-gray-700">
              <li>The date and time you visit the Site, along with the address of the previous website your were visiting, if you linked to us from another website.</li>
              <li>The type of browser you are using (such as Internet Explorer version X).</li>
              <li>Which pages are hit on the Site.</li>
            </ul>

            <h3 className="font-medium text-gray-800 mt-4">4.3 General Information Usage:</h3>
            <p className="text-gray-700">
              The General Information is not Personal Information Samudayik Vikas Samiti tracking system does not record personal information about individuals or link this information to any Personal Information collected from you.
            </p>

            <h3 className="font-medium text-gray-800 mt-4">4.4 Analytics:</h3>
            <p className="text-gray-700">
              The General Information is used by Samudayik Vikas Samiti for analytical analysis, for tracking overall traffic patterns on the Site and to gauge the public interest in Samudayik Vikas Samiti and the Site. General Information may be shared with any person, at Samudayik Vikas Samiti.
            </p>

            <h3 className="font-medium text-gray-800 mt-4">Cookies:</h3>
            <p className="text-gray-700">
              Cookies are small amounts of data that a website can send to a web browser on a computer. The cookie is stored on a guest computer. A cookie may enable the site to track how a visitor navigates through its site and the areas in which they show interest, this is similar to a traffic report: it tracks trends and behavior, but does not identify individuals information. The information collected may include date and time of visits, pages viewed, time spend at the site, and the site visited just before and just after at Samudayik Vikas Samiti.
            </p>

            <h4 className="font-medium text-gray-800 mt-4">Types of Cookies:</h4>
            <p className="text-gray-700">
              If the use of cookies is a worry to you, then please makes sure your browser has this capability, and set your browser alert accordingly. Newer browser versions allow you to be alerted or to automatically abstain cookies, you may need to download a more current version of your web browser from your service provider in order to obtain this option.
            </p>
            <p className="text-gray-700 mt-2">
              <strong>Note:</strong> Some specific features and services provided by Samudayik Vikas Samiti require you to accept a cookie in order to be able to use the particular functionality or service these cookies are used to establish a link between the user and the application server the cookies contain unique session IDs and no customer data is stored on the cookies.
            </p>
          </div>

          {/* Section 5 */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b-2 border-blue-100 pb-2">
              5. Usage of Information
            </h2>
            <h3 className="font-medium text-gray-800 mt-4">5.1 Personal information usage:</h3>
            <p className="text-gray-700">
              Personal information will be used by Samudayik Vikas Samiti for internal purposes including the following:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1 text-gray-700">
              <li>We will send you emails, features, promotional content, surveys, brochures, catalogues, Samudayik Vikas Samiti Annual Report, Samudayik Vikas Samiti in action, reminders for donations, regular updates on the utilization of donations by SVS and other updates.</li>
              <li>Processing your donations to Samudayik Vikas Samiti.</li>
              <li>Delivering the Samudayik Vikas Samiti Receipt for donations made by you to Samudayik Vikas Samiti.</li>
              <li>Preserving an internal confidential database of all the Personal Information collected from visitors to the Site</li>
              <li>Evaluating and administering the Site and Samudayik Vikas Samiti activities, responding to any problems that may arise and gauging visitor trends on the Site.</li>
            </ul>
          </div>

          {/* Section 6 */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b-2 border-blue-100 pb-2">
              6. Disclosure of Personal Information by Samudayik Vikas Samiti
            </h2>
            
            <h3 className="font-medium text-gray-800 mt-4">6.1 Internal Access:</h3>
            <p className="text-gray-700">
              Within Samudayik Vikas Samiti, access to Personal Information collected by Samudayik Vikas Samiti will be given only to those persons who are authorized by Samudayik Vikas Samiti and third parties hired by Samudayik Vikas Samiti to perform administrative services. Samudayik Vikas Samiti will provide access to third parties for inter alia entering and managing Personal Information in Samudayik Vikas Samiti database, preparing address labels, sending emails, which require third parties to have access to your Personal Information. Samudayik Vikas Samiti cannot guarantee that such parties will keep your Personal Information confidential and Samudayik Vikas Samiti will not be liable in any manner for any loss of confidentiality attributable to such third parties.
            </p>

            <h3 className="font-medium text-gray-800 mt-4">6.2 Sharing with Affiliates:</h3>
            <p className="text-gray-700">
              Samudayik Vikas Samiti may share Personal Information with any of persons who are associated with Samudayik Vikas Samiti, including companies and non-government organizations affiliated with Samudayik Vikas Samiti in any manner. Samudayik Vikas Samiti will withhold ownership rights over such information and will share only such portions of the Personal Information as it deems fit.
            </p>

            <h3 className="font-medium text-gray-800 mt-4">6.3 Liability Limitation:</h3>
            <p className="text-gray-700">
              Samudayik Vikas Samiti is not liable in any manner whatsoever for the loss or harm caused to you by the misuse of your personal Information by a third party who is not an employee of Samudayik Vikas Samiti.
            </p>

            <h3 className="font-medium text-gray-800 mt-4">6.4 Legal Disclosure:</h3>
            <p className="text-gray-700">
              Nevertheless anything contained herein or any other contract between you and Samudayik Vikas Samiti reserves the right to disclose any personal Information about you without notice or consent as needed to satisfy any requirement of law, legal request or legal investigation to conduct investigations of violation of law, to protect the site and to protect our visitors and other persons and if required by the policy of Samudayik Vikas Samiti.
            </p>
          </div>

          {/* Section 7 */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b-2 border-blue-100 pb-2">
              7. Security
            </h2>
            <h3 className="font-medium text-gray-800 mt-4">7.1 Security Measures:</h3>
            <p className="text-gray-700">
              Samudayik Vikas Samiti aspire to use up-to-date security measures to protect your Personal Information.
            </p>

            <h3 className="font-medium text-gray-800 mt-4">7.2 No Warranty:</h3>
            <p className="text-gray-700">
              Samudayik Vikas Samiti however does not make any express or implied warranty with respect to the security measures that it may employ from time to time for the protection of the Personal Information.
            </p>
          </div>

          {/* Section 8 */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b-2 border-blue-100 pb-2">
              8. Links to other Websites
            </h2>
            <p className="text-gray-700">
              The Site contains links to other websites for the benefit of it visitors. The privacy policies does not apply to such other websites. Samudayik Vikas Samiti is not responsible for any loss or damage caused to you by the collection, use and detention of personal information by such website in any manner whatsoever. It is important for you to read the privacy policies of all websites you visit before you disclose any information to such websites.
            </p>
          </div>

          {/* Section 9 */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b-2 border-blue-100 pb-2">
              9. Variation of the Privacy Policy
            </h2>
            <p className="text-gray-700">
              Samudayik Vikas Samiti shall be absolutely entitled at its sole discretion from time to time add, alter, delete or modify any of the terms and conditions contained herein. Such changes, additions, deletions or modifications shall be mandatory on you once you visit the site after the privacy policy has been so amended.
            </p>
          </div>

          {/* Section 10 */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b-2 border-blue-100 pb-2">
              10. Copyright Protection
            </h2>
            <p className="text-gray-700">
              All the content on this site including graphics, text, icons, interfaces, audio clips, logos, images and software is the property of Samudayik Vikas Samiti and its content suppliers which is protected by Indian and international copyright laws. The arrangement and compilation (meaning the collection, arrangement, and assembly) of all content on this site is the exclusive property of Samudayik Vikas Samiti and protected by Indian and international copyright laws.
            </p>
            <p className="text-gray-700 mt-2">
              The permission is given to use the resources of this site only for the purposes of making enquiries, making a donation to Samudayik Vikas Samiti. Any other use, including the modification, distribution, transmission, republication, display or performance of the content on this site can only be made with the express permission of Samudayik Vikas Samiti. All other trademarks, brands and copyrights other than those belonging to Samudayik Vikas Samiti belong to their respective owners and are their property.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
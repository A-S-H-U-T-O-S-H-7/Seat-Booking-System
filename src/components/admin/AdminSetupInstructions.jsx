import { useTheme } from '@/context/ThemeContext';
import { 
  UserPlusIcon, 
  EnvelopeIcon, 
  KeyIcon, 
  CheckCircleIcon 
} from '@heroicons/react/24/outline';

export default function AdminSetupInstructions({ adminEmail }) {
  const { isDarkMode } = useTheme();

  const steps = [
    {
      icon: UserPlusIcon,
      title: 'Create Firebase Account',
      description: `Go to the admin login page and create a new account using the email: ${adminEmail}`,
      details: 'Use the "Sign Up" option on the login page with your assigned email address.'
    },
    {
      icon: KeyIcon,
      title: 'Set Your Password',
      description: 'Choose a secure password for your admin account',
      details: 'Make sure to use a strong password with at least 8 characters, including letters, numbers, and symbols.'
    },
    {
      icon: EnvelopeIcon,
      title: 'Verify Your Email',
      description: 'Check your email for a verification link and click it',
      details: 'You may need to check your spam folder. The email will come from Firebase.'
    },
    {
      icon: CheckCircleIcon,
      title: 'Login to Admin Panel',
      description: 'Once verified, you can login to access your assigned features',
      details: 'Your permissions have been pre-configured by the Super Admin.'
    }
  ];

  return (
    <div className={`max-w-2xl mx-auto p-6 rounded-xl shadow-sm border ${
      isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
    }`}>
      <div className="text-center mb-8">
        <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
          isDarkMode ? 'bg-purple-900 text-purple-300' : 'bg-purple-100 text-purple-600'
        }`}>
          <UserPlusIcon className="w-8 h-8" />
        </div>
        <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Admin Account Setup
        </h2>
        <p className={`mt-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          Follow these steps to set up your admin account
        </p>
      </div>

      <div className="space-y-6">
        {steps.map((step, index) => {
          const IconComponent = step.icon;
          return (
            <div key={index} className="flex items-start space-x-4">
              <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                isDarkMode ? 'bg-purple-900 text-purple-300' : 'bg-purple-100 text-purple-600'
              }`}>
                <IconComponent className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Step {index + 1}: {step.title}
                </h3>
                <p className={`mt-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  {step.description}
                </p>
                <p className={`mt-1 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {step.details}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className={`mt-8 p-4 rounded-lg ${
        isDarkMode ? 'bg-blue-900/20 border-blue-700' : 'bg-blue-50 border-blue-200'
      } border`}>
        <div className="flex items-start space-x-3">
          <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
            isDarkMode ? 'bg-blue-700 text-blue-200' : 'bg-blue-100 text-blue-600'
          }`}>
            <span className="text-sm font-bold">!</span>
          </div>
          <div>
            <h4 className={`font-medium ${isDarkMode ? 'text-blue-200' : 'text-blue-800'}`}>
              Important Notes
            </h4>
            <ul className={`mt-1 text-sm space-y-1 ${isDarkMode ? 'text-blue-300' : 'text-blue-700'}`}>
              <li>• Use exactly this email address: <strong>{adminEmail}</strong></li>
              <li>• Keep your login credentials secure</li>
              <li>• Contact the Super Admin if you have any issues</li>
              <li>• Your permissions are already configured and will be active once you login</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

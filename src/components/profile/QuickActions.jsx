import Link from 'next/link';

const QuickActions = ({ onRefresh }) => {
  const actions = [
    {
      href: '/havan',
      label: '🎫 Reserve Havan Spot',
      color: 'from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700'
    },
    // {
    //   href: '/booking/show',
    //   label: '🎭 Reserve Show Spot',
    //   color: 'from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700'
    // },
    {
      href: '/stall',
      label: '🏪 Reserve Your Stall',
      color: 'from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700'
    },
    {
      href: '/delegate',
      label: '🎓 Register as Delegate',
      color: 'from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700'
    },
    {
      href: '/donate',
      label: '💝 Make a Donation',
      color: 'from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700'
    }
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-bold text-gray-800 mb-4">Quick Actions</h3>
      <div className="space-y-3">
        {actions.map((action, index) => (
          <Link
            key={index}
            href={action.href}
            className={`w-full bg-gradient-to-r ${action.color} text-white px-4 py-3 rounded-lg font-medium transform hover:scale-105 transition-all duration-200 shadow-md hover:shadow-lg text-center block`}
          >
            {action.label}
          </Link>
        ))}
        <button
          onClick={onRefresh}
          className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-3 rounded-lg font-medium transition-colors duration-200"
        >
          🔄 Refresh Reservations
        </button>
      </div>
    </div>
  );
};

export default QuickActions;
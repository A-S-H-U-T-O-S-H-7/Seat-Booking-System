import Link from 'next/link';

const EmptyState = ({ type, count, icon, color, link, linkText }) => {
  if (count > 0) return null;

  const colorClasses = {
    orange: 'from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700',
    purple: 'from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700',
    green: 'from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700',
    yellow: 'from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700',
    pink: 'from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700'
  };

  return (
    <div className="text-center py-12">
      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <span className="text-3xl text-gray-400">{icon}</span>
      </div>
      <h4 className="text-lg font-medium text-gray-500 mb-2">No {type} reservations yet</h4>
      <p className="text-gray-400 mb-4">Reserve your first {type.toLowerCase()}</p>
      <Link
        href={link}
        className={`inline-block bg-gradient-to-r ${colorClasses[color]} text-white px-6 py-3 rounded-lg font-medium transform hover:scale-105 transition-all duration-200 shadow-md hover:shadow-lg`}
      >
        {linkText}
      </Link>
    </div>
  );
};

export default EmptyState;
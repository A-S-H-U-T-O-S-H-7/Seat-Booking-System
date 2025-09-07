const BookingTabs = ({ activeTab, setActiveTab, counts }) => {
  return (
    <div className="flex bg-gray-100 rounded-lg p-1">
      {[
        { key: 'havan', label: 'Havan', count: counts.havan, color: 'orange' },
        // { key: 'show', label: 'Shows', count: counts.show, color: 'purple' },
        { key: 'stall', label: 'Stalls', count: counts.stall, color: 'green' },
        { key: 'delegates', label: 'Delegates', count: counts.delegates, color: 'yellow' },
        { key: 'donations', label: 'Donations', count: counts.donations, color: 'pink' }
      ].map((tab) => (
        <button
          key={tab.key}
          onClick={() => setActiveTab(tab.key)}
          className={`flex-1 px-3 py-2 text-xs sm:text-sm font-medium rounded-md transition-colors ${
            activeTab === tab.key
              ? `bg-white text-${tab.color}-600 shadow-sm`
              : 'text-gray-600 hover:text-${tab.color}-600'
          }`}
        >
          {tab.label} ({tab.count})
        </button>
      ))}
    </div>
  );
};

export default BookingTabs;
"use client";
import { useState, useEffect } from 'react';

export default function EmailDatesDebug() {
  const [debugData, setDebugData] = useState([]);

  useEffect(() => {
    try {
      const data = JSON.parse(localStorage.getItem('havanEmailDateDebug') || '[]');
      setDebugData(data);
    } catch (e) {
      console.error('Error loading debug data:', e);
    }
  }, []);

  const clearDebugData = () => {
    localStorage.removeItem('havanEmailDateDebug');
    setDebugData([]);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              Email Date Debug Information
            </h1>
            <button
              onClick={clearDebugData}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
            >
              Clear Debug Data
            </button>
          </div>
          
          <p className="text-gray-600 mb-6">
            This page shows debugging information for Havan email date processing.
            Make a booking for December 5th to see the debug data appear here.
          </p>

          {debugData.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No debug data available. Make a Havan booking to see debug information.
            </div>
          ) : (
            <div className="space-y-4">
              {debugData.map((debug, index) => (
                <div key={index} className="bg-gray-50 border rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">
                        Order ID: {debug.orderId}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        Timestamp: {new Date(debug.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800 mb-2">Date Values:</h4>
                      <div className="text-sm space-y-1">
                        <p><span className="font-medium">eventDate:</span> {JSON.stringify(debug.eventDate)}</p>
                        <p><span className="font-medium">bookingDataEventDate:</span> {JSON.stringify(debug.bookingDataEventDate)}</p>
                        <p><span className="font-medium">selectedDate:</span> {JSON.stringify(debug.selectedDate)}</p>
                        <p><span className="font-medium">Type:</span> {debug.type}</p>
                        <p><span className="font-medium">Constructor:</span> {debug.constructor}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">How to Use This Debug Page:</h3>
            <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
              <li>Make a Havan booking for December 5th</li>
              <li>Complete the payment process</li>
              <li>Refresh this page to see the debug information</li>
              <li>Check what date values are being processed for the email</li>
              <li>Compare with the actual email received to identify the issue</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}

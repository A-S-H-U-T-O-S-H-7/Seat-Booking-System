"use client";
import { useBooking } from '@/context/BookingContext';
import { useStallBooking } from '@/context/StallBookingContext';
import { useShowSeatBooking } from '@/context/ShowSeatBookingContext';
import { formatCurrency } from '@/utils/pricingUtils';

const PricingTestComponent = () => {
  // Get pricing data from all contexts
  const havan = useBooking();
  const stall = useStallBooking();
  const show = useShowSeatBooking();

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Real-Time Pricing Sync Test
        </h1>
        <p className="text-gray-600">
          This component displays pricing information from all booking contexts to verify real-time synchronization.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Havan Pricing */}
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
          <h2 className="text-xl font-bold text-orange-800 mb-4 flex items-center gap-2">
            🕉️ Havan Pricing
          </h2>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-700">Base Seat Price:</span>
              <span className="font-semibold">{formatCurrency(havan.priceSettings.defaultSeatPrice)}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-700">Tax Rate:</span>
              <span className="font-semibold">{havan.priceSettings.taxRate}%</span>
            </div>
            
            <div className="border-t pt-3">
              <h4 className="font-semibold text-gray-800 mb-2">Early Bird Discounts:</h4>
              {havan.priceSettings.earlyBirdDiscounts.length > 0 ? (
                <div className="space-y-1">
                  {havan.priceSettings.earlyBirdDiscounts.map((discount, index) => (
                    <div key={index} className="text-sm text-gray-600">
                      {discount.daysBeforeEvent}+ days: {discount.discountPercent}%
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No early bird discounts set</p>
              )}
            </div>
            
            <div className="border-t pt-3">
              <h4 className="font-semibold text-gray-800 mb-2">Bulk Discounts:</h4>
              {havan.priceSettings.bulkBookingDiscounts.length > 0 ? (
                <div className="space-y-1">
                  {havan.priceSettings.bulkBookingDiscounts.map((discount, index) => (
                    <div key={index} className="text-sm text-gray-600">
                      {discount.minSeats}+ seats: {discount.discountPercent}%
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No bulk discounts set</p>
              )}
            </div>

            {havan.selectedSeats.length > 0 && (
              <div className="border-t pt-3 bg-orange-100 p-3 rounded">
                <h4 className="font-semibold text-gray-800 mb-2">Current Selection:</h4>
                <div className="text-sm space-y-1">
                  <p>Selected Seats: {havan.selectedSeats.length}</p>
                  <p>Base Amount: {formatCurrency(havan.getBaseAmount())}</p>
                  <p>Discount: {formatCurrency(havan.getDiscountAmount())}</p>
                  <p>Tax: {formatCurrency(havan.getTaxAmount())}</p>
                  <p className="font-bold">Total: {formatCurrency(havan.getTotalAmount())}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Stall Pricing */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h2 className="text-xl font-bold text-green-800 mb-4 flex items-center gap-2">
            🏪 Stall Pricing
          </h2>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-700">Default Stall Price:</span>
              <span className="font-semibold">{formatCurrency(stall.priceSettings.defaultStallPrice)}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-700">Tax Rate:</span>
              <span className="font-semibold">{stall.priceSettings.taxRate}%</span>
            </div>
            
            <div className="border-t pt-3">
              <h4 className="font-semibold text-gray-800 mb-2">Early Bird Discounts:</h4>
              {stall.priceSettings.earlyBirdDiscounts.length > 0 ? (
                <div className="space-y-1">
                  {stall.priceSettings.earlyBirdDiscounts.map((discount, index) => (
                    <div key={index} className="text-sm text-gray-600">
                      {discount.daysBeforeEvent}+ days: {discount.discountPercent}%
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No early bird discounts set</p>
              )}
            </div>
            
            <div className="border-t pt-3">
              <h4 className="font-semibold text-gray-800 mb-2">Bulk Discounts:</h4>
              {stall.priceSettings.bulkBookingDiscounts.length > 0 ? (
                <div className="space-y-1">
                  {stall.priceSettings.bulkBookingDiscounts.map((discount, index) => (
                    <div key={index} className="text-sm text-gray-600">
                      {discount.minSeats}+ stalls: {discount.discountPercent}%
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No bulk discounts set</p>
              )}
            </div>

            {stall.selectedStalls.length > 0 && (
              <div className="border-t pt-3 bg-green-100 p-3 rounded">
                <h4 className="font-semibold text-gray-800 mb-2">Current Selection:</h4>
                <div className="text-sm space-y-1">
                  <p>Selected Stalls: {stall.selectedStalls.length}</p>
                  <p>Base Amount: {formatCurrency(stall.getBaseAmount())}</p>
                  <p>Discount: {formatCurrency(stall.getDiscountAmount())}</p>
                  <p>Tax: {formatCurrency(stall.getTaxAmount())}</p>
                  <p className="font-bold">Total: {formatCurrency(stall.getTotalAmount())}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Show Pricing */}
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
          <h2 className="text-xl font-bold text-purple-800 mb-4 flex items-center gap-2">
            🎭 Show Pricing
          </h2>
          
          <div className="space-y-3">
            <div className="border-b pb-2 mb-3">
              <h4 className="font-semibold text-gray-800 mb-2">Seat Types:</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>VIP:</span>
                  <span className="font-semibold">{formatCurrency(show.priceSettings.seatTypes.VIP.price)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Regular C:</span>
                  <span className="font-semibold">{formatCurrency(show.priceSettings.seatTypes.REGULAR_C.price)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Regular D:</span>
                  <span className="font-semibold">{formatCurrency(show.priceSettings.seatTypes.REGULAR_D.price)}</span>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-700">Tax Rate:</span>
              <span className="font-semibold">{show.priceSettings.taxRate}%</span>
            </div>
            
            <div className="border-t pt-3">
              <h4 className="font-semibold text-gray-800 mb-2">Early Bird Discounts:</h4>
              {show.priceSettings.earlyBirdDiscounts.length > 0 ? (
                <div className="space-y-1">
                  {show.priceSettings.earlyBirdDiscounts.map((discount, index) => (
                    <div key={index} className="text-sm text-gray-600">
                      {discount.daysBeforeEvent}+ days: {discount.discountPercent}%
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No early bird discounts set</p>
              )}
            </div>
            
            <div className="border-t pt-3">
              <h4 className="font-semibold text-gray-800 mb-2">Bulk Discounts:</h4>
              {show.priceSettings.bulkBookingDiscounts.length > 0 ? (
                <div className="space-y-1">
                  {show.priceSettings.bulkBookingDiscounts.map((discount, index) => (
                    <div key={index} className="text-sm text-gray-600">
                      {discount.minSeats}+ seats: {discount.discountPercent}%
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No bulk discounts set</p>
              )}
            </div>

            {show.selectedSeats.length > 0 && (
              <div className="border-t pt-3 bg-purple-100 p-3 rounded">
                <h4 className="font-semibold text-gray-800 mb-2">Current Selection:</h4>
                <div className="text-sm space-y-1">
                  <p>Selected Seats: {show.selectedSeats.length}</p>
                  <p>Total Price: {formatCurrency(show.totalPrice)}</p>
                  <p>Seats: {show.selectedSeats.join(', ')}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Test Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-800 mb-3">Testing Instructions</h3>
        <div className="prose text-sm text-blue-700">
          <ol className="list-decimal list-inside space-y-2">
            <li>
              <strong>Setup Admin Pricing:</strong> Create the following documents in Firestore:
              <ul className="list-disc list-inside ml-4 mt-1">
                <li><code>settings/havanPricing</code> - with seatPrice, earlyBirdDiscounts, bulkBookingDiscounts, taxRate</li>
                <li><code>settings/stallPricing</code> - with seatPrice, earlyBirdDiscounts, bulkBookingDiscounts</li>
                <li><code>settings/showPricing</code> - with seatTypes object, earlyBirdDiscounts, bulkBookingDiscounts</li>
              </ul>
            </li>
            <li><strong>Test Real-time Updates:</strong> Modify any pricing document in Firestore and observe instant updates in this component</li>
            <li><strong>Test Discount Calculations:</strong> Select seats/stalls in booking flows and verify discount calculations</li>
            <li><strong>Test User Notifications:</strong> Update prices while seats are selected to see toast notifications</li>
          </ol>
        </div>
      </div>

      <div className="text-center text-gray-600">
        <p className="text-sm">
          💡 This component updates automatically when admin changes pricing settings in Firestore.
          <br />
          Toast notifications will appear when pricing updates occur during active selections.
        </p>
      </div>
    </div>
  );
};

export default PricingTestComponent;

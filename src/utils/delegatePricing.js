// Configuration constants for pricing
export const PRICING_CONFIG = {
  withoutAssistance: {
    pricePerPerson: 1,
    fixedDays: 5,
    benefits: [
      '🍴 Enjoy complimentary lunch throughout the event',
      '🎟️ Receive a free entry pass valid for 5 days',
      '🤝 Get assistance with basic needs during event',
      '🎫 Avail a complimentary pass to exclusive shows'
    ]
  },
  withAssistance: {
    pricePerPersonPerDay: 20,
    minDays: 2,
    maxDays: 5,
    benefits: [
      '✈️ Facility of pick-up & drop from airport/station ',
      '🏨 Comfortable stay in well-appointed hotel ',
      '🚐 Daily transportation between hotel & venue provided',
      '🍽️ Lunch and dinner served throughout your stay',
      '🛎️ Provided all essential amenities for Havan and Shows',
      '🤝 Personalized care and dedicated assistance'
    ]
  }
};

export const API_KEY = "aHFpNVJ5ZGpLeUlPcTRNWVFWb1dnRUZMZW85UFhSMzZJenB3T2dLYQ==";
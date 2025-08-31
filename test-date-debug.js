// Simple test to debug date formatting issues

console.log('=== Date Debugging Test ===');

// Simulate how dates might be stored in Firebase
const testDate = new Date('2024-12-05'); // December 5th, 2024
console.log('1. Original Date:', testDate);
console.log('2. Date components:', {
  year: testDate.getFullYear(),
  month: testDate.getMonth(),
  day: testDate.getDate()
});

// Test timezone issue with toISOString
console.log('3. toISOString():', testDate.toISOString());
console.log('4. toISOString().split("T")[0]:', testDate.toISOString().split('T')[0]);

// Test local date formatting
console.log('5. Local toString():', testDate.toString());
console.log('6. toLocaleDateString():', testDate.toLocaleDateString('en-IN'));
console.log('7. toLocaleDateString() with options:', testDate.toLocaleDateString('en-IN', {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  timeZone: 'Asia/Kolkata'
}));

// Test creating date from components (timezone-safe)
const safeDate = new Date(testDate.getFullYear(), testDate.getMonth(), testDate.getDate());
console.log('8. Safe date from components:', safeDate);
console.log('9. Safe date formatted:', safeDate.toLocaleDateString('en-IN', {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  timeZone: 'Asia/Kolkata'
}));

// Test different input formats
console.log('\n=== Testing Different Input Formats ===');

// String date
const stringDate = '2024-12-05';
console.log('String input:', stringDate);
const parsedFromString = new Date(stringDate);
console.log('Parsed from string:', parsedFromString);
console.log('String parsed components:', {
  year: parsedFromString.getFullYear(),
  month: parsedFromString.getMonth(),
  day: parsedFromString.getDate()
});

// Firestore-like timestamp
const firestoreTimestamp = {
  seconds: Math.floor(testDate.getTime() / 1000),
  nanoseconds: 0
};
console.log('Firestore timestamp:', firestoreTimestamp);
const fromFirestore = new Date(firestoreTimestamp.seconds * 1000);
console.log('From Firestore timestamp:', fromFirestore);
console.log('Firestore date formatted:', fromFirestore.toLocaleDateString('en-IN', {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  timeZone: 'Asia/Kolkata'
}));

console.log('\n=== Testing Manual Date Parse (YYYY-MM-DD) ===');
const dateString = '2024-12-05';
const [year, month, day] = dateString.split('-').map(Number);
const manualDate = new Date(year, month - 1, day); // month is 0-indexed
console.log('Manual parsing result:', manualDate);
console.log('Manual date formatted:', manualDate.toLocaleDateString('en-IN', {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  timeZone: 'Asia/Kolkata'
}));

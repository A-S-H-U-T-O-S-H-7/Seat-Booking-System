/**
 * Date utility functions to ensure consistent date formatting
 * across all components and prevent timezone-related issues
 */

/**
 * Formats a Date object to YYYY-MM-DD string in local timezone
 * This prevents timezone conversion issues that occur with toISOString()
 * @param {Date} date - The date to format
 * @returns {string} - Date in YYYY-MM-DD format
 */
export const formatDateKey = (date) => {
  if (!date || !(date instanceof Date)) {
    throw new Error('Invalid date provided to formatDateKey');
  }
  
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};

/**
 * Creates a document ID for seat availability collection
 * @param {Date} date - The date
 * @param {string} shift - The shift ('morning' or 'evening')
 * @returns {string} - Document ID in format YYYY-MM-DD_shift
 */
export const createSeatAvailabilityDocId = (date, shift) => {
  const dateKey = formatDateKey(date);
  return `${dateKey}_${shift}`;
};

/**
 * Parses a date key back to a Date object
 * @param {string} dateKey - Date string in YYYY-MM-DD format
 * @returns {Date} - Date object
 */
export const parseDateKey = (dateKey) => {
  const [year, month, day] = dateKey.split('-').map(Number);
  return new Date(year, month - 1, day);
};

/**
 * Format a date string to a simplified version (e.g., "Apr 12, 2023 2:30 PM")
 * @param dateString - ISO date string to format
 * @returns Formatted date string
 */
export const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  } catch (e) {
    console.error('Error formatting date:', e);
    return dateString; // Return original string if formatting fails
  }
};

/**
 * Format a date to a time-only string (e.g., "2:30 PM")
 * @param date - Date object or ISO date string to format
 * @returns Formatted time string
 */
export const formatTime = (date: Date | string): string => {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  } catch (e) {
    console.error('Error formatting time:', e);
    return ''; // Return empty string if formatting fails
  }
};

/**
 * Format a date for short display (e.g., "Apr 12, 2023")
 * @param dateString - ISO date string to format
 * @returns Formatted short date string
 */
export const formatShortDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch (e) {
    console.error('Error formatting date:', e);
    return dateString; // Return original string if formatting fails
  }
}; 
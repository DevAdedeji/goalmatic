/**
 * Utility functions for formatting and parsing dates and times
 */
import { Timestamp } from 'firebase-admin/firestore';

/**
 * Formats a date value to YYYY-MM-DD string format
 * Returns null if the input cannot be converted to a valid Date
 * Handles both JavaScript Date objects and Firebase Timestamp objects
 */
export function formatDate(value: any): string | null {
    try {
        let date: Date;

        // Handle Firebase Timestamp objects
        if (value && typeof value === 'object' && 'toDate' in value && typeof value.toDate === 'function') {
            date = value.toDate();
        } else {
            date = new Date(value);
        }

        if (isNaN(date.getTime())) {
            console.warn(`Invalid date value received, cannot format: ${value}`);
            return null;
        }
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        return `${year}-${month}-${day}`;
    } catch (e) {
        console.warn(`Error formatting date value ${value}:`, e);
        return null;
    }
}

/**
 * Parses a time string in "H:mm:ss AM/PM", "HH:mm:ss", or "HH:mm" format and returns a Date object with today's date.
 * Returns null if parsing fails or results in an invalid date.
 */
export function parseTime(timeString: string): Date | null {
  // Updated regex to make seconds and AM/PM optional, and handle HH:mm format
  const parts = timeString.match(/^(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?(?:\s*(AM|PM))?$/i);

  if (!parts) {
    return null;
  }

  let hours = parseInt(parts[1], 10);
  const minutes = parseInt(parts[2], 10);
  // Default seconds to 0 if not provided
  const seconds = parts[3] ? parseInt(parts[3], 10) : 0;
  const ampm = parts[4]; // AM/PM part, might be undefined

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const day = now.getDate();

  // Adjust hours based on AM/PM if present
  if (ampm !== undefined) {
    const upperAmpm = ampm.toUpperCase();
    if (upperAmpm === 'PM' && hours !== 12) {
      hours += 12;
    } else if (upperAmpm === 'AM' && hours === 12) { // Handle 12 AM
      hours = 0;
    }
    // No adjustment needed for 12 PM or other AM hours
  }
  // Note: If AM/PM is not present, we assume 24-hour format (e.g., 20:08)

  // Validate parsed components
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59 || seconds < 0 || seconds > 59) {
      return null; // Invalid time components
  }

  const resultDate = new Date(year, month, day, hours, minutes, seconds);

  // Final check if the constructed date is valid
  if (isNaN(resultDate.getTime())) {
    return null;
  }

  return resultDate;
}

/**
 * Converts a JavaScript Date to a Firebase Timestamp
 */
export function dateToTimestamp(date: Date): Timestamp {
  return Timestamp.fromDate(date);
}

/**
 * Converts a date string to a Firebase Timestamp
 * Returns null if the input cannot be converted to a valid Date
 */
export function dateStringToTimestamp(dateString: string): Timestamp | null {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return null;
    }
    return Timestamp.fromDate(date);
  } catch (e) {
    return null;
  }
}

/**
 * Formats a Date object, timestamp, or recognizable date/time string into "H:mm:ss AM/PM" format.
 * Returns null if the input cannot be converted to a valid Date.
 * Handles Firebase Timestamp objects as well.
 */
export function formatTime(value: Date | number | string | Timestamp): string | null {
  try {
    let date: Date;

    // Handle Firebase Timestamp objects
    if (value && typeof value === 'object' && 'toDate' in value && typeof value.toDate === 'function') {
      date = value.toDate();
    } else if (typeof value === 'string') {
      const parsedDate = parseTime(value);
      date = parsedDate !== null ? parsedDate : new Date(value);
    } else if (value instanceof Date) {
      date = value;
    } else if (typeof value === 'number') {
      date = new Date(value);
    } else {
      return null;
    }

    if (isNaN(date.getTime())) {
      return null;
    }

    let hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();
    const ampm = hours >= 12 ? 'PM' : 'AM';

    hours = hours % 12;
    hours = hours ? hours : 12;

    const minutesStr = minutes.toString().padStart(2, '0');
    const secondsStr = seconds.toString().padStart(2, '0');
    const hoursStr = hours.toString();

    return `${hoursStr}:${minutesStr}:${secondsStr} ${ampm}`;

  } catch (e) {
    return null;
  }
}

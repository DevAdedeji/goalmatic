import { HttpsError } from 'firebase-functions/v2/https';



export  const parseDateFromFormatted = (formattedDate: string): Date => {
    // Extract date components - this is a simplified approach and might need adjustments
    // based on the exact format produced by timeFormatter
    const dateTimeParts = formattedDate.split(', ');
    const datePart = dateTimeParts[0];
    const timePart = dateTimeParts[1].split(' ')[0];
    
    const [month, day, year] = datePart.split('/').map(Number);
    const [hours, minutes, seconds] = timePart.split(':').map(Number);
    
    // Create a date object in local timezone (browser's timezone)
    return new Date(year, month - 1, day, hours, minutes, seconds);
  };

// Helper function to parse YYYY-MM-DD and HH:mm
export const parseDateTimeComponents = (dateStr: string, timeStr: string) => {
    const [year, month, day] = dateStr.split('-').map(Number);
    const [hour, minute] = timeStr.split(':').map(Number);
    if (isNaN(year) || isNaN(month) || isNaN(day) || isNaN(hour) || isNaN(minute) || month < 1 || month > 12 || day < 1 || day > 31 || hour < 0 || hour > 23 || minute < 0 || minute > 59) {
        throw new Error(`Invalid date or time format: ${dateStr} ${timeStr}`);
    }
    // Month is 0-indexed in JavaScript Date constructor and Date.UTC
    return { year, month, day, hour, minute };
}

// Helper function to get offset using Intl
export const getOffsetMilliseconds = (dateObj: Date, timeZone: string): number => {
    try {
        // Intl.DateTimeFormat can be sensitive to locale, use 'en-CA' for YYYY-MM-DD HH:MM:SS parts
        // Use hourCycle 'h23' for 00-23 hour format.
        const formatter = new Intl.DateTimeFormat('en-CA', {
            timeZone: timeZone,
            year: 'numeric', month: 'numeric', day: 'numeric',
            hour: 'numeric', minute: 'numeric', second: 'numeric',
            hourCycle: 'h23'
        });

        // Get the date/time parts as they would be formatted in the target timezone
        const parts = formatter.formatToParts(dateObj).reduce((acc, part) => {
             if (part.type !== 'literal') {
                 // Ensure value is parsed as integer
                 const value = parseInt(part.value, 10);
                 if (!isNaN(value)) {
                    acc[part.type] = value;
                 } else {
                    // Handle cases where parsing might fail unexpectedly
                    console.warn(`Could not parse part ${part.type} value "${part.value}" as integer`);
                 }
             }
             return acc;
            }, {} as Record<string, number>);


        // Check if all necessary parts were successfully parsed
        const requiredParts = ['year', 'month', 'day', 'hour', 'minute', 'second'];
        for (const part of requiredParts) {
            if (parts[part] === undefined || isNaN(parts[part])) {
                 throw new Error(`Failed to get valid numeric value for part "${part}" for timezone ${timeZone} from date ${dateObj.toISOString()}`);
            }
        }

        // Reconstruct the UTC timestamp based *only* on the local time parts
        // This effectively tells us what UTC time corresponds to the local time representation
        const localTimeAsUtcTimestamp = Date.UTC(
            parts.year,
            parts.month - 1, // Month is 0-indexed for Date.UTC
            parts.day,
            parts.hour, // hour is already 0-23 due to hourCycle:'h23'
            parts.minute,
            parts.second
        );

        if (isNaN(localTimeAsUtcTimestamp)) {
             throw new Error(`Could not construct valid UTC timestamp from formatted local parts for timezone ${timeZone}`);
        }

        // The offset is the difference between the original UTC time and the UTC time derived from the local parts
        const offset = dateObj.getTime() - localTimeAsUtcTimestamp;
        // Return negative offset to match conventional timezone notation (positive for east of UTC, negative for west)
        return -offset;

    } catch (e: any) {
        // Check for specific Intl RangeError for invalid timezone
        if (e instanceof RangeError || (e.message && e.message.includes('Invalid time zone'))) {
             throw new HttpsError('invalid-argument', `Invalid timezone identifier provided: "${timeZone}"`);
        }
        // Rethrow other errors, possibly wrapping them
        throw new Error(`Failed to determine timezone offset for "${timeZone}". ${e.message || e}`);
    }
}
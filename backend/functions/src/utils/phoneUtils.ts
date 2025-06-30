/**
 * Phone Number Normalization Utilities
 * 
 * This file provides standardized phone number handling to resolve
 * discrepancies between WhatsApp (no +) and other integrations (with +)
 */

/**
 * Normalizes phone number to E.164 format with + prefix
 * @param phoneNumber - Input phone number in any format
 * @returns Normalized phone number with + prefix (e.g., "+1234567890")
 */
export const normalizePhoneNumber = (phoneNumber: string | null | undefined): string | null => {
  if (!phoneNumber || typeof phoneNumber !== 'string') return null;
  
  // Remove all non-digit characters except +
  const cleaned = phoneNumber.replace(/[^\d+]/g, '');
  
  // If already has + prefix, validate format
  if (cleaned.startsWith('+')) {
    if (isValidE164Format(cleaned)) {
      return cleaned;
    }
    return null;
  }
  
  // Add + prefix if it's a valid length
  if (/^\d{7,15}$/.test(cleaned)) {
    return `+${cleaned}`;
  }
  
  return null;
};

/**
 * Normalizes phone number for WhatsApp API (removes + prefix)
 * @param phoneNumber - Input phone number in any format
 * @returns Phone number without + prefix for WhatsApp API
 */
export const normalizePhoneForWhatsApp = (phoneNumber: string | null | undefined): string | null => {
  const normalized = normalizePhoneNumber(phoneNumber);
  if (!normalized) return null;
  
  return normalized.replace('+', '');
};

/**
 * Validates E.164 phone number format
 * @param phoneNumber - Phone number to validate
 * @returns true if valid E.164 format
 */
export const isValidE164Format = (phoneNumber: string): boolean => {
  if (!phoneNumber || typeof phoneNumber !== 'string') return false;
  
  // Must start with + and be followed by 7-15 digits
  const e164Regex = /^\+\d{7,15}$/;
  
  if (!e164Regex.test(phoneNumber)) return false;
  
  // Additional validation: ensure it's not all the same digit
  const digits = phoneNumber.substring(1);
  if (/^(.)\1+$/.test(digits)) return false;
  
  return true;
};

/**
 * Validates phone number (with or without + prefix)
 * @param phoneNumber - Phone number to validate
 * @returns true if valid international phone number
 */
export const isValidPhoneNumber = (phoneNumber: string | null | undefined): boolean => {
  const normalized = normalizePhoneNumber(phoneNumber);
  return normalized ? isValidE164Format(normalized) : false;
};

/**
 * Formats phone number for display purposes
 * @param phoneNumber - Input phone number
 * @returns Formatted phone number for display
 */
export const formatPhoneForDisplay = (phoneNumber: string | null | undefined): string => {
  const normalized = normalizePhoneNumber(phoneNumber);
  return normalized || '';
};

/**
 * Compares two phone numbers for equality (handles different formats)
 * @param phone1 - First phone number
 * @param phone2 - Second phone number
 * @returns true if phone numbers are the same
 */
export const phoneNumbersEqual = (phone1: string | null | undefined, phone2: string | null | undefined): boolean => {
  const normalized1 = normalizePhoneNumber(phone1);
  const normalized2 = normalizePhoneNumber(phone2);
  
  if (!normalized1 || !normalized2) return false;
  
  return normalized1 === normalized2;
};

/**
 * Extracts phone number from various formats using regex
 * @param text - Text containing phone number
 * @returns Extracted and normalized phone number
 */
export const extractPhoneNumber = (text: string): string | null => {
  if (!text || typeof text !== 'string') return null;
  
  // Regex to match international phone numbers
  const phoneRegex = /(\+?\d{1,4}[-.\s]?\(?\d{1,4}\)?[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9})/g;
  const matches = text.match(phoneRegex);
  
  if (matches && matches.length > 0) {
    // Try each match until we find a valid one
    for (const match of matches) {
      const normalized = normalizePhoneNumber(match);
      if (normalized && isValidE164Format(normalized)) {
        return normalized;
      }
    }
  }
  
  return null;
};

/**
 * Database query helper: Returns both normalized formats for OR queries
 * @param phoneNumber - Input phone number
 * @returns Object with normalized (with +) and whatsapp (without +) formats
 */
export const getPhoneQueryFormats = (phoneNumber: string | null | undefined) => {
  const normalized = normalizePhoneNumber(phoneNumber);
  const whatsapp = normalizePhoneForWhatsApp(phoneNumber);
  
  return {
    normalized, // With + prefix (e.g., "+1234567890")
    whatsapp,   // Without + prefix (e.g., "1234567890")
    isValid: normalized !== null && whatsapp !== null
  };
}; 
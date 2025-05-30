/**
 * Validates if a referral code has the correct format
 * @param code - The referral code to validate
 * @returns True if the code is valid format, false otherwise
 */
export const isValidReferralCode = (code: string): boolean => {
  const regex = /^[A-Z0-9]{7}$/
  return regex.test(code)
}

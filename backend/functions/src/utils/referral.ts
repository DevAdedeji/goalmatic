import { getFirestore } from 'firebase-admin/firestore'
import { goals_db_string } from '../init'

/**
 * Generates a unique referral code for users
 * @param userId - The user's unique ID
 * @param length - The desired length of the referral code (default: 7)
 * @returns A unique referral code string
 */
export const generateReferralCode = (userId: string, length = 7): string => {
  // Create a base from the user ID and current timestamp for uniqueness
  const base = `${userId}${Date.now()}`

  // Create a hash-like string from the base
  let hash = 0
  for (let i = 0; i < base.length; i++) {
    const char = base.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }

  // Convert to positive number and create alphanumeric string
  const positiveHash = Math.abs(hash)
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''

  let num = positiveHash
  for (let i = 0; i < length; i++) {
    result = chars[num % chars.length] + result
    num = Math.floor(num / chars.length)

    // If we run out of digits, pad with random characters
    if (num === 0 && result.length < length) {
      const remaining = length - result.length
      for (let j = 0; j < remaining; j++) {
        result = chars[Math.floor(Math.random() * chars.length)] + result
      }
      break
    }
  }

  // Ensure we have the exact length requested
  if (result.length > length) {
    result = result.substring(0, length)
  } else if (result.length < length) {
    // Pad with random characters if needed
    while (result.length < length) {
      result += chars[Math.floor(Math.random() * chars.length)]
    }
  }

  return result
}

/**
 * Validates if a referral code has the correct format
 * @param code - The referral code to validate
 * @returns True if the code is valid format, false otherwise
 */
export const isValidReferralCode = (code: string): boolean => {
  // Check if code is 7 characters long and contains only alphanumeric characters
  const regex = /^[A-Z0-9]{7}$/
  return regex.test(code)
}

/**
 * Finds a user by their referral code
 * @param referralCode - The referral code to search for
 * @returns The user document if found, null otherwise
 */
export const findUserByReferralCode = async (referralCode: string) => {
  if (!isValidReferralCode(referralCode)) {
    return null
  }

  try {
    const db = getFirestore(goals_db_string)
    const usersRef = db.collection('users')
    const query = usersRef.where('referral_code', '==', referralCode).limit(1)
    const snapshot = await query.get()

    if (snapshot.empty) {
      return null
    }

    const userDoc = snapshot.docs[0]
    return {
      id: userDoc.id,
      ...userDoc.data()
    }
  } catch (error) {
    console.error('Error finding user by referral code:', error)
    return null
  }
}

/**
 * Validates that a referral code exists and belongs to a different user
 * @param referralCode - The referral code to validate
 * @param currentUserId - The current user's ID (to prevent self-referral)
 * @returns True if the referral is valid, false otherwise
 */
export const validateReferral = async (referralCode: string, currentUserId: string): Promise<boolean> => {
  const referrer = await findUserByReferralCode(referralCode)
  
  if (!referrer) {
    return false
  }

  // Prevent self-referral
  if (referrer.id === currentUserId) {
    return false
  }

  return true
} 
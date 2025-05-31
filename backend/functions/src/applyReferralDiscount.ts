import { onCall } from 'firebase-functions/v2/https'
import { getFirestore, Timestamp } from 'firebase-admin/firestore'
import { goals_db_string } from './init'
import { findUserByReferralCode } from './utils/referral'

export const applyReferralDiscount = onCall({
  region: 'us-central1'
}, async (request) => {
  // Check if user is authenticated
  if (!request.auth) {
    throw new Error('User must be authenticated')
  }

  const { referralCode, subscriptionAmount } = request.data
  const userId = request.auth.uid
  
  if (!referralCode || !subscriptionAmount) {
    throw new Error('Missing required parameters: referralCode, subscriptionAmount')
  }

  try {
    const db = getFirestore(goals_db_string)
    
    // Validate the referral code
    const referrer = await findUserByReferralCode(referralCode)
    if (!referrer) {
      throw new Error('Invalid referral code')
    }
    
    // Prevent self-referral
    if (referrer.id === userId) {
      throw new Error('Cannot use your own referral code')
    }
    
    // Check if user has already used a referral discount
    const userDoc = await db.collection('users').doc(userId).get()
    if (!userDoc.exists) {
      throw new Error('User not found')
    }
    
    const userData = userDoc.data()
    if (userData?.referral_discount_used) {
      throw new Error('Referral discount has already been used')
    }
    
    // Calculate 10% discount
    const discountAmount = subscriptionAmount * 0.10
    const discountedAmount = subscriptionAmount - discountAmount
    
    // Create referral discount record
    const discountData = {
      user_id: userId,
      referrer_id: referrer.id,
      referral_code: referralCode,
      original_amount: subscriptionAmount,
      discount_percentage: 0.10,
      discount_amount: discountAmount,
      final_amount: discountedAmount,
      status: 'applied',
      created_at: Timestamp.fromDate(new Date()),
      updated_at: Timestamp.fromDate(new Date())
    }
    
    await db.collection('referral_discounts').add(discountData)
    
    // Mark user as having used referral discount
    await db.collection('users').doc(userId).update({
      referral_discount_used: true,
      referred_by: referrer.id,
      updated_at: Timestamp.fromDate(new Date())
    })
    
    return {
      success: true,
      discount: {
        original_amount: subscriptionAmount,
        discount_amount: discountAmount,
        final_amount: discountedAmount,
        discount_percentage: 10,
        referrer_name: (referrer as any).name || 'Unknown'
      }
    }
    
  } catch (error) {
    console.error('Error applying referral discount:', error)
    throw new Error(error instanceof Error ? error.message : 'Failed to apply referral discount')
  }
}) 
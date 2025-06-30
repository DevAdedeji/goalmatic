import { onCall } from 'firebase-functions/v2/https'
import { getFirestore, Timestamp } from 'firebase-admin/firestore'
import { goals_db_string } from '../init'
import { findUserByReferralCode } from '../utils/referral'

export const processReferralEarnings = onCall({
  region: 'us-central1'
}, async (request) => {
  // Check if user is authenticated (this would typically be called by a webhook or admin function)
  if (!request.auth) {
    throw new Error('User must be authenticated')
  }

  const { userId, subscriptionAmount, subscriptionId, action = 'create' } = request.data
  
  if (!userId || !subscriptionAmount || !subscriptionId) {
    throw new Error('Missing required parameters: userId, subscriptionAmount, subscriptionId')
  }

  try {
    const db = getFirestore(goals_db_string)
    
    // Get the user who subscribed
    const userDoc = await db.collection('users').doc(userId).get()
    if (!userDoc.exists) {
      throw new Error('User not found')
    }
    
    const userData = userDoc.data()
    const referredBy = userData?.referred_by
    
    // If user was not referred, no earnings to process
    if (!referredBy) {
      return { success: true, message: 'User was not referred, no earnings to process' }
    }
    
    // Check if referred_by is a referral code or user ID
    let referrerId: string
    let referralCode: string
    if (typeof referredBy === 'string' && referredBy.length === 7) {
      // It's likely a referral code, find the actual user
      const referrer = await findUserByReferralCode(referredBy)
      if (!referrer) {
        console.warn(`Referrer with code ${referredBy} not found for user ${userId}`)
        return { success: true, message: 'Referrer not found' }
      }
      referrerId = referrer.id
      referralCode = referredBy
    } else {
      // It's already a user ID, need to get their referral code
      referrerId = referredBy
      const referrerDoc = await db.collection('users').doc(referrerId).get()
      if (!referrerDoc.exists) {
        console.warn(`Referrer ${referrerId} not found for user ${userId}`)
        return { success: true, message: 'Referrer not found' }
      }
      referralCode = referrerDoc.data()?.referral_code || ''
    }
    
    // Get the referrer (we might already have this data from above)
    let referrerData: any
    if (typeof referredBy === 'string' && referredBy.length === 7) {
      // We already got referrer data when finding by code
      const referrer = await findUserByReferralCode(referredBy)
      referrerData = referrer
    } else {
      // We already got referrer doc above, use that data
      const referrerDoc = await db.collection('users').doc(referrerId).get()
      referrerData = referrerDoc.exists ? referrerDoc.data() : null
    }
    
    if (!referrerData) {
      console.warn(`Referrer data not found for user ${userId}`)
      return { success: true, message: 'Referrer not found' }
    }
    
    if (action === 'create') {
      // Calculate 20% commission for 3 months
      const monthlyCommission = subscriptionAmount * 0.20
      const totalCommission = monthlyCommission * 3
      
      // Create referral earning record
      const earningData = {
        referrer_id: referrerId,
        referral_code: referralCode,
        referred_user_id: userId,
        subscription_id: subscriptionId,
        monthly_amount: subscriptionAmount,
        commission_rate: 0.20,
        monthly_commission: monthlyCommission,
        total_commission: totalCommission,
        months_remaining: 3,
        status: 'active',
        created_at: Timestamp.fromDate(new Date()),
        updated_at: Timestamp.fromDate(new Date()),
        next_payment_date: Timestamp.fromDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)) // 30 days from now
      }
      
      await db.collection('referral_earnings').add(earningData)
      
      // Update referrer's total earnings
      const referrerEarningsQuery = db.collection('referral_earnings').where('referrer_id', '==', referrerId)
      const referrerEarningsSnapshot = await referrerEarningsQuery.get()
      
      let totalEarnings = 0
      referrerEarningsSnapshot.docs.forEach(doc => {
        const earning = doc.data()
        totalEarnings += earning.monthly_commission || 0
      })
      
      // Update referrer's profile with total earnings
      await db.collection('users').doc(referrerId).update({
        total_referral_earnings: totalEarnings,
        updated_at: Timestamp.fromDate(new Date())
      })
      
      return {
        success: true,
        message: 'Referral earnings processed successfully',
        commission: {
          monthly: monthlyCommission,
          total: totalCommission,
          referrer: referrerData?.name || 'Unknown'
        }
      }
    } else if (action === 'cancel') {
      // Mark referral earnings as cancelled
      const earningsQuery = db.collection('referral_earnings')
        .where('subscription_id', '==', subscriptionId)
        .where('status', '==', 'active')
      
      const earningsSnapshot = await earningsQuery.get()
      
      const batch = db.batch()
      earningsSnapshot.docs.forEach(doc => {
        batch.update(doc.ref, {
          status: 'cancelled',
          cancelled_at: Timestamp.fromDate(new Date()),
          updated_at: Timestamp.fromDate(new Date())
        })
      })
      
      await batch.commit()
      
      // Recalculate referrer's total earnings after cancellation
      const referrerEarningsQuery = db.collection('referral_earnings').where('referrer_id', '==', referrerId).where('status', '==', 'active')
      const referrerEarningsSnapshot = await referrerEarningsQuery.get()
      
      let totalEarnings = 0
      referrerEarningsSnapshot.docs.forEach(doc => {
        const earning = doc.data()
        if (earning.status === 'active') {
          totalEarnings += earning.monthly_commission || 0
        }
      })
      
      // Update referrer's profile with recalculated earnings
      await db.collection('users').doc(referrerId).update({
        total_referral_earnings: totalEarnings,
        updated_at: Timestamp.fromDate(new Date())
      })
      
      return {
        success: true,
        message: 'Referral earnings cancelled successfully'
      }
    }
    
    return { success: true, message: 'No action taken' }
    
  } catch (error) {
    console.error('Error processing referral earnings:', error)
    throw new Error('Failed to process referral earnings')
  }
}) 
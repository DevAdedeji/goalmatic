import { onCall } from 'firebase-functions/v2/https'
import { getFirestore } from 'firebase-admin/firestore'
import { goals_db_string } from './init'

export const getReferralStats = onCall({
  region: 'us-central1'
}, async (request) => {
  // Check if user is authenticated
  if (!request.auth) {
    throw new Error('User must be authenticated')
  }

  const userId = request.auth.uid
  
  try {
    const db = getFirestore(goals_db_string)
    
    // Get user's referral code
    const userDoc = await db.collection('users').doc(userId).get()
    if (!userDoc.exists) {
      throw new Error('User not found')
    }
    
    const userData = userDoc.data()
    const referralCode = userData?.referral_code
    
    if (!referralCode) {
      return {
        referralCode: null,
        totalReferrals: 0,
        successfulReferrals: 0,
        totalEarnings: 0,
        referrals: []
      }
    }
    
    // Get all users referred by this user (using referral code, not user ID)
    const referralsQuery = db.collection('users').where('referred_by', '==', referralCode)
    const referralsSnapshot = await referralsQuery.get()
    
    // Get referral earnings for this user
    const earningsQuery = db.collection('referral_earnings').where('referrer_id', '==', userId)
    const earningsSnapshot = await earningsQuery.get()
    
    // Calculate total earnings from all active referral earnings
    let totalEarnings = 0
    earningsSnapshot.docs.forEach(doc => {
      const earning = doc.data()
      if (earning.status === 'active') {
        // Calculate how much has been earned so far
        const monthsElapsed = Math.min(
          Math.floor((Date.now() - earning.created_at.toDate().getTime()) / (30 * 24 * 60 * 60 * 1000)),
          3 // Maximum 3 months
        )
        totalEarnings += (earning.monthly_commission || 0) * Math.max(monthsElapsed, 1)
      }
    })
    
    // Process referrals with subscription status
    const referrals: Array<{
      id: string
      name: string
      email: string
      created_at: any
      status: 'completed' | 'pending'
      subscription_status: 'active' | 'none'
    }> = []
    let successfulReferrals = 0
    
    for (const doc of referralsSnapshot.docs) {
      const referralData = doc.data()
      
      // Check if this referral has any subscriptions
      const subscriptionsQuery = db.collection('subscriptions').where('user_id', '==', doc.id)
      const subscriptionsSnapshot = await subscriptionsQuery.get()
      
      const hasActiveSubscription = subscriptionsSnapshot.docs.some(subDoc => {
        const subData = subDoc.data()
        return subData.status === 'active' || subData.status === 'trialing'
      })
      
      if (hasActiveSubscription) {
        successfulReferrals++
      }
      
      referrals.push({
        id: doc.id,
        name: referralData.name,
        email: referralData.email,
        created_at: referralData.created_at,
        status: hasActiveSubscription ? 'completed' : 'pending',
        subscription_status: hasActiveSubscription ? 'active' : 'none'
      })
    }
    
    return {
      referralCode,
      totalReferrals: referrals.length,
      successfulReferrals,
      totalEarnings,
      referrals
    }
  } catch (error) {
    console.error('Error getting referral stats:', error)
    throw new Error('Failed to get referral statistics')
  }
}) 
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
        referrals: []
      }
    }
    
    // Count how many users this user has referred
    const referralsQuery = db.collection('users').where('referred_by', '==', userId)
    const referralsSnapshot = await referralsQuery.get()
    
    const referrals = referralsSnapshot.docs.map(doc => ({
      id: doc.id,
      name: doc.data().name,
      email: doc.data().email,
      created_at: doc.data().created_at
    }))
    
    return {
      referralCode,
      totalReferrals: referrals.length,
      referrals
    }
  } catch (error) {
    console.error('Error getting referral stats:', error)
    throw new Error('Failed to get referral statistics')
  }
}) 
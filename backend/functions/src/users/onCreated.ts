import { onDocumentCreated } from 'firebase-functions/v2/firestore'
import { goals_db_string } from '../init'
import { notifyUser } from '../helpers/emailNotifier'
import { welcomeNewGoalmaticUserMsg } from './onCreatedMail'
import { generateReferralCode, findUserByReferralCode } from '../utils/referral'


export const welcomeNewGoalmaticUser = onDocumentCreated({
  document: 'users/{userId}',
  database: goals_db_string,
}, async (event) => {
  // Get the new user data
  const userData = event.data?.data()
  
  if (!userData) {
    return null
  }

  // Check if the user has an email
  if (!userData.email) {
    return null
  }

  // Prepare the welcome email message
  const welcomeMessage = welcomeNewGoalmaticUserMsg({
    email: userData.email,
    name: userData.name || 'New User'
  })
  
  const userRef = event.data?.ref;
  const updates: any = {}
  
  // Ensure showLogs is set to false by default if not present
  if (userData.showLogs === undefined) {
    updates.showLogs = false
  }
  
  // Ensure referral_code is set if not present
  if (!userData.referral_code) {
    updates.referral_code = generateReferralCode(event.params.userId)
  }
  
  // Handle referral validation and conversion
  if (userData.referred_by && typeof userData.referred_by === 'string') {
    try {
      // If referred_by is a referral code, find the actual user and store their ID
      const referrer = await findUserByReferralCode(userData.referred_by)
      if (referrer && referrer.id !== event.params.userId) {
        updates.referred_by = referrer.id
        console.log(`User ${event.params.userId} was referred by user ${referrer.id} with code ${userData.referred_by}`)
      } else {
        // Invalid referral code or self-referral, remove it
        updates.referred_by = null
        console.log(`Invalid referral code ${userData.referred_by} for user ${event.params.userId}`)
      }
    } catch (error) {
      console.error('Error processing referral:', error)
      updates.referred_by = null
    }
  }
  
  // Apply updates if any
  if (Object.keys(updates).length > 0 && userRef) {
    await userRef.update(updates)
  }

  try {
    // Send the welcome email
    const result = await notifyUser(welcomeMessage)
    return result
  } catch (error) {
    console.error('Error sending welcome email:', error)
    return null
  }
})

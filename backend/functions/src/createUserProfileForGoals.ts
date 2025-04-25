import {onCall} from 'firebase-functions/v2/https'
import { goals_db } from './init'





export const createUserProfileForGoals = onCall(async (request) => {
  const body = request.data
  try {
    await goals_db.collection('users').doc(body.id).set(body)
  } catch (e:any) {
    throw new Error(`Error creating user profile: ${e.message}`)
  }

  return {success: true, msg: 'User profile created successfully'}
})







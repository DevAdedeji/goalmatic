import { initializeApp, getApps, getApp } from 'firebase-admin/app'
import { getFirestore, Firestore } from 'firebase-admin/firestore'






export default function firebaseServer() {
    try {
            if (getApps().length === 0) {
        return initializeApp()
    }
    return getApp()
    } catch (error) {
        return null
    }
}
export const useFirestore = (databaseName = '(default)'): Firestore => {
  const app = firebaseServer()!
  return getFirestore(app, databaseName)
}


export const is_dev = JSON.parse(process.env.FIREBASE_CONFIG as string).projectId === 'taaskly-dev' ? true : false



export const goals_db: Firestore = process.env.FIREBASE_DEBUG_MODE === 'true' ? useFirestore('(default)') : useFirestore('goals')
export const goals_db_string: string = process.env.FIREBASE_DEBUG_MODE === 'true' ? '(default)' : 'goals'

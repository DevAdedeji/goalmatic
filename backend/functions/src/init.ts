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



export const goals_db: Firestore = is_dev ? useFirestore('goalmatic-dev') : useFirestore('(default)') 
export const goals_db_string: string = is_dev ? 'goalmatic-dev' : '(default)'

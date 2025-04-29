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

export const is_emulator = process.env.FUNCTIONS_EMULATOR === 'true';
export const is_dev = JSON.parse(process.env.FIREBASE_CONFIG as string).projectId === 'taaskly-dev' ? true : false

const useDefaultDb = (!is_dev || is_emulator) ? '(default)' : 'goalmatic-dev' 


export const goals_db: Firestore = useFirestore(useDefaultDb)
export const goals_db_string: string = useDefaultDb

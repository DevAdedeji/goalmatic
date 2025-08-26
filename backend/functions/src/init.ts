import { initializeApp, getApps, getApp } from 'firebase-admin/app'
import { getFirestore, Firestore } from 'firebase-admin/firestore'
import { Settings } from 'firebase-admin/firestore'






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
  const db = getFirestore(app, databaseName)

  // Configure Firestore to ignore undefined properties
  const settings: Settings = {
    ignoreUndefinedProperties: true
  }
  db.settings(settings)

  return db
}

export const is_emulator = process.env.FUNCTIONS_EMULATOR === 'true';
export const is_dev = JSON.parse(process.env.FIREBASE_CONFIG as string).projectId === 'taaskly-dev' ? true : false

const useDefaultDb = (!is_dev || is_emulator) ? '(default)' : 'goalmatic-dev' 


export const goals_db: Firestore = useFirestore(useDefaultDb)
export const goals_db_string: string = useDefaultDb

// Convex sync configuration
// By default, sync is disabled in dev mode unless explicitly enabled
// In production, sync is enabled by default unless explicitly disabled
export const isConvexSyncEnabled = (): boolean => {
  const envVar = process.env.ENABLE_CONVEX_SYNC;
  
  if (envVar !== undefined) {
    // If environment variable is explicitly set, use its value
    return envVar.toLowerCase() === 'true';
  }
  
  // Default behavior: disabled in dev, enabled in production
  return !is_dev;
};

export const formatSystemInfo = (text: string): string => {
  // Sanitize HTML to allow only specific safe tags
  return text.replace(/<(?!\/?(p|br|strong|em|u|s|ul|ol|li|h[1-6]|blockquote)(?=>|\s.*>))\/?.*?>/g, '')
}
import { User } from 'firebase/auth'
import { Timestamp } from 'firebase/firestore'
import { useUser } from './user'
import { setFirestoreDocument } from '@/firebase/firestore/create'


export const afterAuthCheck = async (user: User | null) => {
    try {
        if (user) {
            const { fetchUserProfile } = useUser()
            const userProfile = await fetchUserProfile(user.uid) as any
            if (!userProfile?.value?.name) {
            await setFirestoreDocument('users', user.uid, {
                id: user.uid,
                name: user.displayName,
                photo_url: user.photoURL,
                email: user.email,
                phone: user.phoneNumber,
                username: user.displayName,
                created_at: Timestamp.fromDate(new Date()),
                updated_at: Timestamp.fromDate(new Date()),
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
            })
        }
         // Check for saved URL in localStorage first
         let savedRedirectUrl = null as string | null
         if (process.client) {
             savedRedirectUrl = localStorage.getItem('redirect_after_login')
             if (savedRedirectUrl) {
                 localStorage.removeItem('redirect_after_login')
             }
         }

         // Fall back to the redirectUrl from the user composable if no saved URL
         const redirectUrl = useUser().redirectUrl.value
         useUser().redirectUrl.value = null

         // Use the saved URL or the redirectUrl from the user composable, or default to /agents
         useRouter().push(savedRedirectUrl || redirectUrl || '/agents')
        }
    } catch (error) {
        console.error(error)
    }
}




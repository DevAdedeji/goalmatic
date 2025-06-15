import type { User } from 'firebase/auth'
import { Timestamp } from 'firebase/firestore'
import { useUser } from './user'
import { setFirestoreDocument } from '@/firebase/firestore/create'

export const afterAuthCheck = async (user: User | null) => {
    try {
        if (user) {
            // Check email verification for email/password accounts
            // Google OAuth users typically have verified emails already
            const isEmailPasswordAuth = user.providerData.some((provider) => provider.providerId === 'password')

            if (isEmailPasswordAuth && !user.emailVerified) {
                // Redirect to email verification page
                useRouter().replace('/auth/verify-email')
                return
            }

            const { fetchUserProfile } = useUser()
            const userProfile = await fetchUserProfile(user.uid) as any
            if (!userProfile?.value?.name) {
                // Check for referral code in localStorage
                let referredBy: string | null = null
                if (process.client) {
                    const savedReferralCode = localStorage.getItem('signup_referral_code')
                    if (savedReferralCode) {
                        referredBy = savedReferralCode
                        localStorage.removeItem('signup_referral_code')
                    }
                }

                // Generate fallback name and username from email if displayName is null
                const fallbackName = user.displayName || (user.email ? user.email.split('@')[0] : 'User')
                const fallbackUsername = user.displayName || (user.email ? user.email.split('@')[0] : 'user')

                await setFirestoreDocument('users', user.uid, {
                    id: user.uid,
                    name: fallbackName,
                    photo_url: user.photoURL,
                    email: user.email,
                    phone: user.phoneNumber,
                    username: fallbackUsername,
                    referred_by: referredBy,
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
         useRouter().replace(savedRedirectUrl || redirectUrl || '/agents')
        }
    } catch (error) {
        console.error(error)
    }
}




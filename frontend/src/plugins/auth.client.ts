import { watchUserStateChange, handleGoogleRedirectResult } from '@/firebase/auth'
import { useAuthReady } from '@/composables/auth/ready'
import { afterAuthCheck } from '@/composables/auth/utils'

export default defineNuxtPlugin(() => {
    if (process.client) {
        const { setAuthReady } = useAuthReady()

        // Set to false before initializing
        setAuthReady(false)

        // First, handle any pending Google redirect result
        handleGoogleRedirectResult().then(async (user) => {
            if (user) {
                // Complete post-auth flow (profile creation, redirect)
                await afterAuthCheck(user)
            }
        }).finally(() => {
            // Then set up the auth state watcher
            let initialized = false
            watchUserStateChange()

            // Firebase onAuthStateChanged in watchUserStateChange will run soon after this.
            // Use a microtask tick to mark ready once state flows through composables.
            queueMicrotask(() => {
                if (!initialized) {
                    setAuthReady(true)
                    initialized = true
                }
            })
        })
    }
})


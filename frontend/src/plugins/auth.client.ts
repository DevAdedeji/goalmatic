import { watchUserStateChange } from '@/firebase/auth'
import { useAuthReady } from '@/composables/auth/ready'

export default defineNuxtPlugin(() => {
    if (process.client) {
        const { setAuthReady } = useAuthReady()

        // Set to false before initializing
        setAuthReady(false)

        // Wrap watcher to set readiness after the first auth state is received
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
    }
})


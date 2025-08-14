import { useUser } from '@/composables/auth/user'
import { useAuthReady } from '@/composables/auth/ready'

export default async function isAuthenticated(route: any) {
	const { isLoggedIn } = useUser()
	const { authReady } = useAuthReady()

	if (!authReady.value) {
		return
	}

	if (!isLoggedIn.value && route.path !== '/auth/login') {
		useUser().redirectUrl.value = route.fullPath
		return navigateTo('/auth/login')
	}
}

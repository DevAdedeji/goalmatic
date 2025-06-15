import { useUser } from '@/composables/auth/user'

export default defineNuxtRouteMiddleware((to) => {
	const { user, isLoggedIn } = useUser()

	// Skip check for auth pages
	if (to.path.startsWith('/auth/')) {
		return
	}

	// Skip check for public pages
	const publicPages = ['/', '/business', '/share']
	if (publicPages.some((page) => to.path === page || to.path.startsWith(page + '/'))) {
		return
	}

	// Only check verification if user is logged in
	if (isLoggedIn.value && user.value) {
		// Check if this is an email/password auth user (not Google OAuth)
		const isEmailPasswordAuth = user.value.providerData.some((provider) => provider.providerId === 'password')
console.log(user.value.emailVerified)
		// Only require email verification for email/password auth users
		if (isEmailPasswordAuth && !user.value.emailVerified) {
			return navigateTo('/auth/verify-email')
		}
	}
})

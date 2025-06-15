<template>
	<div class="h-full p-4 overflow-auto" :class="windowHeight < 700 ? 'py-12' : 'center'">
		<div class="flex flex-col gap-8 w-full max-w-[400px] mx-auto text-center">
			<!-- Header -->
			<div class="flex flex-col gap-3.5">
				<div class="flex justify-center mb-4">
					<div class="size-16 bg-primary/10 rounded-full flex items-center justify-center">
						<Mail :size="32" class="text-primary" />
					</div>
				</div>
				<h2 class="text-headline text-[34px] font-bold leading-[40px]">
					Verify Your Email
				</h2>
				<p class="text-textSecondary text-base font-semibold">
					We've sent a verification link to your email address
				</p>
				<div v-if="user?.email" class="bg-blue-50 border border-blue-200 rounded-lg p-3">
					<p class="text-sm text-blue-800">
						<strong>{{ user.email }}</strong>
					</p>
				</div>
			</div>

			<!-- Instructions -->
			<div class="flex flex-col gap-4 text-left">
				<div class="bg-gray-50 rounded-lg p-4">
					<h3 class="font-semibold text-sm mb-2">
						Follow these steps:
					</h3>
					<ol class="text-sm text-gray-600 space-y-1">
						<li>1. Check your inbox for an email from Goalmatic</li>
						<li>2. Click the verification link in the email</li>
						<li>3. Return to this page and click "I've verified my email"</li>
					</ol>
				</div>
				<p class="text-xs text-gray-500 text-center">
					Can't find the email? Check your spam/junk folder
				</p>
			</div>

			<!-- Action Buttons -->
			<div class="flex flex-col gap-4">
				<button
					class="btn-primary"
					:disabled="loading"
					@click="checkAndProceed"
				>
					<Spinner v-if="loading" />
					<span v-else>I've verified my email</span>
				</button>

				<button
					class="btn-outline"
					:disabled="resendLoading"
					@click="resendVerificationEmail"
				>
					<Spinner v-if="resendLoading" />
					<span v-else>Resend verification email</span>
				</button>

				<div class="text-center text-sm">
					<button
						class="text-gray-500 hover:text-gray-700 underline"
						@click="signOut"
					>
						Sign out and use a different email
					</button>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { Mail } from 'lucide-vue-next'
import { windowHeight } from '@/composables/utils/window'
import { useEmailVerification } from '@/composables/auth/email_verification'
import { useUser } from '@/composables/auth/user'
import { useSignin } from '@/composables/auth/auth'
import { useAlert } from '@/composables/core/notification'

const { user } = useUser()
const { signOut } = useSignin()
const {
	isEmailVerified,
	sendVerificationEmail,
	checkVerificationStatus,
	loading,
	resendLoading
} = useEmailVerification()

// Check verification status and proceed if verified
const checkAndProceed = async () => {
	const verified = await checkVerificationStatus()
	if (verified) {
		console.log(verified)
		// Redirect to dashboard or intended page
		await navigateTo('/agents')
	} else {
		useAlert().openAlert({
			type: 'Alert',
			msg: 'Email not verified yet. Please check your email and click the verification link.'
		})
	}
}

// Resend verification email
const resendVerificationEmail = async () => {
	await sendVerificationEmail()
}

// Send initial verification email when component mounts
onMounted(async () => {
	// Check if already verified
	if (isEmailVerified.value) {
		await navigateTo('/agents')
		return
	}

	// Send verification email on mount
	await sendVerificationEmail()
})

definePageMeta({
	layout: 'auth',
	middleware: 'is-authenticated'
})
</script>

<style scoped>
.btn-outline {
	@apply border border-gray-300 bg-white text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed;
}
</style>

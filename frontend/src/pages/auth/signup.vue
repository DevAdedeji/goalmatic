<template>
	<div class="h-full p-4 overflow-auto" :class="windowHeight < 700 ? 'py-12' : 'center'">
		<div class="flex flex-col gap-8 w-full max-w-[400px] mx-auto">
			<div class="flex flex-col gap-3.5 text-center">
				<h2 class="text-headline text-[34px] font-bold leading-[40px]">
					You're one step closer to getting started
				</h2>
				<p class="text-textSecondary text-base font-semibold">
					Create your free account
				</p>
				<div v-if="referralCode" class="bg-green-50 border border-green-200 rounded-lg p-3">
					<p class="text-sm text-green-800">
						🎉 You're signing up with a referral code: <strong>{{ referralCode }}</strong>
					</p>
				</div>
			</div>

			<form class="flex flex-col gap-6 mt-3" @submit.prevent="signUp">
				<div class="flex flex-col gap-0.5">
					<div class="flex items-center gap-4 justify-between">
						<label class="label">{{ isEmail ? 'Email Address' : 'Phone Number' }}</label>
						<!-- <button type="button" class="text-sm font-semibold text-grey_four" @click="isEmail = !isEmail">
							{{ isEmail ? 'Use Phone Number' : 'Use Email' }}
						</button> -->
					</div>
					<input v-if="isEmail" v-model.trim="authCredentienalsForm.email.value" type="email" required class="input-field" placeholder="Enter email">
					<!-- <NewPhoneInput v-else />  -->
				</div>

				<div class="flex flex-col gap-0.5">
					<label class="label">Password</label>
					<div class="w-full h-fit relative">
						<input v-model.trim="authCredentienalsForm.passord.value" :type="show ? 'text' : 'password'" required class="input-field" placeholder="Enter password">
						<component :is="!show ? EyeOff : Eye" class="text-grey_six absolute top-1/2 -translate-y-1/2 right-4 w-5 cursor-pointer" @click="show = !show" />
					</div>
				</div>

				<div class="flex items-center gap-1">
					<input v-model="accepetedTerms" type="checkbox" required>
					<p class="text-xs text-[#101928] font-medium">
						I consent to Goalmatic's <span class="underline">Privacy Policy</span> and <span class="underline">Terms of Service</span>
					</p>
				</div>

				<button type="submit" class="btn-primary" :disabled="authCredentienalsForm.loading.value">
					<Spinner v-if="authCredentienalsForm.loading.value" />
					<span v-else>Get Started</span>
				</button>
			</form>

			<div class="flex flex-col gap-6">
				<div class="flex items-center gap-2 justify-between">
					<div class="flex flex-grow border-b" />
					<span class="text-sm font-bold text-[#667185]">Or</span>
					<div class="flex flex-grow border-b" />
				</div>

				<button class="btn border bg-light gap-3">
					<IconsGoogle class="w-5 h-5" />
					<span class="text-base font-semibold text-subText">Continue with Google</span>
				</button>
				<div class="text-center text-sm font-bold flex items-center justify-center gap-2">
					<span class="text-[#667185]">Already have an account?</span>
					<NuxtLink to="/auth/login">
						Sign in
					</NuxtLink>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { EyeOff, Eye } from 'lucide-vue-next'
import { windowHeight } from '@/composables/utils/window'
import { useSignin, authCredentienalsForm } from '@/composables/auth/auth'
import { usePasswordlessSignin } from '@/composables/auth/passwordless'
import { useEmailAndPassword } from '@/composables/auth/email_password'
import { isValidReferralCode } from '@/composables/utils/referral'

const route = useRoute()
const { googleSignin, loading } = useSignin()
const { disabled, send_email, valid_email } = usePasswordlessSignin()
const { signUp } = useEmailAndPassword()

const accepetedTerms = ref(false)
const authType = ref('email')
const showPassword = ref(false)
const toggleShow = () => showPassword.value = !showPassword.value

const show = ref(false)
const isEmail = ref(true)

// Capture referral code from URL parameters
const referralCode = ref('')

onMounted(() => {
  const refParam = route.query.ref as string
  if (refParam && isValidReferralCode(refParam)) {
    referralCode.value = refParam
    // Store in localStorage for use during user creation
    if (process.client) {
      localStorage.setItem('signup_referral_code', refParam)
    }
  }
})

definePageMeta({
	layout: 'auth',
	middleware: 'is-not-authenticated'
})
</script>

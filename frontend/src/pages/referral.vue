<template>
	<main class="flex flex-col items-start w-full px-4 md:px-8 py-10">
		<div class="w-full flex flex-col gap-6">
			<div class="flex flex-col gap-2">
				<h1 class="text-[22px] font-bold">
					Refer a Friend
				</h1>
				<p class="text-gray-600 text-sm">
					Share Goalmatic with your friends and earn rewards when they join!
				</p>
			</div>

			<!-- Loading State -->
			<div v-if="loading" class="bg-white rounded-lg border border-line p-6">
				<div class="animate-pulse">
					<div class="h-4 bg-gray-200 rounded w-1/4 mb-4" />
					<div class="grid grid-cols-2 gap-4">
						<div class="h-20 bg-gray-200 rounded" />
						<div class="h-20 bg-gray-200 rounded" />
					</div>
				</div>
			</div>

			<!-- Referral Stats Card -->
			<div v-else class="bg-white rounded-lg border border-line p-6">
				<div class="flex flex-col md:flex-row gap-6">
					<div class="flex-1">
						<h2 class="text-lg font-bold mb-4">
							Your Referral Stats
						</h2>
						<div class="grid grid-cols-2 gap-4">
							<div class="bg-tertiary rounded-lg p-4">
								<div class="text-2xl font-bold text-primary">
									{{ stats?.totalReferrals || 0 }}
								</div>
								<div class="text-sm text-gray-600">
									Total Referrals
								</div>
							</div>
							<div class="bg-tertiary rounded-lg p-4">
								<div class="text-2xl font-bold text-primary">
									{{ stats?.successfulReferrals || 0 }}
								</div>
								<div class="text-sm text-gray-600">
									Successful Referrals
								</div>
							</div>
						</div>
					</div>
					<div class="flex-1">
						<h3 class="text-lg font-bold mb-4">
							Rewards Earned
						</h3>
						<div class="bg-gradient-to-r from-primary to-purple-600 rounded-lg p-4 text-white">
							<div class="text-2xl font-bold">
								${{ stats?.totalEarnings || 0 }}
							</div>
							<div class="text-sm opacity-90">
								Total Earnings
							</div>
						</div>
					</div>
				</div>
			</div>

			<!-- Referral Link Card -->
			<div class="bg-white rounded-lg border border-line p-6">
				<h2 class="text-lg font-bold mb-4">
					Share Your Referral Link
				</h2>
				<div class="flex flex-col gap-4">
					<div class="field">
						<label>Your Referral Link</label>
						<div class="flex gap-2">
							<input
								:value="referralUrl"
								type="text"
								class="input-field flex-1"
								readonly
							>
							<button
								class="btn-primary px-4"
								@click="copyReferralUrl"
							>
								<Copy class="w-4 h-4" />
							</button>
						</div>
					</div>
					<div class="flex flex-wrap gap-2">
						<button
							class="btn-outline flex items-center gap-2"
							@click="shareViaEmail"
						>
							<Mail class="w-4 h-4" />
							Share via Email
						</button>
						<button
							class="btn-outline flex items-center gap-2"
							@click="shareViaWhatsApp"
						>
							<MessageSquare class="w-4 h-4" />
							Share via WhatsApp
						</button>
						<button
							class="btn-outline flex items-center gap-2"
							@click="shareViaTwitter"
						>
							<TwitterIcon class="w-4 h-4" />
							Share on Twitter
						</button>
					</div>
				</div>
			</div>

			<!-- How It Works Card -->
			<div class="bg-white rounded-lg border border-line p-6">
				<h2 class="text-lg font-bold mb-4">
					How It Works
				</h2>
				<div class="grid grid-cols-1 md:grid-cols-3 gap-6">
					<div class="flex flex-col items-center text-center">
						<div class="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold text-lg mb-3">
							1
						</div>
						<h3 class="font-semibold mb-2">
							Share Your Link
						</h3>
						<p class="text-sm text-gray-600">
							Send your unique referral link to friends and colleagues
						</p>
					</div>
					<div class="flex flex-col items-center text-center">
						<div class="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold text-lg mb-3">
							2
						</div>
						<h3 class="font-semibold mb-2">
							They Sign Up
						</h3>
						<p class="text-sm text-gray-600">
							Your friends create an account using your referral link
						</p>
					</div>
					<div class="flex flex-col items-center text-center">
						<div class="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold text-lg mb-3">
							3
						</div>
						<h3 class="font-semibold mb-2">
							Earn Rewards
						</h3>
						<p class="text-sm text-gray-600">
							Get 20% of their subscription fee for 3 months when they upgrade
						</p>
					</div>
				</div>
			</div>

			<!-- Referral History Card -->
			<div class="bg-white rounded-lg border border-line p-6">
				<h2 class="text-lg font-bold mb-4">
					Recent Referrals
				</h2>
				<div v-if="stats?.referrals && stats.referrals.length > 0" class="space-y-3">
					<div
						v-for="referral in stats.referrals"
						:key="referral.id"
						class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
					>
						<div class="flex items-center gap-3">
							<div class="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm font-semibold">
								{{ referral.name?.charAt(0)?.toUpperCase() || '?' }}
							</div>
							<div>
								<div class="font-medium">
									{{ referral.name || 'Unknown User' }}
								</div>
								<div class="text-sm text-gray-600">
									{{ referral.email || 'No email' }}
								</div>
							</div>
						</div>
						<div class="text-right">
							<div class="text-sm font-medium" :class="referral.status === 'completed' ? 'text-green-600' : 'text-yellow-600'">
								{{ referral.status === 'completed' ? 'Completed' : 'Pending' }}
							</div>
							<div class="text-xs text-gray-500">
								{{ formatDate(referral.created_at) }}
							</div>
						</div>
					</div>
				</div>
				<div v-else class="text-center py-8 text-gray-500">
					<Users class="w-12 h-12 mx-auto mb-3 opacity-50" />
					<p>No referrals yet. Start sharing your link!</p>
				</div>
			</div>

			<!-- Terms Card -->
			<div class="bg-gray-50 rounded-lg border border-line p-6">
				<h2 class="text-lg font-bold mb-4">
					Referral Terms
				</h2>
				<ul class="space-y-2 text-sm text-gray-600">
					<li class="flex items-start gap-2">
						<CheckCircle class="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
						<span>Earn 20% of your friend's subscription fee for 3 months when they upgrade to a paid plan</span>
					</li>
					<li class="flex items-start gap-2">
						<CheckCircle class="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
						<span>Your referred friend gets 10% off their subscription fee</span>
					</li>
					<li class="flex items-start gap-2">
						<CheckCircle class="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
						<span>Earnings are automatically credited to your account</span>
					</li>
					<li class="flex items-start gap-2">
						<CheckCircle class="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
						<span>No limit on the number of referrals you can make</span>
					</li>
					<li class="flex items-start gap-2">
						<CheckCircle class="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
						<span>Referral earnings are paid out monthly</span>
					</li>
				</ul>
			</div>
		</div>
	</main>
</template>

<script setup lang="ts">
import { Copy, Mail, MessageSquare, TwitterIcon, Users, CheckCircle } from 'lucide-vue-next'
import { usePageHeader } from '@/composables/utils/header'
import { useAlert } from '@/composables/core/notification'
import { useUser } from '@/composables/auth/user'
import { useReferral } from '@/composables/auth/referral'

const { userProfile } = useUser()
const {
	referralUrl,
	referralStats,
	loading,
	fetchReferralStats,
	copyReferralUrl
} = useReferral()

// Computed property for easier access to stats
const stats = computed(() => referralStats.value)

// Fetch referral stats on component mount
onMounted(async () => {
	await fetchReferralStats()
})

const shareViaEmail = () => {
	const subject = encodeURIComponent('Join me on Goalmatic!')
	const body = encodeURIComponent(`Hi there!\n\nI've been using Goalmatic to automate my tasks with AI agents and it's been amazing! You should check it out.\n\nUse my referral link to get started: ${referralUrl.value}\n\nYou'll get 10% off your subscription, and I'll earn 20% commission for 3 months!\n\nBest regards,\n${userProfile.value?.name || 'Your friend'}`)
	window.open(`mailto:?subject=${subject}&body=${body}`)
}

const shareViaWhatsApp = () => {
	const message = encodeURIComponent(`Hi! I've been using Goalmatic to automate my tasks with AI agents and it's incredible! Join me and get 10% off: ${referralUrl.value}`)
	window.open(`https://wa.me/?text=${message}`)
}

const shareViaTwitter = () => {
	const text = encodeURIComponent(`Just discovered @goalmatic_io - an amazing platform for building AI agents and automating tasks! Join me and get 10% off: ${referralUrl.value}`)
	window.open(`https://twitter.com/intent/tweet?text=${text}`)
}

const formatDate = (date: any) => {
	if (!date) return 'Unknown'

	// Handle Firestore Timestamp
	let dateObj: Date
	if (date.toDate && typeof date.toDate === 'function') {
		dateObj = date.toDate()
	} else if (date instanceof Date) {
		dateObj = date
	} else {
		dateObj = new Date(date)
	}

	return new Intl.DateTimeFormat('en-US', {
		year: 'numeric',
		month: 'short',
		day: 'numeric'
	}).format(dateObj)
}

definePageMeta({
	layout: 'dashboard',
	middleware: ['is-authenticated', () => {
		usePageHeader().setPageHeader({
			title: 'Refer a Friend',
			description: 'Share Goalmatic with friends and earn rewards'
		})
	}]
})
</script>

<style scoped lang="scss">
.field {
	@apply flex flex-row gap-2 items-center;
	label {
		@apply w-[50%] text-[14px] font-medium;
	}
}

@media (max-width: 768px) {
	.field {
		@apply flex-col items-start gap-1;
		label {
			@apply w-full;
		}
	}
}
</style>

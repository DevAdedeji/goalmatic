<template>
	<main class="flex flex-col items-start w-full px-4 md:px-8 py-10">
		<div class="w-full flex flex-col gap-6">
			<div class="flex flex-col gap-2">
				<h1 class="text-[22px] font-bold">
					Help & Support
				</h1>
				<p class="text-gray-600 text-sm">
					Get help with Goalmatic and find answers to your questions
				</p>
			</div>

			<!-- Quick Actions Card -->
			<div class="bg-white rounded-lg border border-line p-6">
				<h2 class="text-lg font-bold mb-4">
					Quick Actions
				</h2>
				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<button
						class="flex items-center gap-3 p-4 border border-line rounded-lg hover:bg-tertiary transition-colors"
						@click="openEmailSupport"
					>
						<div class="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
							<Mail class="w-5 h-5 text-white" />
						</div>
						<div class="text-left">
							<div class="font-semibold">
								Email Support
							</div>
							<div class="text-sm text-gray-600">
								Get help via email
							</div>
						</div>
					</button>
					<button
						class="flex items-center gap-3 p-4 border border-line rounded-lg hover:bg-tertiary transition-colors"
						@click="openWhatsAppSupport"
					>
						<div class="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
							<MessageSquare class="w-5 h-5 text-white" />
						</div>
						<div class="text-left">
							<div class="font-semibold">
								WhatsApp Support
							</div>
							<div class="text-sm text-gray-600">
								Chat with us on WhatsApp
							</div>
						</div>
					</button>
				</div>
			</div>

			<!-- Contact Information Card -->
			<div class="bg-white rounded-lg border border-line p-6">
				<h2 class="text-lg font-bold mb-4">
					Contact Information
				</h2>
				<div class="space-y-4">
					<div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
						<div class="flex items-center gap-3">
							<Mail class="w-5 h-5 text-primary" />
							<div>
								<div class="font-medium">
									Email Support
								</div>
								<div class="text-sm text-gray-600">
									support@goalmatic.io
								</div>
							</div>
						</div>
						<button
							class="btn-outline px-3 py-1 text-sm"
							@click="copyToClipboard('support@goalmatic.io')"
						>
							Copy
						</button>
					</div>
					<div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
						<div class="flex items-center gap-3">
							<MessageSquare class="w-5 h-5 text-green-500" />
							<div>
								<div class="font-medium">
									WhatsApp Support
								</div>
								<div class="text-sm text-gray-600">
									+234 814 692 3944
								</div>
							</div>
						</div>
						<button
							class="btn-outline px-3 py-1 text-sm"
							@click="copyToClipboard('+2348146923944')"
						>
							Copy
						</button>
					</div>
					<div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
						<div class="flex items-center gap-3">
							<Clock class="w-5 h-5 text-blue-500" />
							<div>
								<div class="font-medium">
									Support Hours
								</div>
								<div class="text-sm text-gray-600">
									Monday - Friday, 9:00 AM - 6:00 PM (WAT)
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>



			<!-- Resources Card -->
			<div class="bg-white rounded-lg border border-line p-6">
				<h2 class="text-lg font-bold mb-4">
					Helpful Resources
				</h2>
				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<a
						href="#"
						class="flex items-center gap-3 p-4 border border-line rounded-lg hover:bg-tertiary transition-colors"
					>
						<div class="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
							<BookOpen class="w-5 h-5 text-white" />
						</div>
						<div>
							<div class="font-semibold">Documentation</div>
							<div class="text-sm text-gray-600">Learn how to use Goalmatic</div>
						</div>
					</a>
					<a
						href="#"
						class="flex items-center gap-3 p-4 border border-line rounded-lg hover:bg-tertiary transition-colors"
					>
						<div class="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
							<Video class="w-5 h-5 text-white" />
						</div>
						<div>
							<div class="font-semibold">Video Tutorials</div>
							<div class="text-sm text-gray-600">Watch step-by-step guides</div>
						</div>
					</a>
					<nuxt-link
						to="/community"
						class="flex items-center gap-3 p-4 border border-line rounded-lg hover:bg-tertiary transition-colors"
					>
						<div class="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
							<Users class="w-5 h-5 text-white" />
						</div>
						<div>
							<div class="font-semibold">
								Community Forum
							</div>
							<div class="text-sm text-gray-600">
								Connect with other users
							</div>
						</div>
					</nuxt-link>
					<a
						href="#"
						class="flex items-center gap-3 p-4 border border-line rounded-lg hover:bg-tertiary transition-colors"
					>
						<div class="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center">
							<AlertCircle class="w-5 h-5 text-white" />
						</div>
						<div>
							<div class="font-semibold">Report a Bug</div>
							<div class="text-sm text-gray-600">Help us improve Goalmatic</div>
						</div>
					</a>
				</div>
			</div>

			<!-- Feature Request Card -->
			<div class="bg-gradient-to-r from-primary to-purple-600 rounded-lg p-6 text-white">
				<h2 class="text-lg font-bold mb-2">
					Have a Feature Request?
				</h2>
				<p class="text-sm opacity-90 mb-4">
					We'd love to hear your ideas for improving Goalmatic. Share your suggestions with us!
				</p>
				<button
					class="bg-white text-primary px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors"
					@click="openFeatureRequest"
				>
					Submit Feature Request
				</button>
			</div>
		</div>
	</main>
</template>

<script setup lang="ts">
import {
	Mail,
	MessageSquare,
	Clock,
	ChevronDown,
	BookOpen,
	Video,
	Users,
	AlertCircle
} from 'lucide-vue-next'
import { usePageHeader } from '@/composables/utils/header'
import { useAlert } from '@/composables/core/notification'

const activeFaq = ref<number | null>(null)



const toggleFaq = (index: number) => {
	activeFaq.value = activeFaq.value === index ? null : index
}

const copyToClipboard = async (text: string) => {
	try {
		await navigator.clipboard.writeText(text)
		useAlert().openAlert({
			msg: 'Copied to clipboard!',
			type: 'SUCCESS'
		})
	} catch (err) {
		useAlert().openAlert({
			msg: 'Failed to copy to clipboard',
			type: 'ERROR'
		})
	}
}

const openEmailSupport = () => {
	window.open('mailto:support@goalmatic.io?subject=Support Request')
}

const openWhatsAppSupport = () => {
	const phone = '2348146923944'
	const message = 'Hello Goalmatic Support, I am a Goalmatic user. I would like to get help with ...'
	const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
	window.open(url)
}

const openFeatureRequest = () => {
	window.open('mailto:support@goalmatic.io?subject=Feature Request')
}

definePageMeta({
	layout: 'dashboard',
	middleware: ['is-authenticated', () => {
		usePageHeader().setPageHeader({
			title: 'Help & Support',
			description: 'Get help and find answers to your questions'
		})
	}]
})
</script>

<style scoped lang="scss">
/* Custom styles for the support page */
</style>


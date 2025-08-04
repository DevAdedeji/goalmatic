<template>
	<div class="mt-4 border-t border-gray-200 pt-4">
		<div class="flex items-center justify-between mb-3">
			<h4 class="text-sm font-medium text-gray-900">
				Email Trigger Testing
			</h4>
			<button
				type="button"
				class="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
				@click="toggleTester"
			>
				<svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
				</svg>
				{{ showTester ? 'Hide' : 'Show' }} Test Logs
			</button>
		</div>

		<!-- Email Testing Panel -->
		<div v-if="showTester" class="bg-gray-50 rounded-lg p-4">
			<!-- Connection Status -->
			<div class="flex items-center justify-between mb-3">
				<div class="flex items-center space-x-2">
					<div :class="[
						'w-2 h-2 rounded-full',
						emailTriggerTesting.isConnected.value ? 'bg-green-500' : 'bg-red-500'
					]" />
					<span class="text-xs text-gray-600">
						{{ emailTriggerTesting.isConnected.value ? 'Connected - Listening for emails' : 'Disconnected' }}
					</span>
					<span v-if="emailTriggerTesting.logs.value.length > 0" class="text-xs text-gray-500">
						({{ emailTriggerTesting.logs.value.length }} {{ emailTriggerTesting.logs.value.length === 1 ? 'log' : 'logs' }})
					</span>
				</div>
				<button
					type="button"
					:class="[
						'px-2 py-1 rounded text-xs font-medium transition-colors',
						copySuccess
							? 'bg-green-100 text-green-800 border border-green-200'
							: 'bg-blue-100 text-blue-800 border border-blue-200 hover:bg-blue-200'
					]"
					@click="copyEmailAddress"
				>
					{{ copySuccess ? 'Copied!' : 'Copy Email' }}
				</button>
			</div>

			<!-- Error Display -->
			<div v-if="emailTriggerTesting.error.value" class="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg">
				<div class="flex items-center">
					<svg class="w-4 h-4 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
					</svg>
					<span class="text-sm text-red-700">{{ emailTriggerTesting.error.value }}</span>
				</div>
			</div>

			<!-- Logs Container -->
			<div class="bg-white rounded border max-h-64 overflow-y-auto">
				<!-- Loading State -->
				<div v-if="emailTriggerTesting.loading.value" class="flex items-center justify-center py-8">
					<div class="text-center">
						<div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto" />
						<p class="text-gray-600 text-xs mt-2">
							Loading logs...
						</p>
					</div>
				</div>

				<!-- Empty State -->
				<div v-else-if="emailTriggerTesting.logs.value.length === 0" class="text-center py-8">
					<svg class="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
					</svg>
					<p class="text-sm text-gray-600 mb-1">
						No emails received yet
					</p>
					<p class="text-xs text-gray-500">
						Send a test email to see it appear here
					</p>
				</div>

				<!-- Logs List -->
				<div v-else class="divide-y divide-gray-200">
					<div
						v-for="log in emailTriggerTesting.logs.value.slice(0, 5)"
						:key="log.id"
						class="p-3 hover:bg-gray-50 transition-colors"
					>
						<div class="flex items-start justify-between">
							<div class="flex-1 min-w-0">
								<!-- Status and Timestamp -->
								<div class="flex items-center space-x-2 mb-1">
									<span :class="getStatusBadgeClass(log.status)" class="px-2 py-0.5 rounded-full text-xs font-medium">
										{{ getStatusText(log.status) }}
									</span>
									<span class="text-xs text-gray-500">
										{{ formatTimestamp(log.created_at) }}
									</span>
								</div>

								<!-- Email Details -->
								<div class="space-y-0.5">
									<p class="text-xs text-gray-900 truncate">
										From: {{ log.from_address }}
									</p>
									<p class="text-xs text-gray-700 truncate">
										Subject: {{ log.subject || 'No subject' }}
									</p>

									<!-- View Content Button -->
									<div class="mt-2">
										<button
											class="text-xs text-blue-600 hover:text-blue-800 font-medium"
											type="button"
											@click="openEmailContentModal(log)"
										>
											View Content
										</button>
									</div>

									<!-- Error/Reason -->
									<div v-if="log.reason" class="mt-1">
										<p class="text-xs text-red-600">
											{{ getReasonText(log.reason) }}
										</p>
									</div>
								</div>
							</div>
						</div>

						<!-- Content Info -->
						<div class="px-3 pb-1">
							<div class="text-xs text-gray-500">
								<span v-if="(log as any).body_html">✓ HTML content available</span>
								<span v-if="(log as any).body_text">{{ (log as any).body_html ? ' • ' : '' }}✓ Text content available</span>
								<span v-if="!(log as any).body_html && !(log as any).body_text" class="italic">No content available</span>
							</div>
						</div>
					</div>
				</div>
			</div>

			<!-- Instructions -->
			<div class="mt-3 text-xs text-gray-600">
				<p><strong>How to test:</strong> Send an email to the address above and watch the logs appear in real-time.</p>
			</div>
		</div>

		<!-- Email Content Modal -->
		<EmailContentModal
			v-if="selectedEmailLog"
			:email-log="selectedEmailLog"
			@close="closeEmailContentModal"
		/>
	</div>
</template>

<script setup lang="ts">
import { ref, onUnmounted } from 'vue'
import EmailContentModal from './EmailContentModal.vue'
import { useEmailTriggerTesting } from '@/composables/dashboard/flows/emailTriggerTesting'

interface Props {
  triggerEmail: string
  flowId: string
}

const props = defineProps<Props>()

const showTester = ref(false)
const copySuccess = ref(false)
const emailTriggerTesting = useEmailTriggerTesting()
const selectedEmailLog = ref<any>(null)

// Toggle tester visibility
const toggleTester = () => {
  showTester.value = !showTester.value

  if (showTester.value) {
    // Start listening when opened
    const triggerId = getTriggerIdFromEmail(props.triggerEmail)
    if (triggerId) {
      emailTriggerTesting.startListening(triggerId)
    }
  } else {
    // Stop listening when closed
    emailTriggerTesting.stopListening()
  }
}

// Copy email address to clipboard
const copyEmailAddress = async () => {
  try {
    await navigator.clipboard.writeText(props.triggerEmail)
    copySuccess.value = true
    setTimeout(() => {
      copySuccess.value = false
    }, 2000)
  } catch (error) {
    console.error('Failed to copy email address:', error)
  }
}

// Open email content modal
const openEmailContentModal = (log: any) => {
  selectedEmailLog.value = log
}

// Close email content modal
const closeEmailContentModal = () => {
  selectedEmailLog.value = null
}

// Get trigger ID from email address
const getTriggerIdFromEmail = (email: string) => {
  if (!email) return null
  const match = email.match(/^([a-zA-Z0-9]+)@goalmatic\.io$/)
  return match ? match[1] : null
}

// Format timestamp for display
const formatTimestamp = (timestamp: any) => {
  if (!timestamp) return 'Unknown'

  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp as any)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSeconds = Math.floor(diffMs / 1000)
  const diffMinutes = Math.floor(diffSeconds / 60)

  if (diffSeconds < 60) {
    return `${diffSeconds}s ago`
  } else if (diffMinutes < 60) {
    return `${diffMinutes}m ago`
  } else {
    return date.toLocaleTimeString()
  }
}

// Get status badge styling
const getStatusBadgeClass = (status: string) => {
  switch (status) {
    case 'processed':
      return 'bg-green-100 text-green-800'
    case 'testing':
      return 'bg-blue-100 text-blue-800'
    case 'filtered':
      return 'bg-yellow-100 text-yellow-800'
    case 'failed':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

// Get status text
const getStatusText = (status: string) => {
  switch (status) {
    case 'processed':
      return 'Processed'
    case 'testing':
      return 'Testing'
    case 'filtered':
      return 'Filtered'
    case 'failed':
      return 'Failed'
    default:
      return 'Unknown'
  }
}

// Get human-readable reason text
const getReasonText = (reason: string) => {
  switch (reason) {
    case 'EMAIL_RECEIVED_FOR_TESTING':
      return 'Email received successfully (testing mode)'
    case 'TRIGGER_NOT_FOUND':
      return 'Email trigger not found in database'
    case 'TRIGGER_INACTIVE':
      return 'Email trigger is inactive'
    case 'FLOW_NOT_FOUND':
      return 'Associated flow not found'
    case 'FLOW_INACTIVE':
      return 'Associated flow is inactive'
    case 'DAILY_RATE_LIMIT_EXCEEDED':
      return 'Daily rate limit exceeded'
    case 'HOURLY_RATE_LIMIT_EXCEEDED':
      return 'Hourly rate limit exceeded'
    case 'PROCESSING_ERROR':
      return 'Error occurred during processing'
    default:
      return reason
  }
}

// Cleanup on unmount
onUnmounted(() => {
  emailTriggerTesting.stopListening()
})
</script>

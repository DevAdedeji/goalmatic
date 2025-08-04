<template>
	<div class="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
		<div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
			<!-- Background overlay -->
			<div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" @click="$emit('close')" />

			<!-- Modal panel -->
			<div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
				<!-- Header -->
				<div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
					<div class="flex items-start justify-between">
						<div class="flex-1">
							<h3 id="modal-title" class="text-lg leading-6 font-medium text-gray-900">
								Email Content
							</h3>
							<div class="mt-2">
								<div class="text-sm text-gray-600 space-y-1">
									<p><span class="font-medium">From:</span> {{ emailLog.from_address }}</p>
									<p><span class="font-medium">Subject:</span> {{ emailLog.subject || 'No subject' }}</p>
									<p><span class="font-medium">Received:</span> {{ formatTimestamp(emailLog.received_at) }}</p>
									<div class="flex items-center space-x-4 mt-2">
										<span :class="getStatusBadgeClass(emailLog.status)" class="px-2 py-1 rounded-full text-xs font-medium">
											{{ getStatusText(emailLog.status) }}
										</span>
										<span v-if="emailLog.reason" class="text-xs text-gray-500">
											{{ getReasonText(emailLog.reason) }}
										</span>
									</div>
								</div>
							</div>
						</div>
						<button
							type="button"
							class="ml-4 bg-white rounded-md text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
							@click="$emit('close')"
						>
							<span class="sr-only">Close</span>
							<svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
							</svg>
						</button>
					</div>
				</div>

				<!-- Content tabs -->
				<div class="px-4 sm:px-6">
					<div class="border-b border-gray-200">
						<nav class="-mb-px flex space-x-8">
							<button
								type="button"
								:class="[
									'py-2 px-1 border-b-2 font-medium text-sm',
									activeTab === 'html'
										? 'border-blue-500 text-blue-600'
										: 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
								]"
								:disabled="!emailLog.body_html"
								@click="activeTab = 'html'"
							>
								HTML Content
								<span v-if="!emailLog.body_html" class="text-xs text-gray-400 ml-1">(Not available)</span>
							</button>
							<button
								type="button"
								:class="[
									'py-2 px-1 border-b-2 font-medium text-sm',
									activeTab === 'text'
										? 'border-blue-500 text-blue-600'
										: 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
								]"
								:disabled="!emailLog.body_text"
								@click="activeTab = 'text'"
							>
								Text Content
								<span v-if="!emailLog.body_text" class="text-xs text-gray-400 ml-1">(Not available)</span>
							</button>
							<button
								type="button"
								:class="[
									'py-2 px-1 border-b-2 font-medium text-sm',
									activeTab === 'raw'
										? 'border-blue-500 text-blue-600'
										: 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
								]"
								@click="activeTab = 'raw'"
							>
								Raw Data
							</button>
						</nav>
					</div>
				</div>

				<!-- Content area -->
				<div class="px-4 sm:px-6 pb-6">
					<!-- HTML Content -->
					<div v-if="activeTab === 'html'" class="mt-4">
						<div v-if="emailLog.body_html" class="bg-white border rounded-lg p-4 max-h-96 overflow-y-auto">
							<div class="prose prose-sm max-w-none" v-html="sanitizeHtml(emailLog.body_html)" />
						</div>
						<div v-else class="text-center py-8 text-gray-500">
							<svg class="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
							</svg>
							<p class="text-sm">
								No HTML content available
							</p>
							<p class="text-xs text-gray-400 mt-1">
								This email may be plain text only
							</p>
						</div>
					</div>

					<!-- Text Content -->
					<div v-if="activeTab === 'text'" class="mt-4">
						<div v-if="emailLog.body_text" class="bg-gray-50 border rounded-lg p-4 max-h-96 overflow-y-auto">
							<pre class="whitespace-pre-wrap text-sm font-mono text-gray-800">{{ emailLog.body_text }}</pre>
						</div>
						<div v-else class="text-center py-8 text-gray-500">
							<svg class="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
							</svg>
							<p class="text-sm">
								No text content available
							</p>
						</div>
					</div>

					<!-- Raw Data -->
					<div v-if="activeTab === 'raw'" class="mt-4">
						<div class="bg-gray-900 text-green-400 rounded-lg p-4 max-h-96 overflow-y-auto">
							<pre class="text-xs font-mono">{{ JSON.stringify(emailLog, null, 2) }}</pre>
						</div>
					</div>
				</div>

				<!-- Footer -->
				<div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
					<button
						type="button"
						class="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
						@click="copyContent"
					>
						{{ copySuccess ? 'Copied!' : 'Copy Content' }}
					</button>
					<button
						type="button"
						class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
						@click="$emit('close')"
					>
						Close
					</button>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface Props {
  emailLog: any
}

const props = defineProps<Props>()

defineEmits<{
  close: []
}>()

const activeTab = ref('html')
const copySuccess = ref(false)

// Auto-select the first available tab
const availableTab = computed(() => {
  if (props.emailLog.body_html) return 'html'
  if (props.emailLog.body_text) return 'text'
  return 'raw'
})

// Set initial tab to first available
activeTab.value = availableTab.value

// Copy content to clipboard
const copyContent = async () => {
  try {
    let content = ''
    if (activeTab.value === 'html' && props.emailLog.body_html) {
      content = props.emailLog.body_html
    } else if (activeTab.value === 'text' && props.emailLog.body_text) {
      content = props.emailLog.body_text
    } else if (activeTab.value === 'raw') {
      content = JSON.stringify(props.emailLog, null, 2)
    }

    await navigator.clipboard.writeText(content)
    copySuccess.value = true
    setTimeout(() => {
      copySuccess.value = false
    }, 2000)
  } catch (error) {
    console.error('Failed to copy content:', error)
  }
}

// Sanitize HTML content for safe rendering
const sanitizeHtml = (html: string) => {
  if (!html) return ''

  // Create a temporary div to parse HTML
  const tempDiv = document.createElement('div')
  tempDiv.innerHTML = html

  // Remove potentially dangerous elements and attributes
  const dangerousElements = ['script', 'iframe', 'object', 'embed', 'form', 'input', 'button']
  dangerousElements.forEach((tag) => {
    const elements = tempDiv.querySelectorAll(tag)
    elements.forEach((el) => el.remove())
  })

  // Remove dangerous attributes
  const dangerousAttrs = ['onclick', 'onload', 'onerror', 'onmouseover', 'onfocus', 'onblur', 'onchange', 'onsubmit']
  const allElements = tempDiv.querySelectorAll('*')
  allElements.forEach((el) => {
    dangerousAttrs.forEach((attr) => {
      if (el.hasAttribute(attr)) {
        el.removeAttribute(attr)
      }
    })

    // Remove javascript: links
    if (el.hasAttribute('href') && el.getAttribute('href')?.startsWith('javascript:')) {
      el.removeAttribute('href')
    }

    // Remove data: and javascript: src attributes
    if (el.hasAttribute('src')) {
      const src = el.getAttribute('src')
      if (src?.startsWith('javascript:') || src?.startsWith('data:')) {
        el.removeAttribute('src')
      }
    }
  })

  return tempDiv.innerHTML
}

// Format timestamp for display
const formatTimestamp = (timestamp: any) => {
  if (!timestamp) return 'Unknown'

  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
  return date.toLocaleString()
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
</script>

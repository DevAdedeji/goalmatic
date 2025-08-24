<template>
	<div class="email-display-field">
		<!-- Label -->
		<label
			v-if="label"
			class="block text-sm font-medium text-gray-700 mb-2"
		>
			{{ label }}
			<span v-if="required" class="text-red-500 ml-1">*</span>
		</label>

		<!-- Email Display Container -->
		<div class="relative">
			<!-- Email Input Field -->
			<div
				class="flex items-center w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 min-h-[42px]"
				:class="{
					'border-green-300 bg-green-50': emailStatus === 'generated',
					'border-red-300 bg-red-50': emailStatus === 'invalid',
					'border-gray-300 bg-gray-50': emailStatus === 'not-generated'
				}"
			>
				<!-- Loading State -->
				<div v-if="isGenerating" class="flex items-center space-x-2 text-gray-500">
					<svg class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
						<circle
							class="opacity-25"
							cx="12"
							cy="12"
							r="10"
							stroke="currentColor"
							stroke-width="4"
						/>
						<path
							class="opacity-75"
							fill="currentColor"
							d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
						/>
					</svg>
					<span class="text-sm">Generating email address...</span>
				</div>

				<!-- Email Display -->
				<div v-else class="flex items-center justify-between w-full">
					<div class="flex-1">
						<span
							v-if="displayValue"
							class="text-sm font-mono select-all"
							:class="emailStatusColor"
						>
							{{ displayValue }}
						</span>
						<span
							v-else
							class="text-sm text-gray-400 italic"
						>
							{{ placeholder || 'Click generate to create email address' }}
						</span>
					</div>

					<!-- Action Buttons -->
					<div class="flex items-center space-x-2 ml-3">
						<!-- Generate Button -->
						<button
							v-if="!displayValue && !isGenerating && autoGenerate"
							type="button"
							class="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
							:disabled="isGenerating"
							@click="handleGenerate"
						>
							<svg class="h-3 w-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
							</svg>
							Generate
						</button>

						<!-- Copy Button -->
						<button
							v-if="displayValue && copyable"
							type="button"
							class="inline-flex items-center px-2 py-1 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
							:class="{
								'border-green-300 text-green-700 bg-green-50': copySuccess,
							}"
							:title="copySuccess ? 'Copied!' : 'Copy to clipboard'"
							@click="handleCopy"
						>
							<svg
								v-if="!copySuccess"
								class="h-3 w-3"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
								/>
							</svg>
							<svg
								v-else
								class="h-3 w-3"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M5 13l4 4L19 7"
								/>
							</svg>
						</button>

						<!-- Regenerate Button -->
						<button
							v-if="displayValue && autoGenerate"
							type="button"
							class="inline-flex items-center px-2 py-1 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
							:disabled="isGenerating"
							title="Regenerate email address"
							@click="handleRegenerate"
						>
							<svg class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
								/>
							</svg>
						</button>
					</div>
				</div>
			</div>

			<!-- Status Indicator -->
			<div v-if="emailStatus !== 'not-generated'" class="flex items-center mt-1">
				<div
					class="w-2 h-2 rounded-full mr-2"
					:class="{
						'bg-green-500': emailStatus === 'generated',
						'bg-red-500': emailStatus === 'invalid'
					}"
				/>
				<span
					class="text-xs"
					:class="{
						'text-green-600': emailStatus === 'generated',
						'text-red-600': emailStatus === 'invalid'
					}"
				>
					{{ getStatusText() }}
				</span>
			</div>
		</div>

		<!-- Description -->
		<p v-if="description" class="mt-2 text-sm text-gray-500">
			{{ description }}
		</p>

		<!-- Usage Instructions -->
		<div v-if="displayValue && showInstructions" class="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
			<div class="flex">
				<svg class="h-5 w-5 text-blue-400 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
					<path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
				</svg>
				<div class="text-sm text-blue-700">
					<p class="font-medium mb-1">
						How to use this email trigger:
					</p>
					<ol class="list-decimal list-inside space-y-1 text-sm">
						<li>Copy the email address above</li>
						<li>Send emails to this address to trigger your flow</li>
						<li>The flow will run with email data available to all steps</li>
					</ol>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useEmailTrigger } from '@/composables/dashboard/flows/emailTrigger'

interface Props {
  modelValue?: string
  label?: string
  description?: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
  copyable?: boolean
  autoGenerate?: boolean
  flowId?: string
  showInstructions?: boolean
  existingEmail?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  copyable: true,
  autoGenerate: true,
  showInstructions: true
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'generated': [email: string]
  'copied': [email: string]
}>()

const {
  isGenerating,
  copyEmailToClipboard,
  generateEmailAddress,
  getEmailStatus,
  getEmailStatusColor
} = useEmailTrigger()

const copySuccess = ref(false)

// Computed properties
const displayValue = computed(() => props.modelValue || '')

const emailStatus = computed(() => getEmailStatus(displayValue.value))

const emailStatusColor = computed(() => getEmailStatusColor(emailStatus.value))

// Methods
const handleGenerate = async () => {
  if (!props.flowId) {
    console.error('EmailDisplayField: Flow ID is required to generate email address')
    return
  }

  const email = await generateEmailAddress(props.flowId)
  if (email) {
    emit('update:modelValue', email)
    emit('generated', email)
  }
}

const handleRegenerate = async () => {
  // For regeneration, we need to ensure a new email is created
  // This might require additional backend logic to invalidate the old one
  await handleGenerate()
}

const handleCopy = async () => {
  if (!displayValue.value) return

  const success = await copyEmailToClipboard(displayValue.value)
  if (success) {
    copySuccess.value = true
    emit('copied', displayValue.value)

    // Reset copy success state after 2 seconds
    setTimeout(() => {
      copySuccess.value = false
    }, 2000)
  }
}

const getStatusText = () => {
  switch (emailStatus.value) {
    case 'generated':
      return 'Email address ready to use'
    case 'invalid':
      return 'Invalid email address format'
    default:
      return ''
  }
}

// Auto-generate email when flowId is provided and no email exists
watch(
  () => props.flowId,
  (newFlowId) => {
    if (newFlowId && !displayValue.value && props.autoGenerate) {
      // Check if there's an existing email from flow data first
      if (props.existingEmail) {
        emit('update:modelValue', props.existingEmail)
        emit('generated', props.existingEmail)
      } else {
        handleGenerate()
      }
    }
  },
  { immediate: true }
)

// Also watch for existingEmail prop changes
watch(
  () => props.existingEmail,
  (newExistingEmail) => {
    if (newExistingEmail && !displayValue.value && props.autoGenerate) {
      emit('update:modelValue', newExistingEmail)
      emit('generated', newExistingEmail)
    }
  },
  { immediate: true }
)
</script>

<style scoped>
.email-display-field {
  @apply w-full;
}

.select-all {
  user-select: all;
}

/* Custom scrollbar for long emails */
.font-mono {
  word-break: break-all;
}
</style>

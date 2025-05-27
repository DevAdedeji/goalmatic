<template>
	<div>
		<!-- Properties Form -->
		<form class="flex flex-col gap-6" @submit.prevent="validateAndSave">
			<div v-if="!hasProps" class="text-center py-4 text-text-secondary">
				This node has no configurable properties.
			</div>

			<template v-else>
				<div v-for="(prop, index) in nodeProps" :key="index" class="flex flex-col gap-2">
					<!-- AI Mode Toggle -->
					<div class="flex items-center justify-between mb-1">
						<label class="text-sm flex items-center">
							<span :class="{'text-text-secondary': !prop.required, 'font-medium': prop.required}">
								{{ prop.name }}
							</span>
							<span v-if="prop.required" class="text-danger ml-1">*</span>
							<span v-if="showValidation && !isValidField(prop.key)"
								class="text-danger text-xs ml-2">
								{{ getValidationMessage(prop.key) }}
							</span>

							<!-- Info icon with tooltip for description -->
							<Tooltip v-if="prop.description" placement="top" class="ml-2">
								<template #trigger>
									<InfoIcon :size="14" class="text-gray-400 hover:text-primary cursor-help" />
								</template>
								<template #content>
									<div class="max-w-xs p-2 text-xs">
										{{ prop.description }}
									</div>
								</template>
							</Tooltip>
						</label>


						<select
							v-if="prop.ai_enabled"
							v-model="aiMode[prop.key]"
							class="ai_selector"
							@change="handleAiModeChange(prop.key)"
						>
							<option value="manual">
								Manual
							</option>
							<option value="ai">
								AI
							</option>
						</select>
					</div>




					<!-- Custom Input -->
					<MentionEditor
						v-if="prop.type === 'mentionTextarea' || prop.type === 'mentionInput'"
						v-model="formValues[prop.key]"
						:mention-items="props.previousNodeOutputs"
						:class-node="[
							prop.type === 'mentionTextarea' ? 'input-textarea' : 'input-field',
							prop.ai_enabled && aiMode[prop.key] === 'ai' ? 'ai-mode-input' : ''
						].filter(Boolean).join(' ')"
					/>

					<input
						v-else-if="prop.type === 'text'"
						v-model="formValues[prop.key]"
						type="text"
						:required="prop.required && (!prop.ai_enabled || aiMode[prop.key] === 'manual')"
						:disabled="prop.disabled"
						:class="getInputClasses(prop)"
						:placeholder="prop.ai_enabled && aiMode[prop.key] === 'ai' ? `Enter prompt for ${prop.name.toLowerCase()}` : `Enter ${prop.name.toLowerCase()}`"
					>

					<textarea
						v-else-if="prop.type === 'textarea'"
						v-model="formValues[prop.key]"
						:required="prop.required && (!prop.ai_enabled || aiMode[prop.key] === 'manual')"
						:disabled="prop.disabled"
						rows="4"
						:class="getInputClasses(prop)"
						:placeholder="prop.ai_enabled && aiMode[prop.key] === 'ai' ? `Enter prompt for ${prop.name.toLowerCase()}` : `Enter ${prop.name.toLowerCase()}`"
					/>

					<!-- Number Input -->
					<input
						v-else-if="prop.type === 'number'"
						v-model.number="formValues[prop.key]"
						type="number"
						:required="prop.required && (!prop.ai_enabled || aiMode[prop.key] === 'manual')"
						:disabled="prop.disabled"
						:class="getInputClasses(prop)"
						:placeholder="prop.ai_enabled && aiMode[prop.key] === 'ai' ? 'Enter prompt for number value' : 'Enter a number'"
					>

					<!-- Date Input -->
					<input
						v-else-if="prop.type === 'date'"
						v-model="formValues[prop.key]"
						type="date"
						:required="prop.required && (!prop.ai_enabled || aiMode[prop.key] === 'manual')"
						:disabled="prop.disabled"
						:class="getInputClasses(prop)"
					>

					<!-- Time Input -->
					<input
						v-else-if="prop.type === 'time'"
						v-model="formValues[prop.key]"
						type="time"
						:required="prop.required && (!prop.ai_enabled || aiMode[prop.key] === 'manual')"
						:disabled="prop.disabled"
						:class="getInputClasses(prop)"
					>

					<!-- Select Dropdown -->
					<select
						v-else-if="prop.type === 'select'"
						v-model="formValues[prop.key]"
						:required="prop.required && (!prop.ai_enabled || aiMode[prop.key] === 'manual')"
						:disabled="prop.disabled"
						:class="getInputClasses(prop)"
					>
						<option value="" disabled selected>
							{{ prop.ai_enabled && aiMode[prop.key] === 'ai' ? 'AI will select based on context' : 'Select an option' }}
						</option>
						<option
							v-for="(option, optionIndex) in prop.options"
							:key="optionIndex"
							:value="typeof option === 'object' ? option.value : option"
						>
							{{ typeof option === 'object' ? option.name : option }}
						</option>
					</select>

					<!-- Email Input -->
					<input
						v-else-if="prop.type === 'email'"
						v-model="formValues[prop.key]"
						type="email"
						:required="prop.required && (!prop.ai_enabled || aiMode[prop.key] === 'manual')"
						:disabled="prop.disabled"
						:class="getInputClasses(prop)"
						:placeholder="prop.ai_enabled && aiMode[prop.key] === 'ai' ? 'Enter prompt for email content' : 'Enter email address'"
					>

					<!-- Default Text Input for any other type -->
					<input
						v-else
						v-model="formValues[prop.key]"
						type="text"
						:required="prop.required && (!prop.ai_enabled || aiMode[prop.key] === 'manual')"
						:disabled="prop.disabled"
						:class="getInputClasses(prop)"
						:placeholder="prop.ai_enabled && aiMode[prop.key] === 'ai' ? `Enter prompt for ${prop.name.toLowerCase()}` : `Enter ${prop.name.toLowerCase()}`"
					>
					<div v-if="prop.ai_enabled && aiMode[prop.key] === 'ai'" class="mb-2 rounded-md  text-sm text-primary italic">
						<span>Write a prompt for the AI to generate content from</span>
					</div>
				</div>
			</template>

			<!-- Required fields alert -->
			<div v-if="showValidation && hasValidationErrors" class="p-3 bg-danger-50 border border-danger-200 rounded-md text-danger-800 text-sm">
				<p class="font-semibold">
					Please address the following issues before saving:
				</p>
				<ul v-if="Object.keys(validationMessages).length > 0" class="mt-2 ml-4 list-disc">
					<li v-for="(message, field) in validationMessages" :key="field">
						{{ field }}: {{ message }}
					</li>
				</ul>
				<p v-else>
					Please fill in all required fields before saving.
				</p>
			</div>

			<div class="flex justify-end gap-2 mt-4">
				<button
					type="button"
					class="btn-outline flex-1"
					@click="closeModal"
				>
					Cancel
				</button>
				<button
					type="submit"
					class="btn-primary flex-1"
					:disabled="loading"
				>
					<span v-if="loading">Saving...</span>
					<span v-else>Save Changes</span>
				</button>
			</div>
		</form>
	</div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, reactive } from 'vue'
import { Info as InfoIcon } from 'lucide-vue-next'
import { useUser } from '@/composables/auth/user'
import Tooltip from '@/components/core/Tooltip.vue'
import MentionEditor from '@/components/core/MentionEditor/index.vue'
import type { FlowNodeProp } from '@/composables/dashboard/flows/nodes/types'

const props = defineProps({
	payload: {
		type: Object,
		required: true
	},
	nodeProps: {
		type: Array as () => FlowNodeProp[],
		required: true
	},
	formValues: {
		type: Object,
		required: true
	},
	hasProps: {
		type: Boolean,
		required: true
	},
	loading: {
		type: Boolean,
		required: true
	},
	previousNodeOutputs: {
		type: Object,
		required: false,
		default: () => ({})
	}
})

const emit = defineEmits(['save', 'cancel'])

// AI mode tracking for each prop
const aiMode = reactive<Record<string, 'manual' | 'ai'>>({})

// Validation state
const showValidation = ref(false)
const hasValidationErrors = ref(false)
const validationMessages = ref<Record<string, string>>({})

// Handle AI mode change
const handleAiModeChange = (propKey: string) => {
	// Don't clear the value when switching modes - users can enter prompts in AI mode
	// The field value will be treated as either content (manual) or prompt (AI) based on the mode
}

// Generate input classes based on prop state
const getInputClasses = (prop: FlowNodeProp) => {
	const baseClasses = 'border rounded-md px-3 py-2 focus:ring-1 focus:ring-primary outline-none'

	let conditionalClasses = ''
	if (showValidation.value && !isValidField(prop.key)) {
		conditionalClasses = 'border-danger-300 bg-danger-50 focus:border-danger'
	} else if (prop.ai_enabled && aiMode[prop.key] === 'ai') {
		conditionalClasses = 'ai-mode-input'
	} else {
		conditionalClasses = 'border-border focus:border-primary'
	}

	const disabledClasses = prop.disabled ? 'bg-gray-100 cursor-not-allowed opacity-75' : ''

	return [baseClasses, conditionalClasses, disabledClasses].filter(Boolean).join(' ')
}

// Check if a field has a valid value
const isValidField = (fieldKey: string) => {
	const value = props.formValues[fieldKey]
	// Find the corresponding prop
	const prop = props.nodeProps.find((p) => p.key === fieldKey)

	// If the field has a custom validation function, use it
	if (prop?.validate) {
		const result = prop.validate(value, props.formValues)
		if (!result.valid) {
			validationMessages.value[fieldKey] = result.message || 'Invalid value'
			return false
		}
	}

	// Disabled fields with a value are considered valid
	if (prop?.disabled && value !== undefined && value !== null && value !== '') {
		return true
	}

	// AI mode fields are considered valid regardless of manual input (only if prop is AI-enabled)
	if (prop?.ai_enabled && aiMode[fieldKey] === 'ai') {
		delete validationMessages.value[fieldKey]
		return true
	}

	// Basic validation - field has a value
	const hasValue = value !== undefined && value !== null && value !== ''
	if (!hasValue) {
		validationMessages.value[fieldKey] = 'Required'
	} else {
		delete validationMessages.value[fieldKey]
	}

	return hasValue
}

// Get validation message for a field
const getValidationMessage = (fieldKey: string) => {
	return validationMessages.value[fieldKey] || ''
}

// Validate the form before saving
const validateAndSave = () => {
	showValidation.value = true
	validationMessages.value = {}

	// Check for required fields (only in manual mode)
	const requiredProps = props.nodeProps.filter((prop) => prop.required)
	const invalidFields = requiredProps.filter((prop) => !isValidField(prop.key))

	// Also check any fields with custom validation
	const customValidationProps = props.nodeProps.filter((prop) => prop.validate && !invalidFields.includes(prop))
	customValidationProps.forEach((prop) => {
		if (props.formValues[prop.key] !== undefined && props.formValues[prop.key] !== null) {
			isValidField(prop.key)
		}
	})

	if (invalidFields.length > 0 || Object.keys(validationMessages.value).length > 0) {
		hasValidationErrors.value = true
		return
	}

	const resolvedValues: Record<string, any> = {}
	for (const key in props.formValues) {
		const val = props.formValues[key]
		resolvedValues[key] = val
	}

	// Create AI enabled fields list - only include props that are AI-enabled and set to AI mode
	const aiEnabledFields = Object.keys(aiMode).filter((key) => {
		const prop = props.nodeProps.find((p) => p.key === key)
		return prop?.ai_enabled && aiMode[key] === 'ai'
	})

	const nonCloneables = props.nodeProps.filter((prop) => {
		// Include fields that are explicitly marked as non-cloneable
		if (prop.cloneable === false) return true

		// Include fields with function values (they should be re-evaluated)
		if (prop.value && typeof prop.value === 'function') return true

		// Include fields with special user-specific values
		if (prop.value === 'USER_EMAIL') return true

		// Include disabled properties
		if (prop.disabled) return true

		// Include properties that have validation functions (they might be context-specific)
		if (prop.validate) return true

		return false
	}).map((prop) => prop.key)

	hasValidationErrors.value = false
	emit('save', { ...resolvedValues, aiEnabledFields, nonCloneables })
}

const closeModal = () => {
	emit('cancel')
}

// Populate default values
onMounted(() => {
	setTimeout(() => {
		props.nodeProps.forEach((prop) => {
			// Initialize AI mode - only for AI-enabled props
			if (prop.ai_enabled) {
				// Check if this prop was previously set to AI mode
				if (props.payload.aiEnabledFields && props.payload.aiEnabledFields.includes(prop.key)) {
					aiMode[prop.key] = 'ai'
				} else {
					aiMode[prop.key] = 'manual'
				}
			}

			// Check if this is a new property not in the saved node data
			const isNewProperty = props.formValues[prop.key] === undefined

			// Handle special value markers
			if (prop.value === 'USER_EMAIL') {
				try {
					const userEmail = useUser().user.value?.email
					if (userEmail) {
						props.formValues[prop.key] = userEmail
					}
				} catch (error) {
					console.error(`Error getting user email for ${prop.name}:`, error)
				}
			// If property has a value function, evaluate it but don't store the function itself
			} else if (prop.value && typeof prop.value === 'function') {
				try {
					const value = prop.value()
					// Only set if the value is not undefined
					if (value !== undefined) {
						props.formValues[prop.key] = value
					}
				} catch (error) {
					console.error(`Error evaluating value function for ${prop.name}:`, error)
				}
			// For new properties without a value function, set default values based on type
			} else if (isNewProperty) {
				switch (prop.type) {
					case 'select':
						// For select, use first option or empty string
						if (prop.options && prop.options.length > 0) {
							const firstOption = prop.options[0]
							props.formValues[prop.key] = typeof firstOption === 'object' ? firstOption.value : firstOption
						} else {
							props.formValues[prop.key] = ''
						}
						break
					case 'number':
						props.formValues[prop.key] = 0
						break
					case 'boolean':
						props.formValues[prop.key] = false
						break
					default:
						// For text, email, textarea, etc.
						props.formValues[prop.key] = ''
				}
			}
		})
	}, 100)
})
</script>



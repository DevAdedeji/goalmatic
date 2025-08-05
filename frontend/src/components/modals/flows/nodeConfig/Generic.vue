<template>
	<div>
		<!-- Properties Form -->
		<form class="flex flex-col gap-6" @submit.prevent="validateAndSave">
			<div v-if="!hasProps" class="text-center py-4 text-text-secondary">
				This node has no configurable properties.
			</div>

			<template v-else>
				<div
					v-for="(prop, index) in processedNodeProps"
					:key="`${index}-${prop.disabled}`"
					class="flex flex-col gap-2"
				>
					<!-- AI Mode Toggle -->
					<div class="flex items-center justify-between mb-1">
						<label class="text-sm flex items-center">
							<span
								:class="{
									'text-text-secondary': !prop.required,
									'font-medium': prop.required,
								}"
							>
								{{ prop.name }}
							</span>
							<span v-if="prop.required" class="text-danger ml-1"
							>*</span
							>
							<span
								v-if="showValidation && !isValidField(prop.key)"
								class="text-danger text-xs ml-2"
							>
								{{ getValidationMessage(prop.key) }}
							</span>

							<!-- Info icon with tooltip for description -->
							<Tooltip
								v-if="prop.description"
								placement="top"
								class="ml-2"
							>
								<template #trigger>
									<InfoIcon
										:size="14"
										class="text-gray-400 hover:text-primary cursor-help"
									/>
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
						v-if="
							prop.type === 'mentionTextarea' ||
								prop.type === 'mentionInput'
						"
						v-model="formValues[prop.key]"
						:mention-items="props.previousNodeOutputs"
						:class-node="
							[
								prop.type === 'mentionTextarea'
									? 'input-textarea min-h-[110px]'
									: 'input-field',
								prop.ai_enabled && aiMode[prop.key] === 'ai'
									? 'ai-mode-input'
									: '',
							]
								.filter(Boolean)
								.join(' ')
						"
					/>

					<input
						v-else-if="prop.type === 'text'"
						v-model="formValues[prop.key]"
						type="text"
						:required="
							prop.required &&
								(!prop.ai_enabled || aiMode[prop.key] === 'manual')
						"
						:disabled="prop.disabled"
						:class="getInputClasses(prop)"
						:placeholder="
							prop.ai_enabled && aiMode[prop.key] === 'ai'
								? `Enter prompt for ${prop.name.toLowerCase()}`
								: `Enter ${prop.name.toLowerCase()}`
						"
					>

					<textarea
						v-else-if="prop.type === 'textarea'"
						v-model="formValues[prop.key]"
						:required="
							prop.required &&
								(!prop.ai_enabled || aiMode[prop.key] === 'manual')
						"
						:disabled="prop.disabled"
						rows="4"
						:class="getInputClasses(prop)"
						:placeholder="
							prop.ai_enabled && aiMode[prop.key] === 'ai'
								? `Enter prompt for ${prop.name.toLowerCase()}`
								: `Enter ${prop.name.toLowerCase()}`
						"
					/>

					<!-- Number Input -->
					<input
						v-else-if="prop.type === 'number'"
						v-model.number="formValues[prop.key]"
						type="number"
						:required="
							prop.required &&
								(!prop.ai_enabled || aiMode[prop.key] === 'manual')
						"
						:disabled="prop.disabled"
						:class="getInputClasses(prop)"
						:placeholder="
							prop.ai_enabled && aiMode[prop.key] === 'ai'
								? 'Enter prompt for number value'
								: 'Enter a number'
						"
					>

					<!-- Date Input -->
					<input
						v-else-if="prop.type === 'date'"
						v-model="formValues[prop.key]"
						type="date"
						:required="
							prop.required &&
								(!prop.ai_enabled || aiMode[prop.key] === 'manual')
						"
						:disabled="prop.disabled"
						:class="getInputClasses(prop)"
					>

					<!-- Time Input -->
					<input
						v-else-if="prop.type === 'time'"
						v-model="formValues[prop.key]"
						type="time"
						:required="
							prop.required &&
								(!prop.ai_enabled || aiMode[prop.key] === 'manual')
						"
						:disabled="prop.disabled"
						:class="getInputClasses(prop)"
					>

					<!-- Regular Select Dropdown -->
					<Select
						v-else-if="prop.type === 'select'"
						v-model="formValues[prop.key]"
						:options="getSelectOptions(prop)"
						:placeholder="
							prop.ai_enabled && aiMode[prop.key] === 'ai'
								? 'AI will select based on context'
								: 'Select an option'
						"
						:required="
							prop.required &&
								(!prop.ai_enabled || aiMode[prop.key] === 'manual')
						"
						:disabled="prop.disabled"
						:class="getInputClasses(prop)"
					/>

					<!-- Searchable Select with API calls -->
					<SearchableSelect
						v-else-if="prop.type === 'searchableSelect'"
						v-model="formValues[prop.key]"
						:options="prop.options || []"
						:placeholder="
							prop.ai_enabled && aiMode[prop.key] === 'ai'
								? 'AI will select based on context'
								: 'Select an option'
						"
						:required="
							prop.required &&
								(!prop.ai_enabled || aiMode[prop.key] === 'manual')
						"
						:disabled="prop.disabled"
						:loading="prop.loading || false"
						:load-options="prop.loadOptions || undefined"
						:searchable="true"
						:input-class="getInputClasses(prop)"
						:loading-text="prop.loadingText || 'Loading...'"
						:search-placeholder="
							prop.searchPlaceholder || 'Search...'
						"
						:min-search-length="prop.minSearchLength || 0"
					/>

					<!-- Email Input -->
					<input
						v-else-if="prop.type === 'email'"
						v-model="formValues[prop.key]"
						type="email"
						:required="
							prop.required &&
								(!prop.ai_enabled || aiMode[prop.key] === 'manual')
						"
						:disabled="prop.disabled"
						:class="getInputClasses(prop)"
						:placeholder="
							prop.ai_enabled && aiMode[prop.key] === 'ai'
								? 'Enter prompt for email content'
								: 'Enter email address'
						"
					>

					<!-- Checkbox Input -->
					<div
						v-else-if="prop.type === 'checkbox'"
						class="flex items-center"
					>
						<input
							:id="`checkbox-${prop.key}`"
							v-model="formValues[prop.key]"
							type="checkbox"
							:disabled="prop.disabled"
							class="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
						>
						<label
							:for="`checkbox-${prop.key}`"
							class="ml-2 text-sm text-gray-700"
						>
							{{ prop.description || "Enable this option" }}
						</label>
					</div>

					<!-- Email Display Field (for showing generated email addresses with copy functionality) -->
					<div v-else-if="prop.type === 'email_display'" class="flex">
						<EmailDisplayField
							v-model="formValues[prop.key]"
							:description="prop.description"
							:placeholder="prop.placeholder"
							:required="prop.required"
							:disabled="prop.disabled"
							:copyable="prop.copyable"
							:auto-generate="prop.auto_generate"
							:flow-id="payload?.flow_id || payload?.id || route.params.id"
							:show-instructions="true"
							@generated="(email) => (formValues[prop.key] = email)"
							@copied="(email) => console.log('Copied email:', email)"
						/>

						<!-- Email Trigger Testing Component (only for email triggers) -->
						<EmailTriggerTester
							v-if="prop.type === 'email_display' && isEmailTriggerNode && formValues[prop.key]"
							:trigger-email="formValues[prop.key]"
							:flow-id="payload?.flow_id || payload?.id || route.params.id"
						/>
					</div>


					<!-- Default Text Input for any other type -->
					<input
						v-else
						v-model="formValues[prop.key]"
						type="text"
						:required="
							prop.required &&
								(!prop.ai_enabled || aiMode[prop.key] === 'manual')
						"
						:disabled="prop.disabled"
						:class="getInputClasses(prop)"
						:placeholder="
							prop.ai_enabled && aiMode[prop.key] === 'ai'
								? `Enter prompt for ${prop.name.toLowerCase()}`
								: `Enter ${prop.name.toLowerCase()}`
						"
					>
					<div
						v-if="prop.ai_enabled && aiMode[prop.key] === 'ai'"
						class="mb-2 rounded-md text-sm text-primary italic"
					>
						<span
						>Write a prompt for the AI to generate content
							from</span
						>
					</div>
				</div>
			</template>

			<!-- Required fields alert -->
			<div
				v-if="showValidation && hasValidationErrors"
				class="p-3 bg-danger-50 border border-danger-200 rounded-md text-danger-800 text-sm"
			>
				<p class="font-semibold">
					Please address the following issues before saving:
				</p>
				<ul
					v-if="Object.keys(validationMessages).length > 0"
					class="mt-2 ml-4 list-disc"
				>
					<li
						v-for="(message, field) in validationMessages"
						:key="field"
					>
						{{ field }}: {{ message }}
					</li>
				</ul>
				<p v-else>
					Please fill in all required fields before saving.
				</p>
			</div>

			<!-- Test Node Section (only for testable nodes) -->
			<div
				v-if="isTestableNode"
				class="border-t border-gray-200 pt-4 mt-4"
			>
				<div class="flex items-center justify-between mb-3">
					<h3 class="text-sm font-medium text-gray-700">
						Test Node
					</h3>
					<button
						type="button"
						class="btn-outline !px-3 !py-1 text-sm"
						:disabled="testLoading || !canTestNode"
						@click="handleTestNode"
					>
						<span v-if="!testLoading">Test</span>
						<span v-else class="flex items-center gap-2">
							<svg
								class="animate-spin h-3 w-3"
								viewBox="0 0 24 24"
							>
								<circle
									class="opacity-25"
									cx="12"
									cy="12"
									r="10"
									stroke="currentColor"
									stroke-width="4"
									fill="none"
								/>
								<path
									class="opacity-75"
									fill="currentColor"
									d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
								/>
							</svg>
							Testing...
						</span>
					</button>
				</div>

				<!-- Test Result Display -->
				<div
					v-if="testResult"
					class="mt-3 p-3 border rounded-md text-sm"
					:class="
						testResult.success
							? 'bg-green-50 border-green-200'
							: 'bg-red-50 border-red-200'
					"
				>
					<div class="flex justify-between items-start mb-2">
						<h4
							class="font-medium"
							:class="
								testResult.success
									? 'text-green-800'
									: 'text-red-800'
							"
						>
							{{
								testResult.success
									? "Test Successful"
									: "Test Failed"
							}}
						</h4>
						<button
							type="button"
							class="text-gray-400 hover:text-gray-600"
							@click="clearTestResult"
						>
							<svg
								class="w-4 h-4"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M6 18L18 6M6 6l12 12"
								/>
							</svg>
						</button>
					</div>

					<p
						class="text-xs mb-2"
						:class="
							testResult.success
								? 'text-green-600'
								: 'text-red-600'
						"
					>
						Duration: {{ testResult.duration }}
					</p>

					<!-- Success Result -->
					<div
						v-if="testResult.success && testResult.result"
						class="max-h-40 overflow-y-auto bg-white border rounded p-2"
					>
						<div
							v-if="testResult.result.payload?.extractedData"
							class="mb-2"
						>
							<h5 class="text-xs font-medium mb-1">
								Extracted Data:
							</h5>
							<pre
								class="text-xs whitespace-pre-wrap bg-gray-50 p-2 rounded"
							>{{
                                    JSON.stringify(
                                        testResult.result.payload.extractedData,
                                        null,
                                        2,
                                    )
							}}</pre
							>
						</div>
						<div
							v-if="
								testResult.result.payload?.extractorContent &&
									testResult.result.payload.extractorContent !==
									JSON.stringify(
										testResult.result.payload.extractedData,
										null,
										2,
									)
							"
						>
							<h5 class="text-xs font-medium mb-1">
								Formatted Output:
							</h5>
							<pre
								class="text-xs whitespace-pre-wrap bg-gray-50 p-2 rounded"
							>{{
                                    testResult.result.payload.extractorContent
							}}</pre
							>
						</div>
						<div v-if="!testResult.result.payload?.extractedData">
							<pre class="text-xs whitespace-pre-wrap">{{
                                JSON.stringify(testResult.result, null, 2)
							}}</pre>
						</div>
					</div>

					<!-- Error Result -->
					<div v-else-if="!testResult.success" class="text-red-700">
						{{ testResult.error || "Unknown error occurred" }}
					</div>
				</div>
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
import { ref, onMounted, computed, reactive, watch } from 'vue'
import { Info as InfoIcon } from 'lucide-vue-next'
import { useUser } from '@/composables/auth/user'
import { useTestNode } from '@/composables/dashboard/flows/nodes/test'
import Tooltip from '@/components/core/Tooltip.vue'
import MentionEditor from '@/components/core/MentionEditor/index.vue'
import SearchableSelect from '@/components/core/SearchableSelect.vue'
import Select from '@/components/core/Select.vue'
import EmailDisplayField from '@/components/flows/EmailDisplayField.vue'
import EmailTriggerTester from '@/components/flows/EmailTriggerTester.vue'
import type { FlowNodeProp } from '@/composables/dashboard/flows/nodes/types'

const route = useRoute()

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

// User composable for getting user's agents
const { user: _user } = useUser()



// Check if this is an email trigger node
const isEmailTriggerNode = computed(() => {
    return props.payload?.node_id === 'EMAIL_TRIGGER' || props.payload?.type === 'EMAIL_TRIGGER'
})



// Test node functionality
const {
    loading: testLoading,
    testResult,
    testNode,
    clearTestResult
} = useTestNode()

// Check if this node is testable
const isTestableNode = computed(() => {
    return props.payload?.isTestable === true
})

// Check if we can test the node (all required fields filled)
const canTestNode = computed(() => {
    if (!isTestableNode.value) return false

    // Check that all required fields are filled
    const requiredProps = processedNodeProps.value.filter(
        (prop) => prop.required
    )
    return requiredProps.every((prop) => {
        const value = props.formValues[prop.key]
        return value !== undefined && value !== null && value !== ''
    })
})

// Process node props with conditional disabling and hiding logic
const processedNodeProps = computed(() => {
    // Create a copy of formValues to ensure reactivity
    const currentFormValues = { ...props.formValues }

    return props.nodeProps
        .map((prop) => {
            const processedProp = { ...prop }

            // If prop has a disabledFunc, evaluate it with current form values
            if (prop.disabledFunc && typeof prop.disabledFunc === 'function') {
                try {
                    const shouldDisable = prop.disabledFunc(currentFormValues)
                    processedProp.disabled = Boolean(shouldDisable)
                } catch (error) {
                    console.error(
                        `Error evaluating disabledFunc for ${prop.key}:`,
                        error
                    )
                }
            }

            // If prop has a hiddenFunc, evaluate it with current form values
            if (prop.hiddenFunc && typeof prop.hiddenFunc === 'function') {
                try {
                    const shouldHide = prop.hiddenFunc(currentFormValues)
                    processedProp.hidden = Boolean(shouldHide)
                } catch (error) {
                    console.error(
                        `Error evaluating hiddenFunc for ${prop.key}:`,
                        error
                    )
                }
            }

            return processedProp
        })
        .filter((prop) => !prop.hidden) // Filter out hidden props
})

// Handle test node button click
const handleTestNode = async () => {
    if (!isTestableNode.value || !canTestNode.value) return

    // Prepare the props data for testing
    const testPropsData: Record<string, any> = {}
    for (const key in props.formValues) {
        testPropsData[key] = props.formValues[key]
    }

    // Create AI enabled fields list for testing
    const aiEnabledFields = Object.keys(aiMode).filter((key) => {
        const prop = props.nodeProps.find((p) => p.key === key)
        return prop?.ai_enabled && aiMode[key] === 'ai'
    })

    await testNode(props.payload?.node_id, props.payload, {
        ...testPropsData,
        aiEnabledFields
    })
}

// Handle AI mode change
const handleAiModeChange = (_propKey: string) => {
    // Don't clear the value when switching modes - users can enter prompts in AI mode
    // The field value will be treated as either content (manual) or prompt (AI) based on the mode
}

// Generate input classes based on prop state
const getInputClasses = (prop: FlowNodeProp) => {
    const baseClasses =
        'border rounded-md px-3 py-2 focus:ring-1 focus:ring-primary outline-none'

    let conditionalClasses = ''
    if (showValidation.value && !isValidField(prop.key)) {
        conditionalClasses =
            'border-danger-300 bg-danger-50 focus:border-danger'
    } else if (prop.ai_enabled && aiMode[prop.key] === 'ai') {
        conditionalClasses = 'ai-mode-input'
    } else {
        conditionalClasses = 'border-border focus:border-primary'
    }

    const disabledClasses = prop.disabled
        ? 'bg-gray-100 cursor-not-allowed opacity-75'
        : ''

    return [baseClasses, conditionalClasses, disabledClasses]
        .filter(Boolean)
        .join(' ')
}

// Check if a field has a valid value
const isValidField = (fieldKey: string) => {
    const value = props.formValues[fieldKey]
    // Find the corresponding prop
    const prop = processedNodeProps.value.find((p) => p.key === fieldKey)

    // Hidden fields are always considered valid (don't validate them)
    if (prop?.hidden) {
        delete validationMessages.value[fieldKey]
        return true
    }

    // If the field has a custom validation function, use it
    if (prop?.validate) {
        const result = prop.validate(value, props.formValues)
        if (!result.valid) {
            validationMessages.value[fieldKey] =
                result.message || 'Invalid value'
            return false
        }
    }

    // Disabled fields with a value are considered valid
    if (
        prop?.disabled &&
        value !== undefined &&
        value !== null &&
        value !== ''
    ) {
        delete validationMessages.value[fieldKey]
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
    // Clear previous validation messages first
    validationMessages.value = {}
    hasValidationErrors.value = false

    // Check for required fields (only in manual mode and only visible fields)
    const requiredProps = processedNodeProps.value.filter(
        (prop) => prop.required && !prop.hidden
    )
    const invalidFields = requiredProps.filter(
        (prop) => !isValidField(prop.key)
    )

    // Also check any fields with custom validation (only visible fields)
    const customValidationProps = processedNodeProps.value.filter(
        (prop) =>
            prop.validate && !prop.hidden && !invalidFields.includes(prop)
    )
    customValidationProps.forEach((prop) => {
        if (
            props.formValues[prop.key] !== undefined &&
            props.formValues[prop.key] !== null
        ) {
            isValidField(prop.key)
        }
    })

    // Only show validation UI if there are actual errors
    if (
        invalidFields.length > 0 ||
        Object.keys(validationMessages.value).length > 0
    ) {
        showValidation.value = true
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

    const nonCloneables = props.nodeProps
        .filter((prop) => {
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
        })
        .map((prop) => prop.key)

    // Reset validation state on successful save
    showValidation.value = false
    hasValidationErrors.value = false
    emit('save', { ...resolvedValues, aiEnabledFields, nonCloneables })
}

const closeModal = () => {
    // Reset validation state when closing modal
    showValidation.value = false
    hasValidationErrors.value = false
    validationMessages.value = {}
    emit('cancel')
}

// Populate default values reactively
const initializeFormValues = () => {
    props.nodeProps.forEach((prop) => {
        // Initialize AI mode - only for AI-enabled props
        if (prop.ai_enabled) {
            // Only initialize AI mode if not already set
            if (aiMode[prop.key] === undefined) {
                // Check if this prop was previously set to AI mode
                if (
                    props.payload.aiEnabledFields &&
                    props.payload.aiEnabledFields.includes(prop.key)
                ) {
                    aiMode[prop.key] = 'ai'
                } else {
                    aiMode[prop.key] = 'manual'
                }
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
                console.error(
                    `Error getting user email for ${prop.name}:`,
                    error
                )
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
                console.error(
                    `Error evaluating value function for ${prop.name}:`,
                    error
                )
            }
            // For new properties without a value function, set default values based on type
        } else if (isNewProperty) {
            switch (prop.type) {
                case 'select':
                    // For select, use first option or empty string
                    if (prop.options && prop.options.length > 0) {
                        const firstOption = prop.options[0]
                        // Handle boolean values properly
                        if (typeof firstOption === 'object') {
                            props.formValues[prop.key] = firstOption.value
                        } else {
                            props.formValues[prop.key] = firstOption
                        }
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
}

// Watch for changes in nodeProps and update form values accordingly
watch(
    () => props.nodeProps,
    () => {
        setTimeout(() => {
            initializeFormValues()
        }, 100)
    },
    { immediate: true, deep: true }
)

// Watch for changes in form values to clear validation messages when user fixes issues
watch(
    () => props.formValues,
    () => {
        if (showValidation.value) {
            // Re-validate fields and clear messages for valid fields
            const requiredProps = processedNodeProps.value.filter(
                (prop) => prop.required && !prop.hidden
            )
            requiredProps.forEach((prop) => {
                if (isValidField(prop.key)) {
                    delete validationMessages.value[prop.key]
                }
            })

            // If all validation messages are cleared, hide the validation UI
            if (Object.keys(validationMessages.value).length === 0) {
                hasValidationErrors.value = false
            }
        }
    },
    { deep: true }
)

// Also initialize on mount for safety
onMounted(() => {
    setTimeout(() => {
        initializeFormValues()
    }, 100)
})

// Helper methods for Select and SearchableSelect
const getSelectOptions = (prop: FlowNodeProp) => {
    // For searchableSelect with loadOptions, options will be loaded dynamically
    if (prop.type === 'searchableSelect' && prop.loadOptions) {
        return []
    }

    // For regular select and searchableSelect with static options
    if (!prop.options) return []

    return prop.options.map((option: any) => {
        if (typeof option === 'object') {
            return {
                value: option.value,
                label: option.name || option.label || String(option.value),
                description: option.description
            }
        }
        return {
            value: option,
            label: String(option)
        }
    })
}
</script>

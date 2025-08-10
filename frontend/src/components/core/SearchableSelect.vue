<template>
	<div class="relative">
		<!-- Input field for search/display -->
		<div class="relative">
			<input
				ref="searchInput"
				v-model="searchQuery"
				type="text"
				:placeholder="inputPlaceholder"
				:class="getInputClasses()"
				:disabled="disabled"
				:required="required"
				@focus="handleFocus"
				@blur="handleBlur"
				@input="handleSearch"
				@keydown="handleKeydown"
			>
			<div class="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
				<svg
					v-if="!loading"
					class="h-4 w-4 text-gray-400 transition-transform duration-200"
					:class="{ 'rotate-180': isOpen }"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
				</svg>
				<svg
					v-else
					class="h-4 w-4 text-gray-400 animate-spin"
					viewBox="0 0 24 24"
				>
					<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" />
					<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
				</svg>
			</div>
		</div>

		<!-- Dropdown options -->
		<div
			v-if="isOpen && (filteredOptions.length > 0 || hasCustomOptions)"
			class="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto"
		>
			<!-- Regular options -->
			<div
				v-for="option in filteredOptions"
				:key="getOptionValue(option)"
				class="px-3 py-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
				:class="{
					'bg-primary-50 border-primary-200': isSelected(option),
					'bg-gray-100': highlightedIndex === filteredOptions.indexOf(option)
				}"
				@click="selectOption(option)"
				@mouseenter="highlightedIndex = filteredOptions.indexOf(option)"
			>
				<div class="flex items-start justify-between">
					<div class="flex-1">
						<div class="font-medium text-gray-900">
							{{ getOptionLabel(option) }}
						</div>
						<div v-if="getOptionDescription(option)" class="text-sm text-gray-600 mt-1">
							{{ getOptionDescription(option) }}
						</div>
						<div v-if="getOptionBadges(option).length > 0" class="flex items-center gap-2 mt-2">
							<span
								v-for="badge in getOptionBadges(option)"
								:key="badge.text"
								class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
								:class="badge.class"
							>
								{{ badge.text }}
							</span>
						</div>
					</div>
					<div v-if="isSelected(option)" class="ml-3">
						<svg class="h-5 w-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
							<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
						</svg>
					</div>
				</div>
			</div>

			<!-- No results message -->
			<div
				v-if="searchQuery && filteredOptions.length === 0 && !loading && !hasCustomOptions"
				class="px-3 py-2 text-center text-gray-500"
			>
				No results found for "{{ searchQuery }}"
			</div>

			<!-- Loading state -->
			<div v-if="loading" class="px-3 py-2 text-center text-gray-500">
				<div class="flex items-center justify-center gap-2">
					<svg class="animate-spin h-4 w-4" viewBox="0 0 24 24">
						<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" />
						<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
					</svg>
					{{ loadingText }}
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'

interface Option {
	id: string | number
	name: string
	description?: string
	badges?: Array<{
		text: string
		class: string
	}>
	[key: string]: any
}

interface Props {
	modelValue?: string | number | null
	options?: Option[]
	placeholder?: string
	searchPlaceholder?: string
	disabled?: boolean
	required?: boolean
	loading?: boolean
	loadingText?: string
	// Function to load options dynamically (for async data like agents)
	loadOptions?: (query: string) => Promise<Option[]>
	// Custom option handling
	optionIdKey?: string
	optionNameKey?: string
	optionDescriptionKey?: string
	optionBadgesKey?: string
	// Styling
	inputClass?: string
	// Search behavior
	searchable?: boolean
	minSearchLength?: number
}

const props = withDefaults(defineProps<Props>(), {
	placeholder: 'Select an option...',
	searchPlaceholder: 'Search...',
	loadingText: 'Loading...',
	optionIdKey: 'id',
	optionNameKey: 'name',
	optionDescriptionKey: 'description',
	optionBadgesKey: 'badges',
	searchable: true,
	minSearchLength: 0
})

const emit = defineEmits<{
	'update:modelValue': [value: string | number | null]
	'search': [query: string]
	'focus': []
	'blur': []
}>()

// Component state
const searchInput = ref<HTMLInputElement>()
const searchQuery = ref('')
const isOpen = ref(false)
const highlightedIndex = ref(-1)
const dynamicOptions = ref<Option[]>([])

// Computed properties
const allOptions = computed(() => {
	if (props.loadOptions) {
		return dynamicOptions.value
	}
	return props.options || []
})

const filteredOptions = computed(() => {
	if (!props.searchable || !searchQuery.value) {
		return allOptions.value
	}

	const query = searchQuery.value.toLowerCase()
	return allOptions.value.filter((option) => {
		const name = getOptionLabel(option).toLowerCase()
		const description = getOptionDescription(option)?.toLowerCase() || ''
		return name.includes(query) || description.includes(query)
	})
})

const selectedOption = computed(() => {
    if (props.modelValue == null) return null
    return allOptions.value.find((option) => getOptionValue(option) === props.modelValue)
})

const inputPlaceholder = computed(() => {
    // Always use explicit placeholders. The selected value should be displayed
    // as the actual input text (via searchQuery), not as placeholder.
    return isOpen.value ? props.searchPlaceholder : props.placeholder
})

const hasCustomOptions = computed(() => {
	return !!props.loadOptions
})

// Helper functions
const getOptionValue = (option: Option): string | number => {
	return option[props.optionIdKey] || option.id
}

const getOptionLabel = (option: Option): string => {
	return option[props.optionNameKey] || option.name || String(getOptionValue(option))
}

const getOptionDescription = (option: Option): string | undefined => {
	return option[props.optionDescriptionKey] || option.description
}

const getOptionBadges = (option: Option): Array<{ text: string; class: string }> => {
	return option[props.optionBadgesKey] || option.badges || []
}

const isSelected = (option: Option): boolean => {
	return getOptionValue(option) === props.modelValue
}

const getInputClasses = (): string => {
	const baseClasses = 'w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent'
	const stateClasses = props.disabled
		? 'bg-gray-100 border-gray-300 text-gray-500 cursor-not-allowed'
		: 'bg-white border-gray-300 text-gray-900'
	const customClasses = props.inputClass || ''

	return `${baseClasses} ${stateClasses} ${customClasses}`.trim()
}

// Event handlers
const handleFocus = async () => {
	if (props.disabled) return

	isOpen.value = true
	searchQuery.value = ''
	highlightedIndex.value = -1

	// Load options if using dynamic loading
	if (props.loadOptions) {
		await loadDynamicOptions('')
	}

	emit('focus')
}

const handleBlur = () => {
	// Delay closing to allow click events on options
	setTimeout(() => {
		isOpen.value = false

		// Reset search query to show selected value
		if (selectedOption.value) {
			searchQuery.value = getOptionLabel(selectedOption.value)
		} else {
			searchQuery.value = ''
		}

		emit('blur')
	}, 150)
}

const handleSearch = async () => {
	emit('search', searchQuery.value)

	if (props.loadOptions && searchQuery.value.length >= props.minSearchLength) {
		await loadDynamicOptions(searchQuery.value)
	}
}

const handleKeydown = (event: KeyboardEvent) => {
	if (!isOpen.value) {
		if (event.key === 'ArrowDown' || event.key === 'Enter') {
			event.preventDefault()
			handleFocus()
		}
		return
	}

	switch (event.key) {
		case 'ArrowDown':
			event.preventDefault()
			highlightedIndex.value = Math.min(highlightedIndex.value + 1, filteredOptions.value.length - 1)
			break
		case 'ArrowUp':
			event.preventDefault()
			highlightedIndex.value = Math.max(highlightedIndex.value - 1, -1)
			break
		case 'Enter':
			event.preventDefault()
			if (highlightedIndex.value >= 0 && filteredOptions.value[highlightedIndex.value]) {
				selectOption(filteredOptions.value[highlightedIndex.value])
			}
			break
		case 'Escape':
			event.preventDefault()
			isOpen.value = false
			searchInput.value?.blur()
			break
	}
}

const selectOption = (option: Option) => {
	const value = getOptionValue(option)
	emit('update:modelValue', value)
	searchQuery.value = getOptionLabel(option)
	isOpen.value = false
	highlightedIndex.value = -1
}

const loadDynamicOptions = async (query: string) => {
	if (!props.loadOptions) return

	try {
		dynamicOptions.value = await props.loadOptions(query)
	} catch (error) {
		console.error('Error loading options:', error)
		dynamicOptions.value = []
	}
}

// Initialize component
onMounted(() => {
	if (selectedOption.value) {
		searchQuery.value = getOptionLabel(selectedOption.value)
	}

	// Load initial options if using dynamic loading
	if (props.loadOptions) {
		loadDynamicOptions('')
	}
})

// Watch for external model value changes
watch(() => props.modelValue, (newValue) => {
    if (newValue != null && selectedOption.value) {
		searchQuery.value = getOptionLabel(selectedOption.value)
	} else {
		searchQuery.value = ''
	}
})

// Also watch for options changing (e.g., async-loaded options) so that once the
// selected option becomes available, we reflect its label in the input text.
watch(() => allOptions.value, () => {
    if (props.modelValue == null) return
    const option = allOptions.value.find((opt) => getOptionValue(opt) === props.modelValue)
    if (option) {
        searchQuery.value = getOptionLabel(option)
    }
})

// Click outside handler
const handleClickOutside = (event: Event) => {
	const target = event.target as Element
	if (searchInput.value && !searchInput.value.contains(target)) {
		isOpen.value = false
	}
}

onMounted(() => {
	document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
	document.removeEventListener('click', handleClickOutside)
})
</script>

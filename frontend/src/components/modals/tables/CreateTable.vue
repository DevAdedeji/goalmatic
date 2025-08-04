<template>
	<Modal
		modal="$atts.modal"
		:title="isEditMode ? 'Edit Table' : 'Create Table'"
		:is-full-height="false"
		:props-modal="propsModal"
		modal-content-class="p-0 "
		size="xl"
	>
		<template #header>
			<div class="flex flex-col relative w-full">
				<h2 class="text-lg font-semibold">
					{{ isEditMode ? 'Edit your table' : 'Create a new table' }}
				</h2>
				<p class="text-sm text-[#535862]">
					{{ isEditMode ? 'Update your table name and description' : 'Give your table a name and description' }}
				</p>

				<button class="absolute top-0 right-0 " type="button" @click="closeCreateTable">
					<X class="size-6" />
				</button>
			</div>
		</template>

		<!-- Tab Navigation (only show for create mode) -->
		<div v-if="!isEditMode" class="tabs mx-2.5 mt-4">
			<button
				type="button"
				class="tab-btn flex-1"
				:class="activeTab === 'manual' ? 'active' : ''"
				@click="activeTab = 'manual'"
			>
				Manual
			</button>
			<button
				type="button"
				class="tab-btn flex-1"
				:class="activeTab === 'ai' ? 'active' : ''"
				@click="activeTab = 'ai'"
			>
				✨ AI Generated
			</button>
		</div>

		<form class="flex flex-col" @submit.prevent="isEditMode ? updateTableModal() : (activeTab === 'ai' ? generateFields() : createTableModal())">
			<div class="p-2.5">
				<section class="flex flex-col p-2.5 gap-4 bg-[#F9FAFB] rounded-[10px]">
					<!-- Manual Mode Content -->
					<div v-if="isEditMode || activeTab === 'manual'">
						<div class="field relative mt-6">
							<label for="name">Table Name</label>
							<input
								v-model="formData.name"
								required
								class="input-field"
								placeholder="Give your table a name"
							>
						</div>
						<div class="field relative mt-4">
							<label for="description">Table Description</label>
							<textarea
								v-model="formData.description"
								class="input-textarea"
								rows="4"
								placeholder="Describe what this table is for"
							/>
						</div>

						<!-- Show current fields in manual tab when they exist -->
						<div v-if="!isEditMode && createTableForm.fields.length > 0" class="border-t pt-4">
							<h4 class="text-sm font-medium text-gray-700 mb-2">
								Current Fields ({{ createTableForm.fields.length }}):
							</h4>
							<div class="bg-white border rounded-lg p-3 max-h-48 overflow-y-auto">
								<div v-for="field in createTableForm.fields" :key="field.id" class="flex justify-between items-center py-2 border-b last:border-b-0">
									<div class="flex-1">
										<div class="flex items-center gap-2">
											<span class="font-medium text-sm">{{ field.name }}</span>
											<span class="text-xs bg-gray-100 px-2 py-1 rounded">{{ field.type }}</span>
											<span v-if="field.required" class="text-xs text-red-500">*</span>
										</div>
										<p v-if="field.description" class="text-xs text-gray-500 mt-1">
											{{ field.description }}
										</p>
										<p v-if="field.options && field.options.length" class="text-xs text-gray-500 mt-1">
											Options: {{ field.options.join(', ') }}
										</p>
									</div>
								</div>
							</div>
							<p class="text-xs text-gray-500 mt-2">
								💡 You can continue with these fields or switch to the AI tab to regenerate them.
							</p>
						</div>
					</div>

					<!-- AI Mode Content -->
					<div v-else-if="activeTab === 'ai'" class="mt-6">
						<div class="field relative">
							<div class="flex items-center gap-2">
								<label for="ai-prompt">Describe your table</label>
								<Tooltip>
									<template #trigger>
										<Info class="size-4 text-gray-400 hover:text-gray-600 cursor-help" />
									</template>
									<template #content>
										<div class="max-w-md p-3 bg-transparent rounded-lg shadow-lg">
											<p class="text-xs">
												💡 <strong>Tip:</strong> The AI will analyze your description and create a complete table with:
											</p>
											<ul class="text-xs mt-1 ml-4 list-disc">
												<li>Automatically generated table name</li>
												<li>Appropriate field types (text, number, date, select, etc.)</li>
												<li>Required field validation where needed</li>
												<li>Dropdown options for categorization fields</li>
											</ul>
											<p class="text-xs mt-2">
												After creation, you can edit fields and add records on the table page.
											</p>
										</div>
									</template>
								</Tooltip>
							</div>
							<textarea
								id="ai-prompt"
								v-model="formData.description"
								class="input-textarea"
								rows="6"
								placeholder="Describe what data you want to store in this table. Be specific about the fields you need.

Examples:
• Employee database with names, emails, departments, hire dates, and salary information
• Project tracking with tasks, deadlines, priorities, and assigned team members
• Customer orders with product details, quantities, prices, and shipping addresses"
								required
							/>
						</div>
					</div>
				</section>
			</div>

			<footer class="flex gap-3 w-full p-5  bg-[#F5F7F9] rounded-b-2xl z-10">
				<button class="btn-outline bg-light flex-1" type="button" :disabled="loading || aiLoading" @click="closeCreateTable">
					Cancel
				</button>

				<!-- AI Mode: Generate Button -->
				<template v-if="!isEditMode && activeTab === 'ai'">
					<button
						class="btn-primary flex-1"
						type="submit"
						:disabled="!formData.description.trim() || aiLoading"
					>
						<span v-if="!aiLoading">✨ Create Table with AI</span>
						<span v-else class="flex items-center justify-center gap-2">
							<Spinner />
							Creating Table...
						</span>
					</button>
				</template>

				<!-- Manual Mode: Create/Update Button -->
				<template v-else>
					<button class="btn-primary flex-1" :disabled="isDisabled || loading">
						<span v-if="!loading">{{ isEditMode ? 'Update Table' : 'Create Table' }}</span>
						<Spinner v-else />
					</button>
				</template>
			</footer>
		</form>
	</Modal>
</template>

<script setup lang="ts">
import { X, Info } from 'lucide-vue-next'
import { reactive, computed, watch, ref, type PropType } from 'vue'
import { Timestamp } from 'firebase/firestore'
import { useTablesModal } from '@/composables/core/modals'
import { useCreateTable } from '@/composables/dashboard/tables/create'
import { useEditTable } from '@/composables/dashboard/tables/edit'
import { useAITableGeneration } from '@/composables/dashboard/tables/aiGeneration'
import { useAlert } from '@/composables/core/notification'
import Spinner from '@/components/core/Spinner.vue'
import Tooltip from '@/components/core/Tooltip.vue'

const { closeCreateTable } = useTablesModal()
const { createTableModal, loading: createLoading, createTableForm, isDisabled: createDisabled, resetForm, addField } = useCreateTable()
const { updateTable, loading: updateLoading } = useEditTable()
const { loading: aiLoading, generatedFields, generatedTableData, generateTableFields, clearGeneratedFields } = useAITableGeneration()

// Tab state for create mode
const activeTab = ref<'manual' | 'ai'>('manual')

const props = defineProps({
	payload: {
		type: Object as PropType<Record<string, any> | null>,
		default: null,
		required: false
	},
	propsModal: {
		type: String,
		required: false
	}
})

// Check if we're in edit mode
const isEditMode = computed(() => props.payload?.mode === 'edit')

// Form data that works for both create and edit modes
const formData = reactive({
	name: '',
	description: ''
})

// Loading state for both modes
const loading = computed(() => isEditMode.value ? updateLoading.value : createLoading.value)

// Disabled state
const isDisabled = computed(() => {
	if (isEditMode.value) {
		return !formData.name.trim()
	}
	return createDisabled.value
})

// Watch for payload changes to populate form in edit mode
watch(() => props.payload, (newPayload) => {
	if (newPayload?.mode === 'edit' && newPayload?.tableData) {
		formData.name = newPayload.tableData.name || ''
		formData.description = newPayload.tableData.description || ''
	} else {
		// Reset form for create mode
		formData.name = ''
		formData.description = ''
		activeTab.value = 'manual'
		clearGeneratedFields()
		resetForm()
	}
}, { immediate: true, deep: true })

// Sync form data with createTableForm for create mode
watch(() => formData, (newFormData) => {
	if (!isEditMode.value) {
		createTableForm.name = newFormData.name
		createTableForm.description = newFormData.description
	}
}, { deep: true })

// AI Generation Methods
const generateFields = async () => {
	try {
		// Generate fields and table metadata with AI
		await generateTableFields(formData.description)

		// If we have generated data, automatically create the table
		if (generatedTableData.value && generatedFields.value.length > 0) {
			// Set the form data from AI generation
			formData.name = generatedTableData.value.name
			formData.description = generatedTableData.value.description

			// Also explicitly set the createTableForm data to ensure sync
			createTableForm.name = generatedTableData.value.name
			createTableForm.description = generatedTableData.value.description

			// Clear existing fields and add generated ones
			createTableForm.fields = []
			generatedFields.value.forEach((field) => {
				addField(field)
			})

			// Automatically create the table
			await createTableModal()
		}
	} catch (error) {
		console.error('Error generating fields:', error)
	}
}

// Update table function for edit mode
const updateTableModal = async () => {
	if (!props.payload?.tableData) return

	const updatedTable = {
		...props.payload.tableData,
		name: formData.name,
		description: formData.description,
		updated_at: Timestamp.fromDate(new Date())
	}

	await updateTable(updatedTable)
	closeCreateTable()
}
</script>

<style>

</style>

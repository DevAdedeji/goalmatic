<template>
	<section class="flex flex-col items-start w-full gap-6">
		<div class="flex justify-between items-start flex-wrap gap-4 w-full">
			<div class="flex-grow">
				<!-- Title Display & Popover -->
				<div class="flex items-center gap-2 mb-2">
					<Popover align="start" :open="titlePopoverOpen" :modal="true" @update:open="titlePopoverOpen = $event">
						<template #trigger>
							<div class="flex items-center gap-2 cursor-pointer" @click="openTitlePopover">
								<span class="text-3xl font-medium text-headline p-1 min-w-[150px] max-w-xl break-words">
									{{ tableData.name || 'Untitled Table' }}
								</span>
								<Edit2 :size="16" class="hover:text-primary" />
							</div>
						</template>
						<template #content>
							<div class="min-w-[300px] p-1">
								<input
									ref="titleInputRef"
									v-model="currentTitle"
									type="text"
									placeholder="Table Title"
									class="input w-full mb-2"
									@keydown.enter.prevent="saveTitle"
								>
								<div class="flex justify-end gap-2">
									<button class="btn-outline flex-1" @click="titlePopoverOpen = false">
										Cancel
									</button>
									<button class="btn-primary flex-1" @click="saveTitle">
										Save
									</button>
								</div>
							</div>
						</template>
					</Popover>
				</div>

				<!-- Description Display & Popover -->
				<div class="flex items-start gap-2">
					<Popover align="start" :open="descriptionPopoverOpen" :modal="true" @update:open="descriptionPopoverOpen = $event">
						<template #trigger>
							<div class="flex items-center gap-2 cursor-pointer" @click="openDescriptionPopover">
								<span class="text-text-secondary p-1 w-full max-w-2xl break-words whitespace-pre-wrap">
									{{ tableData.description || 'Add a description...' }}
								</span>
								<Edit2 :size="16" class="hover:text-primary" />
							</div>
						</template>
						<template #content>
							<div class="min-w-[350px] max-w-xl p-1">
								<textarea
									ref="descInputRef"
									v-model="currentDescription"
									placeholder="Add a description..."
									class="input-textarea"
									rows="4"
									@keydown.enter.prevent="saveDescription"
								/>
								<div class="flex justify-end gap-2">
									<button class="btn-outline flex-1" @click="descriptionPopoverOpen = false">
										Cancel
									</button>
									<button class="btn-primary flex-1" @click="saveDescription">
										Save
									</button>
								</div>
							</div>
						</template>
					</Popover>
				</div>
			</div>
			<div class="flex gap-3 w-full md:w-auto md:min-w-[200px]">
				<Popover v-if="tableData.status === 'active'" side="top" align="center" :modal="false">
					<template #trigger>
						<button class="btn-outline flex-1">
							Deactivate Table
						</button>
					</template>
					<template #content>
						<div class="p-2 max-w-xs">
							<p>Deactivating will make this table unavailable for use in flows and agents.</p>
						</div>
					</template>
				</Popover>
				<button v-else class="btn-outline flex-1">
					Activate Table
				</button>
				<button class="btn-primary flex-1" @click="saveTable">
					Save Table
				</button>
			</div>
		</div>

		<!-- Table info -->
		<div class="mb-6">
			<span class="text-text-secondary text-sm">
				{{ tableData.fields?.length || 0 }} fields · {{ tableData.records?.length || 0 }} records
			</span>
		</div>

		<!-- Tabs -->
		<Tabs
			:tabs="['structure', 'data']"
			:selected="currentTab"
			:icons="[Columns, Database]"
			:counts="[tableData.fields?.length, tableData.records?.length]"
			class="mb-6"
			@changed="$emit('update:currentTab', $event)"
		/>
	</section>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue'
import { Edit2, Columns, Database } from 'lucide-vue-next'
import Tabs from '@/components/core/Tabs.vue'
import Popover from '@/components/core/Popover.vue'
import { useEditTable } from '@/composables/dashboard/tables/edit'

const props = defineProps({
	tableData: {
		type: Object,
		required: true
	},
	currentTab: {
		type: String,
		required: true
	}
})

const emit = defineEmits(['update:currentTab'])
const { updateTable } = useEditTable()

// Function to save the table
const saveTable = async () => {
	await updateTable(props.tableData)
}

// Refs for input elements inside popovers
const titleInputRef = ref<HTMLInputElement | null>(null)
const descInputRef = ref<HTMLTextAreaElement | null>(null)
const titlePopoverOpen = ref(false)
const descriptionPopoverOpen = ref(false)

// Local state for input values within popovers
const currentTitle = ref('')
const currentDescription = ref('')

// Title popover functions
const openTitlePopover = () => {
	titlePopoverOpen.value = true
	currentTitle.value = props.tableData.name || ''
	nextTick(() => {
		titleInputRef.value?.focus()
	})
}

const saveTitle = async () => {
	if (currentTitle.value.trim()) {
		await updateTable({
			...props.tableData,
			name: currentTitle.value.trim()
		})
		titlePopoverOpen.value = false
	}
}

// Description popover functions
const openDescriptionPopover = () => {
	descriptionPopoverOpen.value = true
	currentDescription.value = props.tableData.description || ''
	nextTick(() => {
		descInputRef.value?.focus()
	})
}

const saveDescription = async () => {
	await updateTable({
		...props.tableData,
		description: currentDescription.value.trim()
	})
	descriptionPopoverOpen.value = false
}
</script>

<style scoped>
.icon-btn {
	@apply p-1 rounded-md hover:bg-gray-100 transition-colors;
}
</style>

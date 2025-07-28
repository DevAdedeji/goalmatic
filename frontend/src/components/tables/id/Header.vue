<template>
	<section class="flex flex-col items-start w-full gap-6">
		<div class="flex flex-col md:flex-row justify-between items-start flex-wrap gap-4 w-full">
			<div class="flex flex-col gap-2 w-full md:w-auto max-w-2xl">
				<!-- Title Display -->
				<div class="flex items-center gap-2 mb-2">
					<div class="flex items-center gap-2 cursor-pointer" @click="openEditModal">
						<span class="text-3xl font-medium text-headline p-1 min-w-[150px] max-w-xl break-words">
							{{ tableData.name || 'Untitled Table' }}
						</span>
						<Edit2 :size="16" class="hover:text-primary" />
					</div>
				</div>

				<!-- Description Display -->
				<span class="text-secondary p-1 ">
					{{ tableData.description || 'Add a description...' }}
				</span>
			</div>
			<div class="flex gap-3 w-full jsu md:w-auto ">
				<button class="btn-primary w-full md:w-auto" @click="saveTable">
					Save Table
				</button>
			</div>
		</div>

		<!-- Table info -->
		<div class="mb-6">
			<span class="text-[#7A797E] text-sm">
				{{ tableData.fields?.length || 0 }} fields · {{ tableRecords.length || 0 }} records
			</span>
		</div>

		<!-- Tabs -->
		<div class="tabs">
			<button
				v-for="tab in tabsData"
				:key="tab.name"
				class="tab-btn"
				:class="currentTab === tab.name ? 'active' : ''"
				@click="$emit('update:currentTab', tab.name)"
			>
				<component :is="tab.icon" class="size-4" />
				{{ tab.label }}
				<span
					v-if="tab.count !== undefined && tab.count > 0"
					class="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 ml-1"
				>
					{{ tab.count }}
				</span>
			</button>
		</div>
	</section>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { Edit2, Columns, Database } from 'lucide-vue-next'
import { useEditTable } from '@/composables/dashboard/tables/edit'
import { useFetchTableRecords } from '@/composables/dashboard/tables/fetch'
import { useTablesModal } from '@/composables/core/modals'

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
const { fetchTableRecords, tableRecords } = useFetchTableRecords()
const { openCreateTable } = useTablesModal()

// Fetch records when component is mounted
onMounted(async () => {
	if (props.tableData.id) {
		await fetchTableRecords(props.tableData.id)
	}
})

// Define tabs data
const tabsData = computed(() => [
	{
		name: 'structure',
		label: 'Structure',
		icon: Columns,
		count: props.tableData.fields?.length || 0
	},
	{
		name: 'data',
		label: 'Data',
		icon: Database,
		count: tableRecords.value.length || 0
	}
])

// Function to save the table
const saveTable = async () => {
	await updateTable(props.tableData)
}

// Function to open edit modal
const openEditModal = () => {
	openCreateTable({ mode: 'edit', tableData: props.tableData })
}
</script>



<template>
	<div>
		<div class="flex justify-between items-center mb-6">
			<h2 class="text-lg font-medium text-headline">
				Fields Definition
			</h2>
			<button
				class="btn-outline gap-2"
				@click="addNewField"
			>
				<Plus :size="16" />
				Add Field
			</button>
		</div>

		<div v-if="!tableData.fields || tableData.fields.length === 0" class="flex flex-col justify-center items-center text-center py-12 border border-dashed border-border rounded-lg">
			<Database :size="48" class="mx-auto mb-4 text-text-secondary opacity-40" />
			<h3 class="text-lg font-medium text-headline mb-2">
				No Fields Defined
			</h3>
			<p class="text-text-secondary mb-4">
				Define fields to structure your table
			</p>
			<button
				class="btn-outline gap-2"
				@click="addNewField"
			>
				<Plus :size="16" />
				Add First Field
			</button>
		</div>

		<div v-else>
			<div class="space-y-3">
				<div v-for="(field, index) in tableData.fields" :key="field.id" class="border border-border rounded-lg p-4 hover:border-primary/40 transition-colors">
					<div class="flex justify-between items-start">
						<div>
							<div class="flex items-center gap-2 mb-1">
								<h3 class="text-lg font-medium text-headline">
									{{ field.name }}
								</h3>
								<span class="bg-gray-100 text-text-secondary px-2 py-0.5 rounded text-xs">{{ field.type }}</span>
								<span v-if="field.required" class="bg-danger-50 text-danger-700 px-2 py-0.5 rounded text-xs">Required</span>
							</div>
							<p v-if="field.description" class="text-text-secondary text-sm">
								{{ field.description }}
							</p>
						</div>
						<div class="flex gap-2">
							<button class="icon-btn text-text-secondary hover:text-primary" @click="editField(index)">
								<Edit2 :size="18" />
							</button>
							<button class="icon-btn text-text-secondary hover:text-danger" @click="deleteField(index)">
								<Trash2 :size="18" />
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { Plus, Edit2, Trash2, Database } from 'lucide-vue-next'
import { useTableStructureSection } from '@/composables/dashboard/tables/structureSection'


const { addNewField, editField, deleteField, tableData } = useTableStructureSection()
</script>

<style scoped>
.icon-btn {
	@apply p-1 rounded-md hover:bg-gray-100 transition-colors;
}
</style>

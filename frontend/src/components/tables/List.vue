<template>
	<section>
		<div v-if="tables.length" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
			<TablesCard
				v-for="table in tables"
				:key="table.id"
				:table="table"
				@edit="emit('edit', table)"
				@delete="emit('delete', table)"
			/>
		</div>
		<div v-else class="justify-center items-center flex flex-col text-center py-10 border border-dashed border-border rounded-lg">
			<Database
				class="mx-auto mb-3 text-gray-400"
				:size="40"
			/>
			<p class="text-text-secondary mb-2">
				No tables yet
			</p>
			<p class="text-sm text-text-secondary mb-4">
				Create your first table to get started
			</p>
			<button
				class="btn-primary px-4 py-2 rounded-md"
				@click="emit('createNewTable')"
			>
				Create New Table
			</button>
		</div>
	</section>
</template>

<script setup lang="ts">
import { Database } from 'lucide-vue-next'
import TablesCard from './Card.vue'

defineProps<{
    tables: any[];
}>()

const emit = defineEmits<{(e: 'edit', table: any): void;
    (e: 'delete', table: any): void;
    (e: 'createNewTable'): void;
}>()
</script>

<style scoped>
</style>

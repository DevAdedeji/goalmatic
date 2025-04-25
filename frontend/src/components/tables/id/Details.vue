<template>
	<TablesIdStructureSection v-if="currentTab === 'structure'" :table-data="tableData" />
	<TablesIdDataSection
		v-if="currentTab === 'data'"
		:table-data="tableData"
		@switch-tab="$emit('switchTab', $event)"
	/>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue'
import TablesIdStructureSection from '@/components/tables/id/StructureSection.vue'
import TablesIdDataSection from '@/components/tables/id/DataSection.vue'

// Define emits
const emit = defineEmits(['switchTab'])

// Define Props
defineProps({
	tableData: {
		type: Object,
		required: true
	},
	currentTab: {
		type: String,
		required: true
	}
})
</script>

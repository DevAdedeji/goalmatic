<template>
	<section>
		<TablesIdStructureSection v-if="currentTab === 'structure'" />
		<TablesIdDataSection
			v-if="currentTab === 'data'"
			@switch-tab="$emit('switchTab', $event)"
		/>
	</section>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue'
import TablesIdStructureSection from '@/components/tables/id/StructureSection.vue'
import TablesIdDataSection from '@/components/tables/id/DataSection.vue'

// Define emits
const emit = defineEmits(['switchTab'])

// Define Props
defineProps({
	currentTab: {
		type: String,
		required: true
	}
})
</script>

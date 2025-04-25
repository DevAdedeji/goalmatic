<template>
	<Modal
		modal="$atts.modal"
		:title="modalData.title"
		:is-full-height="false"
		:props-modal="propsModal"
	>
		<form class="auth-form mt-4 p-1" @submit.prevent="">
			<div v-for="field in modalData.fields" :key="field.key" class="field relative">
				<label>{{ field.name }}</label>
				<template v-if="field.type === 'TEXT'">
					<input
						v-model="modalData.config[field.key]"
						type="text"
						class="input-field"
						:placeholder="`Enter ${field.name.toLowerCase()}`"
					>
				</template>
				<template v-else-if="field.type === 'SELECT'">
					<select
						v-model="modalData.config[field.key]"
						class="input-field"
					>
						<option value="" disabled>Select an option</option>
						<option
							v-for="option in selectOptions[field.key] || []"
							:key="option.value"
							:value="option.value"
						>
							{{ option.name }}
						</option>
					</select>
				</template>
			</div>

			<div class="grid grid-cols-1 gap-4 mt-6 w-full">
				<button class="btn-primary text-light" :disabled="loading" @click="updateConfig">
					<span v-if="!loading">Update</span>
					<Spinner v-else />
				</button>
			</div>
		</form>
	</Modal>
</template>

<script setup lang="ts">
import { useEditToolConfig } from '@/composables/dashboard/assistant/agents/tools/config'
import { onMounted, ref } from 'vue'

const { modalData, loading, updateConfig } = useEditToolConfig()

// Store options for SELECT fields
const selectOptions = ref<Record<string, any[]>>({})

// Load options for SELECT fields
onMounted(async () => {
  // Process each field
  for (const field of modalData.value.fields) {
    if (field.type === 'SELECT' && field.options) {
      // If options is a function, call it to get the options
      if (typeof field.options === 'function') {
        try {
          selectOptions.value[field.key] = await field.options()
        } catch (error) {
          console.error(`Error loading options for ${field.name}:`, error)
          selectOptions.value[field.key] = []
        }
      } else {
        // If options is an array, use it directly
        selectOptions.value[field.key] = field.options
      }
    }
  }
})

defineProps({
	payload: {
		type: Object as PropType<Record<string, any> | null>,
		default: null,
		required: false
	},
	propsModal: {
		type: String,
		required: false // Adjust as needed
	}
})
</script>

<style scoped>
.field {
	@apply flex flex-col gap-2 mb-4;
}

label {
	@apply text-sm font-medium text-gray-700;
}

.input-field {
	@apply w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary;
}
</style>

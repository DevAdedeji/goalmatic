<template>
	<div>
		<!-- 1. Describe how often you want this to run -->
		<label class="block font-medium mb-1">Describe how often you want this to run</label>
		<div class="flex gap-2 items-center mb-4">
			<input
				v-model="scheduleInput"
				:disabled="loading"
				type="text"
				class="input-field w-full"
				placeholder="e.g. 12pm every week days"
			>
			<button
				class="btn-primary  "
				:disabled="loading || !scheduleInput"
				@click="generateCron"
			>
				<span v-if="!loading">Generate</span>
				<span v-else>Generating...</span>
			</button>
		</div>

		<!-- 2. Running (structured English) -->
		<div v-if="cronResult">
			<label class="block font-medium mb-1">Running</label>
			<input
				type="text"
				class="input-field w-full mb-4"
				:value="cronResult.PlainText"
				disabled
			>

			<!-- 3. CRON Expression -->
			<label class="block font-medium mb-1">CRON Expression</label>
			<input
				type="text"
				class="input-field w-full "
				:value="cronResult.cron"
				disabled
			>
		</div>
	</div>


	<div class="flex justify-end gap-2 mt-4">
		<button class="btn-outline flex-1" :disabled="loading" @click="$emit('cancel')">
			Cancel
		</button>
		<button class="btn-primary flex-1" :disabled="!cronResult || loading" @click="onSave">
			Save
		</button>
	</div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps({
  payload: Object,
  nodeProps: Array,
  formValues: Object,
  hasProps: Boolean,
  loading: Boolean
})

const emit = defineEmits(['save', 'cancel'])

const scheduleInput = ref('')
const cronResult = ref<null | { cron: string; PlainText: string }>(null)
const loading = ref(false)

// Placeholder for backend call
async function generateCron() {
  loading.value = true
  try {
    // TODO: Replace with actual backend call
    // Simulate backend response
    await new Promise((resolve) => setTimeout(resolve, 1000))
    // Example: "12pm every week days" => "0 12 * * 1-5", "At 12:00 PM, Monday through Friday"
    cronResult.value = {
      cron: '0 12 * * 1-5',
      PlainText: 'At 12:00 PM, Monday through Friday'
    }
  } finally {
    loading.value = false
  }
}

function onSave() {
  if (cronResult.value) {
    emit('save', {
      cron: cronResult.value.cron,
      PlainText: cronResult.value.PlainText,
      Input: scheduleInput.value
    })
  }
}


</script>




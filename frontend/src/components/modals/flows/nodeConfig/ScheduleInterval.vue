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


	<div class="hidden sm:flex justify-end gap-2 mt-4 pb-24 sm:pb-0">
		<button class="btn-outline flex-1" :disabled="loading" @click="$emit('cancel')">
			Cancel
		</button>
		<button class="btn-primary flex-1" :disabled="!cronResult || loading" @click="onSave">
			Save
		</button>
	</div>
	<div class="fixed inset-x-0 bottom-0 sm:hidden bg-light border-t border-border p-3">
		<div class="grid grid-cols-2 gap-3 w-full">
			<button type="button" class="btn-outline" :disabled="loading" @click="$emit('cancel')">
				Cancel
			</button>
			<button type="button" class="btn-primary" :disabled="!cronResult || loading" @click="onSave">
				Save
			</button>
		</div>
	</div>
</template>

<script setup lang="ts">
import { callFirebaseFunction } from '@/firebase/functions'
import { parseCronExpression } from '@/composables/utils/cronParser'


const props = defineProps({
  payload: Object,
  nodeProps: Array,
  formValues: Object,
  hasProps: Boolean,
  loading: Boolean,
  previousNodeOutputs: {
    type: Object,
    required: false,
    default: () => ({})
  }
})

const emit = defineEmits(['save', 'cancel'])

const scheduleInput = ref('')
const cronResult = ref<null | { cron: string, PlainText: string }>(null)
const loading = ref(false)

// Placeholder for backend call
async function generateCron() {
  loading.value = true
  try {
    // Call the backend Firebase function to generate the cron expression
      const result = await callFirebaseFunction('generateCron', { input: scheduleInput.value }) as { cron: string; PlainText: string }

    cronResult.value = result
	  const PlainText = parseCronExpression(result.cron)

	  cronResult.value.PlainText = PlainText.toString()
  } catch (error) {
    cronResult.value = null
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

onMounted(() => {
  if (props.formValues) {
    if (props.formValues.Input) {
      scheduleInput.value = props.formValues.Input
    }
    if (props.formValues.cron && props.formValues.PlainText) {
      cronResult.value = {
        cron: props.formValues.cron,
        PlainText: props.formValues.PlainText
      }
    }
  }
})

</script>




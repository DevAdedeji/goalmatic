<template>
	<Modal
		modal="$atts.modal"
		:title="isAnUpdateEvent ? 'Update Event' : 'Create Event'"
		:is-full-height="false"
		:props-modal="propsModal"
	>
		<form class="auth-form" @submit.prevent="isAnUpdateEvent ? updateEventFromForm() : createEventFromForm()">
			<div class="field relative">
				<label class="block text-sm font-medium mb-1">Title</label>
				<input
					v-model="eventFormData.title"
					type="text"
					class="input-field"
					autocomplete="off"
				>
			</div>

			<div class="field relative">
				<label class="block text-sm font-medium mb-1">Description</label>
				<textarea
					v-model="eventFormData.description"
					class="input-textarea"
					autocomplete="off"
				/>
			</div>

			<!-- Date and Time Section -->
			<div class="grid grid-cols-2 gap-4 mt-4">
				<div class="field relative">
					<label class="block text-sm font-medium mb-1">Start Time</label>
					<input
						v-model="eventFormData.startTime"
						type="datetime-local"
						class="input-field"
					>
				</div>
				<div class="field relative">
					<label class="block text-sm font-medium mb-1">End Time</label>
					<input
						v-model="eventFormData.endTime"
						type="datetime-local"
						class="input-field"
					>
				</div>
			</div>

			<div class="grid grid-cols-1 gap-4 mt-6 w-full">
				<button class="btn-primary text-light" :disabled="loading || updateLoading || !eventFormData.title">
					<span v-if="!loading && !updateLoading">
						{{ isAnUpdateEvent ? 'Update' : 'Create' }}
					</span>
					<Spinner v-else />
				</button>
			</div>
		</form>
	</Modal>
</template>

<script setup lang="ts">
import { useCreateCalendarEvent } from '@/composables/dashboard/integrations/googleCalendar/create'
import { useUpdateCalendarEvent } from '@/composables/dashboard/integrations/googleCalendar/update'

const { loading, isAnUpdateEvent, eventFormData, createEventFromForm } = useCreateCalendarEvent()
const { updateEventFromForm, loading: updateLoading } = useUpdateCalendarEvent()

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


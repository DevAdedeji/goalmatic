<template>
	<Modal
		modal="$atts.modal"
		title="Change Agent Visibility"
		:props-modal="propsModal"
	>
		<div class="flex flex-col gap-4">
			<p class="text-subText">
				Are you sure you want to make this agent <span class="font-bold">{{ isPublic ? 'private' : 'public' }}</span>?
			</p>

			<div v-if="!isPublic" class="bg-amber-50 border border-amber-200 rounded-md p-3 text-amber-800">
				<p class="text-sm">
					<span class="font-bold">Note:</span> Making this agent public will allow anyone to view and use it.
				</p>
			</div>

			<div v-else class="bg-blue-50 border border-blue-200 rounded-md p-3 text-blue-800">
				<p class="text-sm">
					<span class="font-bold">Note:</span> Making this agent private will restrict access to only you.
				</p>
			</div>

			<div class="flex gap-3 mt-2">
				<button class="btn-outline flex-1" @click="useAssistantModal().closeConfirmVisibility()">
					Cancel
				</button>
				<button
					class="btn-primary flex-1"
					:disabled="loading"
					@click="confirmToggle()"
				>
					<span v-if="!loading">Confirm</span>
					<Spinner v-else />
				</button>
			</div>
		</div>
	</Modal>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Modal from '@/components/core/modal/Modal.vue'
import Spinner from '@/components/core/Spinner.vue'
import { useAssistantModal } from '@/composables/core/modals'

const props = defineProps({
	payload: {
		type: Object,
		required: true
	},
	propsModal: {
		type: String,
		required: false
	}
})

const loading = ref(false)
const isPublic = computed(() => props.payload.agent?.public === true)

const confirmToggle = async () => {
	loading.value = true
	try {
		await props.payload.onConfirm()
		useAssistantModal().closeConfirmVisibility()
	} finally {
		loading.value = false
	}
}
</script>

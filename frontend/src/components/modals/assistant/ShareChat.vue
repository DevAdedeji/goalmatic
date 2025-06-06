<template>
	<Modal
		modal="$atts.modal"
		title="Share public link to chat"
		:is-full-height="false"
		:props-modal="propsModal"
		size="md"
	>
		<div class="space-y-4">
			<!-- Privacy Information -->
			<div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
				<div class="flex items-start space-x-3">
					<InfoIcon class="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
					<div class="text-sm text-blue-800">
						<p class="font-medium mb-1">
							Your privacy is protected
						</p>
						<p class="text-blue-700">
							Your name, custom instructions, and any messages you add after sharing stay private.
							This creates a public clone of the current conversation.
						</p>
					</div>
				</div>
			</div>

			<!-- Share Link Generation -->
			<div v-if="!shareLink" class="text-center py-4 w-full">
				<button
					class="btn-primary w-full"
					:disabled="loading"
					@click="generateShareLink"
				>
					<LinkIcon v-if="!loading" class="w-4 h-4 mr-2" />
					<Spinner v-else class="w-4 h-4 mr-2" />
					{{ loading ? 'Creating link...' : 'Create link' }}
				</button>
			</div>

			<!-- Generated Link -->
			<div v-if="shareLink" class="space-y-3">
				<div class="bg-gray-50 border border-gray-200 rounded-lg p-3">
					<div class="flex items-center justify-between">
						<div class="flex-1 min-w-0">
							<p class="text-sm text-gray-600 mb-1">
								Shareable link
							</p>
							<p class="text-sm font-mono bg-white border rounded px-2 py-1 truncate">
								{{ shareLink }}
							</p>
						</div>
					</div>
				</div>

				<!-- Action Buttons -->
				<div class="flex space-x-2">
					<button
						class="btn-primary flex-1"
						@click="copyToClipboard"
					>
						<CopyIcon class="w-4 h-4 mr-2" />
						{{ copied ? 'Copied!' : 'Copy link' }}
					</button>
					<button
						class="btn-outline flex-1"
						@click="openInNewTab"
					>
						<ExternalLinkIcon class="w-4 h-4 mr-2" />
						Open link
					</button>
				</div>
			</div>

			<!-- Actions -->
			<div class="flex justify-end space-x-3 pt-4 border-t">
				<button
					class="btn-outline w-full"
					@click="closeModal"
				>
					Cancel
				</button>
			</div>
		</div>
	</Modal>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { InfoIcon, LinkIcon, CopyIcon, ExternalLinkIcon } from 'lucide-vue-next'
import Modal from '@/components/core/modal/Modal.vue'
import Spinner from '@/components/core/Spinner.vue'
import { useAssistantModal } from '@/composables/core/modals'
import { callFirebaseFunction } from '@/firebase/functions'
import { useAlert } from '@/composables/core/notification'
import { useCopyToClipboard } from '@/composables/utils/share'

const props = defineProps({
	payload: {
		type: Object as PropType<{ sessionId: string } | null>,
		default: null,
		required: false
	},
	propsModal: {
		type: String,
		required: false
	}
})

const { closeShareChat } = useAssistantModal()
const { copyData } = useCopyToClipboard()

const loading = ref(false)
const shareLink = ref('')
const copied = ref(false)

const generateShareLink = async () => {
	if (!props.payload?.sessionId) {
		useAlert().openAlert({
			type: 'ERROR',
			msg: 'Session ID is required to share chat'
		})
		return
	}

	try {
		loading.value = true
		const result = await callFirebaseFunction('shareChatSession', {
			sessionId: props.payload.sessionId
		}) as { success: boolean; publicId: string; shareUrl: string }

		if (result.success) {
			shareLink.value = result.shareUrl
			useAlert().openAlert({
				type: 'SUCCESS',
				msg: 'Share link created successfully!'
			})
		}
	} catch (error) {
		console.error('Error generating share link:', error)
		useAlert().openAlert({
			type: 'ERROR',
			msg: 'Failed to create share link. Please try again.'
		})
	} finally {
		loading.value = false
	}
}

const copyToClipboard = () => {
	copyData({
		info: shareLink.value,
		msg: 'Share link copied to clipboard!'
	})
	copied.value = true
	setTimeout(() => {
		copied.value = false
	}, 2000)
}

const openInNewTab = () => {
	window.open(shareLink.value, '_blank')
}

const closeModal = () => {
	closeShareChat()
}
</script>

<style scoped>

</style>

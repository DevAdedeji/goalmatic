<template>
	<div class="avatar-selector">
		<section class="flex gap-4 items-start">
			<img :src="selectedAvatar" :alt="'Selected avatar'" class="avatar-image">


			<div class="avatars-grid">
				<button
					v-for="(avatar, index) in predefinedAvatars"
					:key="index"
					type="button"
					class="avatar-option"
					:class="{ 'selected': selectedAvatar === avatar }"
					@click="selectAvatar(avatar)"
				>
					<img :src="avatar" :alt="`Avatar ${index + 1}`" class="avatar-option-image">
				</button>

				<button
					type="button"
					:disabled="uploadLoading"
					class="flex flex-col items-center justify-center relative"
					@click="triggerFileUpload"
				>
					<input
						ref="fileInput"
						type="file"
						accept="image/jpeg,image/png,image/webp"
						class="hidden"
						@change="handleFileUpload"
					>
					<div class="avatar-option !size-10 mt-2 !border-primary center mb-2 ">
						<Upload v-if="!uploadLoading" :size="16" class="text-primary" />
						<Spinner v-else size="16px" />
					</div>
					<div class="flex absolute -bottom-3">
						<span v-if="!uploadLoading" class="text-xs  w-full text-center">Custom</span>
						<span v-else>Uploading... {{ uploadPercentage }}%</span>
					</div>
				</button>
			</div>
		</section>







		<!-- Predefined Avatars Grid -->
	</div>
</template>

<script setup lang="ts">
import { Upload } from 'lucide-vue-next'
import { uploadFirebasetorage } from '@/firebase/storage'
import { useAlert } from '@/composables/core/notification'

const emit = defineEmits<{
	'update:avatar': [avatar: string]
}>()

const props = defineProps<{
	selectedAvatar: string
}>()

// Predefined avatars
const predefinedAvatars = [
	'/avatars/0.png',
	'/avatars/1.png',
	'/avatars/2.png',
	'/avatars/3.png',
	'/avatars/4.png',
	'/avatars/5.png',
	'/avatars/6.png'
]

// File upload refs and state
const fileInput = ref<HTMLInputElement>()
const uploadFile = ref<File>()
const { percentage: uploadPercentage, downloadURL, upload, loading: uploadLoading } = uploadFirebasetorage()

// Methods
const selectAvatar = (avatar: string) => {
	emit('update:avatar', avatar)
}

const triggerFileUpload = () => {
	fileInput.value?.click()
}

const handleFileUpload = () => {
	const file = fileInput.value?.files?.[0]
	if (file) {
		// Validate file size (2MB max)
		if (file.size > 2 * 1024 * 1024) {
			useAlert().openAlert({ type: 'ERROR', msg: 'File size must be less than 2MB' })
			return
		}

		// Validate file type
		if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
			useAlert().openAlert({ type: 'ERROR', msg: 'Please upload a PNG, JPG, or WebP image' })
			return
		}

		uploadFile.value = file
		// Upload to agents/avatars folder with unique filename
		const fileName = `agents/avatars/${Date.now()}_${file.name}`
		upload(fileName, ref(file))
	}
}

// Watch for upload completion
watch(downloadURL, (newURL) => {
	if (newURL) {
		emit('update:avatar', newURL)
		useAlert().openAlert({ type: 'SUCCESS', msg: 'Avatar uploaded successfully!' })
	}
})
</script>

<style scoped lang="postcss">




.avatar-image {
	@apply size-20 rounded-full object-cover;
}

.section-title {
	@apply text-sm font-medium text-gray-900 mb-3;
}



.avatars-grid {
	@apply grid grid-cols-5 md:grid-cols-6 gap-3 place-content-center justify-center;
}

.avatar-option {
	@apply size-12 relative rounded-full border-2 border-transparent  transition-all duration-200 focus:outline-none focus:ring-2 ;
}

.avatar-option.selected {
	@apply border-primary;
}

.avatar-option-image {
	@apply size-12 rounded-full object-cover;
}




.hidden {
	@apply sr-only;
}
</style>

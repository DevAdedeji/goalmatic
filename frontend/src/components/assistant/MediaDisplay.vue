<template>
	<div class="media-display">
		<template v-for="(part, index) in mediaParts" :key="index">
			<!-- Image Display -->
			<div v-if="part.type === 'image'" class="image-container">
				<div v-if="part.caption" class="media-caption">
					{{ part.caption }}
				</div>
				<div class="image-wrapper">
					<img
						v-if="part.signedUrl"
						:src="part.signedUrl"
						:alt="part.content"
						class="media-image"
						loading="lazy"
						@error="handleImageError"
					>
					<div v-else class="media-placeholder">
						<div class="placeholder-icon">
							<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
								<path d="M21 19V5C21 3.9 20.1 3 19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19ZM8.5 13.5L11 16.51L14.5 12L19 18H5L8.5 13.5Z" fill="currentColor" />
							</svg>
						</div>
						<p class="placeholder-text">
							{{ part.content }}
						</p>
					</div>
				</div>
			</div>

			<!-- Audio Display -->
			<div v-else-if="part.type === 'audio'" class="audio-container">
				<div class="audio-header">
					<div class="audio-icon">
						<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
							<path d="M12 2C13.1 2 14 2.9 14 4V8C14 9.1 13.1 10 12 10C10.9 10 10 9.1 10 4V8C10 6.9 10.9 6 12 6C13.1 6 14 6.9 14 8V4C14 2.9 13.1 2 12 2ZM19 10V12C19 16.4 15.4 20 11 20C6.6 20 3 16.4 3 12V10H5V12C5 15.3 7.7 18 11 18C14.3 18 17 15.3 17 12V10H19ZM11 22V20H13V22H11Z" fill="currentColor" />
						</svg>
					</div>
					<span class="audio-label">Voice Message</span>
				</div>

				<audio
					v-if="part.signedUrl"
					:src="part.signedUrl"
					controls
					class="audio-player"
					preload="metadata"
				>
					Your browser does not support the audio element.
				</audio>

				<div v-else class="audio-placeholder">
					<div class="placeholder-icon">
						<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
							<path d="M12 2C13.1 2 14 2.9 14 4V8C14 9.1 13.1 10 12 10C10.9 10 10 9.1 10 4V8C10 6.9 10.9 6 12 6C13.1 6 14 6.9 14 8V4C14 2.9 13.1 2 12 2Z" fill="currentColor" />
						</svg>
					</div>
					<span class="placeholder-text">Audio unavailable</span>
				</div>

				<div v-if="part.transcription" class="transcription">
					<div class="transcription-label">
						Transcription:
					</div>
					<p class="transcription-text">
						{{ part.transcription }}
					</p>
				</div>
			</div>

			<!-- Text Display -->
			<div v-else-if="part.type === 'text' && part.content.trim()" class="text-content" v-html="markdownProcessor(part.content)" />
		</template>
	</div>
</template>

<script setup lang="ts">
import type { MediaContent } from '@/composables/assistant/mediaProcessor'
import { markdownProcessor } from '@/composables/utils/markdown'

interface Props {
  mediaParts: MediaContent[]
}

defineProps<Props>()

const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  console.error('Failed to load image:', img.src)
  // Could show a fallback image or error state here
}
</script>

<style scoped>
.media-display {
  @apply flex flex-col gap-3 w-full;
}

.image-container {
  @apply flex flex-col gap-2;
}

.media-caption {
  @apply text-sm font-medium text-gray-700 italic;
}

.image-wrapper {
  @apply relative overflow-hidden rounded-lg border border-gray-200;
}

.media-image {
  @apply w-full max-w-sm h-auto object-cover rounded-lg;
  max-height: 300px;
}

.media-placeholder {
  @apply flex flex-col items-center justify-center p-6 bg-gray-100 text-gray-500;
  min-height: 120px;
}

.placeholder-icon {
  @apply mb-2 text-gray-400;
}

.placeholder-text {
  @apply text-sm text-center;
}

.audio-container {
  @apply flex flex-col gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200;
}

.audio-header {
  @apply flex items-center gap-2 text-gray-700;
}

.audio-icon {
  @apply text-blue-600;
}

.audio-label {
  @apply text-sm font-medium;
}

.audio-player {
  @apply w-full;
}

.audio-placeholder {
  @apply flex items-center gap-2 text-gray-500 text-sm;
}

.transcription {
  @apply mt-2 p-3 bg-white rounded border border-gray-200;
}

.transcription-label {
  @apply text-xs font-semibold text-gray-600 mb-1;
}

.transcription-text {
  @apply text-sm text-gray-800;
}

.text-content {
  @apply text-sm text-gray-800;
}

.text-content :deep(p) {
  @apply text-sm text-subText;
}
</style>

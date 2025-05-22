<template>
	<div>
		<NuxtLoadingIndicator :height="4" color="#4F1DED" />
		<NuxtLayout>
			<NuxtPage />
		</NuxtLayout>
	</div>
	<footer v-if="!online" class="center bg-danger text-white py-1 fixed bottom-0 inset-x-0">
		You are currently offline
	</footer>
	<!-- <ColorBadge name="DEV" /> -->
</template>

<script lang='ts' setup>
import { useOnline } from '@vueuse/core'


const online = useOnline()

useHead({
	script: [
		{
			src: 'https://scripts.ahalab.io/track.js',
			async: true,
			'data-aha-client-id': 'org_2xPFkGRtXSgx1G4uQUI1LLpFBxS'
		}
	]
})





</script>

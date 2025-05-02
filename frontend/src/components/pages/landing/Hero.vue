<template>
	<main class="min-h-screen p-4 pt-40 relative overflow-hidden flex flex-col items-center">
		<PagesLandingInteractiveGridPattern

			:width="80"
			:height="80"
			:squares="[200, 200]"
			squares-class-name="hover:fill-blue-500"
		/>

		<div class="flex flex-col items-center md:gap-10 gap-4 z-30  mt-16">
			<h1 class="text-headline font-bold text-[49px] md:text-[72px] lg:max-w-[800px] text-center leading-[40px] md:leading-[80px]">
				Your AI, Your Rules: Automate Your Life
			</h1>
			<p class="text-sm md:text-[18px] text-dark text-center  md:max-w-[760px] leading-[30px]">
				Build AI agents that automate repetitive tasks. Connect to your apps, create workflows, and stay in control of your life with Goalmatic.
			</p>
			<nuxt-link to="/auth/login" class="btn-primary">
				Get Started
			</nuxt-link>
		</div>
	</main>
</template>

<script setup lang="ts">
import { watchUserStateChange } from '@/firebase/auth'
import { useUser } from '@/composables/auth/user'

const { isLoggedIn } = useUser()
const userGoal = ref('')
const textarea = ref()







definePageMeta({
	layout: false
})

onMounted(() => watchUserStateChange())

</script>

<style scoped>
.btn-primary{
@apply text-sm px-5 py-3 md:text-base md:px-10 order-1 md:order-3 ml-12 md:ml-0
}
</style>

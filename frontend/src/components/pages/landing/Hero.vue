<template>
	<main class="min-h-screen p-4 relative overflow-hidden flex flex-col items-center">
		<div class="flex flex-col items-center md:gap-4 gap-4 z-30  mt-[153px]">
			<h1 class="textHero text-headline font-bold text-[49px] md:text-[72px] lg:max-w-[800px] text-center leading-[40px] md:leading-[80px]">
				Your AI, Your Rules: Automate Your Life
			</h1>
			<p class="text-sm md:text-[18px] text-dark text-center  md:max-w-[760px] leading-[30px]">
				Build AI agents that automate repetitive tasks. Connect to your apps, create workflows, and stay in control of your life with Goalmatic.
			</p>
			<nuxt-link to="/auth/login" class="btn-primary mt-6">
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

<style>
.textHero{
	background: linear-gradient(180deg, #000 54.17%, #6403F8 100%);
background-clip: text;
-webkit-background-clip: text;
-webkit-text-fill-color: transparent;
}
</style>

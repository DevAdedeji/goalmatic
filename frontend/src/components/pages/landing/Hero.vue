<template>
	<main class="container md:px-9 px-4 relative overflow-hidden flex flex-col items-center">
		<div class="flex flex-col items-center md:gap-4 gap-4 z-30  mt-[153px] relative">
			<h1 class="textHero text-headline font-bold text-[49px] md:text-[72px] lg:max-w-[800px] text-center leading-[40px] md:leading-[80px] px-4">
				Your AI, Your Rules: Automate Your Life
			</h1>
			<p class="text-sm md:text-[18px] text-dark text-center  md:max-w-[760px] leading-[30px] px-4">
				Build AI agents that automate repetitive tasks. Connect to your apps, create workflows, and stay in control of your life with Goalmatic.
			</p>
			<nuxt-link to="/auth/login" class="btn-primary mt-6">
				Get Started for Free
			</nuxt-link>
			<img src="/hero.svg" alt="hero-bg" class="heroBox mt-24 ">
		</div>
	</main>
</template>

<script setup lang="ts">
import { watchUserStateChange } from '@/firebase/auth'

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
.heroBox{
@apply md:rounded-t-[26px] border hidden md:block absolute -bottom-[180px] inset-x-0 md:relative md:inset-x-auto md:bottom-auto
 border-white/10 shadow-[0px_-20px_70px_0px_rgba(140,69,255,0.25),_0px_-19px_70px_0px_rgba(140,69,255,0.40)];
/* border-radius: 26px; */
/* border: 1px solid rgba(255, 255, 255, 0.10); */
/* box-shadow: 0px -20px 70px 0px rgba(140, 69, 255, 0.25), 0px -19px 70px 0px rgba(140, 69, 255, 0.40); */
}
</style>

<template>
	<main
		class="container max-w-[100vw] md:px-9 px-4 relative overflow-hidden flex flex-col items-center  bg-holder pt-[70px]">
		<div class="flex flex-col items-center md:gap-4 gap-4 z-30  mt-[153px] relative">
			<h1 ref="headline"
				class="textHero text-headline font-bold text-[40px] md:text-[72px] lg:max-w-[960px] text-center leading-[45px] md:leading-[80px] md:px-4">
				AI Agents & Workflows Built for Business Growth
			</h1>
			<p ref="paragraph"
				class="text-sm md:text-[20px] text-dark text-center  md:max-w-[760px] leading-[25px] md:leading-[30px] md:px-4">
				Empower your teams—sales, marketing, customer service, IT—with intelligent automation that works 24/7.
				We provide both the software and the strategic guidance.
			</p>
			<nuxt-link ref="ctaButton" to="/auth/login" class="btn-primary mt-6">
				Get Started for Free
			</nuxt-link>
			<div class="flex flex-col items-center md:gap-4 gap-4 z-30  container">
				<img src="/flow.png" alt="hero-bg" class=" mt-24 hidden md:block">
				<img src="/flow-mobile.png" alt="hero-bg" class=" mt-8 md:hidden">
			</div>
		</div>
	</main>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { gsap } from 'gsap'
import { SplitText } from 'gsap/SplitText'
import { watchUserStateChange } from '@/firebase/auth'

gsap.registerPlugin(SplitText)

definePageMeta({
	layout: false
})

const headline = ref<HTMLHeadingElement | null>(null)
const paragraph = ref<HTMLParagraphElement | null>(null)
const ctaButton = ref<HTMLElement | null>(null)

onMounted(() => {
	watchUserStateChange()
})

</script>

<style scoped>
.bg-holder {
	background-image: url('/background.svg');
	background-size: cover;
	background-position: center;
	background-repeat: no-repeat;
}

.textHero {
	background: linear-gradient(180deg, #000 54.17%, #6403F8 100%);
	background-clip: text;
	-webkit-background-clip: text;
	-webkit-text-fill-color: transparent;
}

.heroBox{
@apply md:rounded-t-[26px] border hidden md:block absolute -bottom-[180px] inset-x-0 md:relative md:inset-x-auto md:bottom-auto
 border-white/10 shadow-[0px_-20px_70px_0px_rgba(140,69,255,0.25),_0px_-19px_70px_0px_rgba(140,69,255,0.40)];
}
</style>

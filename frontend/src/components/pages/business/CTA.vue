<template>
	<section class=" cta-card container mx-auto px-4 md:px-9 py-20 md:mt-16 relative flex
     flex-col gap-4 items-center justify-center text-center">
		<h2 class="text-3xl md:text-5xl font-semibold text-headline mb-4 max-w-xl leading-[45px] md:leading-[60px]">
			Stop Wasting Time on Tasks AI Can Handle.
		</h2>
		<p class="text-dark max-w-xl mx-auto text-base md:text-xl">
			You’re leaving efficiency—and profit—on the table. Goalmatic makes it effortless to automate the repetitive tasks so yoy can stay miles ahead of the competition.
		</p>
		<div class="flex flex-col md:flex-row gap-2 space-y-3 md:space-y-0 md:space-x-3 mt-6">
			<nuxt-link ref="ctaButton" to="/auth/login" class="landing-btn  w-full md:w-auto">
				Get Started for Free
			</nuxt-link>
			<a href="https://cal.com/kromate/goalmatic-demo" target="_blank" class="landing-btn-secondary w-full md:w-auto">
				Book a Demo
			</a>
		</div>

		<span class="mt-8 text-dark italic text-sm">
			Start for free. No credit card required 🔥
		</span>
	</section>
</template>

<script setup lang="ts">

</script>

<style scoped>
.cta-card {
	@apply text-light relative flex flex-col bg-transparent rounded-2xl ;
	background-image: url('/business/cta-bg.png');
	background-size: cover;
	background-position: top;
	background-repeat: no-repeat;
	transition: all 0.3s ease-in-out;
}
a{
    @apply scale-100;
}
</style>

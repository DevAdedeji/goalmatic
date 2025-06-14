<template>
	<section class="container mx-auto px-4 md:px-9 py-16 md:mt-16 relative flex flex-col gap-4 items-start">
		<span class="pill">Ready to Build?</span>
		<h2 class="text-3xl md:text-5xl font-semibold text-headline mb-4">
			Create your first automation
		</h2>

		<div class="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
			<article v-for="card in cards" :key="card.title" class="flex relative flex-col gap-4 items-start automation-card min-h-[364px]">
				<h2 class="text-[28px] font-semibold">
					{{ card.title }}
				</h2>
				<p class="text-base max-w-[329px] text-[#D3D2D4]">
					{{ card.description }}
				</p>
				<nuxt-link to="/auth/login" class=" flex items-center gap-2 landing-btn-secondary">
					{{ card.btnText }}
					<ArrowRight size="16" />
				</nuxt-link>

				<img :src="card.image" alt="automation-card" class="absolute bottom-0 right-0 md:w-[400px] w-[340px]">
			</article>
		</div>
	</section>
</template>

<script setup>
import { ArrowRight } from 'lucide-vue-next'

const cards = [
	{
		title: 'create from scratch',
		description: 'Build a tailored workflow or agent exactly to your needs',
		link: '/auth/login',
		btnText: 'Get Started',
		image: '/business/aut1.png'
	},
	{
		title: 'Start with a template',
		description: 'Pick a proven workflow or agent and customize it to fit your business in minutes.',
		link: '/auth/login',
		btnText: 'View Templates',
		image: '/business/aut2.png'
	}
]
</script>

<style scoped>
.pill{
	@apply text-sm font-medium items-center px-3 py-1.5;
	border-radius: 7.2px;
border: 1.2px solid #EDEDED;
background: #F5F7F9;
}
.automation-card {
	@apply text-light relative p-6 flex flex-col bg-[#000021] rounded-2xl ;
	background-image: url('/business/bigCard.png');
	background-size: cover;
	background-position: center;
	background-repeat: no-repeat;
	transition: all 0.3s ease-in-out;
}
</style>

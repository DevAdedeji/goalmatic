<template>
	<PagesBusinessHero />
	<PagesBusinessUsecase />
	<PagesBusinessGetStarted />
	<PagesBusinessCTA />
	<PagesLandingFAQ />
	<PagesLandingFooter />
</template>

<script setup lang="ts">
import section1 from './consultingpages.vue/section1.vue'
import HeroHeader from '@/components/layouts/landing/HeroHeader.vue'
</script>

<style scoped>
* {
	margin: 0px !important;
	padding: 0px !important;
}
</style>

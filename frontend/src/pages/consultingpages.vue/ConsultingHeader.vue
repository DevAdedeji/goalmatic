<template>
	<header class="w-full px-4 md:px-9 py-1 flex items-center justify-between  z-50 relative">
		<!-- Left: Logo -->
		<nuxt-link to="/">
			<img src="/lt.svg" alt="Goalmatic Logo" class="w-32 md:w-48">
		</nuxt-link>

		<!-- Desktop Center Nav Links -->
		<nav class="hidden md:flex space-x-6 absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
			<nuxt-link to="/product"
				class="text-sm font-bold  hover:text-purple-600 font-color-menu">
				Product
			</nuxt-link>
			<nuxt-link to="/integrations"
				class="text-sm font-bold font-color-menu hover:text-purple-600">
				Integrations
			</nuxt-link>
			<nuxt-link to="/pricing" class="text-sm font-bold font-color-menu hover:text-purple-600">
				Pricing
			</nuxt-link>
			<nuxt-link to="/faq" class="text-sm font-semibold text-gray-700 hover:text-purple-600">
				FAQ
			</nuxt-link>
		</nav>

		<!-- Desktop Right Buttons -->
		<div class="hidden md:flex space-x-3">
			<nuxt-link v-if="!isLoggedIn" to="/auth/login" class="btn2 bg-light text-[#5F1DED]">
				Login
			</nuxt-link>

			<div v-if="!isLoggedIn" class="button-margin-div  rounded-[10px]">
				<nuxt-link to="/auth/signup" class="btn-primary ">
					Sign up →
				</nuxt-link>
			</div>
			<div v-else class="button-margin-div  rounded-[10px]">
				<nuxt-link to="/dashboard" class="btn-primary ">
					Dashboard
				</nuxt-link>
			</div>
		</div>

		<!-- Hamburger Button (Mobile Only) -->
		<button class="md:hidden text-gray-800" @click="isOpen = !isOpen">
			<svg v-if="!isOpen" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
			</svg>
			<svg v-else class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
			</svg>
		</button>

		<!-- Mobile Dropdown Menu -->
		<div v-if="isOpen" class="absolute top-full left-0 w-full bg-white shadow-md md:hidden z-40">
			<div class="flex flex-col items-start px-4 py-4 space-y-3">
				<nuxt-link to="/product" class="text-gray-700">
					Product
				</nuxt-link>
				<nuxt-link to="/integrations" class="text-gray-700">
					Integrations
				</nuxt-link>
				<nuxt-link to="/pricing" class="text-gray-700">
					Pricing
				</nuxt-link>
				<nuxt-link to="/faq" class="text-gray-700">
					FAQ
				</nuxt-link>
				<nuxt-link v-if="!isLoggedIn" to="/auth/login" class="text-gray-700">
					Login
				</nuxt-link>
				<nuxt-link v-if="!isLoggedIn" to="/auth/signup" class="text-purple-600">
					Sign up →
				</nuxt-link>
				<nuxt-link v-else to="/dashboard" class="text-purple-600">
					Dashboard
				</nuxt-link>
			</div>
		</div>
	</header>
</template>

<script setup lang="ts">
// import { useUser } from '@/composables/auth/user'

import { useUser } from '../../../src/composables/auth/user'
const isOpen = ref(false)

const { isLoggedIn } = useUser()
</script>

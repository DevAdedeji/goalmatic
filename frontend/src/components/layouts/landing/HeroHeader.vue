<template>
	<header class="container flex items-center justify-between py-3.5  md:px-9 px-4 bg-transparent flex-wrap h-[70px] mx-auto inset-x-0 z-50">
		<nuxt-link to="/">
			<img src="/lt.svg" alt="logo" class=" md:w-48 w-32">
		</nuxt-link>



		<nuxt-link v-if="!isLoggedIn" to="/auth/login" class="btn-primary">
			Login
		</nuxt-link>
		<nuxt-link v-else to="/auth/login" class="btn-primary">
			Dashboard
		</nuxt-link>
	</header>
</template>

<script setup lang="ts">
import { useUser } from '@/composables/auth/user'


const { isLoggedIn } = useUser()
</script>



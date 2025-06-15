<template>
	<div class="bg-light">
		<main class="mx-auto w-full max-w-7xl px-6 pb-16 pt-10 sm:pb-24 lg:px-8">
			<img class="mx-auto h-10 w-auto sm:h-20" src="/lt.svg" alt="Taaskly Logo">
			<div class="mx-auto mt-10 max-w-2xl text-center sm:mt-12">
				<p class="text-base font-semibold leading-8 text-dark">
					{{ error.statusCode || 'Error' }}
				</p>
				<h1 class="mt-4 text-3xl font-bold tracking-tight text-dark sm:text-5xl">
					{{ error.statusMessage || 'This page does not exist' }}
				</h1>
				<p class="mt-4 text-base leading-7 text-grey_two sm:mt-6 sm:text-lg sm:leading-8">
					{{ error.message || "Sorry, we couldn't find the page you're looking for." }}
				</p>
			</div>
			<div class="mt-10 flex justify-center gap-4">
				<nuxt-link to="/" class="btn-primary text-sm font-semibold leading-6 ">
					Go Home
				</nuxt-link>
			</div>
		</main>
		<footer class=" py-6 sm:py-10 fixed bottom-0 inset-x-0">
			<div class="mx-auto flex max-w-7xl flex-col items-center justify-center gap-4 px-6 sm:flex-row lg:px-8">
				<p class="text-sm leading-7 text-gray-400">
					&copy; Taaskly, Inc. All rights reserved.
				</p>

				<div class="flex gap-x-4">
					<a v-for="(item, itemIdx) in social" :key="itemIdx" :href="item.href" target="_blank" class="text-gray-400 hover:text-gray-500">
						<span class="sr-only">{{ item.name }}</span>
						<component :is="item.icon" class="h-6 w-6" aria-hidden="true" />
					</a>
				</div>
			</div>
		</footer>
	</div>
</template>

<script setup>
import { TwitterIcon, Instagram, Linkedin } from 'lucide-vue-next'

// Define props to receive error information from Nuxt
const props = defineProps({
  error: {
    type: Object,
    default: () => ({})
  }
})

// Console log the error details
console.error('Error page loaded with details:', {
  statusCode: props.error.statusCode,
  statusMessage: props.error.statusMessage,
  message: props.error.message,
  stack: props.error.stack,
  url: props.error.url,
  fullError: props.error
})

// Also log to help with debugging
if (process.client) {
  console.group('🚨 Error Page Debug Info')
  console.log('Error Status Code:', props.error.statusCode)
  console.log('Error Status Message:', props.error.statusMessage)
  console.log('Error Message:', props.error.message)
  console.log('Error URL:', props.error.url)
  console.log('Full Error Object:', props.error)
  if (props.error.stack) {
    console.log('Error Stack Trace:', props.error.stack)
  }
  console.groupEnd()
}

const social = [
  {
    name: 'Twitter',
    href: 'https://x.com/goalmatic_io',
    icon: TwitterIcon
  },
  {
    name: 'Instagram',
    href: 'https://www.instagram.com/goalmatic.io/',
    icon: Instagram
    },
    {
    name: 'LinkedIn',
    href: 'https://www.linkedin.com/company/goalmatic/',
    icon: Linkedin
  }
]
</script>

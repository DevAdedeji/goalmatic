<template>
	<header class=" flex items-center justify-between py-4 md:px-5 px-4 bg-transparent border-b border-[#E9E9E9]">
		<div class="flex items-center gap-4">
			<span class="hidden md:flex" />
			<!-- <img src="/lt.svg" alt="" class="w-[130px] md:hidden"> -->
			<ClientOnly>
				<h1 v-if="title" class="text-lg font-semibold text-gray-900  block">
					{{ title }}
				</h1>
			</ClientOnly>
		</div>

		<div class="flex items-center gap-4">
			<div class="relative" @click.stop>
				<DropdownMenuRoot>
					<DropdownMenuTrigger class="bg-tertiary text-[#2D00BA] rounded-lg p-2 px-4 border border-line center gap-2 ">
						<IconsHeadset />
						<span class="text-sm">Support</span>
					</DropdownMenuTrigger>
					<DropdownMenuPortal>
						<DropdownMenuContent class="w-[280px] my-2 p-2 border border-line rounded-lg bg-white shadow-lg z-[999]">
							<div class="p-2 space-y-2">
								<div class="flex items-center justify-between gap-2">
									<DropdownMenuItem as="a" href="mailto:support@taaskly.com" class="flex items-center gap-2 p-2 rounded-lg cursor-pointer hover:bg-tertiary flex-1">
										<Mail class="size-4 text-[#2D00BA]" />
										<span class="text-sm">Email Support</span>
									</DropdownMenuItem>
									<button class="p-2 hover:bg-tertiary rounded-lg" @click="copyToClipboard('support@goalmatic.io')">
										<Copy class="size-4 text-[#2D00BA]" />
									</button>
								</div>
								<div class="flex items-center justify-between gap-2">
									<DropdownMenuItem as="a" href="https://wa.me/+2348146923944" target="_blank" class="flex items-center gap-2 p-2 rounded-lg cursor-pointer hover:bg-tertiary flex-1">
										<MessageSquare class="size-4 text-[#2D00BA]" />
										<span class="text-sm">WhatsApp Support</span>
									</DropdownMenuItem>
									<button class="p-2 hover:bg-tertiary rounded-lg" @click="copyToClipboard('https://wa.me/+2348146923944')">
										<Copy class="size-4 text-[#2D00BA]" />
									</button>
								</div>
							</div>
						</DropdownMenuContent>
					</DropdownMenuPortal>
				</DropdownMenuRoot>
			</div>
			<nuxt-link v-if="!isLoggedIn" to="/auth/login" class="btn-outline btn" @click="saveCurrentUrl">
				Login
			</nuxt-link>
			<!-- <AvatarDropdown v-if="isLoggedIn" class="md:hidden" /> -->
		</div>
	</header>
</template>

<script setup lang="ts">
import { DropdownMenuContent, DropdownMenuItem, DropdownMenuPortal, DropdownMenuRoot, DropdownMenuTrigger } from 'radix-vue'
import { Mail, MessageSquare, Copy } from 'lucide-vue-next'

import AvatarDropdown from '@/components/core/AvatarDropdown.vue'
import { useAlert } from '@/composables/core/notification'
import { useUser } from '@/composables/auth/user'
import { useHeaderTitle } from '@/composables/core/headerTitle'


const { isLoggedIn } = useUser()
const { title } = useHeaderTitle()


const saveCurrentUrl = () => {
  if (process.client) {
    localStorage.setItem('redirect_after_login', window.location.pathname)
  }
}

const copyToClipboard = async (text: string) => {
	try {
		await navigator.clipboard.writeText(text)
		useAlert().openAlert({
			msg: 'Copied to clipboard!',
			type: 'SUCCESS'
		})
	} catch (err) {
		useAlert().openAlert({
			msg: 'Failed to copy to clipboard',
			type: 'ERROR'
		})
	}
}
</script>

<style scoped>
.btn{
@apply text-sm px-5 py-[7px]  md:px-8
}
</style>

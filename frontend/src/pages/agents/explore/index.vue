<template>
	<section class="flex flex-col gap-4 center pt-10 px-4">
		<!-- Only show Create Agent button for authenticated users -->
		<div v-if="isLoggedIn" class="flex w-full justify-end">
			<button class="btn-primary" @click="useAssistantModal().openCreateAgent()">
				Create Agent
			</button>
		</div>
		<h1 class="text-[32px] font-bold text-headline">
			Explore Agents
		</h1>
		<p class="text-base text-subText font-medium">
			Find the perfect solution for your tasks and projects.
		</p>
		<div class="flex flex-col gap-4  max-w-[1200px] mx-auto md:w-9/12 w-full">
			<div class="flex w-full justify-start mt-5">
				<Tabs :selected="selected" :tabs="tabViews" @changed="updateTab($event)" />
			</div>

			<div class="mb-12 pt-2">
				<keep-alive>
					<component :is="tabs[selected]" />
				</keep-alive>
			</div>
		</div>
	</section>
</template>

<script setup lang="ts">
import all from './tabs/all.vue'
import by_You from './tabs/byYou.vue'
import { useAssistantModal } from '@/composables/core/modals'
import { useTabs } from '@/composables/utils/tabs'
import { useUser } from '@/composables/auth/user'

// Get user authentication status
const { isLoggedIn } = useUser()

definePageMeta({
	layout: 'dashboard'
	// No authentication middleware - public agents can be viewed by anyone
})

const { initTabs, selected, tabViews, updateTab, tabs, onTabMounted } = useTabs()

// Initialize tabs with components based on authentication status
const initializeTabsBasedOnAuth = () => {
  if (isLoggedIn.value) {
    // Show both tabs for authenticated users
    initTabs(
      'all',
      ['all', 'by_You'],
      markRaw({ all, by_You })
    )
  } else {
    // Show only 'all' tab for unauthenticated users
    initTabs(
      'all',
      ['all'],
      markRaw({ all })
    )
  }
}

// Initialize tabs and watch for auth state changes
initializeTabsBasedOnAuth()
watch(isLoggedIn, () => {
  initializeTabsBasedOnAuth()
})

onTabMounted()
</script>



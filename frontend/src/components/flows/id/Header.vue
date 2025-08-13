<template>
	<section id="header" class="flex md:flex-row flex-col items-center justify-between w-full">
		<div class="flex flex-col w-full items-center md:items-start">
			<!-- Avatar -->
			<div v-if="loading" class="relative">
				<Skeleton width="64px" height="64px" radius="50%" />
			</div>
			<div v-else class="relative">
				<img :src="flowData.avatar || '/bot.png'" alt="flow avatar" class="size-[64px] rounded-full">
			</div>

			<!-- Flow Name -->
			<div class="flex items-center gap-2 mt-5">
				<Skeleton v-if="loading" width="192px" height="32px" radius="4px" />
				<h1 v-else class="text-headline text-2xl font-bold">
					{{ flowData?.name || 'Untitled Flow' }}
				</h1>
			</div>

			<!-- Created Date -->
			<Skeleton v-if="loading" width="128px" height="16px" radius="4px" class="mt-2" />
			<p v-else class="text-[#37363D] text-[14px] mt-2">
				Created at: {{
					flowData?.created_at ? formatDateString(flowData.created_at, {
						month: 'short',
						day: 'numeric',
						year: 'numeric'
					}) : 'Unknown date'
				}}
			</p>

			<!-- Clone Button -->
			<div class="flex mt-5 gap-2">
				<Skeleton v-if="loading" width="80px" height="40px" radius="4px" />
				<button v-else class="btn-icon gap-2 text-primary" :disabled="cloneLoading" :title="!canCloneFlow(flowData) ? (flowData?.creator_id === user_id ? 'You cannot clone your own flow' : 'You must be logged in to clone a flow') : 'Clone this flow'"
					@click="handleCloneFlow(flowData)">
					Clone
					<Copy :size="16" color="#601DED" />
				</button>
			</div>
		</div>

		<article class="flex flex-col gap-3.5 mt-8 md:mt-0 w-full md:w-auto md:min-w-[200px]">
			<!-- Details Title -->
			<Skeleton v-if="loading" width="64px" height="24px" radius="4px" />
			<h2 v-else class="font-medium">
				Details
			</h2>

			<!-- Creator Name -->
			<Skeleton v-if="loading" width="96px" height="16px" radius="4px" />
			<p v-else class="text-subText text-[14px] text-[#7A797E]">
				By {{ flowData?.user?.name || 'Unknown User' }}
			</p>

			<!-- Last Updated -->
			<Skeleton v-if="loading" width="128px" height="16px" radius="4px" />
			<p v-else class="text-subText text-[14px] text-[#7A797E]">
				Last Updated: {{ flowData?.updated_at ? formatDateString(flowData.updated_at, {
					month: 'short',
					day: 'numeric',
					year: 'numeric'
				}) : 'Unknown date' }}
			</p>
		</article>
	</section>

	<hr class="w-full border-line my-4">

	<section id="about" class="card gap-2 w-full">
		<div class="flex justify-between items-center mb-2">
			<Skeleton v-if="loading" width="96px" height="24px" radius="4px" />
			<h1 v-else class="section-title">
				About Flow
			</h1>
		</div>

		<!-- Description -->
		<div v-if="loading" class="space-y-2">
			<Skeleton width="100%" height="16px" radius="4px" />
			<Skeleton width="75%" height="16px" radius="4px" />
			<Skeleton width="50%" height="16px" radius="4px" />
		</div>
		<div v-else class="text-subText prose max-w-none" v-html="flowData.description || '<p>No description provided.</p>'" />
	</section>

	<!-- Nodes list (visible in public/non-owner view under About) -->
	<section id="nodes" class="card gap-3 w-full mt-4">
		<div class="flex justify-between items-center mb-2">
			<Skeleton v-if="loading" width="180px" height="24px" radius="4px" />
			<h2 v-else class="section-title">
				Nodes in this Flow
			</h2>
		</div>

		<!-- Loading state -->
		<div v-if="loading" class="flex items-center gap-2 flex-wrap">
			<Skeleton width="120px" height="40px" radius="999px" />
			<Skeleton width="150px" height="40px" radius="999px" />
			<Skeleton width="120px" height="40px" radius="999px" />
		</div>

		<!-- Nodes content as pill chips -->
		<div v-else>
			<div v-if="usedApps.length === 0" class="text-subText text-[14px]">
				No nodes configured for this flow.
			</div>
			<ul v-else class="flex items-center gap-3 flex-wrap">
				<li v-for="(app, idx) in usedApps" :key="idx" class="inline-flex items-center gap-2 bg-grey rounded-md border border-line px-3 py-2">
					<img :src="app.icon" :alt="app.label" class="h-5 w-5 rounded-md">
					<span class="text-sm font-medium">{{ app.label }}</span>
				</li>
			</ul>
		</div>
	</section>
</template>

<script setup lang="ts">
import { Copy } from 'lucide-vue-next'
import { useCloneFlow } from '@/composables/dashboard/flows/clone'
import { useUser } from '@/composables/auth/user'
import { formatDateString } from '@/composables/utils/formatter'
import { useAlert } from '@/composables/core/notification'
import Skeleton from '@/components/core/skeleton.vue'

const { cloneFlow, loading: cloneLoading } = useCloneFlow()
const { id: user_id, isLoggedIn } = useUser()
const { openAlert } = useAlert()

const props = defineProps({
  flowData: {
    type: Object,
    required: true
  },
  loading: {
    type: Boolean,
	  default: false,
		required: true
  }
})

// Derive used app pills from trigger + steps
const usedApps = computed(() => {
  const apps: { label: string; icon: string }[] = []
  const add = (node?: any) => {
    if (!node) return
    const baseLabel = node.parent_node_id ? String(node.name).split(':')[0].trim() : node.name
    const label = baseLabel || 'Unknown'
    const icon = node.icon || '/bot.png'
    // Avoid duplicates by label
    if (!apps.find((a) => a.label === label)) {
      apps.push({ label, icon })
    }
  }
  add((props as any).flowData?.trigger)
  ;((props as any).flowData?.steps || []).forEach((s: any) => add(s))
  return apps
})

const canCloneFlow = (flow: Record<string, any>) => {
  if (!isLoggedIn.value) return false
  if (flow.creator_id === user_id.value) return false
  return true
}

const handleCloneFlow = (flow: Record<string, any>) => {
  if (!isLoggedIn.value) {
    openAlert({
      type: 'ERROR',
      msg: 'You must be logged in to clone a flow',
      position: 'bottom-right'
    })
    return
  }
  if (flow.creator_id === user_id.value) {
    openAlert({
      type: 'ERROR',
      msg: 'You cannot clone your own flow'
    })
    return
  }
  cloneFlow(flow)
}
</script>

<style scoped lang="scss">
.section-title{
	@apply  text-base md:text-xl font-semibold;
}
</style>

<template>
	<article class="card">
		<div class="body">
			<header class="flex justify-between items-center">
				<img src="/bot.png" alt="" class="flex w-[34px] h-[34px] flex-shrink-0 aspect-square rounded-full border border-white">
				<nuxt-link :to="`/agents/explore/${agent.id}`" class="flex flex-col justify-center items-center gap-1 py-0.5 px-3 rounded-md border border-black/10 bg-white shadow-sm text-gray-900 text-center text-xs font-medium leading-5">
					Clone
				</nuxt-link>
			</header>
			<h4 class="capitalize text-[#1F1F1F] text-sm font-semibold leading-[140%] tracking-[-0.56px] self-stretch mt-3.5">
				{{ agent.name }}
			</h4>
			<p class="overflow-hidden h-9 text-[#7A797E]  whitespace-wrap text-xs font-medium leading-[14.4px]">
				{{ truncateString(agent.description, 60) }}
			</p>
		</div>
		<footer>
			<span class="text-grey_four text-xs font-semibold">By {{ agent.user.name }}</span>
		</footer>
	</article>
</template>

<script setup lang="ts">
import { truncateString } from '@/composables/utils/formatter'



const props = defineProps<{
    agent: any
}>()


</script>

<style scoped lang="postcss">
.card{
    @apply bg-[#F5F7F9] flex flex-col  border border-[#DCE3EA] rounded-xl;
	.body{
		@apply bg-light border-b border-[#EFE8FD] rounded-xl py-3 px-4 cursor-pointer ;
	}
    footer{
        @apply  py-3 px-4;
    }
}
</style>

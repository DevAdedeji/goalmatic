<template>
	<section id="main1" class="flex flex-col items-center gap-4 relative h-[calc(100vh-0px)] w-full  px-4 md:pt-8 pt-4 overflow-auto pb-20">
		<section id="main2" class=" w-full md:max-w-[var(--mw)]  flex flex-col gap-6 items-start ">
			<div class="flex items-center justify-start gap-2 border-line border p-4 rounded-xl bg-[#FCFCFD] w-full">
				<div class="assistant-avatar">
					<img class="size-5" src="/og.png" alt="goalmatic logo">
				</div>
				<span class="name-label">Goalmatic 1.0</span>
				<span class="default-pill">Default</span>
			</div>
		</section>
		<section id="main2" class=" w-full md:max-w-[var(--mw)]  flex flex-col gap-6 items-start ">
			<div class="message-container">
				<div class="header-container">
					<div class="assistant-avatar">
						<img class="size-5" src="/og.png" alt="goalmatic logo">
					</div>

					<p class="name-label">
						Goalmatic (Default)
					</p>
				</div>
				<article class="message-bubble">
					<p class="message-text">
						How can I help you today?
					</p>
				</article>
			</div>
		</section>
	</section>
</template>

<script setup lang="ts">

import { useFetchAgents } from '@/composables/dashboard/assistant/agents/fetch'





const { fetchAllAgents, fetchedAllAgents } = useFetchAgents()

fetchAllAgents()

</script>

<style scoped lang="scss">
.shadow{
	box-shadow: 0px 8px 24px 0px #959DA533;
}
#main1, #main2 {
	scroll-padding: 10rem;
}
.message-container {
  @apply flex flex-col gap-2 w-full items-start;
}

.header-container {
  @apply flex gap-2 text-[#374151];
}

.user-avatar {
  @apply  flex size-[30px] shrink-0 select-none items-center justify-center rounded-full border shadow-sm;
}

.assistant-avatar {
  @apply bg-[#eaeaef] flex size-[30px] shrink-0 items-center justify-center rounded-full p-0.5;
}

.name-label {
  @apply  overflow-x-hidden font-semibold mt-0.5;
}

.message-bubble {
  @apply bg-[#F4F3FF] px-4 py-2 rounded-lg ml-9 w-auto border border-[#E4E7EC] md:leading-8 leading-7;
    p {
    @apply text-sm text-subText ;
  }
}


</style>


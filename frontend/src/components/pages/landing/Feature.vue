<template>
	<div class="container md:px-9 px-4 relative overflow-hidden flex flex-col items-center mt-20 md:mt-40">
		<section v-for="feature in features" :key="feature.title" :class="['bento', feature.bentoClass]">
			<article>
				<h2 class="text-3xl md:text-4xl font-bold text-headline mb-4">
					{{ feature.title }}
				</h2>
				<p class="text-sm md:text-base text-dark mb-6">
					{{ feature.description }}
				</p>
				<img :src="feature.articleImg" alt="feature-1" class="max-w-[353px]">
			</article>
			<img :src="feature.img" alt="feature-1">
		</section>
	</div>
</template>

<script setup lang="ts">
import { watchUserStateChange } from '@/firebase/auth'

const features = [
    {
        title: 'AI Agents',
        description: 'Build your own assistants tailored to your goals. From daily planning to writing emails — your agent, your rules.',
        articleImg: '/hero/brain.png',
        img: '/hero/agent.png'
    },
    {
        title: 'Workflows',
        description: 'Automate anything. Trigger actions, schedule tasks, and connect multiple tools — without writing a single line of code.',
        articleImg: '/hero/bolt.png',
        img: '/hero/flow.png',
        bentoClass: 'md:!flex-row-reverse '
    },
    {
        title: 'Smart Tables',
        description: 'Store data, track progress, or organize resources. Like spreadsheets — but smarter and connected to your workflows.',
        articleImg: '/hero/cube.png',
        img: '/hero/table.png'
    }
]

definePageMeta({
	layout: false
})

onMounted(() => watchUserStateChange())

</script>

<style lang="scss">
.bento{
	@apply flex flex-col md:flex-row items-center justify-between w-full mb-24 gap-2.5;
    article{
        @apply p-6 w-full md:w-[40%] flex flex-col items-start ;
        p{
            @apply self-stretch text-[rgba(0,_0,_0,_0.70)] text-base tracking-[0px]  not-italic leading-[26px] mb-11
        }
        img{
            @apply w-full
        }
    }
    img{
        @apply md:w-[60%] w-full
    }

}
</style>

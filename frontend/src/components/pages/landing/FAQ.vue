<template>
	<div class="container mx-auto px-4 md:px-9 py-12 flex flex-col items-center">
		<h2 class="text-4xl md:text-5xl font-semibold text-headline text-center mb-4 ">
			Frequently asked questions.
		</h2>
		<p class="text-center text-dark mb-12 max-w-2xl mx-auto">
			Have questions about Goalmatic? We've got answers to help you understand how our platform can work for you.
		</p>

		<div class="w-full max-w-6xl">
			<div v-for="(faq, index) in faqs" :key="index">
				<div
					class="flex justify-between gap-1 items-center md:p-5 py-4 bg-white border-b"
					:class="{ 'rounded-b-none border-b-0': activeIndex === index }"
					@click="toggleFaq(index)"
				>
					<h3 class="text-lg font-medium text-headline ">
						{{ faq.question }}
					</h3>
					<button class=" text-light bg-dark rounded-full  focus:outline-none transition-transform duration-200">
						<span v-if="activeIndex === index">
							<MinusCircle :size="25" />
						</span>
						<span v-else>
							<PlusCircle :size="25" />
						</span>
					</button>
				</div>
				<transition
					name="accordion"
					:css="false"
					@enter="startTransition"
					@leave="endTransition"

				>
					<div
						v-show="activeIndex === index"
						class="overflow-hidden bg-white  border-b"
					>
						<div class="md:p-5 py-4 pt-0">
							<p class="text-dark">
								{{ faq.answer }}
							</p>
						</div>
					</div>
				</transition>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { PlusCircle, MinusCircle } from 'lucide-vue-next'
import { gsap } from 'gsap'

const activeIndex = ref<number | null>(null)

const toggleFaq = (index: number) => {
    if (activeIndex.value === index) {
        activeIndex.value = null
    } else {
        activeIndex.value = index
    }
}


const startTransition = (el: Element, done: () => void) => {
	const element = el as HTMLElement
	element.style.overflow = 'hidden'
	element.style.height = '0px'

	const originalDisplay = element.style.display
	element.style.display = ''
	element.style.height = 'auto'
	const height = element.scrollHeight
	element.style.height = '0px'
	element.style.display = originalDisplay
	element.offsetHeight


	gsap.to(element, {
		height: `${height}px`,
		duration: 0.3,
		ease: 'power1.inOut',
		onComplete: () => {
			element.style.height = 'auto'
			element.style.overflow = ''
			done()
		}
	})
}

const endTransition = (el: Element, done: () => void) => {
	const element = el as HTMLElement
	element.style.overflow = 'hidden'

	gsap.to(element, {
		height: '0px',
		duration: 0.3,
		ease: 'power1.inOut',
		onComplete: () => {
			element.style.overflow = ''
			done()
		}
	})
}

const faqs = [
    {
        question: 'What is Goalmatic and how does it work?',
        answer: 'Goalmatic is a platform that helps you build AI agents, create workflows, and manage data with smart tables. It allows you to automate tasks, connect multiple tools, and organize your resources without writing code.'
    },
    {
        question: 'Do I need to know how to code?',
        answer: 'No, Goalmatic is designed to be user-friendly and requires no coding knowledge. Our intuitive interface allows you to build agents and workflows through simple drag-and-drop actions and configurations.'
    },
    {
        question: 'What kind of tasks can I automate?',
        answer: 'You can automate a wide range of tasks including daily planning, email writing, data collection, scheduling, notifications, and connecting multiple tools together. The possibilities are extensive with our customizable agents and workflows.'
    },
    {
        question: 'Can I integrate Goalmatic with other apps I use?',
        answer: 'Yes, Goalmatic is designed to integrate with many popular apps and services. You can connect your existing tools to create powerful workflows that automate tasks across different platforms.'
    },
    {
        question: 'Is my data secure with Goalmatic?',
        answer: 'Yes, we take data security very seriously. Goalmatic employs industry-standard encryption and security practices to ensure your data remains private and protected. We never share your data with third parties without your explicit permission.'
    },
    {
        question: 'Do you offer a free trial?',
        answer: 'Yes, we offer a free tier that allows you to explore Goalmatic\'s core features. You can create basic agents and workflows to experience the platform before deciding to upgrade to a paid plan with more advanced capabilities.'
    },
    {
        question: 'How do smart tables work?',
        answer: 'Smart tables function like intelligent spreadsheets that can store, organize, and manage your data. They can be connected to your agents and workflows, allowing for automated data entry, retrieval, and analysis without manual intervention.'
    },
    {
        question: 'Can I customize my AI agents?',
        answer: 'Absolutely! Goalmatic allows you to fully customize your AI agents to suit your specific needs. You can define their behavior, connect them to various tools, and train them to handle specific tasks according to your preferences.'
    }
]
</script>

<style scoped>
/* Removed redundant CSS transitions as :css="false" is used */
</style>

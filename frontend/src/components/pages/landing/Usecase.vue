<template>
	<div class="container mx-auto px-4 md:px-9 py-16">
		<div class="text-center mb-12">
			<h2 class="text-3xl md:text-5xl font-bold text-headline mb-4">
				Build the AI agents that<br>fit your use case
			</h2>
			<p class="text-dark max-w-2xl mx-auto">
				AI agents aren't one-size-fits-all. Goalmatic lets you create agents tailored to your life, your tools, and your goals.
			</p>
		</div>

		<!-- Marquee container with gradient overlays for smooth edges -->
		<div class="marquee-wrapper relative">
			<!-- Left gradient overlay -->
			<div class="absolute left-0 top-0 h-full w-16 z-10 bg-gradient-to-r from-white to-transparent" />

			<!-- Right gradient overlay -->
			<div class="absolute right-0 top-0 h-full w-16 z-10 bg-gradient-to-l from-white to-transparent" />

			<div class="marquee-container overflow-hidden relative">
				<div class="marquee-track flex">
					<!-- First set of cards -->
					<div
						v-for="(agent, index) in agents"
						:key="`first-${index}`"
						class="bg-gray-50 rounded-lg p-6 flex flex-col hover:shadow-md transition-all duration-300 hover:translate-y-[-4px] agent-card min-w-[280px] md:min-w-[320px] mx-3"
					>
						<img :src="agent.image" alt="Agent Image" class=" mb-4">
						<h3 class="text-xl font-semibold text-headline mb-2">
							{{ agent.title }}
						</h3>
						<p class="text-dark text-sm flex-grow">
							{{ agent.description }}
						</p>
					</div>

					<!-- Duplicate set of cards for continuous scrolling -->
					<div
						v-for="(agent, index) in agents"
						:key="`second-${index}`"
						class="bg-gray-50 rounded-lg p-6 flex flex-col hover:shadow-md transition-all duration-300 hover:translate-y-[-4px] agent-card min-w-[280px] md:min-w-[320px] mx-3"
					>
						<img :src="agent.image" alt="Agent Image" class=" mb-4">
						<h3 class="text-xl font-semibold text-headline mb-2">
							{{ agent.title }}
						</h3>
						<p class="text-dark text-sm flex-grow">
							{{ agent.description }}
						</p>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
const agents = [
	{
		title: 'Study Assistant Agent',
		description: 'Breaks study goals into manageable schedules, focus blocks, and tracks progress over time.',
		image: '/hero/ring.png',
		color: '#4F1DED' // Primary purple
	},
	{
		title: 'Content Scheduler Agent',
		description: 'Helps you draft, schedule, and publish social content by pulling from your notes, trends, and brand guidelines.',
		image: '/hero/ring.png',
		color: '#00A3FF' // Blue
	},
	{
		title: 'Daily Planning Agent',
		description: 'Pulls tasks from your calendar, notes, and reminders to generate a daily agenda tailored to your goals and energy levels.',
		image: '/hero/ring.png',
		color: '#FF6B00' // Orange
	},
	{
		title: 'Habit Tracker Agent',
		description: 'Tracks your habits, sends reminders, and gives you weekly reports on consistency and progress.',
		image: '/hero/ring.png',
		color: '#00C48C' // Green
	},
	{
		title: 'Email Assistant Agent',
		description: 'Helps you draft, organize, and respond to emails based on your communication style and priorities.',
		image: '/hero/ring.png',
		color: '#FF3D71' // Red
	},
	{
		title: 'Research Agent',
		description: 'Gathers information from various sources, summarizes findings, and helps you organize research materials.',
		image: '/hero/ring.png',
		color: '#FFAA00' // Yellow
	},
	{
		title: 'Project Manager Agent',
		description: 'Tracks project milestones, assigns tasks, and sends reminders to keep your team on schedule.',
		image: '/hero/ring.png',
		color: '#7B61FF' // Light purple
	},
	{
		title: 'Learning Coach Agent',
		description: 'Creates personalized learning paths, quizzes you on material, and adapts to your learning style.',
		image: '/hero/ring.png',
		color: '#0095FF' // Light blue
	}
]


</script>

<style scoped>
.btn-primary {
	@apply bg-primary text-white font-medium;
	/* Using var(--primary) directly as Tailwind config uses it */
}

.btn-primary:hover {
	background-color: var(--primary-dark, #4018c2); /* Keep as is if --primary-dark isn't in Tailwind config */
	/* Or potentially use a darker shade if defined: @apply bg-primary-dark; */
}

.agent-card {
	@apply border border-transparent transition-all duration-300 ease-in-out;
	/* Added ease-in-out based on common transition patterns */
	box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05); /* Keep custom shadow or replace with Tailwind shadow if suitable e.g. shadow-sm */
}

.agent-card:hover {
	@apply border-primary; /* Assumes --primary is mapped to 'primary' in Tailwind config */
	box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1); /* Keep custom shadow or replace e.g. shadow-lg */
}

.agent-image-container {
	@apply transition-transform duration-300 ease-in-out;
}



.marquee-wrapper {
	@apply w-full py-5 overflow-hidden;
}

.marquee-container {
	@apply w-full py-2.5 overflow-hidden;
}

.marquee-track {
	@apply w-fit will-change-transform;
	animation: marquee 40s linear infinite; /* Keep animation definition */
}

/* Pause animation on hover */
.marquee-container:hover .marquee-track {
	animation-play-state: paused; /* Keep animation-play-state or use paused:animate-none if animation is utility-based */
}

@keyframes marquee {
	0% {
		transform: translateX(0);
	}
	100% {
		transform: translateX(-50%);
	}
}

/* Responsive adjustments */
@media (max-width: 768px) {
	.marquee-track {
		animation-duration: 25s; /* Keep animation-duration */
	}

	.agent-card {
		@apply min-w-[260px];
	}
}
</style>

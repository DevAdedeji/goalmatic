<template>
	<div class="container mx-auto px-4 md:px-9 py-16 md:py-24">
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
						<div class="mb-4 agent-image-container" :style="`--agent-color: ${agent.color}`">
							<div class="w-24 h-24 agent-ring" v-html="getColoredRing(agent.color)" />
						</div>
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
						<div class="mb-4 agent-image-container" :style="`--agent-color: ${agent.color}`">
							<div class="w-24 h-24 agent-ring" v-html="getColoredRing(agent.color)" />
						</div>
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
		image: '/usecase/agent-ring.svg',
		color: '#4F1DED' // Primary purple
	},
	{
		title: 'Content Scheduler Agent',
		description: 'Helps you draft, schedule, and publish social content by pulling from your notes, trends, and brand guidelines.',
		image: '/usecase/agent-ring.svg',
		color: '#00A3FF' // Blue
	},
	{
		title: 'Daily Planning Agent',
		description: 'Pulls tasks from your calendar, notes, and reminders to generate a daily agenda tailored to your goals and energy levels.',
		image: '/usecase/agent-ring.svg',
		color: '#FF6B00' // Orange
	},
	{
		title: 'Habit Tracker Agent',
		description: 'Tracks your habits, sends reminders, and gives you weekly reports on consistency and progress.',
		image: '/usecase/agent-ring.svg',
		color: '#00C48C' // Green
	},
	{
		title: 'Email Assistant Agent',
		description: 'Helps you draft, organize, and respond to emails based on your communication style and priorities.',
		image: '/usecase/agent-ring.svg',
		color: '#FF3D71' // Red
	},
	{
		title: 'Research Agent',
		description: 'Gathers information from various sources, summarizes findings, and helps you organize research materials.',
		image: '/usecase/agent-ring.svg',
		color: '#FFAA00' // Yellow
	},
	{
		title: 'Project Manager Agent',
		description: 'Tracks project milestones, assigns tasks, and sends reminders to keep your team on schedule.',
		image: '/usecase/agent-ring.svg',
		color: '#7B61FF' // Light purple
	},
	{
		title: 'Learning Coach Agent',
		description: 'Creates personalized learning paths, quizzes you on material, and adapts to your learning style.',
		image: '/usecase/agent-ring.svg',
		color: '#0095FF' // Light blue
	}
]

// Function to create a colored SVG ring dynamically
const getColoredRing = (color: string): string => {
	return `<svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
		<circle cx="50" cy="50" r="40" stroke="${color}" stroke-width="8" fill="none"/>
	</svg>`
}
</script>

<style scoped>
.btn-primary {
	background-color: var(--primary);
	color: white;
	font-weight: 500;
}

.btn-primary:hover {
	background-color: var(--primary-dark, #4018c2);
}

.agent-card {
	border: 1px solid transparent;
	transition: all 0.3s ease;
}

.agent-card:hover {
	border-color: var(--primary, #4F1DED);
}

.agent-image-container {
	transition: transform 0.3s ease;
}

.agent-card:hover .agent-image-container {
	transform: rotate(10deg);
}

.marquee-wrapper {
	width: 100%;
	padding: 20px 0;
	overflow: hidden;
}

.marquee-container {
	width: 100%;
	padding: 10px 0;
	overflow: hidden;
}

.marquee-track {
	animation: marquee 40s linear infinite;
	will-change: transform;
	width: fit-content;
}

/* Pause animation on hover */
.marquee-container:hover .marquee-track {
	animation-play-state: paused;
}

@keyframes marquee {
	0% {
		transform: translateX(0);
	}
	100% {
		transform: translateX(-50%);
	}
}

/* Add some depth to the cards with subtle shadow */
.agent-card {
	box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.agent-card:hover {
	box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
}

/* Responsive adjustments */
@media (max-width: 768px) {
	.marquee-track {
		animation-duration: 25s; /* Faster on mobile */
	}

	.agent-card {
		min-width: 260px;
	}
}
</style>

<template>
	<div class="container mx-auto px-4 md:px-9 py-16 relative">
		<header class="flex flex-col items-center">
			<div class="text-center mb-12">
				<h2 class="text-3xl md:text-5xl font-semibold text-headline mb-4">
					Your All-In-One Automation Solution.
				</h2>
				<p class="text-dark max-w-2xl mx-auto">
					Cut implementation cost and automate lengthy manual processes with AI agents and workflows built for you and your processes.
				</p>
			</div>
			<a href="https://cal.com/kromate/goalmatic-demo" target="_blank" class="landing-btn scale-100  mb-12">
				Book a Demo
			</a>
		</header>

		<!-- Bento Grid Layout -->
		<div class="bento-grid">
			<!-- Mobile marquee tracks - 3 alternating rows -->
			<div class="mobile-marquee-container mobile-only">
				<div class="marquee-track marquee-left-to-right">
					<div
						v-for="(agent, index) in getRowAgents(0)"
						:key="`mobile-row1-${index}`"
						class="agent-card mobile-card"
						:style="{
							borderColor: agent.color,
							'--glow-color': agent.color,
							'--glow-color-rgb': hexToRgb(agent.color),
							boxShadow: `0 0 40px rgba(${hexToRgb(agent.color)}, 0.4), 0 6px 20px rgba(0, 0, 0, 0.2)`
						}"
					>
						<div class="flex flex-col h-full">
							<div class="flex-shrink-0 mb-3">
								<div
									class="w-3 h-3 rounded-full mb-4"
									:style="{ backgroundColor: agent.color }"
								/>
								<h3 class="text-lg font-semibold text-light mb-3">
									{{ agent.title }}
								</h3>
							</div>
							<p class="text-[#D3D2D4] text-sm flex-grow leading-relaxed">
								{{ agent.description }}
							</p>
						</div>
					</div>
					<!-- Duplicate for seamless loop -->
					<div
						v-for="(agent, index) in getRowAgents(0)"
						:key="`mobile-row1-dup-${index}`"
						class="agent-card mobile-card"
						:style="{
							borderColor: agent.color,
							'--glow-color': agent.color,
							'--glow-color-rgb': hexToRgb(agent.color),
							boxShadow: `0 0 40px rgba(${hexToRgb(agent.color)}, 0.4), 0 6px 20px rgba(0, 0, 0, 0.2)`
						}"
					>
						<div class="flex flex-col h-full">
							<div class="flex-shrink-0 mb-3">
								<div
									class="w-3 h-3 rounded-full mb-4"
									:style="{ backgroundColor: agent.color }"
								/>
								<h3 class="text-lg font-semibold text-light mb-3">
									{{ agent.title }}
								</h3>
							</div>
							<p class="text-[#D3D2D4] text-sm flex-grow leading-relaxed">
								{{ agent.description }}
							</p>
						</div>
					</div>
				</div>

				<!-- Row 2 - Right to Left -->
				<div class="marquee-track marquee-right-to-left">
					<div
						v-for="(agent, index) in getRowAgents(1)"
						:key="`mobile-row2-${index}`"
						class="agent-card mobile-card"
						:style="{
							borderColor: agent.color,
							'--glow-color': agent.color,
							'--glow-color-rgb': hexToRgb(agent.color),
							boxShadow: `0 0 40px rgba(${hexToRgb(agent.color)}, 0.4), 0 6px 20px rgba(0, 0, 0, 0.2)`
						}"
					>
						<div class="flex flex-col h-full">
							<div class="flex-shrink-0 mb-3">
								<div
									class="w-3 h-3 rounded-full mb-4"
									:style="{ backgroundColor: agent.color }"
								/>
								<h3 class="text-lg font-semibold text-light mb-3">
									{{ agent.title }}
								</h3>
							</div>
							<p class="text-[#D3D2D4] text-sm flex-grow leading-relaxed">
								{{ agent.description }}
							</p>
						</div>
					</div>
					<!-- Duplicate for seamless loop -->
					<div
						v-for="(agent, index) in getRowAgents(1)"
						:key="`mobile-row2-dup-${index}`"
						class="agent-card mobile-card"
						:style="{
							borderColor: agent.color,
							'--glow-color': agent.color,
							'--glow-color-rgb': hexToRgb(agent.color),
							boxShadow: `0 0 40px rgba(${hexToRgb(agent.color)}, 0.4), 0 6px 20px rgba(0, 0, 0, 0.2)`
						}"
					>
						<div class="flex flex-col h-full">
							<div class="flex-shrink-0 mb-3">
								<div
									class="w-3 h-3 rounded-full mb-4"
									:style="{ backgroundColor: agent.color }"
								/>
								<h3 class="text-lg font-semibold text-light mb-3">
									{{ agent.title }}
								</h3>
							</div>
							<p class="text-[#D3D2D4] text-sm flex-grow leading-relaxed">
								{{ agent.description }}
							</p>
						</div>
					</div>
				</div>

				<!-- Row 3 - Left to Right -->
				<div class="marquee-track marquee-left-to-right">
					<div
						v-for="(agent, index) in getRowAgents(2)"
						:key="`mobile-row3-${index}`"
						class="agent-card mobile-card"
						:style="{
							borderColor: agent.color,
							'--glow-color': agent.color,
							'--glow-color-rgb': hexToRgb(agent.color),
							boxShadow: `0 0 40px rgba(${hexToRgb(agent.color)}, 0.4), 0 6px 20px rgba(0, 0, 0, 0.2)`
						}"
					>
						<div class="flex flex-col h-full">
							<div class="flex-shrink-0 mb-3">
								<div
									class="w-3 h-3 rounded-full mb-4"
									:style="{ backgroundColor: agent.color }"
								/>
								<h3 class="text-lg font-semibold text-light mb-3">
									{{ agent.title }}
								</h3>
							</div>
							<p class="text-[#D3D2D4] text-sm flex-grow leading-relaxed">
								{{ agent.description }}
							</p>
						</div>
					</div>
					<!-- Duplicate for seamless loop -->
					<div
						v-for="(agent, index) in getRowAgents(2)"
						:key="`mobile-row3-dup-${index}`"
						class="agent-card mobile-card"
						:style="{
							borderColor: agent.color,
							'--glow-color': agent.color,
							'--glow-color-rgb': hexToRgb(agent.color),
							boxShadow: `0 0 40px rgba(${hexToRgb(agent.color)}, 0.4), 0 6px 20px rgba(0, 0, 0, 0.2)`
						}"
					>
						<div class="flex flex-col h-full">
							<div class="flex-shrink-0 mb-3">
								<div
									class="w-3 h-3 rounded-full mb-4"
									:style="{ backgroundColor: agent.color }"
								/>
								<h3 class="text-lg font-semibold text-light mb-3">
									{{ agent.title }}
								</h3>
							</div>
							<p class="text-[#D3D2D4] text-sm flex-grow leading-relaxed">
								{{ agent.description }}
							</p>
						</div>
					</div>
				</div>
			</div>

			<!-- Desktop/Tablet grid items -->
			<div
				v-for="(agent, index) in agents"
				:key="`desktop-${index}`"
				class="agent-card desktop-card"
				:style="{
					borderColor: agent.color,
					'--glow-color': agent.color,
					'--glow-color-rgb': hexToRgb(agent.color),
					boxShadow: `0 0 40px rgba(${hexToRgb(agent.color)}, 0.4), 0 6px 20px rgba(0, 0, 0, 0.2)`
				}"
			>
				<div class="flex flex-col h-full">
					<div class="flex-shrink-0 mb-3">
						<div
							class="w-3 h-3 rounded-full mb-4"
							:style="{ backgroundColor: agent.color }"
						/>
						<h3 class="text-lg md:text-xl font-semibold text-light mb-3">
							{{ agent.title }}
						</h3>
					</div>
					<p class="text-[#D3D2D4] text-sm flex-grow leading-relaxed">
						{{ agent.description }}
					</p>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
const agents = [
	{
		title: 'Customer Support',
		description: 'Deliver faster, more accurate responses with Goalmatic that handle customer inquiries.',
		image: '/hero/ring.png',
		color: '#4F1DED'
	},
	{
		title: 'Internal Operations',
		description: 'Streamline internal processes, automate repetitive tasks, and free up your team to focus on what matters most - with less effort.',
		image: '/operations.png',
		color: '#00A3FF'
	},
	{
		title: 'Sales & Lead Management',
		description: 'Qualify leads automatically, follow up with prospects, and close more deals.',
		image: '/hero/ring.png',
		color: '#FF6B00'
	},
	{
		title: 'Project Management',
		description: 'Automate task updates, meeting summaries, and deadline tracking with intelligent workflows.',
		image: '/hero/ring.png',
		color: '#00C48C'
	},
	{
		title: 'Scheduling & Admin Tasks',
		description: 'Let Goalmatic handle your calendar, meetings, and admin work so you can focus on the work that matters.',
		image: '/hero/ring.png',
		color: '#FF3D71'
	},
	{
		title: 'Data Entry & Reporting',
		description: 'Automate form filling, data syncing and reporting across platforms.',
		image: '/hero/ring.png',
		color: '#FFAA00'
	},
	{
		title: 'HR & People Ops',
		description: 'From screening candidates to scheduling interviews and onboarding - automate your HR workflows.',
		image: '/hero/ring.png',
		color: '#7B61FF'
	},
	{
		title: 'Customer Onboarding',
		description: 'Create seamless onboarding flows with automated checklists, reminders and follow-ups.',
		image: '/hero/ring.png',
		color: '#0095FF'
	},
	{
		title: 'Marketing Workflows',
		description: 'Automate campaign coordination, social content review, and approvals.',
		image: '/hero/ring.png',
		color: '#4F1DED'
	},
	{
		title: 'Finance & Billing',
		description: 'Automate invoicing, expense tracking, and reconciliation with Goalmatic.',
		image: '/hero/ring.png',
		color: '#00A3FF'
	}
]

// Helper function to convert hex color to RGB values
const hexToRgb = (hex: string): string => {
	const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
	if (!result) return '0, 0, 0'

	const r = parseInt(result[1], 16)
	const g = parseInt(result[2], 16)
	const b = parseInt(result[3], 16)

	return `${r}, ${g}, ${b}`
}

// Helper function to get agents for a specific row
const getRowAgents = (row: number): typeof agents => {
	if (row === 0) return agents.slice(0, 3) // First 3 items
	if (row === 1) return agents.slice(3, 6) // Next 3 items
	if (row === 2) return agents.slice(6, 10) // Last 4 items
	return []
}
</script>

<style scoped>
.btn-primary {
	@apply bg-primary text-white font-medium;
}

.btn-primary:hover {
	background-color: var(--primary-dark, #4018c2);
}

.bento-grid {
	@apply w-full;

	/* Mobile - Horizontal marquee */
	@media (max-width: 640px) {
		overflow: hidden;
		position: relative;
	}

	/* Tablet and Desktop - Grid layout */
	@media (min-width: 641px) {
		@apply grid gap-4;
	}

	/* Tablet - 2 columns, 5 rows */
	@media (min-width: 641px) and (max-width: 1024px) {
		grid-template-columns: repeat(2, 1fr);
		grid-template-rows: repeat(5, minmax(220px, auto));
	}

	/* Desktop and Laptop - Auto columns with exactly 3 rows */
	@media (min-width: 1025px) {
		grid-template-columns: repeat(4, 1fr);
		grid-template-rows: repeat(3, minmax(240px, auto));
		grid-auto-flow: row;
	}

	/* Large screens - 5 columns with 3 rows */
	@media (min-width: 1400px) {
		grid-template-columns: repeat(4, 1fr);
		grid-template-rows: repeat(3, minmax(240px, auto));
		grid-auto-flow: row;
	}
}

/* Mobile marquee styles */
.mobile-marquee-container {
	@apply flex flex-col gap-4;
}

.marquee-track {
	@apply flex overflow-hidden;
	width: fit-content;
}

.marquee-left-to-right {
	animation: marquee-left 45s linear infinite;
}

.marquee-right-to-left {
	animation: marquee-right 45s linear infinite;
}

.marquee-track:hover {
	animation-play-state: paused;
}

@keyframes marquee-left {
	0% {
		transform: translateX(0);
	}
	100% {
		transform: translateX(-50%);
	}
}

@keyframes marquee-right {
	0% {
		transform: translateX(-50%);
	}
	100% {
		transform: translateX(0%);
	}
}

/* Mobile/Desktop visibility toggles */
.mobile-only {
	@media (min-width: 641px) {
		display: none !important;
	}
}

.desktop-card {
	@media (max-width: 640px) {
		display: none !important;
	}
}

.mobile-card {
	@apply flex-shrink-0 mx-2 w-[280px] h-auto;
}

.agent-card {
	@apply relative p-6 flex flex-col bg-[#000021] rounded-2xl border-2 border-opacity-30 transition-all duration-300 hover:border-opacity-60 hover:transform hover:scale-[1.02];
	background-image: url('/business/card.png');
	background-size: cover;
	background-position: center;
	background-repeat: no-repeat;
	transition: all 0.3s ease-in-out;
}

.agent-card:hover {
	box-shadow: 0 0 60px rgba(var(--glow-color-rgb), 0.6), 0 12px 35px rgba(0, 0, 0, 0.25) !important;
}
</style>

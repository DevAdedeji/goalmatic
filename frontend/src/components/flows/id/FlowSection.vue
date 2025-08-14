<template>
	<div class="flex flex-col gap-4 mt-6 pb-64  mx-auto" :class="[isOwner(flowData) ? 'max-w-[700px]' : '2xl:max-w-5xl max-w-7xl  md:px-10']">
		<h1 v-if="!isOwner(flowData)" class="section-title">
			Preview
		</h1>
		<!-- Flow trigger section -->
		<div class="flex flex-col gap-4 items-center">
			<section v-if="!flowData.trigger && isOwner(flowData)" class="w-full bg-grey  rounded-xl border border-line">
				<header class="flex  items-center justify-between px-4 py-3">
					<div class="flex flex-col">
						<p class="text-base font-semibold">
							When this happens
						</p>
						<span class="text-sm text-[#7A797E]">Your workflow starts when this happens</span>
					</div>

					<span class="flex items-center font-normal gap-1 text-sm text-primary border border-secondaryLight rounded px-2 py-px bg-[#F6F5FF]">
						<svg class="size-4" width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
							<path d="M4.31407 6.33655H4.08459C3.34272 6.33655 2.97179 6.33655 2.81368 6.09197C2.65557 5.8474 2.80622 5.50666 3.10752 4.82517L4.01334 2.77637C4.28729 2.15675 4.42426 1.84695 4.68998 1.67335C4.95571 1.49976 5.29297 1.49976 5.96748 1.49976H7.0122C7.8316 1.49976 8.2413 1.49976 8.39582 1.76743C8.55035 2.03511 8.34708 2.39269 7.94054 3.10787L7.4046 4.05069C7.2025 4.40623 7.10145 4.584 7.10286 4.72952C7.10469 4.91863 7.20527 5.09285 7.3677 5.18828C7.49268 5.2617 7.69636 5.2617 8.10371 5.2617C8.61866 5.2617 8.87614 5.2617 9.01024 5.35084C9.18446 5.46665 9.27565 5.67385 9.24369 5.88134C9.2191 6.04105 9.0459 6.23257 8.6995 6.61561L5.93193 9.67593C5.38835 10.277 5.11655 10.5776 4.93403 10.4824C4.75152 10.3873 4.83917 9.99083 5.01447 9.19783L5.35784 7.64456C5.49132 7.04074 5.55806 6.73883 5.39755 6.53769C5.23704 6.33655 4.92938 6.33655 4.31407 6.33655Z" fill="#8F61F2" />
						</svg>

						Trigger
					</span>
				</header>
				<section class="bg-light rounded-b-xl border-y border-line p-3 flex justify-center">
					<button
						class="btn flex items-center gap-2 bg-grey border border-line"
						@click="useFlowsModal().openSelectNode({ type: 'trigger' })">
						<PlusCircle :size="18" class="text-text-secondary group-hover:text-primary transition-colors" />
						<span class="group-hover:text-primary transition-colors">Add Trigger</span>
					</button>
				</section>
			</section>


			<section v-else class="w-full bg-grey  rounded-xl border border-line">
				<header class="flex  items-center justify-between px-4 py-3">
					<div class="flex flex-col">
						<p class="text-base font-semibold">
							When this happens
						</p>
						<span class="text-sm text-[#7A797E]">Your workflow starts when this happens</span>
					</div>

					<span class="flex items-center font-normal gap-1 text-sm text-primary border border-secondaryLight rounded px-2 py-px bg-[#F6F5FF]">
						<svg class="size-4" width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
							<path d="M4.31407 6.33655H4.08459C3.34272 6.33655 2.97179 6.33655 2.81368 6.09197C2.65557 5.8474 2.80622 5.50666 3.10752 4.82517L4.01334 2.77637C4.28729 2.15675 4.42426 1.84695 4.68998 1.67335C4.95571 1.49976 5.29297 1.49976 5.96748 1.49976H7.0122C7.8316 1.49976 8.2413 1.49976 8.39582 1.76743C8.55035 2.03511 8.34708 2.39269 7.94054 3.10787L7.4046 4.05069C7.2025 4.40623 7.10145 4.584 7.10286 4.72952C7.10469 4.91863 7.20527 5.09285 7.3677 5.18828C7.49268 5.2617 7.69636 5.2617 8.10371 5.2617C8.61866 5.2617 8.87614 5.2617 9.01024 5.35084C9.18446 5.46665 9.27565 5.67385 9.24369 5.88134C9.2191 6.04105 9.0459 6.23257 8.6995 6.61561L5.93193 9.67593C5.38835 10.277 5.11655 10.5776 4.93403 10.4824C4.75152 10.3873 4.83917 9.99083 5.01447 9.19783L5.35784 7.64456C5.49132 7.04074 5.55806 6.73883 5.39755 6.53769C5.23704 6.33655 4.92938 6.33655 4.31407 6.33655Z" fill="#8F61F2" />
						</svg>

						Trigger
					</span>
				</header>
				<FlowStepCard

					:step="flowData.trigger"
					:step-index="0"
					:is-trigger="true"
					:is-flow-active="flowData.status === 1"
					:is-owner="isOwner(flowData)"
					@edit-step="editNode(flowData.trigger)"
					@remove-step="confirmRemoveNode(flowData.trigger)"
					@change-node="handleChangeNode(flowData.trigger, null, 'trigger')"
				/>
			</section>
		</div>

		<!-- Flow action section -->
		<div class="flex flex-col items-center gap-4"
			:class="{ 'mt-12': flowData.steps.length === 0 }"
		>
			<section v-if="flowData.steps.length" class="w-full bg-grey  rounded-xl border border-line">
				<header class="flex  items-center justify-between px-4 py-3">
					<div class="flex flex-col">
						<p class="text-base font-semibold">
							Do this...
						</p>
						<span class="text-sm text-[#7A797E]">Steps your automation takes</span>
					</div>

					<span class="flex items-center font-normal gap-1 text-sm text-primary border border-secondaryLight rounded px-2 py-px bg-[#F6F5FF]">
						<svg class="size-4" width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
							<path d="M9.44529 6.42299C9.26857 7.0945 8.43334 7.56901 6.76287 8.51804C5.14802 9.43546 4.3406 9.89418 3.68992 9.70979C3.4209 9.63356 3.1758 9.48878 2.97812 9.28934C2.5 8.80695 2.5 7.8713 2.5 6C2.5 4.1287 2.5 3.19305 2.97812 2.71066C3.1758 2.51122 3.4209 2.36644 3.68992 2.29021C4.3406 2.10582 5.14802 2.56454 6.76287 3.48196C8.43333 4.43098 9.26857 4.9055 9.44529 5.57701C9.51824 5.85419 9.51824 6.14581 9.44529 6.42299Z" fill="#8F61F2" />
						</svg>

						Action
					</span>
				</header>
				<div class="flex flex-col items-center justify-center w-full p-4 bg-light rounded-b-xl">
					<div v-for="(step, index) in flowData.steps" :key="index" class="w-full flex flex-col items-center gap-0">
						<!-- Connector line with add button (only for owners) -->
						<div v-if="index > 0" class="h-[50px] w-[2px] bg-gray-200 relative ">
							<button
								v-if="isOwner(flowData)"
								class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center hover:border-primary group"
								@click="useFlowsModal().openSelectNode({ type: 'action', position: index })"
							>
								<PlusCircle :size="14" class="text-text-secondary group-hover:text-primary" />
							</button>
						</div>

						<!-- Step card -->
						<FlowStepCard
							:step="step"
							:step-index="index + 1"
							:is-flow-active="flowData.status === 1"
							:is-owner="isOwner(flowData)"
							:total-steps="flowData.steps.length"
							:current-step-index="index"
							class="rounded-xl"
							@edit-step="editNode(step)"
							@remove-step="confirmRemoveNode(step, index)"
							@change-node="handleChangeNode(step, index, 'action')"
							@move-step-up="moveStepUp"
							@move-step-down="moveStepDown"
						/>
					</div>

					<!-- Add step button at the end (only for owners) -->
					<div v-if="isOwner(flowData)" class="flex flex-col items-center ">
						<div class="h-12 w-[2px] bg-gray-200 " />
						<button
							class="flow-empty-btn group"
							@click="useFlowsModal().openSelectNode({ type: 'action' })"
						>
							<PlusCircle :size="18" class="text-text-secondary group-hover:text-primary transition-colors" />
							<span class="group-hover:text-primary transition-colors">Add Step</span>
						</button>
					</div>
				</div>
			</section>

			<section v-else-if="isOwner(flowData)" class="w-full bg-grey  rounded-xl border border-line">
				<header class="flex  items-center justify-between px-4 py-3">
					<div class="flex flex-col">
						<p class="text-base font-semibold">
							Do this...
						</p>
						<span class="text-sm text-[#7A797E]">Steps your automation takes</span>
					</div>

					<span class="flex items-center font-normal gap-1 text-sm text-primary border border-secondaryLight rounded px-2 py-px bg-[#F6F5FF]">
						<svg class="size-4" width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
							<path d="M9.44529 6.42299C9.26857 7.0945 8.43334 7.56901 6.76287 8.51804C5.14802 9.43546 4.3406 9.89418 3.68992 9.70979C3.4209 9.63356 3.1758 9.48878 2.97812 9.28934C2.5 8.80695 2.5 7.8713 2.5 6C2.5 4.1287 2.5 3.19305 2.97812 2.71066C3.1758 2.51122 3.4209 2.36644 3.68992 2.29021C4.3406 2.10582 5.14802 2.56454 6.76287 3.48196C8.43333 4.43098 9.26857 4.9055 9.44529 5.57701C9.51824 5.85419 9.51824 6.14581 9.44529 6.42299Z" fill="#8F61F2" />
						</svg>

						Action
					</span>
				</header>
				<section class="bg-light rounded-b-xl border-y border-line p-3 flex justify-center">
					<button
						class="btn flex items-center gap-2 bg-grey border border-line"
						@click="useFlowsModal().openSelectNode({ type: 'action' })">
						<PlusCircle :size="18" class="text-text-secondary group-hover:text-primary transition-colors" />
						<span>Add Step</span>
					</button>
				</section>
			</section>
		</div>
	</div>
</template>

<script setup lang="ts">
import { PlusCircle } from 'lucide-vue-next'
import FlowStepCard from './FlowStepCard.vue'
import { useEditFlow } from '@/composables/dashboard/flows/edit'
import { useFlowsModal } from '@/composables/core/modals'
import { useFlowOwner } from '@/composables/dashboard/flows/owner'

const { confirmRemoveNode, editNode, handleChangeNode, moveStepUp, moveStepDown } = useEditFlow()
const { isOwner } = useFlowOwner()

defineProps({
	flowData: {
		type: Object,
		required: true
	}
})
</script>

<style scoped>
.flow-empty-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem 1.5rem;
  gap: 0.5rem;
  background-color: white;
  border: 1px dashed #d1d5db;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  color: #6b7280;
  cursor: pointer;
  width: 100%;
  max-width: 32rem;
  transition: all 0.2s;
}

.flow-empty-btn:hover {
  border-color: var(--color-primary);
  background-color: rgba(var(--color-primary-rgb), 0.05);
}

.flow-empty-display {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem 1.5rem;
  background-color: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  width: 100%;
  max-width: 32rem;
}

.section-title{
	@apply  text-base md:text-xl font-semibold;
}
</style>

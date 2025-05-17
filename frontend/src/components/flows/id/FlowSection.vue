<template>
	<div class="flex flex-col gap-4">
		<!-- Flow trigger section -->
		<div class="flex flex-col gap-4 items-center">
			<colorBadge>
				When this happens...
			</colorBadge>

			<button v-if="!flowData.trigger"
				class="flow-empty-btn group"
				@click="useFlowsModal().openSelectNode({ type: 'trigger' })">
				<PlusCircle :size="18" class="text-text-secondary group-hover:text-primary transition-colors" />
				<span class="group-hover:text-primary transition-colors">Add Trigger</span>
			</button>

			<FlowStepCard
				v-else
				:step="flowData.trigger"
				:step-index="0"
				:is-trigger="true"
				:is-flow-active="flowData.status === 1"
				@edit-step="editNode(flowData.trigger)"
				@remove-step="removeNode(flowData.trigger)"
				@change-node="handleChangeNode(flowData.trigger, null, 'trigger')"
			/>
		</div>

		<!-- Flow action section -->
		<div class="flex flex-col items-center gap-4"
			:class="{ 'mt-12': flowData.steps.length === 0 }"
		>
			<colorBadge>
				Do this...
			</colorBadge>

			<!-- Display action steps if they exist -->
			<div v-if="flowData.steps.length" class="flex flex-col items-center justify-center w-full">
				<div v-for="(step, index) in flowData.steps" :key="index" class="w-full flex flex-col items-center gap-0">
					<!-- Connector line with add button -->
					<div v-if="index > 0" class="h-[80px] w-[2px] bg-gray-200 relative ">
						<button
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
						@edit-step="editNode(step)"
						@remove-step="removeNode(step, index)"
						@change-node="handleChangeNode(step, index, 'action')"
					/>
				</div>

				<!-- Add step button at the end -->
				<div class="flex flex-col items-center ">
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

			<!-- Add step button when no action steps exist -->
			<div v-else class="w-full center">
				<button
					class="flow-empty-btn group"
					@click="useFlowsModal().openSelectNode({ type: 'action' })"
				>
					<PlusCircle :size="18" class="text-text-secondary group-hover:text-primary transition-colors mr-2" />
					<span class="group-hover:text-primary transition-colors">Add Step</span>
				</button>
			</div>
		</div>

		<!-- Flow validity warning -->
		<div v-if="!isFlowValid" class="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md text-amber-800 flex items-center gap-2">
			<AlertTriangle :size="18" />
			<span>Your flow needs at least one trigger and one action step to be valid.</span>
		</div>
	</div>
</template>

<script setup lang="ts">
import { PlusCircle, AlertTriangle } from 'lucide-vue-next'
import FlowStepCard from './FlowStepCard.vue'
import { useEditFlow } from '@/composables/dashboard/flows/edit'
import { useFlowsModal } from '@/composables/core/modals'

const { isFlowValid, removeNode, editNode, handleChangeNode } = useEditFlow()

const props = defineProps({
	flowData: {
		type: Object,
		required: true
	}
})



defineEmits([
	'openStepPanel',
	'removeStep'
])
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
</style>

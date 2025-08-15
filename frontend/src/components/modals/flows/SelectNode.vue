<template>
	<Modal
		modal="$atts.modal"
		:title="modalTitle"
		:props-modal="propsModal"
		type="sidebar"
	>
		<section class="mt-8">
			<!-- Replacement indicator -->
			<div v-if="isReplacementMode" class="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md flex items-center gap-2 text-blue-700">
				<RefreshCw :size="18" />
				<span>Select a new {{ payload?.type }} to replace the current one</span>
			</div>

			<div class="flex flex-col gap-4">
				<div
					v-for="node in nodes"
					:key="node.node_id"
					class="border border-border rounded-lg overflow-hidden transition-colors"
				>
					<!-- Parent node -->
					<div
						class="p-4 hover:border-primary cursor-pointer transition-colors"
						:class="{'border-b border-border': hasChildren(node) && !expandedNodes[node.node_id || '']}"
						@click="handleNodeClick(node)"
					>
						<div class="flex items-center justify-between">
							<div class="flex items-center gap-3 mb-1">
								<img :src="node.icon" :alt="node.name" class="w-5 h-5">
								<h3 class="font-medium text-headline">
									{{ node.name }}
								</h3>
							</div>
							<ChevronDown
								v-if="hasChildren(node)"
								:class="[
									'transition-transform w-5 h-5 text-text-secondary',
									!expandedNodes[node.node_id || ''] ? 'transform rotate-180' : ''
								]"
								@click.stop="toggleNodeExpansion(node.node_id || '')"
							/>
						</div>
						<p class="text-sm text-text-secondary ml-8">
							{{ node.description }}
						</p>
					</div>

					<!-- Children nodes -->
					<div
						v-if="hasChildren(node) && !expandedNodes[node.node_id || '']"
						class="bg-gray-50"
					>
						<div
							v-for="child in node.children"
							:key="child.node_id"
							class="p-4 pl-10 border-b border-border last:border-b-0 hover:bg-gray-100 cursor-pointer transition-colors"
							@click="handleChildNodeClick(node, child)"
						>
							<div class="flex items-center gap-3 mb-1">
								<div class="w-2 h-2 bg-primary rounded-full" />
								<h3 class="font-medium text-headline">
									{{ child.name }}
								</h3>
							</div>
							<p class="text-sm text-text-secondary ml-10">
								{{ child.description }}
							</p>
						</div>
					</div>
				</div>
			</div>
		</section>
	</Modal>
</template>

<script setup lang="ts">
import { ChevronDown, RefreshCw } from 'lucide-vue-next'
import { useSelectNodeLogic } from '@/composables/dashboard/flows/nodes/nodeOperations'

const props = defineProps({
	payload: {
		type: Object as PropType<Record<string, any> | null>,
		default: null,
		required: false
	},
	propsModal: {
		type: String,
		required: false
	}
})

// Use the directly exported composable
const {
	nodes,
	expandedNodes,
	hasChildren,
	toggleNodeExpansion,
	handleNodeClick,
	handleChildNodeClick,
	isReplacementMode,
	modalTitle
} = useSelectNodeLogic(props)
</script>

<style>

</style>

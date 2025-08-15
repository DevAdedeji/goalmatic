<template>
	<Modal
		modal="$atts.modal"
		title="Review Workflow Requirements"
		:props-modal="propsModal"
	>
		<div class="flex flex-col gap-4">
			<!-- Success banner when everything is valid -->
			<article v-if="isFlowCurrentlyValid" class="w-full p-2.5 flex items-center gap-3 rounded border border-green-200 text-green-800 bg-green-50">
				<svg xmlns="http://www.w3.org/2000/svg" class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 12l2 2 4-4" /><path d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0" /></svg>
				<span class="text-sm">This flow is currently valid. You can run a test or activate it.</span>
			</article>
			<!-- Integrations -->
			<div v-if="requirements.integrations && requirements.integrations.length" class="border rounded-md p-3">
				<h3 class="text-sm font-semibold mb-2">
					Required Integrations
				</h3>
				<div class="flex flex-col gap-2">
					<div v-for="intg in requirements.integrations" :key="intg.id" class="flex items-center justify-between">
						<div class="flex items-center gap-2">
							<img :src="intg.icon" alt="icon" class="size-5">
							<span class="text-sm">{{ intg.name }}</span>
						</div>
						<div>
							<button v-if="!hasIntegration(intg.id)" class="btn-primary text-xs" :disabled="connectingIntegration===intg.id" @click="connect(intg.id)">
								<Spinner v-if="connectingIntegration===intg.id" size="14px" />
								<span v-else>Connect</span>
							</button>
							<span v-else class="text-xs text-green-700">Connected</span>
						</div>
					</div>
				</div>
			</div>

			<!-- Config requirements -->
			<div v-if="requirements.config && requirements.config.length" class="border rounded-md p-3">
				<h3 class="text-sm font-semibold mb-2">
					Fields to Configure
				</h3>

				<div class="flex flex-col gap-3">
					<div v-for="cfg in requirements.config" :key="cfg.nodeName" class="border rounded p-2">
						<div class="flex items-center justify-between mb-1">
							<div class="text-xs font-semibold">
								{{ cfg.nodeName }}
							</div>
							<button class="btn-outline text-xs" @click="configureNode(cfg)">
								Configure
							</button>
						</div>
						<ul class="list-disc pl-4">
							<li v-for="p in cfg.props" :key="p.key" class="text-xs">
								<span class="font-medium">{{ p.name }}</span>
								<span class="text-subText"> ({{ p.key }})</span>
							</li>
						</ul>
					</div>
				</div>
			</div>

			<div class="flex gap-3 mt-2">
				<button class="btn-primary w-full" :disabled="loading" @click="done">
					<span v-if="!loading">Done</span>
					<Spinner v-else />
				</button>
			</div>
		</div>
	</Modal>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import Modal from '@/components/core/modal/Modal.vue'
import Spinner from '@/components/core/Spinner.vue'
import { useFlowsModal } from '@/composables/core/modals'
import { useConnectIntegration } from '@/composables/dashboard/integrations/connect'
import { useAlert } from '@/composables/core/notification'
import { callFirebaseFunction } from '@/firebase/functions'
import { agentToolConfigs } from '@/composables/dashboard/assistant/agents/tools/config'
import { useFetchFlowById } from '@/composables/dashboard/flows/id'
import { checkFlowRequirements } from '@/composables/dashboard/flows/approval'

const props = defineProps({
  payload: { type: Object, required: true },
  propsModal: { type: String, required: false }
})

const loading = ref(false)
const connectingIntegration = ref<string | null>(null)
const { connectIntegration } = useConnectIntegration()
const { openAlert } = useAlert()

const userIntegrations = computed(() => props.payload.userIntegrations || [])
// Dynamically compute requirements from current flow state so modal updates after edits
const { flowDetails } = useFetchFlowById()
const requirements = computed(() => {
  const flow = flowDetails.value || {}
  // In-editor validation should not simulate post-clone defaults; use actual propsData
  const { requirements } = checkFlowRequirements(flow, userIntegrations.value, { simulatePostClone: false })
  return requirements
})

const hasIntegration = (id: string) => userIntegrations.value.some((i: any) => i.integration_id === id)

const isFlowCurrentlyValid = computed(() => {
  const missingConfig = (requirements.value.config || []).length > 0
  const missingIntegrations = (requirements.value.integrations || []).some((i: any) => !hasIntegration(i.id))
  return !missingConfig && !missingIntegrations
})

// Notify once when the flow becomes valid
const hasNotifiedValid = ref(false)
watch(isFlowCurrentlyValid, (isValid) => {
  if (isValid && !hasNotifiedValid.value) {
    hasNotifiedValid.value = true
    useAlert().openAlert({ type: 'SUCCESS', msg: 'This flow is currently valid. You can run a test or activate it.' })
  }
})

const isBlocked = computed(() => {
  const missingIntegrations = (requirements.value.integrations || []).filter((i: any) => !hasIntegration(i.id))
  // Do not block on config; those fields can be set after cloning
  return missingIntegrations.length > 0
})

const connect = async (id: string) => {
  connectingIntegration.value = id
  try {
    await connectIntegration(id)
    openAlert({ type: 'SUCCESS', msg: 'Connection initiated. Complete the popup flow.' })
    window.addEventListener('message', async (event) => {
      if (event.origin === window.location.origin) {
        const oauthResult = JSON.parse(localStorage.getItem('oauth_result') || '{}')
        if (oauthResult && oauthResult.success) {
          if (props.payload && props.payload.refreshUserIntegrations) {
            await props.payload.refreshUserIntegrations()
          }
        }
        connectingIntegration.value = null
      }
    }, { once: true })
  } catch (e) {
    connectingIntegration.value = null
  }
}

// Editor opening removed; fields can be configured later in the workflow editor

const cancel = () => {
  useFlowsModal().closeCloneFlowApprovalModal()
}

const done = () => {
  useFlowsModal().closeCloneFlowApprovalModal()
}

// Recheck removed; requirements are static, integration status updates unblocks clone

const isTableConfig = (cfg: any) => {
  // Heuristic: look for table-related required prop keys
  return (cfg.props || []).some((p: any) => ['id', 'tableId', 'selected_table_id'].includes(p.key))
}

// Open editor for the node corresponding to a config requirement
const configureNode = (cfg: any) => {
  const flow = flowDetails.value
  if (!flow) return
  let node: any = null
  if (cfg?.nodeRef?.type === 'trigger') {
    node = flow.trigger
  } else if (cfg?.nodeRef?.type === 'step' && typeof cfg?.nodeRef?.index === 'number') {
    node = Array.isArray(flow.steps) ? flow.steps[cfg.nodeRef.index] : null
  }
  if (node) {
    useFlowsModal().openEditNode(node)
  }
}

const tableCloning = ref(false)
const cloneTableForFlow = async () => {
  if (!props.payload?.flowIdForClone) {
    openAlert({ type: 'ERROR', msg: 'Flow context not found for table cloning' })
    return
  }
  try {
    tableCloning.value = true
    // Prefer cloning by explicit tableId when provided
    if (props.payload.sourceTableId) {
      const result = await callFirebaseFunction('cloneTableById', { tableId: props.payload.sourceTableId }) as any
      const newTableId = result?.tableId
      if (newTableId) {
        agentToolConfigs.value.TABLE = agentToolConfigs.value.TABLE || {}
        agentToolConfigs.value.TABLE.selected_table_id = newTableId
        openAlert({ type: 'SUCCESS', msg: 'Table cloned. Recheck to continue.' })
      } else {
        openAlert({ type: 'ERROR', msg: 'Failed to clone table' })
      }
    } else if (props.payload.agentIdForTableClone) {
      // Fallback: clone using an agent's configured table
      const result = await callFirebaseFunction('cloneTable', { agentId: props.payload.agentIdForTableClone }) as any
      const newTableId = result?.tableId
      if (newTableId) {
        agentToolConfigs.value.TABLE = agentToolConfigs.value.TABLE || {}
        agentToolConfigs.value.TABLE.selected_table_id = newTableId
        openAlert({ type: 'SUCCESS', msg: 'Table cloned. Recheck to continue.' })
      } else {
        openAlert({ type: 'ERROR', msg: 'Failed to clone table' })
      }
    } else {
      openAlert({ type: 'ERROR', msg: 'No source table provided for cloning' })
    }
  } catch (e: any) {
    openAlert({ type: 'ERROR', msg: `Error cloning table: ${e?.message || 'Unknown error'}` })
  } finally {
    tableCloning.value = false
  }
}
</script>


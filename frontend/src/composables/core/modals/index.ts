import { modal } from '../modal'

// ==================== AUTH ===============================
import Logout from '@/components/modals/auth/logout.vue'
import LoginAlert from '@/components/modals/auth/loginAlert.vue'

// ==================== CORE ===============================
import Confirmation from '@/components/modals/core/Confirmation.vue'
import LoadingVerification from '@/components/modals/core/loading.vue'


// ==================== BOTTOMBAR ===============================
import BottomMenu from '@/components/layouts/bottomBar/modal/Main.vue'

// ==================== ASSISTANT ===============================
import CreateAgent from '@/components/modals/assistant/CreateAgent.vue'
import EditToolConfig from '@/components/modals/assistant/EditToolConfig.vue'
import ConfirmVisibility from '@/components/modals/assistant/ConfirmVisibility.vue'
import ToolApprovalModal from '@/components/modals/assistant/ToolApprovalModal.vue'

// ==================== INTEGRATIONS ===============================
import ConnectWhatsapp from '@/components/modals/integrations/ConnectWhatsapp.vue'
import EditConfig from '@/components/modals/integrations/EditConfig.vue'

// ==================== FLOWS ===============================
import SelectNode from '@/components/modals/flows/SelectNode.vue'
import EditNode from '@/components/modals/flows/EditNode.vue'

// ==================== TABLES ===============================
import TablesIdFieldModal from '@/components/modals/tables/FieldModal.vue'
import TablesIdRecordModal from '@/components/modals/tables/RecordModal.vue'

type OptionalPayload = Record<string, any> | null;

// Update type definitions to include optional payload parameter
type AuthTypes = 'Logout' | 'LoginAlert'
type CoreTypes = 'Confirmation' | 'LoadingVerification'
type BottombarTypes = 'BottomMenu'
type AssistantTypes = 'CreateAgent' | 'EditToolConfig' | 'ConfirmVisibility' | 'ToolApprovalModal'
type IntegrationsTypes = 'ConnectWhatsapp' | 'EditConfig'
type FlowsTypes = 'SelectNode' | 'EditNode'
type TablesTypes = 'FieldModal' | 'RecordModal'

// Define helper function types with payload
type ModalHelpers<Keys extends string> = Record<
	`open${Capitalize<Keys>}`, (payload?: OptionalPayload) => void
> & Record<
	`close${Capitalize<Keys>}`, () => void
> & Record<
	`toggle${Capitalize<Keys>}`, (payload?: OptionalPayload) => void
> & { closeAll: () => void };

const AuthModals = { Logout, LoginAlert } as Record<AuthTypes, any>
const CoreModals = { Confirmation, LoadingVerification } as Record<CoreTypes, any>
const BottombarModals = { BottomMenu } as Record<BottombarTypes, any>
const AssistantModals = { CreateAgent, EditToolConfig, ConfirmVisibility, ToolApprovalModal } as Record<AssistantTypes, any>
const IntegrationsModals = { ConnectWhatsapp, EditConfig } as Record<IntegrationsTypes, any>
const FlowsModals = { SelectNode, EditNode } as Record<FlowsTypes, any>
const TablesModals = { FieldModal: TablesIdFieldModal, RecordModal: TablesIdRecordModal } as Record<TablesTypes, any>


const authModal = modal.register('Auth', AuthModals)

const coreModal = modal.register('Core', CoreModals)
const bottombarModal = modal.register('Bottombar', BottombarModals)
const assistantModal = modal.register('Assistant', AssistantModals)
const integrationsModal = modal.register('Integrations', IntegrationsModals)
const flowsModal = modal.register('Flows', FlowsModals)
const tablesModal = modal.register('Tables', TablesModals)


// Export with updated types
export const useAuthModal = (): ModalHelpers<AuthTypes> => authModal
export const useCoreModal = (): ModalHelpers<CoreTypes> => coreModal
export const useBottombarModal = (): ModalHelpers<BottombarTypes> => bottombarModal
export const useAssistantModal = (): ModalHelpers<AssistantTypes> => assistantModal
export const useIntegrationsModal = (): ModalHelpers<IntegrationsTypes> => integrationsModal
export const useFlowsModal = (): ModalHelpers<FlowsTypes> => flowsModal
export const useTablesModal = (): ModalHelpers<TablesTypes> => tablesModal



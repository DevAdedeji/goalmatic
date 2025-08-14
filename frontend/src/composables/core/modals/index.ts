import { modal } from '../modal'

// ==================== AUTH ===============================
import Logout from '@/components/modals/auth/logout.vue'
import LoginAlert from '@/components/modals/auth/loginAlert.vue'

// ==================== CORE ===============================
import Confirmation from '@/components/modals/core/Confirmation.vue'
import LoadingVerification from '@/components/modals/core/loading.vue'
import OtpVerificationModal from '@/components/modals/core/OtpVerificationModal.vue'

// ==================== BOTTOMBAR ===============================
import BottomMenu from '@/components/layouts/bottomBar/modal/Main.vue'

// ==================== ASSISTANT ===============================
import CreateAgent from '@/components/modals/assistant/CreateAgent.vue'
import EditToolConfig from '@/components/modals/assistant/EditToolConfig.vue'
import ConfirmVisibility from '@/components/modals/assistant/ConfirmVisibility.vue'
import ToolApprovalModal from '@/components/modals/assistant/ToolApprovalModal.vue'
import ShareChat from '@/components/modals/assistant/ShareChat.vue'

// ==================== INTEGRATIONS ===============================
import ConnectWhatsapp from '@/components/modals/integrations/ConnectWhatsapp.vue'
import EditConfig from '@/components/modals/integrations/EditConfig.vue'

// ==================== FLOWS ===============================
import SelectNode from '@/components/modals/flows/SelectNode.vue'
import EditNode from '@/components/modals/flows/EditNode.vue'
import CloneFlowApprovalModal from '@/components/modals/flows/CloneFlowApprovalModal.vue'
import CreateWorkflow from '@/components/modals/assistant/CreateWorkflow.vue'

// ==================== TABLES ===============================
import TablesIdFieldModal from '@/components/modals/tables/FieldModal.vue'
import TablesIdRecordModal from '@/components/modals/tables/RecordModal.vue'
import CreateTable from '@/components/modals/tables/CreateTable.vue'

type OptionalPayload = Record<string, any> | null;

// Update type definitions to include optional payload parameter
type AuthTypes = 'Logout' | 'LoginAlert'
type CoreTypes = 'Confirmation' | 'LoadingVerification' | 'OtpVerificationModal'
type BottombarTypes = 'BottomMenu'
type AssistantTypes = 'CreateAgent' | 'EditToolConfig' | 'ConfirmVisibility' | 'ToolApprovalModal' | 'ShareChat'
type IntegrationsTypes = 'ConnectWhatsapp' | 'EditConfig'
type FlowsTypes = 'SelectNode' | 'EditNode' | 'CreateWorkflow' | 'CloneFlowApprovalModal'
type TablesTypes = 'FieldModal' | 'RecordModal' | 'CreateTable'

// Define helper function types with payload
type ModalHelpers<Keys extends string> = Record<
	`open${Capitalize<Keys>}`, (payload?: OptionalPayload) => void
> & Record<
	`close${Capitalize<Keys>}`, () => void
> & Record<
	`toggle${Capitalize<Keys>}`, (payload?: OptionalPayload) => void
> & { closeAll: () => void };

const AuthModals = { Logout, LoginAlert } as Record<AuthTypes, any>
const CoreModals = { Confirmation, LoadingVerification, OtpVerificationModal } as Record<CoreTypes, any>
const BottombarModals = { BottomMenu } as Record<BottombarTypes, any>
const AssistantModals = { CreateAgent, EditToolConfig, ConfirmVisibility, ToolApprovalModal, ShareChat } as Record<AssistantTypes, any>
const IntegrationsModals = { ConnectWhatsapp, EditConfig } as Record<IntegrationsTypes, any>
const FlowsModals = { SelectNode, EditNode, CreateWorkflow, CloneFlowApprovalModal } as Record<FlowsTypes, any>
const TablesModals = { FieldModal: TablesIdFieldModal, RecordModal: TablesIdRecordModal, CreateTable } as Record<TablesTypes, any>


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



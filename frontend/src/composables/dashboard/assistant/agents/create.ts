import { v4 as uuidv4 } from 'uuid'
import { Timestamp } from 'firebase/firestore'
import { setFirestoreDocument } from '@/firebase/firestore/create'
import { useUser } from '@/composables/auth/user'
import { useAssistantModal } from '@/composables/core/modals'

type AgentStatus = 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED'

const createAgentForm = reactive({
    name: '',
    description: '',
    avatar: '/avatars/0.png', // Default avatar
    public: false,
    status: 'DRAFT' as AgentStatus,
    spec: {
        systemInfo: 'You are a helpful assistant',
        tools: []
    }
})



export const useCreateAgent = () => {
    const { id: user_id, userProfile } = useUser()

    const loading = ref(false)

    const isDisabled = computed(() => {
        return !createAgentForm.name
    })

    const resetForm = () => {
        createAgentForm.name = ''
        createAgentForm.description = ''
        createAgentForm.avatar = '/avatars/0.png' // Reset to default avatar
    }

    const createAgent = async () => {
        loading.value = true
        const id = uuidv4()

        const sent_data = {
            ...createAgentForm,
            user: {
                id: user_id.value!,
                name: userProfile.value?.name
            },
            created_at: Timestamp.fromDate(new Date()),
            updated_at: Timestamp.fromDate(new Date()),
            creator_id: user_id.value!,
            id
        }


        await setFirestoreDocument('agents', id, sent_data)
        loading.value = false
        await useRouter().push(`/agents/explore/${id}`)
        useAssistantModal().closeCreateAgent()
        resetForm()
    }

    return { createAgent, createAgentForm, loading, isDisabled }
}

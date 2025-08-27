import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUser } from '@/composables/auth/user'
import { useAlert } from '@/composables/core/notification'
import { callFirebaseFunction } from '@/firebase/functions'

export const useOwnerCloneFlow = () => {
    const { id: user_id, isLoggedIn } = useUser()
    const loading = ref(false)
    const router = useRouter()

    const ownerCloneFlow = async (flowToClone: Record<string, any>) => {
        if (!isLoggedIn.value || !user_id.value) {
            useAlert().openAlert({
                type: 'ERROR',
                msg: 'You must be logged in to clone a flow'
            })
            return false
        }

        loading.value = true
        try {
            // Call the owner clone function
            const res = await callFirebaseFunction('ownerCloneFlow', {
                flowId: flowToClone.id
            }) as any
            const id = res?.id
            if (!id) throw new Error('Failed to create cloned flow')

            // Show success message
            useAlert().openAlert({
                type: 'SUCCESS',
                msg: 'Workflow cloned successfully'
            })

            // Navigate to the new flow's page
            router.push(`/flows/${id}`)
            return true
        } catch (error: any) {
            useAlert().openAlert({
                type: 'ERROR',
                msg: `Error cloning workflow: ${error.message}`
            })
            return false
        } finally {
            loading.value = false
        }
    }

    return { ownerCloneFlow, loading }
}

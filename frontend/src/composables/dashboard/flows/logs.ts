
import { ref } from 'vue'
import { useUser } from '@/composables/auth/user'
import { useAlert } from '@/composables/core/notification'
import { getFirestoreSubCollection } from '@/firebase/firestore/fetch'
import { getFirestoreSubCollectionWithSort } from '@/firebase/firestore/sort'

// Define interfaces for flow log data
interface FlowLog {
  id: string;
  status: string;
  start_time: string;
  end_time?: string;
  duration?: string;
  trigger?: string;
  steps_completed?: number;
  steps_total?: number;
  error?: string | null;
  [key: string]: any;
}

// Interface for the formatted data used by the LogSection component
interface FormattedLogData {
  id: { data: { id: string } };
  status: { data: { status: string } };
  start_time: { data: { start_time: string } };
  duration: { data: { duration: string } };
  trigger: { data: { trigger: string } };
  steps: {
    data: {
      steps_completed: number;
      steps_total: number;
      error: string | null
    }
  };
}

export const useFlowLogs = () => {
  const { id: user_id } = useUser()
  const flowLogs = ref<FormattedLogData[]>([])
  const flowLogsLoading = ref(false)

  // Fetch flow logs from the logs subcollection
  const fetchFlowLogs = async (flowId: string) => {
    if (!flowId || !user_id.value) return
    if (import.meta.server) return
    flowLogsLoading.value = true
    try {
    // Fetch newest-first
    await getFirestoreSubCollectionWithSort(
      'flows',
      flowId,
      'logs',
      flowLogs,
      { name: 'start_time', order: 'desc' }
    )
    } catch (error: unknown) {
      console.error('Error fetching flow logs:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      useAlert().openAlert({ type: 'ERROR', msg: `Error fetching flow logs: ${errorMessage}` })
    } finally {
      flowLogsLoading.value = false
    }
  }

  return {
    flowLogs,
    flowLogsLoading,
    fetchFlowLogs
  }
}

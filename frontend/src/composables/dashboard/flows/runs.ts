import { collection, getDocs, orderBy, query } from 'firebase/firestore'
import { ref } from 'vue'
import { db } from '@/firebase/init'
import { useUser } from '@/composables/auth/user'
import { useAlert } from '@/composables/core/notification'

// Define interfaces for flow run data
interface FlowRun {
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

// Interface for the formatted data used by the RunSection component
interface FormattedRunData {
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

export const useFlowRuns = () => {
  const { id: user_id } = useUser()
  const flowRuns = ref<FormattedRunData[]>([])
  const flowRunsLoading = ref(false)

  // Fetch flow runs from the runs subcollection
  const fetchFlowRuns = async (flowId: string) => {
    if (!flowId || !user_id.value) return

    flowRunsLoading.value = true
    try {
      // Fetch runs using direct Firestore methods
      const runsCollectionRef = collection(db, `flows/${flowId}/runs`)
      const runsQuery = query(runsCollectionRef, orderBy('start_time', 'desc'))
      const runsSnapshot = await getDocs(runsQuery)

      const runsData: FlowRun[] = []
      runsSnapshot.forEach((doc) => {
        runsData.push({
          id: doc.id,
          ...doc.data() as Omit<FlowRun, 'id'>
        })
      })

      // Map the data to the format expected by the RunSection component
      flowRuns.value = runsData.map((run) => ({
        id: { data: { id: run.id } },
        status: { data: { status: run.status || 'unknown' } },
        start_time: { data: { start_time: run.start_time || '' } },
        duration: { data: { duration: run.duration || '0s' } },
        trigger: { data: { trigger: run.trigger || 'manual' } },
        steps: {
          data: {
            steps_completed: run.steps_completed || 0,
            steps_total: run.steps_total || 0,
            error: run.error || null
          }
        }
      }))
    } catch (error: unknown) {
      console.error('Error fetching flow runs:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      useAlert().openAlert({ type: 'ERROR', msg: `Error fetching flow runs: ${errorMessage}` })
    } finally {
      flowRunsLoading.value = false
    }
  }

  return {
    flowRuns,
    flowRunsLoading,
    fetchFlowRuns
  }
}

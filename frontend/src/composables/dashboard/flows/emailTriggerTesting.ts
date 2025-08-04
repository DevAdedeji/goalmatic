import { ref } from 'vue'
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
  deleteDoc,
  getDocs
} from 'firebase/firestore'
import { db } from '@/firebase/init'

interface EmailTriggerLog {
  id: string
  trigger_id: string
  flow_id: string
  message_id: string
  from_address: string
  subject: string
  received_at: Timestamp
  status: 'processed' | 'filtered' | 'failed'
  reason?: string
  execution_id?: string
  created_at: Timestamp
}

export const useEmailTriggerTesting = () => {
  const logs = ref<EmailTriggerLog[]>([])
  const loading = ref(false)
  const isConnected = ref(false)
  const error = ref<string | null>(null)

  let unsubscribe: (() => void) | null = null

  /**
   * Start listening to real-time logs for a specific trigger
   */
  const startListening = (triggerId: string) => {
    if (unsubscribe) {
      stopListening()
    }

    loading.value = true
    error.value = null
    console.log('Starting to listen for email trigger logs for trigger:', triggerId)

    try {
      const logsCollection = collection(db, 'emailTriggerLogs')
      const logsQuery = query(
        logsCollection,
        where('trigger_id', '==', triggerId),
        orderBy('created_at', 'desc')
      )

      console.log('Created Firestore query for emailTriggerLogs')

      unsubscribe = onSnapshot(
        logsQuery,
        (snapshot) => {
          console.log('Firestore snapshot received:', snapshot.size, 'documents')
          const newLogs: EmailTriggerLog[] = []

          snapshot.forEach((doc) => {
            const data = doc.data()
            newLogs.push({ ...data as any })
          })

          logs.value = newLogs
          loading.value = false
          isConnected.value = true
          console.log('Successfully connected to Firestore, loaded', newLogs.length, 'logs')
        },
        (err) => {
          console.error('Error listening to email trigger logs:', err)
          console.error('Error code:', err.code)
          console.error('Error message:', err.message)

          if (err.code === 'permission-denied') {
            error.value = 'Permission denied. Please check Firestore security rules.'
          } else {
            error.value = err.message
          }

          loading.value = false
          isConnected.value = false
        }
      )
    } catch (err: any) {
      console.error('Error setting up email trigger logs listener:', err)
      error.value = err.message
      loading.value = false
      isConnected.value = false
    }
  }

  /**
   * Stop listening to real-time logs
   */
  const stopListening = () => {
    if (unsubscribe) {
      unsubscribe()
      unsubscribe = null
    }
    isConnected.value = false
  }

  /**
   * Clear all logs from the current view (local only)
   */
  const clearLogs = () => {
    logs.value = []
  }

  /**
   * Delete old logs from Firestore (24+ hours old)
   */
  const cleanupOldLogs = async (triggerId: string) => {
    try {
      const twentyFourHoursAgo = new Date()
      twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24)

      const logsCollection = collection(db, 'emailTriggerLogs')
      const oldLogsQuery = query(
        logsCollection,
        where('trigger_id', '==', triggerId),
        where('created_at', '<', Timestamp.fromDate(twentyFourHoursAgo))
      )

      const snapshot = await getDocs(oldLogsQuery)
      const deletePromises = snapshot.docs.map((doc) => deleteDoc(doc.ref))

      await Promise.all(deletePromises)

      console.log(`Cleaned up ${snapshot.docs.length} old email trigger logs`)
    } catch (err) {
      console.error('Error cleaning up old logs:', err)
    }
  }

  /**
   * Get logs count for a specific status
   */
  const getLogsCountByStatus = (status: 'processed' | 'filtered' | 'failed') => {
    return logs.value.filter((log) => log.status === status).length
  }

  /**
   * Get the most recent log
   */
  const getLatestLog = () => {
    return logs.value.length > 0 ? logs.value[0] : null
  }

  /**
   * Check if there are any recent successful triggers (last 5 minutes)
   */
  const hasRecentSuccessfulTriggers = () => {
    const fiveMinutesAgo = new Date()
    fiveMinutesAgo.setMinutes(fiveMinutesAgo.getMinutes() - 5)

    return logs.value.some((log) => {
      const logDate = log.created_at.toDate ? log.created_at.toDate() : new Date(log.created_at as any)
      return log.status === 'processed' && logDate > fiveMinutesAgo
    })
  }

  /**
   * Get logs statistics
   */
  const getLogsStats = () => {
    const total = logs.value.length
    const processed = getLogsCountByStatus('processed')
    const filtered = getLogsCountByStatus('filtered')
    const failed = getLogsCountByStatus('failed')

    return {
      total,
      processed,
      filtered,
      failed,
      successRate: total > 0 ? Math.round((processed / total) * 100) : 0
    }
  }

  /**
   * Format log for export/debugging
   */
  const exportLogs = () => {
    return logs.value.map((log) => ({
      timestamp: log.created_at.toDate ? log.created_at.toDate().toISOString() : log.created_at,
      from: log.from_address,
      subject: log.subject,
      status: log.status,
      reason: log.reason,
      executionId: log.execution_id
    }))
  }

  return {
    // State
    logs,
    loading,
    isConnected,
    error,

    // Actions
    startListening,
    stopListening,
    clearLogs,
    cleanupOldLogs,

    // Computed/Helpers
    getLogsCountByStatus,
    getLatestLog,
    hasRecentSuccessfulTriggers,
    getLogsStats,
    exportLogs
  }
}

// Global instance for sharing state across components if needed
let globalEmailTriggerTesting: ReturnType<typeof useEmailTriggerTesting> | null = null

export const useGlobalEmailTriggerTesting = () => {
  if (!globalEmailTriggerTesting) {
    globalEmailTriggerTesting = useEmailTriggerTesting()
  }
  return globalEmailTriggerTesting
}

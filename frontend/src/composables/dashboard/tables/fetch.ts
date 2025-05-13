import { ref } from 'vue'
import { useUser } from '@/composables/auth/user'
import { getFirestoreCollectionWithWhereQuery } from '@/firebase/firestore/query'
import { useAlert } from '@/composables/core/notification'
import { getSingleFirestoreDocument } from '@/firebase/firestore/fetch'
import { getFirestoreSubCollectionWithSort } from '@/firebase/firestore/sort'
// Store for tables data
const userTables = ref([] as any[])
const tableData = ref<any>(null)



// Track fetched states
const hasInitialFetch = ref(false)

export const useFetchUserTables = () => {
  const { id: user_id } = useUser()
  const loading = ref(false)
  const isClient = typeof window !== 'undefined'

  const fetchAllUserTables = async () => {
    if (!user_id.value || !isClient) return
    userTables.value = []
    loading.value = true
    try {
      await getFirestoreCollectionWithWhereQuery(
        'tables',
        userTables,
        { name: 'creator_id', operator: '==', value: user_id.value }
      )
      hasInitialFetch.value = true
    } catch (error: any) {
      console.error('Error fetching tables:', error)
      useAlert().openAlert({ type: 'ERROR', msg: `Error fetching tables: ${error.message}` })
    } finally {
      loading.value = false
    }
  }

  // Get a single table by ID
  const fetchTableById = async (table_id: string) => {
    loading.value = true
    if (!table_id || !isClient) return null
    try {
      await getSingleFirestoreDocument('tables', table_id, tableData)
      return tableData.value
    } catch (error: any) {
      console.error('Error fetching table by ID:', error)
      // Updated error handling to match the fetchFlowById pattern
      if (error.code === 'permission-denied') {
        useAlert().openAlert({
          type: 'ERROR',
          msg: "You don't have permission to access this table. It may be private"
        })
      } else {
        useAlert().openAlert({ type: 'ERROR', msg: `Error fetching table: ${error.message}` })
      }
      return null // Return null in case of error
    } finally {
      loading.value = false
    }
  }



  return {
    userTables,
    loading,
    fetchAllUserTables,
    fetchTableById,
    tableData,
    hasInitialFetch
  }
}

export const useFetchTableRecords = () => {
  const loading = ref(false)
  const tableRecords = ref([] as any[])
  const error = ref<string | null>(null)
  const isClient = typeof window !== 'undefined'

  const fetchTableRecords = async (tableId: string) => {
    if (!tableId || !isClient) return []
    tableRecords.value = []
    loading.value = true
    error.value = null

    try {
      // Fetch records from the subcollection, ordered by created_at descending
      await getFirestoreSubCollectionWithSort('tables', tableId, 'records', tableRecords, { name: 'created_at', order: 'desc' })
      return tableRecords.value
    } catch (err: any) {
      console.error('Error fetching table records:', err)

      // Handle permission errors specifically
      if (err.code === 'permission-denied') {
        error.value = "You don't have permission to access this table's records. It may be private or you may not be authorized."
        useAlert().openAlert({
          type: 'ERROR',
          msg: error.value
        })
      } else {
        error.value = `Error fetching table records: ${err.message}`
        useAlert().openAlert({
          type: 'ERROR',
          msg: error.value
        })
      }

      return []
    } finally {
      loading.value = false
    }
  }

  return { fetchTableRecords, loading, tableRecords, error }
}



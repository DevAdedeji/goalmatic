import { ref, computed } from 'vue'
import { useUser } from '@/composables/auth/user'
import { getFirestoreCollectionWithWhereQuery } from '@/firebase/firestore/query'
import { useAlert } from '@/composables/core/notification'
import { getSingleFirestoreDocument } from '@/firebase/firestore/fetch'

// Store for tables data
const userTables = ref([] as any[])
const tableData = ref<any>(null)
const loading = ref(false)

// Track fetched states
const hasInitialFetch = ref(false)

export const useFetchUserTables = () => {
  const { id: user_id } = useUser()

  const fetchAllTables = async () => {
    if (!user_id.value) return

    loading.value = true
    try {
      // Query tables collection where creator_id equals user_id
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

    try {
      // Use getSingleFirestoreDocument to fetch the table by its ID
      await getSingleFirestoreDocument('tables', table_id, tableData)
      // Return the fetched data directly from the ref's value
      return tableData.value
    } catch (error: any) {
      console.error('Error fetching table by ID:', error)
      // Updated error handling to match the fetchFlowById pattern
      if (error.code === 'permission-denied') {
        useAlert().openAlert({
          type: 'ERROR',
          msg: 'You don\'t have permission to access this table. It may be private'
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
    fetchAllTables,
    fetchTableById,
    tableData,
    hasInitialFetch
  }
}

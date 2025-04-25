import { ref } from 'vue'

// Store for selected table
const selectedTable = ref()

// Common state that might be shared across table composables
const tableLoading = ref(false)

export const useTables = () => {
  // Any shared table functionality would go here
  return {
    selectedTable,
    tableLoading
  }
}

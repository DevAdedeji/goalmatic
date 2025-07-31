import { ref } from 'vue'
import { useAlert } from '@/composables/core/notification'
import { useEditTable } from '@/composables/dashboard/tables/edit'
import { generateUniqueFieldId, isUuidFieldId } from '@/composables/utils/fieldId'
import type { Field } from '@/composables/dashboard/tables/types'

export const useFieldIdMigration = () => {
  const loading = ref(false)
  const { updateTable } = useEditTable()

  /**
   * Migrates field IDs from UUID to name-based for a table
   * @param table The table object to migrate
   * @param updateRecords Whether to also update existing records to use new field IDs
   * @returns Migration result
   */
  const migrateTableFieldIds = async (table: Record<string, any>, updateRecords = false) => {
    if (!table.fields || !Array.isArray(table.fields)) {
      throw new Error('Table has no fields to migrate')
    }

    loading.value = true
    try {
      const fieldsToMigrate = table.fields.filter((field: Field) => isUuidFieldId(field.id))

      if (fieldsToMigrate.length === 0) {
        useAlert().openAlert({
          type: 'SUCCESS',
          msg: 'Table already uses name-based field IDs'
        })
        return { migrated: 0, skipped: table.fields.length }
      }

      // Create mapping of old ID to new ID
      const idMapping: Record<string, string> = {}
      const updatedFields = table.fields.map((field: Field) => {
        if (isUuidFieldId(field.id)) {
          const newId = generateUniqueFieldId(field.name, table.fields)
          idMapping[field.id] = newId
          return { ...field, id: newId }
        }
        return field
      })

      // Update the table with new field IDs
      const updatedTable = {
        ...table,
        fields: updatedFields
      }

      await updateTable(updatedTable)

      // TODO: If updateRecords is true, we would also need to migrate existing records
      // This would involve updating all records to use the new field IDs as keys
      if (updateRecords) {
        console.warn('Record migration not implemented yet - only field definitions have been updated')
      }

      useAlert().openAlert({
        type: 'SUCCESS',
        msg: `Successfully migrated ${fieldsToMigrate.length} fields to name-based IDs`
      })

      return {
        migrated: fieldsToMigrate.length,
        skipped: table.fields.length - fieldsToMigrate.length,
        idMapping
      }
    } catch (error: any) {
      useAlert().openAlert({
        type: 'ERROR',
        msg: `Migration failed: ${error.message}`
      })
      throw error
    } finally {
      loading.value = false
    }
  }

  /**
   * Checks if a table needs field ID migration
   * @param table The table to check
   * @returns Number of fields that need migration
   */
  const checkMigrationNeeded = (table: Record<string, any>): number => {
    if (!table.fields || !Array.isArray(table.fields)) {
      return 0
    }
    return table.fields.filter((field: Field) => isUuidFieldId(field.id)).length
  }

  return {
    loading,
    migrateTableFieldIds,
    checkMigrationNeeded
  }
}

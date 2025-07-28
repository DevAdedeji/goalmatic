import { ref } from 'vue'
import type { TableField } from './types'
import { callFirebaseFunction } from '@/firebase/functions'
import { useAlert } from '@/composables/core/notification'

export const useAITableGeneration = () => {
  const loading = ref(false)
  const generatedFields = ref<TableField[]>([])
  const generatedTableData = ref<{ name: string; description: string } | null>(null)

  const generateTableFields = async (description: string): Promise<TableField[]> => {
    if (!description.trim()) {
      throw new Error('Please provide a description for the table')
    }

    loading.value = true
    try {
      const result = await callFirebaseFunction('generateTableFields', { description }) as any

      if (!result?.fields || !Array.isArray(result.fields)) {
        throw new Error('Invalid response from AI service')
      }

      // Debug: Log the full result to check what we're getting
      console.log('AI Generation Result:', result)

      // Store the generated table metadata
      generatedTableData.value = {
        name: result.name || '',
        description: result.description || description
      }

      console.log('Generated Table Data:', generatedTableData.value)

      // Transform fields to match our frontend structure
      const transformedFields: TableField[] = result.fields.map((field: any) => ({
        id: field.id || crypto.randomUUID(),
        name: field.name,
        type: field.type,
        description: field.description || '',
        required: field.required || false,
        options: field.options || [],
        // For select fields, also create optionsText for the UI
        optionsText: field.type === 'select' && field.options ? field.options.join('\n') : ''
      }))

      generatedFields.value = transformedFields
      useAlert().openAlert({
        type: 'SUCCESS',
        msg: `Successfully generated "${result.name}" table with ${transformedFields.length} fields!`
      })

      return transformedFields
    } catch (error: any) {
      console.error('Error generating table fields:', error)
      useAlert().openAlert({
        type: 'ERROR',
        msg: error.message || 'Failed to generate table fields'
      })
      throw error
    } finally {
      loading.value = false
    }
  }

  const clearGeneratedFields = () => {
    generatedFields.value = []
    generatedTableData.value = null
  }

  return {
    loading,
    generatedFields,
    generatedTableData,
    generateTableFields,
    clearGeneratedFields
  }
}

/**
 * Generates a field ID from a field name by converting to lowercase, trimming, and replacing spaces with underscores
 * Falls back to UUID for backward compatibility if name is empty
 * @param name The field name
 * @returns A normalized field ID
 */
export const generateFieldId = (name: string): string => {
  if (!name || typeof name !== 'string') {
    // Fallback to UUID for backward compatibility
    return crypto.randomUUID()
  }

  const normalized = name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '') // Remove any non-alphanumeric characters except underscores

  // If after normalization we have an empty string, fallback to UUID
  if (!normalized) {
    return crypto.randomUUID()
  }

  return normalized
}

/**
 * Checks if a field ID is a UUID (for backward compatibility detection)
 * @param id The field ID to check
 * @returns True if the ID is a UUID format
 */
export const isUuidFieldId = (id: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  return uuidRegex.test(id)
}

/**
 * Ensures field ID uniqueness within a list of fields
 * If the generated ID conflicts with existing fields, append a number
 * @param name The field name
 * @param existingFields Array of existing fields
 * @returns A unique field ID
 */
export const generateUniqueFieldId = (name: string, existingFields: { id: string }[] = []): string => {
  const baseId = generateFieldId(name)
  const existingIds = existingFields.map((field) => field.id)

  if (!existingIds.includes(baseId)) {
    return baseId
  }

  // If base ID exists, append a number
  let counter = 1
  let uniqueId = `${baseId}_${counter}`

  while (existingIds.includes(uniqueId)) {
    counter++
    uniqueId = `${baseId}_${counter}`
  }

  return uniqueId
}

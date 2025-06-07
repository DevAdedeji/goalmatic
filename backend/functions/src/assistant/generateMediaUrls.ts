import { onCall } from 'firebase-functions/v2/https'
import { getSignedMediaUrl, extractUserIdFromPath } from '../whatsapp/utils/mediaStorage'

interface GenerateMediaUrlsData {
  filePaths: string[]
}

export const generateMediaUrls = onCall({
  cors: true,
  region: 'us-central1'
}, async (request) => {
  // Verify user is authenticated
  if (!request.auth) {
    throw new Error('Authentication required')
  }

  const { filePaths } = request.data as GenerateMediaUrlsData
  const requestingUserId = request.auth.uid

  if (!filePaths || !Array.isArray(filePaths)) {
    throw new Error('Invalid filePaths parameter')
  }

  const urlMap: Record<string, string> = {}
  const errors: string[] = []

  for (const filePath of filePaths) {
    try {
      // Verify the requesting user owns this file
      const fileUserId = extractUserIdFromPath(filePath)
      if (fileUserId !== requestingUserId) {
        console.warn(`User ${requestingUserId} attempted to access file owned by ${fileUserId}: ${filePath}`)
        errors.push(`Access denied for file: ${filePath}`)
        continue
      }

      // Generate signed URL
      const signedUrl = await getSignedMediaUrl(filePath, 24) // 24-hour expiration
      urlMap[filePath] = signedUrl

    } catch (error) {
      console.error(`Failed to generate URL for ${filePath}:`, error)
      errors.push(`Failed to generate URL for: ${filePath}`)
    }
  }

  return {
    urlMap,
    errors: errors.length > 0 ? errors : undefined
  }
}) 
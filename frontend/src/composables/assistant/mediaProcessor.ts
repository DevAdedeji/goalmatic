import { ref as storageRef, getDownloadURL } from 'firebase/storage'
import { auth, storage } from '@/firebase/init'

export interface MediaContent {
  type: 'image' | 'audio' | 'text'
  content: string
  filePath?: string
  signedUrl?: string
  caption?: string
  transcription?: string
}

/**
 * Gets Firebase Storage download URL using the SDK
 * This handles authentication automatically per Firebase docs
 */
async function getStorageDownloadUrl(filePath: string): Promise<string> {
  try {
    // Create a reference to the file using the storage SDK
    const fileRef = storageRef(storage, filePath)

    // Get the download URL - this respects security rules and authentication
    const downloadUrl = await getDownloadURL(fileRef)

    console.log(`Successfully generated download URL for: ${filePath}`)
    return downloadUrl
  } catch (error) {
    console.error(`Failed to get download URL for ${filePath}:`, error)
    throw error
  }
}

/**
 * Parses message content and extracts media information
 */
export function parseMessageContent(content: string): MediaContent[] {
  const parts: MediaContent[] = []

  // Regex patterns for different media types
  const imagePattern = /\[Image Message\](?:\s+Caption:\s+"([^"]*)")?\s*\nDescription:\s*([^\n]*)\s*\nFile Path:\s*(whatsapp-media\/[^\s\n]+)/g
  const audioPattern = /\[Voice Message\]\s*\nTranscription:\s*([^\n]*)\s*\nFile Path:\s*(whatsapp-media\/[^\s\n]+)/g

  let lastIndex = 0
  let content_copy = content

  // Find and process image matches
  let match
  while ((match = imagePattern.exec(content)) !== null) {
    // Add text before the match
    if (match.index > lastIndex) {
      const textContent = content.substring(lastIndex, match.index).trim()
      if (textContent) {
        parts.push({
          type: 'text',
          content: textContent
        })
      }
    }

    // Add image content
    parts.push({
      type: 'image',
      content: match[2], // Description
      filePath: match[3], // File path
      caption: match[1] || undefined // Caption (optional)
    })

    lastIndex = match.index + match[0].length
    // Remove the processed part from content_copy
    content_copy = content_copy.replace(match[0], '')
  }

  // Reset regex for audio processing
  audioPattern.lastIndex = 0

  // Find and process audio matches
  while ((match = audioPattern.exec(content_copy)) !== null) {
    // Add audio content
    parts.push({
      type: 'audio',
      content: match[1], // Transcription
      filePath: match[2], // File path
      transcription: match[1]
    })

    // Remove the processed part from content_copy
    content_copy = content_copy.replace(match[0], '')
  }

  // Add remaining text content
  const remainingText = content_copy.trim()
  if (remainingText && parts.length === 0) {
    // If no media was found, return the original content as text
    parts.push({
      type: 'text',
      content
    })
  } else if (remainingText) {
    // Add any remaining text
    parts.push({
      type: 'text',
      content: remainingText
    })
  }

  return parts
}

/**
 * Generates download URLs for media files using Firebase Storage SDK
 * This respects Firebase Security Rules and authentication
 */
export async function generateMediaUrls(mediaParts: MediaContent[]): Promise<MediaContent[]> {
  const mediaFilePaths = mediaParts
    .filter((part) => part.filePath)
    .map((part) => part.filePath!)

  if (mediaFilePaths.length === 0) {
    return mediaParts
  }

  // Check if user is authenticated (required by Firebase Security Rules)
  if (!auth.currentUser) {
    console.warn('User not authenticated, cannot access media files')
    return mediaParts
  }

  console.log(`Generating download URLs for ${mediaFilePaths.length} media files`)

  // Process each media part and generate download URLs
  const processedParts: MediaContent[] = []

  for (const part of mediaParts) {
    if (part.filePath) {
      try {
        console.log(`Getting download URL for: ${part.filePath}`)

        // Use Firebase Storage SDK to get download URL
        // This automatically handles authentication and respects security rules
        const downloadUrl = await getStorageDownloadUrl(part.filePath)

        processedParts.push({
          ...part,
          signedUrl: downloadUrl
        })
      } catch (error) {
        console.error(`Failed to get download URL for ${part.filePath}:`, error)
        // Show content without media if URL generation fails
        processedParts.push(part)
      }
    } else {
      processedParts.push(part)
    }
  }

  console.log(`Successfully generated ${processedParts.filter((p) => p.signedUrl).length} download URLs`)
  return processedParts
}

/**
 * Processes message content and returns structured media content with URLs
 */
export async function processMessageMedia(content: string): Promise<MediaContent[]> {
  const mediaParts = parseMessageContent(content)
  return await generateMediaUrls(mediaParts)
}




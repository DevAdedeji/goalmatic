import { v4 as uuidv4 } from 'uuid'
import { generateText } from 'ai'
import { createGoogleGenerativeAI } from '@ai-sdk/google'

// Simple in-memory storage for chat messages
// In a real app, this would be stored in a database
const chatSessions = new Map<string, any>()

// Default agent configuration
const defaultAgent = {
  id: 'test-agent',
  name: 'Test Agent',
  description: 'A test agent for the chat interface',
  spec: {
    systemInfo: 'You are a helpful assistant that provides concise and accurate responses.',
    tools: []
  }
}

export default defineEventHandler(async (event) => {
  try {
    // Parse request body
    const { message, history, sessionId: requestSessionId } = await readBody(event)

    if (!message) {
      throw createError({
        statusCode: 400,
        message: 'Missing required parameter: message'
      })
    }

    // Use provided sessionId or generate a new one
    const sessionId = requestSessionId || uuidv4()

    // Get existing session or create a new one
    if (!chatSessions.has(sessionId)) {
      chatSessions.set(sessionId, {
        id: sessionId,
        messages: []
      })
    }

    const session = chatSessions.get(sessionId)

    // Add user message to session
    const userMessage = {
      id: uuidv4(),
      role: 'user',
      content: message,
      timestamp: new Date().toISOString()
    }

    session.messages.push(userMessage)

    // Process conversation history for AI
    const conversationHistory = history.map((msg: any) => ({
      role: msg.role,
      content: msg.content
    }))

    // Initialize Google Generative AI
    const google = createGoogleGenerativeAI({
      apiKey: process.env.GEMINI_API_KEY || ''
    })

    // Track processing time
    const startTime = Date.now()

    // Generate response using Vercel AI with Google's model
    let response
    try {
      const result = await generateText({
        model: google('gemini-1.5-flash'),
        messages: conversationHistory,
        system: defaultAgent.spec.systemInfo
      })

      response = result.text
    } catch (error) {
      console.error('Error generating response:', error)
      response = "I'm sorry, I encountered an error processing your request. Please try again."
    }

    const endTime = Date.now()
    const processingTime = endTime - startTime

    // Add assistant response to session
    const assistantMessage = {
      id: uuidv4(),
      role: 'assistant',
      content: response,
      timestamp: new Date().toISOString()
    }

    session.messages.push(assistantMessage)

    // Return the response and sessionId
    return {
      response,
      sessionId,
      metadata: {
        processingTime
      }
    }
  } catch (error) {
    console.error('Error in chat API:', error)
    throw createError({
      statusCode: 500,
      message: error instanceof Error ? error.message : 'Internal Server Error'
    })
  }
})

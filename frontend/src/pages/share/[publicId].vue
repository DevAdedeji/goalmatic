<template>
	<div class="min-h-screen bg-gray-50">
		<!-- Header -->
		<header class="bg-white border-b border-gray-200 sticky top-0 z-10">
			<div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
				<div class="flex justify-between items-center h-16">
					<div class="flex items-center space-x-4">
						<div class="text-xl font-bold text-purple-600">
							Goalmatic
						</div>
						<div class="text-gray-400">
							|
						</div>
						<div class="text-sm text-gray-600">
							Shared Chat
						</div>
					</div>
					<div class="flex items-center space-x-4">
						<span class="text-sm text-gray-500">
							{{ formatDate(publicChat?.shared_at) }}
						</span>
					</div>
				</div>
			</div>
		</header>

		<!-- Loading State -->
		<div v-if="loading" class="flex items-center justify-center min-h-96">
			<div class="text-center">
				<div class="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto" />
				<p class="mt-2 text-gray-600">
					Loading shared chat...
				</p>
			</div>
		</div>

		<!-- Error State -->
		<div v-else-if="error" class="flex items-center justify-center min-h-96">
			<div class="text-center">
				<div class="text-red-500 text-6xl mb-4">
					⚠️
				</div>
				<h2 class="text-xl font-semibold text-gray-900 mb-2">
					Chat Not Found
				</h2>
				<p class="text-gray-600 mb-4">
					This shared chat link is invalid or may have been removed.
				</p>
				<NuxtLink
					to="/"
					class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700"
				>
					Go to Goalmatic
				</NuxtLink>
			</div>
		</div>

		<!-- Chat Content -->
		<div v-else-if="publicChat" class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
			<!-- Chat Info -->
			<div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
				<div class="flex items-start justify-between">
					<div>
						<h1 class="text-xl font-semibold text-gray-900 mb-2">
							{{ publicChat.summary || 'Shared Chat' }}
						</h1>
						<div class="flex items-center space-x-4 text-sm text-gray-600">
							<span>Agent: {{ agentName }}</span>
							<span>•</span>
							<span>{{ publicChat.messages.length }} messages</span>
							<span>•</span>
							<span>Shared {{ formatDate(publicChat.shared_at) }}</span>
						</div>
					</div>
					<div class="flex items-center space-x-2">
						<ShareIcon class="w-5 h-5 text-gray-400" />
					</div>
				</div>
			</div>

			<!-- Messages -->
			<div class="space-y-4">
				<div
					v-for="message in publicChat.messages"
					:key="message.id"
					class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
				>
					<div class="p-6">
						<div class="flex items-start space-x-4">
							<!-- Avatar -->
							<div
								:class="[
									'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium',
									message.role === 'user' ? 'bg-blue-500' : 'bg-purple-500'
								]"
							>
								{{ message.role === 'user' ? 'U' : 'A' }}
							</div>

							<!-- Message Content -->
							<div class="flex-1 min-w-0">
								<div class="flex items-center space-x-2 mb-2">
									<span class="font-medium text-gray-900">
										{{ message.role === 'user' ? 'User' : agentName }}
									</span>
									<span class="text-sm text-gray-500">
										{{ formatMessageTime(message.timestamp) }}
									</span>
								</div>

								<!-- Message Text -->
								<div class="prose prose-sm max-w-none">
									<div class="whitespace-pre-wrap text-gray-700">
										{{ message.content }}
									</div>
								</div>

								<!-- Tool Call Info (if applicable) -->
								<div v-if="message.toolId" class="mt-3 p-3 bg-gray-50 rounded-lg">
									<div class="flex items-center space-x-2 text-sm text-gray-600">
										<Settings class="w-4 h-4" />
										<span class="font-medium">Tool: {{ message.toolId }}</span>
									</div>
									<div v-if="message.parameters" class="mt-2 text-xs text-gray-500 font-mono">
										{{ JSON.stringify(message.parameters, null, 2) }}
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			<!-- Footer -->
			<div class="mt-12 text-center">
				<div class="inline-flex items-center space-x-2 text-sm text-gray-500">
					<span>Powered by</span>
					<NuxtLink to="/" class="text-purple-600 hover:text-purple-700 font-medium">
						Goalmatic
					</NuxtLink>
				</div>
				<p class="mt-2 text-xs text-gray-400">
					Create your own AI-powered workflows at goalmatic.com
				</p>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { doc, getDoc } from 'firebase/firestore'
import { ShareIcon, Settings } from 'lucide-vue-next'
import { db } from '@/firebase/init'
import { useFetchAgents, defaultGoalmaticAgent } from '@/composables/dashboard/assistant/agents/fetch'

// Get the public ID from the route
const route = useRoute()
const publicId = route.params.publicId as string

// Reactive state
const loading = ref(true)
const error = ref(false)
const publicChat = ref<any>(null)
const agentName = ref('Assistant')

// Agent data for name resolution
const { fetchedAllAgents, fetchAllAgents } = useFetchAgents()

// Load the public chat session
const loadPublicChat = async () => {
  try {
    loading.value = true
    error.value = false

    if (!publicId) {
      error.value = true
      return
    }

    // Get the public chat document
    const publicChatRef = doc(db, 'publicChats', `public_${publicId}`)
    const publicChatDoc = await getDoc(publicChatRef)

    if (!publicChatDoc.exists()) {
      error.value = true
      return
    }

    publicChat.value = publicChatDoc.data()

    // Load agents to get the agent name
    await fetchAllAgents()

    // Get agent name
    if (publicChat.value.agent_id === '0' || String(publicChat.value.agent_id) === '0') {
      agentName.value = defaultGoalmaticAgent.name
    } else {
      const agent = fetchedAllAgents.value.find((a) => a.id === publicChat.value.agent_id)
      agentName.value = agent?.name || 'Assistant'
    }
  } catch (err) {
    console.error('Error loading public chat:', err)
    error.value = true
  } finally {
    loading.value = false
  }
}

// Format date helper
const formatDate = (timestamp: any) => {
  if (!timestamp) return ''
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// Format message time helper
const formatMessageTime = (timestamp: any) => {
  if (!timestamp) return ''
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Set page meta
useSeoMeta({
  title: () => publicChat.value?.summary ? `${publicChat.value.summary} - Shared Chat` : 'Shared Chat - Goalmatic',
  description: 'View this shared AI conversation on Goalmatic',
  ogTitle: () => publicChat.value?.summary ? `${publicChat.value.summary} - Shared Chat` : 'Shared Chat - Goalmatic',
  ogDescription: 'View this shared AI conversation on Goalmatic',
  ogType: 'website'
})

// Load data on mount
onMounted(() => {
  loadPublicChat()
})
</script>

<style scoped>
.prose {
  max-width: none;
}

.prose p {
  margin-bottom: 1rem;
}

.prose p:last-child {
  margin-bottom: 0;
}
</style>

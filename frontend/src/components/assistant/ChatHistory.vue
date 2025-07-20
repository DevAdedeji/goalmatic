<template>
	<article class="historyContainer">
		<!-- Search Bar -->
		<div class="searchContainer">
			<div class="searchInputWrapper">
				<SearchIcon class="searchIcon" />
				<input
					v-model="searchQuery"
					type="text"
					placeholder="Search for chats..."
					class="searchInput"
				>
			</div>
		</div>

		<!-- <div class="flex w-full p-4">
			<button class="btn landing-btn w-full" @click="navigateToSession('new')">
				New Chat
			</button>
		</div> -->

		<!-- Loading State -->
		<div v-if="loading" class="loadingContainer">
			<div class="loadingSpinner" />
			<p class="loadingText">
				Loading chat history...
			</p>
		</div>

		<!-- Empty State -->
		<div v-else-if="!loading && sortedChatSessions.length === 0" class="emptyState">
			<MessageSquareIcon class="emptyIcon" />
			<p class="emptyTitle">
				No chat history yet
			</p>
			<p class="emptyDescription">
				Start a conversation to see your chat history here
			</p>
		</div>

		<!-- Chat History Content -->
		<div v-else class="historyContent">
			<div v-if="filteredSessions.length > 0" class="section">
				<TransitionGroup
					name="session-list"
					tag="div"
					class="sessionsList"
					enter-active-class="session-enter-active"
					leave-active-class="session-leave-active"
					enter-from-class="session-enter-from"
					enter-to-class="session-enter-to"
					leave-from-class="session-leave-from"
					leave-to-class="session-leave-to"
				>
					<div
						v-for="(session, index) in filteredSessions"
						:key="session.id"
						class="sessionItem group"
						:style="{ '--delay': index * 0.05 + 's' }"
					>
						<div class="sessionContent" @click="navigateToSession(session.id)">
							<h4 class="sessionTitle">
								{{ getSessionSummary(session) }}
							</h4>
							<p class="sessionMeta">
								{{ getAgentDisplayName(session) }}
							</p>
						</div>
						<div class="sessionActions">
							<div class="sessionDate">
								{{ formatSessionDate(session) }}
							</div>
							<IconDropdown
								:data="session"
								:children="[
									{
										name: 'Share Chat',
										icon: Share2,
										func: openShareModal,
										class: '!text-primary hover:!bg-primary hover:!text-white'
									},
									{
										name: 'Delete Chat',
										icon: Trash2,
										func: confirmDeleteSession,
										class: '!text-danger hover:!bg-danger hover:!text-white'
									}
								]"
								btn-class="opacity-70 hover:opacity-100 transition-opacity duration-200"
								class-name="w-48"
								:index="index"
							/>
						</div>
					</div>
				</TransitionGroup>
			</div>

			<!-- No Search Results -->
			<Transition
				name="fade"
				enter-active-class="fade-enter-active"
				leave-active-class="fade-leave-active"
				enter-from-class="fade-enter-from"
				enter-to-class="fade-enter-to"
				leave-from-class="fade-leave-from"
				leave-to-class="fade-leave-to"
			>
				<div v-if="searchQuery && filteredSessions.length === 0" class="noResults">
					<SearchIcon class="noResultsIcon" />
					<p class="noResultsText">
						No chats found for "{{ searchQuery }}"
					</p>
				</div>
			</Transition>
		</div>
	</article>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { SearchIcon, MessageSquareIcon, Trash2, Share2 } from 'lucide-vue-next'
import { useChatHistory } from '@/composables/dashboard/assistant/messaging/chatHistory'
import IconDropdown from '@/components/core/IconDropdown.vue'

const {
	loading,
	sortedChatSessions,
	fetchChatSessions,
	navigateToSession,
	getSessionSummary,
	getAgentDisplayName,
	formatSessionDate,
	confirmDeleteSession,
	openShareModal
} = useChatHistory()

// Search functionality
const searchQuery = ref('')

// Filtered sessions based on search query
const filteredSessions = computed(() => {
	if (!searchQuery.value.trim()) {
		return sortedChatSessions.value
	}

	const query = searchQuery.value.toLowerCase()
	return sortedChatSessions.value.filter((session) => {
		const summary = getSessionSummary(session).toLowerCase()
		const agentName = getAgentDisplayName(session).toLowerCase()
		return summary.includes(query) || agentName.includes(query)
	})
})

// Fetch chat sessions on component mount
onMounted(() => {
	fetchChatSessions()
})
</script>

<style scoped>
.historyContainer {
	color: #19213D;
	font-size: 14px;
	font-weight: 500;
	line-height: 130%;
	height: 100%;
	display: flex;
	flex-direction: column;
	overflow: hidden;
}

.searchContainer {
	padding: 16px;
	border-bottom: 1px solid #E4E7EC;
	flex-shrink: 0;
}

.searchInputWrapper {
	position: relative;
	display: flex;
	align-items: center;
}

.searchIcon {
	position: absolute;
	left: 12px;
	width: 16px;
	height: 16px;
	color: #6B7280;
	z-index: 1;
	transition: color 0.2s ease;
}





.loadingContainer {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 40px 16px;
	flex: 1;
}

.loadingSpinner {
	width: 24px;
	height: 24px;
	border: 2px solid #E4E7EC;
	border-top: 2px solid #9A6BFF;
	border-radius: 50%;
	animation: spin 1s linear infinite;
}

@keyframes spin {
	0% { transform: rotate(0deg); }
	100% { transform: rotate(360deg); }
}

.loadingText {
	margin-top: 12px;
	color: #6B7280;
	font-size: 14px;
	animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
	0%, 100% { opacity: 1; }
	50% { opacity: 0.5; }
}

.emptyState {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 40px 16px;
	flex: 1;
	text-align: center;
	animation: fadeInUp 0.6s ease-out;
}

@keyframes fadeInUp {
	from {
		opacity: 0;
		transform: translateY(20px);
	}
	to {
		opacity: 1;
		transform: translateY(0);
	}
}

.emptyIcon {
	width: 48px;
	height: 48px;
	color: #D1D5DB;
	margin-bottom: 16px;
	animation: float 3s ease-in-out infinite;
}

@keyframes float {
	0%, 100% { transform: translateY(0px); }
	50% { transform: translateY(-10px); }
}

.emptyTitle {
	font-size: 16px;
	font-weight: 600;
	color: #374151;
	margin-bottom: 8px;
}

.emptyDescription {
	font-size: 14px;
	color: #6B7280;
	line-height: 1.5;
}

.historyContent {
	flex: 1;
	overflow-y: auto;
	padding: 16px 0;
}

.section {
	margin-bottom: 24px;
	animation: slideInLeft 0.5s ease-out;
}

@keyframes slideInLeft {
	from {
		opacity: 0;
		transform: translateX(-20px);
	}
	to {
		opacity: 1;
		transform: translateX(0);
	}
}

.sectionTitle {
	font-size: 12px;
	font-weight: 600;
	color: #6B7280;
	text-transform: uppercase;
	letter-spacing: 0.5px;
	margin-bottom: 12px;
	padding: 0 16px;
}

.sessionsList {
	display: flex;
	flex-direction: column;
	gap: 2px;
}

.sessionItem {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 12px 16px;
	cursor: pointer;
	transition: all 0.2s ease;
	border-radius: 8px;
	margin: 0 8px;
	position: relative;
	overflow: hidden;
}

.sessionItem::before {
	content: '';
	position: absolute;
	top: 0;
	left: -100%;
	width: 100%;
	height: 100%;
	background: linear-gradient(90deg, transparent, rgba(154, 107, 255, 0.1), transparent);
	transition: left 0.6s ease;
}

.sessionItem:hover::before {
	left: 100%;
}

.sessionItem:hover {
	background-color: #F4F5F8;
}

.sessionContent:hover {
	transform: translateX(4px);
}

.sessionContent:active {
	transform: translateX(2px) scale(0.98);
}

.sessionContent {
	flex: 1;
	min-width: 0;
	cursor: pointer;
}

.sessionActions {
	display: flex;
	align-items: center;
	gap: 8px;
	flex-shrink: 0;
}

.sessionTitle {
	font-size: 14px;
	font-weight: 500;
	color: #111827;
	margin-bottom: 4px;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
	transition: color 0.2s ease;
}

.sessionItem:hover .sessionTitle {
	color: #9A6BFF;
}

.sessionMeta {
	font-size: 12px;
	color: #6B7280;
	margin: 0;
	transition: color 0.2s ease;
}

.sessionDate {
	font-size: 12px;
	color: #9CA3AF;
	transition: color 0.2s ease;
}

.sessionItem:hover .sessionDate {
	color: #6B7280;
}



.noResults {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 40px 16px;
	text-align: center;
}

.noResultsIcon {
	width: 32px;
	height: 32px;
	color: #D1D5DB;
	margin-bottom: 12px;
	animation: shake 0.5s ease-in-out;
}

@keyframes shake {
	0%, 100% { transform: translateX(0); }
	25% { transform: translateX(-5px); }
	75% { transform: translateX(5px); }
}

.noResultsText {
	font-size: 14px;
	color: #6B7280;
}

/* Session List Animations */
.session-enter-active {
	transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
	transition-delay: var(--delay, 0s);
}

.session-leave-active {
	transition: all 0.3s ease-in;
}

.session-enter-from {
	opacity: 0;
	transform: translateX(-20px) scale(0.95);
}

.session-enter-to {
	opacity: 1;
	transform: translateX(0) scale(1);
}

.session-leave-from {
	opacity: 1;
	transform: translateX(0) scale(1);
}

.session-leave-to {
	opacity: 0;
	transform: translateX(20px) scale(0.95);
}

/* Fade Animations */
.fade-enter-active {
	transition: all 0.3s ease;
}

.fade-leave-active {
	transition: all 0.2s ease;
}

.fade-enter-from {
	opacity: 0;
	transform: scale(0.95);
}

.fade-enter-to {
	opacity: 1;
	transform: scale(1);
}

.fade-leave-from {
	opacity: 1;
	transform: scale(1);
}

.fade-leave-to {
	opacity: 0;
	transform: scale(0.95);
}

/* Scrollbar styling */
.historyContent::-webkit-scrollbar {
	width: 4px;
}

.historyContent::-webkit-scrollbar-track {
	background: transparent;
}

.historyContent::-webkit-scrollbar-thumb {
	background: #D1D5DB;
	border-radius: 2px;
	transition: background 0.2s ease;
}

.historyContent::-webkit-scrollbar-thumb:hover {
	background: #9CA3AF;
}

/* Responsive animations */
@media (max-width: 768px) {
	.sessionContent:hover {
		transform: translateX(2px);
	}

	.session-enter-from,
	.session-leave-to {
		transform: translateY(-10px) scale(0.95);
	}


}
</style>


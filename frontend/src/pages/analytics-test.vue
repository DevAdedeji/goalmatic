<template>
  <div class="container mx-auto p-8">
    <h1 class="text-3xl font-bold mb-8">Analytics Test Page</h1>
    
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <!-- Authentication Events -->
      <div class="bg-white p-6 rounded-lg shadow-md">
        <h2 class="text-xl font-semibold mb-4">Authentication Events</h2>
        <div class="space-y-2">
          <button @click="testLoginStart" class="btn btn-primary w-full">
            Test Login Started
          </button>
          <button @click="testLoginSuccess" class="btn btn-success w-full">
            Test Login Success
          </button>
          <button @click="testSignupStart" class="btn btn-primary w-full">
            Test Signup Started
          </button>
          <button @click="testLogout" class="btn btn-secondary w-full">
            Test Logout
          </button>
        </div>
      </div>

      <!-- Flow Events -->
      <div class="bg-white p-6 rounded-lg shadow-md">
        <h2 class="text-xl font-semibold mb-4">Flow Events</h2>
        <div class="space-y-2">
          <button @click="testFlowCreated" class="btn btn-primary w-full">
            Test Flow Created
          </button>
          <button @click="testFlowActivated" class="btn btn-success w-full">
            Test Flow Activated
          </button>
          <button @click="testFlowExecuted" class="btn btn-info w-full">
            Test Flow Executed
          </button>
        </div>
      </div>

      <!-- Node Events -->
      <div class="bg-white p-6 rounded-lg shadow-md">
        <h2 class="text-xl font-semibold mb-4">Node Events</h2>
        <div class="space-y-2">
          <button @click="testNodeAdded" class="btn btn-primary w-full">
            Test Node Added
          </button>
          <button @click="testNodeConfigured" class="btn btn-success w-full">
            Test Node Configured
          </button>
          <button @click="testNodeTested" class="btn btn-info w-full">
            Test Node Tested
          </button>
        </div>
      </div>

      <!-- Job Scraper Events -->
      <div class="bg-white p-6 rounded-lg shadow-md">
        <h2 class="text-xl font-semibold mb-4">Job Scraper Events</h2>
        <div class="space-y-2">
          <button @click="testJobSearchStart" class="btn btn-primary w-full">
            Test Job Search Started
          </button>
          <button @click="testJobSearchSuccess" class="btn btn-success w-full">
            Test Job Search Success
          </button>
          <button @click="testJobsFound" class="btn btn-info w-full">
            Test Jobs Found
          </button>
        </div>
      </div>

      <!-- UI Events -->
      <div class="bg-white p-6 rounded-lg shadow-md">
        <h2 class="text-xl font-semibold mb-4">UI Events</h2>
        <div class="space-y-2">
          <button @click="testButtonClick" class="btn btn-primary w-full" data-analytics-label="Test Button">
            Test Button Click
          </button>
          <button @click="testModalOpen" class="btn btn-success w-full">
            Test Modal Open
          </button>
          <button @click="testModalClose" class="btn btn-secondary w-full">
            Test Modal Close
          </button>
        </div>
      </div>

      <!-- Custom Events -->
      <div class="bg-white p-6 rounded-lg shadow-md">
        <h2 class="text-xl font-semibold mb-4">Custom Events</h2>
        <div class="space-y-2">
          <input 
            v-model="customEventName" 
            placeholder="Event name" 
            class="input input-bordered w-full mb-2"
          />
          <input 
            v-model="customEventProperty" 
            placeholder="Property (key=value)" 
            class="input input-bordered w-full mb-2"
          />
          <button @click="testCustomEvent" class="btn btn-primary w-full">
            Send Custom Event
          </button>
        </div>
      </div>
    </div>

    <!-- Event Log -->
    <div class="mt-8 bg-gray-100 p-6 rounded-lg">
      <h2 class="text-xl font-semibold mb-4">Event Log (Check Browser Console)</h2>
      <p class="text-gray-600">
        Events are being tracked and logged to the browser console. 
        In production, these would be sent to PostHog.
      </p>
      <div class="mt-4">
        <h3 class="font-semibold">Last Event:</h3>
        <pre class="bg-white p-2 rounded mt-2 text-sm">{{ lastEvent }}</pre>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAnalytics } from '@/composables/core/analytics/posthog'

const { 
  trackAuthEvent, 
  trackFlowEvent, 
  trackNodeEvent, 
  trackJobScrapingEvent,
  trackButtonClick,
  trackModalInteraction,
  trackEvent,
  EVENTS 
} = useAnalytics()

const customEventName = ref('')
const customEventProperty = ref('')
const lastEvent = ref('')

const logEvent = (eventName: string, properties?: any) => {
  lastEvent.value = JSON.stringify({ event: eventName, properties }, null, 2)
  console.log('[Analytics Test]', eventName, properties)
}

// Authentication event tests
const testLoginStart = () => {
  trackAuthEvent('LOGIN_STARTED', { method: 'email' })
  logEvent('LOGIN_STARTED', { method: 'email' })
}

const testLoginSuccess = () => {
  trackAuthEvent('LOGIN_SUCCESS', { method: 'email', user_id: 'test-user-123' })
  logEvent('LOGIN_SUCCESS', { method: 'email', user_id: 'test-user-123' })
}

const testSignupStart = () => {
  trackAuthEvent('SIGNUP_STARTED', { method: 'google' })
  logEvent('SIGNUP_STARTED', { method: 'google' })
}

const testLogout = () => {
  trackAuthEvent('LOGOUT')
  logEvent('LOGOUT')
}

// Flow event tests
const testFlowCreated = () => {
  trackFlowEvent('CREATED', 'test-flow-123', { flow_name: 'Test Flow', flow_type: 'standard' })
  logEvent('FLOW_CREATED', { flow_id: 'test-flow-123', flow_name: 'Test Flow' })
}

const testFlowActivated = () => {
  trackFlowEvent('ACTIVATED', 'test-flow-123', { trigger_type: 'email' })
  logEvent('FLOW_ACTIVATED', { flow_id: 'test-flow-123', trigger_type: 'email' })
}

const testFlowExecuted = () => {
  trackFlowEvent('EXECUTED', 'test-flow-123', { execution_time: 1500, steps_count: 3 })
  logEvent('FLOW_EXECUTED', { flow_id: 'test-flow-123', execution_time: 1500 })
}

// Node event tests
const testNodeAdded = () => {
  trackNodeEvent('ADDED', 'EMAIL_TRIGGER', { flow_id: 'test-flow-123' })
  logEvent('NODE_ADDED', { node_type: 'EMAIL_TRIGGER', flow_id: 'test-flow-123' })
}

const testNodeConfigured = () => {
  trackNodeEvent('CONFIGURED', 'JOB_SCRAPER', { job_site: 'linkedin', job_title: 'Software Engineer' })
  logEvent('NODE_CONFIGURED', { node_type: 'JOB_SCRAPER', job_site: 'linkedin' })
}

const testNodeTested = () => {
  trackNodeEvent('TESTED', 'SEND_EMAIL', { test_result: 'success' })
  logEvent('NODE_TESTED', { node_type: 'SEND_EMAIL', test_result: 'success' })
}

// Job scraper event tests
const testJobSearchStart = () => {
  trackJobScrapingEvent('SEARCH_STARTED', { job_site: 'linkedin', job_title: 'Frontend Developer' })
  logEvent('JOB_SEARCH_STARTED', { job_site: 'linkedin', job_title: 'Frontend Developer' })
}

const testJobSearchSuccess = () => {
  trackJobScrapingEvent('SEARCH_SUCCESS', { job_site: 'linkedin', jobs_found: 25, search_time: 3000 })
  logEvent('JOB_SEARCH_SUCCESS', { job_site: 'linkedin', jobs_found: 25 })
}

const testJobsFound = () => {
  trackJobScrapingEvent('JOBS_FOUND', { job_site: 'vuejobs', jobs_count: 15, location: 'Remote' })
  logEvent('JOBS_FOUND', { job_site: 'vuejobs', jobs_count: 15 })
}

// UI event tests
const testButtonClick = () => {
  trackButtonClick('Analytics Test Button', '/analytics-test')
  logEvent('BUTTON_CLICK', { button_label: 'Analytics Test Button', location: '/analytics-test' })
}

const testModalOpen = () => {
  trackModalInteraction('test-modal', 'opened')
  logEvent('MODAL_OPENED', { modal_name: 'test-modal' })
}

const testModalClose = () => {
  trackModalInteraction('test-modal', 'closed')
  logEvent('MODAL_CLOSED', { modal_name: 'test-modal' })
}

// Custom event test
const testCustomEvent = () => {
  if (!customEventName.value) return
  
  let properties = {}
  if (customEventProperty.value) {
    const [key, value] = customEventProperty.value.split('=')
    if (key && value) {
      properties = { [key.trim()]: value.trim() }
    }
  }
  
  trackEvent(customEventName.value, properties)
  logEvent(customEventName.value, properties)
}

definePageMeta({
  layout: 'default'
})
</script>

<style scoped>
.btn {
  @apply px-4 py-2 rounded font-medium transition-colors;
}

.btn-primary {
  @apply bg-blue-500 text-white hover:bg-blue-600;
}

.btn-success {
  @apply bg-green-500 text-white hover:bg-green-600;
}

.btn-info {
  @apply bg-cyan-500 text-white hover:bg-cyan-600;
}

.btn-secondary {
  @apply bg-gray-500 text-white hover:bg-gray-600;
}

.input {
  @apply px-3 py-2 border rounded;
}

.input-bordered {
  @apply border-gray-300 focus:border-blue-500 focus:outline-none;
}
</style>

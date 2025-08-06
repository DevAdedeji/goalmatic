

import { useAnalytics } from '@/composables/core/analytics/posthog'

let initializedClicks = false

export default defineNuxtRouteMiddleware(async (to, from) => {
    if (process.client) {
      // Use the new analytics service for page tracking
      const { trackPageView } = useAnalytics()
      trackPageView(to.fullPath, to.meta.title as string || 'Untitled Page')

      try {
        if (!initializedClicks) {
            trackClicks()
            initializedClicks = true
        }
    } catch (error) {
      // console.error('Analytics initialization failed', error)
    }
  }
})






const trackClicks = () => {
  const { trackButtonClick } = useAnalytics()

  document.addEventListener('click', (mouse_event: MouseEvent) => {
        const target = mouse_event.target as HTMLElement
        const label = target.getAttribute('data-analytics-label') ||
                     target.getAttribute('data-ga-label') ||
                     target.innerText?.trim() ||
                     target.tagName

        // Only track clicks on interactive elements
        const interactiveElements = ['BUTTON', 'A', 'INPUT', 'SELECT', 'TEXTAREA']
        const isInteractive = interactiveElements.includes(target.tagName) ||
                             target.getAttribute('role') === 'button' ||
                             target.classList.contains('btn') ||
                             target.classList.contains('button')

        if (isInteractive && label) {
          trackButtonClick(label, window.location.pathname)
        }
      })
}

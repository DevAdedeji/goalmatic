import axios from 'axios'
import { Timestamp } from 'firebase/firestore'
import { useFetchCalendarIntegrations } from '../fetch'
import { useCreateCalendarEvent } from './create'
import { useUser } from '@/composables/auth/user'
import { useAlert } from '@/composables/core/notification'
import { setFirestoreSubDocument } from '@/firebase/firestore/create'
import { useDashboardModal } from '@/composables/core/modals'
import { useFetchAllCalendarEvents } from '@/composables/dashboard/integrations/googleCalendar/fetch'
import { formatDateTimeForInput } from '@/composables/utils/formatter'

const updateCalendarEventData = ref()
const updateVuecalViewRef = ref()



export const useUpdateCalendarEvent = () => {
    const { getCalendarIntegrationsStorage, fetchCalendarIntegrations } = useFetchCalendarIntegrations()
    const { fetchedEvents, fetchEventsForCurrentViewMonth } = useFetchAllCalendarEvents()
    const { id: user_id } = useUser()
    const loading = ref(false)
    const updatedEvent = ref(null)

    const { eventFormData, isAnUpdateEvent, createCalendarEvent } = useCreateCalendarEvent()

    const setUpdateCalendarEventData = (event: any) => {
        updateCalendarEventData.value = event
        isAnUpdateEvent.value = true
        eventFormData.value = {
            title: event.summary,
            description: event.description,
            startTime: formatDateTimeForInput(new Date(event.start)),
            endTime: formatDateTimeForInput(new Date(event.end))
        }
        useDashboardModal().openCalendarEvent()
    }

    const updateEventFromForm = async () => {
	try {
		if (!updateCalendarEventData.value || !updateCalendarEventData.value.id) return

		const startTime = new Date(eventFormData.value.startTime)
		const endTime = new Date(eventFormData.value.endTime)

		const eventData = {
			summary: eventFormData.value.title,
			description: eventFormData.value.description,
			start: {
				dateTime: startTime.toISOString()
			},
			end: {
				dateTime: endTime.toISOString()
			}
		}

		const result = await updateCalendarEvent(updateCalendarEventData.value.id, eventData)
		if (result) {
            fetchedEvents.value = fetchedEvents.value.map((event) => {
                if (event.id === updateCalendarEventData.value.id) {
                    return result
                }
                return event
            })
            useDashboardModal().closeCalendarEvent()
		}
	} catch (error) {
		console.error('Error updating event:', error)
	}
    }

    const updateOnEventDrag = async (dragData: any) => {
        const event = dragData.event
        const startTime = new Date(event.start)
        const endTime = new Date(event.end)

        const eventData = {
			summary: event.title,
			description: event.description,
			start: {
				dateTime: startTime.toISOString()
			},
			end: {
				dateTime: endTime.toISOString()
			}
        }
        if (event.isTodoCard && !eventAlreadyExists(event)) {
            createCalendarEvent(eventData).then((res) => {
                setTimeout(() => {
                    updateVuecalViewRef.value.deleteEvent(event._.id, 3)
                }, 10)
                fetchedEvents.value = [...fetchedEvents.value, res]
            })
        } else {
            updateCalendarEvent(event.id, eventData)
        }
    }

    const eventAlreadyExists = (event: any) => {
        return fetchedEvents.value.some((e) => e.id === event.id)
    }

    const updateCalendarEvent = async (eventId: string, eventData: any, calendarId = 'primary') => {
        try {
            loading.value = true

            // Get calendar integrations
            const calendarIntegrations = await getCalendarIntegrationsStorage() as any

            if (!calendarIntegrations || calendarIntegrations.length === 0) {
                useAlert().openAlert({
                    type: 'ERROR',
                    msg: 'No Google Calendar integrations found. Please connect your Google Calendar first.'
                })
                return null
            }

            // Find the first Google Calendar integration
            const integration = calendarIntegrations
                .find((integration) => integration.provider === 'GOOGLE')

            if (!integration) {
                useAlert().openAlert({
                    type: 'ERROR',
                    msg: 'No Google Calendar integration found. Please connect your Google Calendar first.'
                })
                return null
            }

            // Prepare event data with calendar ID
            const eventWithCalendarId = {
                ...eventData,
                calendarId
            }

            // Call the server API endpoint to update the event
            const response = await axios.post('/api/googleCal/update', {
                credentials: {
                    access_token: integration.access_token,
                    refresh_token: integration.refresh_token,
                    expiry_date: integration.expiry_date
                },
                eventId,
                eventData: eventWithCalendarId
            })

            // If the API returned refreshed credentials, update the stored credentials
            if (response.data?.credentials &&
                response.data.credentials.access_token &&
                response.data.credentials.access_token !== integration.access_token) {
                // Update integration in Firestore and cookie storage
                const updatedIntegration = {
                    ...integration,
                    access_token: response.data.credentials.access_token,
                    expiry_date: response.data.credentials.expiry_date,
                    updated_at: Timestamp.fromDate(new Date())
                }

                if (user_id.value) {
                    await setFirestoreSubDocument(
                        'users',
                        user_id.value,
                        'integrations',
                        integration.id,
                        updatedIntegration
                    )

                    // Refresh calendar integrations in cookie
                    await fetchCalendarIntegrations()
                }
            }

            // Store the updated event and return it
            updatedEvent.value = response.data.data
            useAlert().openAlert({ type: 'SUCCESS', msg: 'Calendar event updated successfully' })

            return response.data.data
        } catch (error: any) {
            console.error('Error updating calendar event:', error)
            useAlert().openAlert({ type: 'ERROR', msg: error.message || 'Failed to update calendar event' })
            return null
        } finally {
            loading.value = false
        }
    }

    return {
        loading, updateOnEventDrag,
        updatedEvent,
        updateEventFromForm,
        updateCalendarEvent,
        setUpdateCalendarEventData,
        updateVuecalViewRef
    }
}

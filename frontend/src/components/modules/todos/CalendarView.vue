<template>
	<div class="flex flex-col gap-4">
		<ColorBadge v-if="!calendarConnected && !badgeDismissed" color="#2F804A" bg="#EAFFF1" name="nill">
			<div class="flex items-center gap-2 w-full justify-between">
				<span>connect your google calendar</span>
				<XCircle class="w-4 h-4 cursor-pointer" @click="dismissBadge" />
			</div>
		</ColorBadge>

		<!-- Demo controls -->
		<div v-if="calendarConnected" class="flex gap-2">
			<button class="btn-primary w-full"
				@click="useDashboardModal().openCalendarEvent()">
				Create Event
			</button>
		</div>
		<div class="flex  space-y-7 justify-end">
			<Spinner v-if="calendarLoading" :light="false" size="18px" />
		</div>


		<vue-cal v-bind="config"
			:events="calendarEvents"
			:editable-events="{create: false, delete: true}"
			@event-create="null"
			@event-drop="updateOnEventDrag"
			@event-resize-end="updateOnEventDrag"
			@ready="({ view }) => scrollToCurrentTime(view)"
		>
			<template #time-cell="{ hours, minutes }">
				<strong v-if="minutes" class="text-xs hidden ">{{ hours }}</strong>
			</template>
			<template #event="{ event, view }">
				<section class="flex flex-col h-full relative">
					<div class="font-semibold text-base">
						{{ event.title }}
					</div>
					<div v-if="view !== 'month' && event.description" class="text-xs">
						{{ event.description }}
					</div>
					<small class="mt-2 font-semibold text-xs">
						<span>{{ event._.startTimeFormatted12 }}</span> - <span>{{ event._.endTimeFormatted12 }}</span>
					</small>
					<div class="absolute top-0 right-0">
						<IconDropdown
							:data="event"
							:children="dropdownChildren()"
						/>
					</div>
				</section>
			</template>
		</vue-cal>
	</div>
</template>

<script setup lang="ts">
import { XCircle } from 'lucide-vue-next'
import { VueCal } from 'vue-cal'
import { onMounted, ref, computed, watch } from 'vue'
import { useFetchAllCalendarEvents } from '@/composables/dashboard/integrations/googleCalendar/fetch'
import { useUpdateCalendarEvent } from '@/composables/dashboard/integrations/googleCalendar/update'
import { useDeleteCalendarEvent } from '@/composables/dashboard/integrations/googleCalendar/delete'
import { useDashboardModal } from '@/composables/core/modals'
import { useTodoDate } from '@/composables/dashboard/todo/date_logic'


const vuecalView = ref<InstanceType<typeof VueCal> | null>(null)
// Define event type interfaces
interface CalendarEventData {
	id?: string;
	summary?: string;
	description?: string;
	start?: {
		date?: string;
		dateTime?: string;
	};
	end?: {
		date?: string;
		dateTime?: string;
	};
	[key: string]: any;
}

interface VueCalEvent {
	id?: string;
	title?: string;
	description?: string;
	start: Date;
	end: Date;
	class?: string;
	background?: boolean;
	split?: boolean;
	[key: string]: any;
}



const props = defineProps({
	month: Number,
	year: Number,
	loading: Boolean
})

const config = {
	view: 'day',
	'today-button': false,
	'views-bar': false,
	'title-bar': false,
	'time-step': 30,
	'snap-to-interval': 15,
	'time-at-cursor': true,
	'watch-real-time': true,
	'editable-events': true,
	'twelve-hour': true
}

const scrollToCurrentTime = (view) => {
	if (!vuecalView.value) {
		updateVuecalViewRef.value = view
		vuecalView.value = view
	}

	const currentTimeInMinutes = new Date().getHours() * 60 + new Date().getMinutes()
	const offset = 900
	const targetTimeInMinutes = currentTimeInMinutes + offset
	view.scrollToTime(targetTimeInMinutes)
}


const { dateState } = useTodoDate()

// Google Calendar integration
const { loading: calendarLoading, fetchedEvents, fetchEventsForCurrentViewMonth, calendarConnected } = useFetchAllCalendarEvents()
const { setUpdateCalendarEventData, updateOnEventDrag, updateVuecalViewRef } = useUpdateCalendarEvent()
const { setDeleteCalendarEventData } = useDeleteCalendarEvent()

const dropdownChildren = () => {
	const res = [
		{ name: 'Update Event', func: (data) => setUpdateCalendarEventData(data) },
		{ name: 'Delete Event', func: (data) => setDeleteCalendarEventData(data), class: '!text-red hover:!bg-red hover:!text-white' }
	]
	return res
}



// Format events for Vue-Cal
const calendarEvents = computed(() => {
	return fetchedEvents.value.map((event: CalendarEventData) => {
		const startDate = event.start?.dateTime ? new Date(event.start.dateTime) : new Date(event.start?.date || new Date())
		const endDate = event.end?.dateTime ? new Date(event.end.dateTime) : new Date(event.end?.date || new Date())

		return {
			...event,
			id: event.id,
			start: startDate,
			end: endDate,
			title: event.summary || 'Untitled Event',
			description: event.description || '',
			class: 'calCard',
			background: false,
			split: event.start?.date && !event.start?.dateTime // For all-day events
		} as VueCalEvent
	})
})

watch(dateState, () => {
	const updatedDate = new Date(`${dateState.day}/${dateState.month}/${dateState.year}`)
	vuecalView.value!.updateViewDate(updatedDate)
	setTimeout(() => {
		scrollToCurrentTime(vuecalView.value)
	}, 300)
	fetchEventsForCurrentViewMonth(updatedDate)
})


onMounted(async () => {
	// Initialize with current date from props or use the one from dateState
	if (props.year && props.month) {
		dateState.date = new Date(props.year, props.month - 1, 1)
	} // otherwise use the existing dateState.date

	await fetchEventsForCurrentViewMonth(dateState.date)
})



const badgeDismissed = ref(false)

const dismissBadge = () => {
	badgeDismissed.value = true
}
</script>

<style>
@import url('@/assets/css/vue-cal.css');
.vuecal {
  --vuecal-primary-color: var(--primary);
  --vuecal-time-cell-height: 75px !important;
  --vuecal-height: 500px !important;
  /* --vuecal-height: 100dvh !important; */
}
.vuecal__now-line {border-color: var(--primary) !important;}

/* Style for Google Calendar events */
.google-calendar-event {
  background-color: #4285F4;
  color: white;
  border-radius: 3px;
}
.vuecal__event{
box-shadow: 0px 0px 0px 1px #1B1F2326 !important;
border: 0.5px solid var(--primary) !important;
background: var(--secondaryLight) !important;
border-radius: 8px !important;
color: #37363D !important;
margin-left: 3px !important;
padding: 12px 16px !important;
}
</style>

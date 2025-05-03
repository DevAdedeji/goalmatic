
<template>
	<ClientOnly>
		<div>
			<transition-group
				appear
				tag="aside"
				class="fixed top-4 right-4 z-[1000] w-auto flex flex-col-reverse gap-4 !transition-all !duration-300"
				name="list"
			>
				<AlertCard
					v-for="(alert, index) in topRightAlerts"
					:id="alert.id"
					:key="alert.id"
					:data-index="index+1"
					:message="alert.msg"
					:addrs="alert.addrs"
					:type="alert.type"
					@closeAlert="closeAlert($event)"
				/>
			</transition-group>

			<!-- Top Left -->
			<transition-group
				appear
				tag="aside"
				class="fixed top-4 left-4 z-[1000] w-auto flex flex-col-reverse gap-4 !transition-all !duration-300"
				name="list"
			>
				<AlertCard
					v-for="(alert, index) in topLeftAlerts"
					:id="alert.id"
					:key="alert.id"
					:data-index="index+1"
					:message="alert.msg"
					:addrs="alert.addrs"
					:type="alert.type"
					@closeAlert="closeAlert($event)"
				/>
			</transition-group>

			<!-- Bottom Right -->
			<transition-group
				appear
				tag="aside"
				class="fixed bottom-4 right-4 z-[1000] w-auto flex flex-col gap-4 !transition-all !duration-300"
				name="list"
			>
				<AlertCard
					v-for="(alert, index) in bottomRightAlerts"
					:id="alert.id"
					:key="alert.id"
					:data-index="index+1"
					:message="alert.msg"
					:addrs="alert.addrs"
					:type="alert.type"
					@closeAlert="closeAlert($event)"
				/>
			</transition-group>

			<!-- Bottom Left -->
			<transition-group
				appear
				tag="aside"
				class="fixed bottom-4 left-4 z-[1000] w-auto flex flex-col gap-4 !transition-all !duration-300"
				name="list"
			>
				<AlertCard
					v-for="(alert, index) in bottomLeftAlerts"
					:id="alert.id"
					:key="alert.id"
					:data-index="index+1"
					:message="alert.msg"
					:addrs="alert.addrs"
					:type="alert.type"
					@closeAlert="closeAlert($event)"
				/>
			</transition-group>

			<!-- Top Center -->
			<transition-group
				appear
				tag="aside"
				class="fixed top-4 left-1/2 -translate-x-1/2 z-[1000] w-auto flex flex-col-reverse gap-4 !transition-all !duration-300"
				name="list"
			>
				<AlertCard
					v-for="(alert, index) in topCenterAlerts"
					:id="alert.id"
					:key="alert.id"
					:data-index="index+1"
					:message="alert.msg"
					:addrs="alert.addrs"
					:type="alert.type"
					@closeAlert="closeAlert($event)"
				/>
			</transition-group>

			<!-- Bottom Center -->
			<transition-group
				appear
				tag="aside"
				class="fixed bottom-4 left-1/2 -translate-x-1/2 z-[1000] w-auto flex flex-col gap-4 !transition-all !duration-300"
				name="list"
			>
				<AlertCard
					v-for="(alert, index) in bottomCenterAlerts"
					:id="alert.id"
					:key="alert.id"
					:data-index="index+1"
					:message="alert.msg"
					:addrs="alert.addrs"
					:type="alert.type"
					@closeAlert="closeAlert($event)"
				/>
			</transition-group>
		</div>
	</ClientOnly>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAlert } from '@/composables/core/notification'

const { openAlertArray, closeAlert } = useAlert()

// Filter alerts by position
const topRightAlerts = computed(() =>
	openAlertArray.value.filter((alert) => alert.position === 'top-right' || !alert.position)
)

const topLeftAlerts = computed(() =>
	openAlertArray.value.filter((alert) => alert.position === 'top-left')
)

const bottomRightAlerts = computed(() =>
	openAlertArray.value.filter((alert) => alert.position === 'bottom-right')
)

const bottomLeftAlerts = computed(() =>
	openAlertArray.value.filter((alert) => alert.position === 'bottom-left')
)

const topCenterAlerts = computed(() =>
	openAlertArray.value.filter((alert) => alert.position === 'top-center')
)

const bottomCenterAlerts = computed(() =>
	openAlertArray.value.filter((alert) => alert.position === 'bottom-center')
)

</script>

<style scoped>
.list-move,
.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}


</style>

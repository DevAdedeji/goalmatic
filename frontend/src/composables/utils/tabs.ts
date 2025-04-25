import { Raw, Component, ref, computed, ComputedRef } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import TabComponents from '@/components/core/Tabs.vue'

export const useTabs = () => {
	const router = useRouter()
	const route = useRoute()

	const tabViews = ref([] as Array<string>)
	const selected = ref('')
	const tabs = ref({} as Raw<Component>)
	const icons = ref([] as Array<Component | undefined>)
	const counts = ref([] as Array<any>)

	const initTabs = (
		selectedStr: string,
		tabStringArray: Array<string>,
		tabComp: Raw<Component>,
		tabIcons?: Array<Component | undefined>,
		tabCounts?: Array<any>
	) => {
		selected.value = selectedStr
		tabViews.value = tabStringArray
		tabs.value = tabComp
		icons.value = tabIcons || []
		counts.value = tabCounts || []
	}

	const updateTab = (data: any) => {
		if (router) {
			router.push({ query: { q: data } })
		}
		selected.value = data
	}

	const onTabMounted = () => {
		if (route?.query?.q) {
			selected.value = route.query.q as string
		}
	}

	return { initTabs, TabComponents, selected, tabViews, tabs, icons, counts, updateTab, onTabMounted }
}

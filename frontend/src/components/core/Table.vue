<template>
	<section class="flex flex-col max-w-full z-0">
		<slot name="header" />
		<slot name="sub_header" />
		<div class="overflow-x-auto border border-border rounded-lg">
			<table :key="key" class="min-w-full divide-y divide-border">
				<thead class="bg-gray-50">
					<tr>
						<th v-if="checkbox" scope="col" class="px-4 py-3 text-center w-5">
							<input
								ref="headerCheckbox"
								type="checkbox"
								class="form-checkbox h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary mx-auto"
								:checked="selected && selected.length > 0 && selected.length === tableData.length"
								:indeterminate="selected && selected.length > 0 && selected.length < tableData.length"
								@change="$emit('toggle-all')">
						</th>
						<th v-for="(header, i) in headers" :key="i" scope="col"
							class="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
							{{ header.text }}
						</th>
					</tr>
				</thead>
				<tbody v-if="!loading" class="bg-white divide-y divide-border">
					<tr v-for="(data, index) in displayTable" :key="index" :data-index="index"
						:class="['hover:bg-gray-50', (isClickable || rowClicked) ? 'cursor-pointer' : '']"
						@click="handleRowClick($event, data)">
						<td v-if="checkbox" class="px-4 py-3 whitespace-nowrap text-center">
							<input
								:checked="selected!.map(el => el?.id).includes(data?.id)"
								type="checkbox"
								class="form-checkbox h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary mx-auto"
								@change="$emit('checked', data)"
								@click.stop>
						</td>
						<td v-for="(value, key) in populateTable(data)" :key="key" class="px-4 py-3 whitespace-nowrap text-sm" :data-label="headers[key]?.text">
							<slot name="item" :item="{ [key]: key, data, index: index }">
								<span class="text-text-secondary">{{ value }}</span>
							</slot>
						</td>
					</tr>
				</tbody>
				<tbody v-else class="bg-white divide-y divide-border">
					<tr v-for="n in 3" :key="n" class="hover:bg-gray-50">
						<td v-if="checkbox" class="px-4 py-3 text-center">
							<Skeleton height="15px" width="16px" radius="3px" class="mx-auto" />
						</td>
						<td v-for="(_, i) in headers" :key="i" class="px-4 py-3">
							<Skeleton height="15px" radius="3px" />
						</td>
					</tr>
				</tbody>
			</table>
			<div v-if="!loading && displayTable.length <= 0" class="text-center py-10 border border-dashed border-border rounded-lg">
				<slot name="empty">
					<p class="text-text-secondary mb-2">
						No records available
					</p>
					<p class="text-sm text-text-secondary">
						There is no data to display at the moment.
					</p>
				</slot>
			</div>
		</div>
		<slot name="footer" />
	</section>
</template>

<script lang="ts" setup>
import { ref, computed, watch, onMounted } from 'vue'

interface Header {
  text: string
  value: string
  width?: number | string
}

interface DataItem {
  id?: any
  [key: string]: any
}

interface Props {
  hasOverflow?: boolean
  rowClicked?: (data: DataItem) => void
  isClickable?: boolean
  selected?: DataItem[]
  headers: Header[]
  tableData: DataItem[]
  loading: boolean
  checkbox?: boolean
  pageSync?: string
  itemPerPage?: number
  page?: number
}

const props = defineProps<Props>()
const emit = defineEmits(['checked', 'rowClicked', 'toggle-all'])

const key = ref(0)
const headerCheckbox = ref<HTMLInputElement | null>(null)

// Watch for changes in the selected array to force re-render and update indeterminate state
watch(() => props.selected, () => {
  key.value++
  updateHeaderCheckboxState()
}, { deep: true })

// Update the indeterminate state of the header checkbox
const updateHeaderCheckboxState = () => {
  if (headerCheckbox.value && props.selected && props.tableData) {
    const selectedCount = props.selected.length
    const totalCount = props.tableData.length

    // Set indeterminate state when some but not all items are selected
    headerCheckbox.value.indeterminate = selectedCount > 0 && selectedCount < totalCount
  }
}

// Initialize the indeterminate state when the component is mounted
onMounted(() => {
  updateHeaderCheckboxState()
})

const displayTable = computed(() => {
  return props.pageSync ? paginate(props.tableData) : props.tableData
})

// Uncomment if needed for column width calculations
// const getItemsWithColWidth = computed(() => {
//   return props.headers.reduce((length, item) => {
//     return !item.width ? length + 1 : length
//   }, 0)
// })

// Uncomment if needed for column width calculations
// const defaultColWidth = computed(() => {
//   return (100 / getItemsWithColWidth.value).toFixed(2)
// })



const paginate = (data: DataItem[]) => {
  const from = (props.page! - 1) * props.itemPerPage!
  const to = props.page! * props.itemPerPage!
  return data.slice(from, to)
}

const populateTable = (data: DataItem) => {
  const element: Record<string, any> = {}
  props.headers.forEach((item) => {
    element[item.value] = data[item.value] ?? ''
  })
  return element
}

const handleRowClick = (_event: MouseEvent, data: DataItem) => {
  if (!window.getSelection()?.toString()) {
    emit('rowClicked', data)
  }
}
</script>

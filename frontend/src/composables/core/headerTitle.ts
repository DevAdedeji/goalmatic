import { ref, computed } from 'vue'

const headerTitle = ref<string>('')

export const useHeaderTitle = () => {
  const setTitle = (title: string) => {
    headerTitle.value = title
  }

  const clearTitle = () => {
    headerTitle.value = ''
  }

  const title = computed(() => headerTitle.value)

  return {
    title,
    setTitle,
    clearTitle
  }
}

<template>
	<div class="dropdown-menu">
		<template v-if="items.length">
			<template v-for="(group, groupIndex) in items" :key="group.key">
				<div class="mention-group">
					<div class="mention-group-heading">
						{{ formatHeader(group.key) }}
					</div>
					<button v-for="(item, childIndex) in group.children" :key="childIndex" :class="{ 'is-selected': isSelected(groupIndex, childIndex) }" @click="selectItem(groupIndex, childIndex)">
						{{ typeof item === 'string' ? item : item.label }}
					</button>
				</div>
				<hr v-if="groupIndex < items.length - 1" class="mention-group-separator">
			</template>
		</template>
		<div v-else class="item">
			No result
		</div>
	</div>
</template>

<script>
import { capitalize } from '@/composables/utils/formatter'

export default {
  props: {
    items: {
      type: Array,
      required: true
    },

    command: {
      type: Function,
      required: true
    }
  },

  data() {
    return {
      selectedGroupIndex: 0,
      selectedChildIndex: 0
    }
  },

  watch: {
    items() {
      this.selectedGroupIndex = 0
      this.selectedChildIndex = 0
    }
  },

  methods: {
    formatHeader(data) {
      const splitMain = data.split('-')

      // Handle trigger nodes (format: trigger-NODE_ID)
      if (splitMain[0] === 'trigger' && splitMain.length === 2) {
        const capTitle = splitMain[1].split('_').map((i) => capitalize(i)).join(' ')
        return `(Trigger) ${capTitle}`
      }

      // Handle step nodes (format: step-index-NODE_ID)
      if (splitMain.length >= 3) {
        const capTitle = splitMain[2].split('_').map((i) => capitalize(i)).join(' ')
        const formatted = `(${splitMain[1]}) ${capTitle}`
        return formatted
      }

      // Fallback for unexpected formats
      return data
    },
    isSelected(groupIdx, childIdx) {
      return this.selectedGroupIndex === groupIdx && this.selectedChildIndex === childIdx
    },

    onKeyDown({ event }) {
      const groupCount = this.items.length
      if (groupCount === 0) return false
      const currentGroup = this.items[this.selectedGroupIndex]
      const childCount = currentGroup.children.length
      if (event.key === 'ArrowUp') {
        if (this.selectedChildIndex > 0) {
          this.selectedChildIndex--
        } else if (this.selectedGroupIndex > 0) {
          this.selectedGroupIndex--
          this.selectedChildIndex = this.items[this.selectedGroupIndex].children.length - 1
        }
        return true
      }
      if (event.key === 'ArrowDown') {
        if (this.selectedChildIndex < childCount - 1) {
          this.selectedChildIndex++
        } else if (this.selectedGroupIndex < groupCount - 1) {
          this.selectedGroupIndex++
          this.selectedChildIndex = 0
        }
        return true
      }
      if (event.key === 'Enter') {
        this.selectItem(this.selectedGroupIndex, this.selectedChildIndex)
        return true
      }
      return false
    },

    selectItem(groupIdx, childIdx) {
      const group = this.items[groupIdx]
      if (!group) return
      const item = group.children[childIdx]
      if (item) {
        const usedItem = typeof item === 'string' ? item : item.id || item.label
        const usedId = `${group.key}[${usedItem}]`
        const usedLabel = `${group.key}-${usedItem}`
        this.command({ id: usedId, label: usedLabel })
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.dropdown-menu {
  max-height: 300px;
  background: var(--light);
  border: 1px solid var(--line);
  border-radius: 0.7rem;
  box-shadow: 0px 12px 33px 0px rgba(0, 0, 0, .06), 0px 3.618px 9.949px 0px rgba(0, 0, 0, .04);
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  overflow: auto;
  padding: 0.4rem;
  position: relative;

  .mention-group {
    margin-bottom: 0.5rem;

    .mention-group-heading {
      font-weight: bold;
      font-size: 0.95rem;
      margin-bottom: 0.2rem;
      color: var(--dark);
    }
  }

  .mention-group-separator {
    border: none;
    border-top: 1px solid var(--line);
    margin: 0.3rem 0;
  }

  button {
    align-items: center;
    background-color: transparent;
    display: flex;
    gap: 0.25rem;
    text-align: left;
    width: 100%;

    &:hover,
    &:hover.is-selected {
      background-color: var(--hover);
    }

    &.is-selected {
      background-color: var(--line);
    }
  }
}

button {
  background: rgba(61, 37, 20, .08);
  border-radius: .5rem;
  border: none;
  color: var(--dark);
  font-family: inherit;
  font-size: .875rem;
  line-height: 1.15;
  margin: none;
  padding: .375rem .625rem;
  transition: all .2s cubic-bezier(.65, .05, .36, 1);
}
</style>

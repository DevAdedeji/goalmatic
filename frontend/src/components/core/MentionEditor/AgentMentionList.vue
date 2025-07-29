<template>
	<div class="dropdown-menu">
		<template v-if="items.length">
			<button
				v-for="(item, index) in items"
				:key="index"
				:class="{ 'is-selected': index === selectedIndex }"
				@click="selectItem(index)"
			>
				{{ item }}
			</button>
		</template>
		<div v-else class="item">
			No result
		</div>
	</div>
</template>

<script>
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
      selectedIndex: 0
    }
  },

  watch: {
    items() {
      this.selectedIndex = 0
    }
  },

  methods: {
    onKeyDown({ event }) {
      if (event.key === 'ArrowUp') {
        this.upHandler()
        return true
      }

      if (event.key === 'ArrowDown') {
        this.downHandler()
        return true
      }

      if (event.key === 'Enter') {
        this.enterHandler()
        return true
      }

      return false
    },

    upHandler() {
      this.selectedIndex = (this.selectedIndex + this.items.length - 1) % this.items.length
    },

    downHandler() {
      this.selectedIndex = (this.selectedIndex + 1) % this.items.length
    },

    enterHandler() {
      this.selectItem(this.selectedIndex)
    },

    selectItem(index) {
      const item = this.items[index]

      if (item) {
        this.command({ id: item })
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

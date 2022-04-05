<template>
  <div v-show="isActive">
    <slot></slot>
  </div>
</template>

<script>
import { inject, onBeforeMount, ref, watch } from 'vue'

export default {
  name: 'Tab',
  props: {
    name: { required: true },
    selected: {
      type: Boolean,
      default: false
    }
  },
  setup (props) {
    const isActive = ref(props.selected)
    const tabsProvider = inject('tabsProvider')
    const addTab = inject('addTab')
    watch(
      () => tabsProvider.activeTab,
      () => {
        isActive.value = props.name === tabsProvider.activeTab
      }
    )
    onBeforeMount(() => {
      addTab({
        name: props.name,
        index: tabsProvider.tabs.length,
        selected: props.selected
      })
    })
    return {
      isActive
    }
  }
}
</script>

<style scoped></style>

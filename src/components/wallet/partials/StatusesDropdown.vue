<template>
  <div class="relative" v-click-away="() => { this.dropdown = false }">
    <div>
      <button id="user-menu-button" aria-expanded="false" aria-haspopup="true"
              class="px-4 py-2 bg-transparent border border-gray-300 dark:border-gray-600 flex items-center justify-between w-full rounded overflow-hidden focus:outline-none"
              type="button" @click="dropdown = !dropdown">
        <span class="sr-only">Open user menu</span>
        {{ statuses.filter(s => s.selected).length }} options selected
        <span class="transform-gpu transition-all" :class="{'rotate-180': dropdown}">
          <icon name="chevron-down" classes="w-4 h-5"></icon>
        </span>
      </button>
    </div>
    <div v-if="dropdown" aria-labelledby="user-menu-button" aria-orientation="vertical"
         class="origin-top-right absolute max-h-64 scrollbar scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200 dark:scrollbar-track-gray-900 dark:scrollbar-thumb-gray-600 right-0 mt-2 w-full rounded-md shadow-xl py-1 border border-gray-50 dark:border-gray-900 bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 focus:outline-none"
         role="menu" tabindex="-1">
      <a
        class="flex items-center block px-4 py-2 text-sm text-gray-700 cursor-pointer hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-700"
        role="menuitem" tabindex="-1">
        <label>
          <input type="checkbox" class="form-checkbox" v-model="allStatuses" :checked="allStatuses"/>
          <span class="ml-3">Select All</span>
        </label>
      </a>
      <a
        class="flex items-center block px-4 py-2 text-sm text-gray-700 cursor-pointer hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-700"
        v-for="(status, index) in statuses" :key="index"
        role="menuitem" tabindex="-1">
        <label>
          <input type="checkbox" class="form-checkbox" v-model="status.selected" :checked="status.selected"/>
          <span class="ml-3">{{ status.label }}</span>
        </label>
      </a>
    </div>
  </div>
</template>

<script>
import Icon from '@/components/Icon'
import { onBeforeMount, reactive, toRefs, watch } from 'vue'
import compositionUtils from '@/compositionUtils'
import * as _ from 'lodash'

export default {
  name: 'StatusesDropdown',
  emits: ['statuses'],
  components: {
    Icon
  },
  setup (props, { emit }) {
    const { transactionStatuses } = compositionUtils()

    const state = reactive({
      statuses: [],
      dropdown: false,
      allStatuses: true
    })

    // Watch
    watch(() => _.cloneDeep(state.statuses),
      (newVal, oldVal) => {
        emit('statuses', newVal.filter(s => s.selected))
        state.allStatuses = (newVal.filter(s => s.selected)).length === state.statuses.length
      })
    watch(() => state.allStatuses,
      (newVal, oldVal) => {
        state.statuses = state.statuses.map(s => {
          return {
            ...s,
            selected: newVal
          }
        })
        emit('statuses', state.statuses.filter(s => s.selected))
      })

    onBeforeMount(() => {
      state.statuses = transactionStatuses.map(s => {
        return {
          ...s,
          selected: true
        }
      })
    })

    return {
      ...toRefs(state)
    }
  }
}
</script>

<style scoped>

</style>

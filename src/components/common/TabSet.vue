<template>
  <div class="card">
    <ul class="tab-set flex flex-wrap bg-blue-700 text-gray-100 rounded-t">
      <template v-for="(tab, index) in tabs" :key="index">
        <li class="flex-1">
          <a :class="`tab w-full ${tab.isActive ? 'active bg-blue-500' : ''}`"
             href="javascript:void(0)" @click="selectTab(tab)">
            <span :class="{'bg-blue-500':  tab.isActive}" v-html="tab.name"></span>
          </a>
        </li>
      </template>
    </ul>
    <hr class="border-gray-300 dark:border-gray-600"/>
    <div class="body">
      <slot></slot>
    </div>
  </div>
</template>

<script>
import { onMounted, provide, reactive, toRefs } from 'vue'

export default {
  name: 'TabSet',
  emits: ['changed'],
  setup (props, { emit }) {
    const state = reactive({
      activeTab: '',
      tabs: []
    })
    provide('tabsProvider', state)
    provide('addTab', (tab) => {
      state.tabs.push(tab)
    })
    const selectTab = (tab) => {
      const selectedTab = findTab(tab.name)
      if (!selectedTab) {
        return
      }
      state.tabs.forEach(tab => {
        tab.isActive = (tab.name === selectedTab.name)
      })
      state.activeTab = selectedTab.name

      emit('changed', { tab: selectedTab })
    }

    const findTab = (name) => {
      return state.tabs.find(tab => tab.name === name)
    }

    onMounted(() => {
      if (!state.tabs.length) {
        return
      }
      let selectedTab = state.tabs[0]
      state.tabs.forEach(tab => {
        if (tab.selected) {
          selectedTab = tab
        }
      })
      selectTab(selectedTab)
    })

    return {
      ...toRefs(state),
      selectTab,
      findTab
    }
  }
}
</script>

<style scoped lang="scss"></style>

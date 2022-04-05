<template>
  <nav v-if="meta.totalPages > 1" aria-label="pagination" class="mt-3">

    <ul class="inline-flex -space-x-px text-sm md:text-base">
      <li>
        <a :class="{'cursor-not-allowed bg-gray-200 dark:bg-gray-900 dark:hover:text-gray-400': !isPrev}"
           class="px-2 py-2 md:px-3 ml-0 leading-tight text-gray-500 dark:text-gray-400 bg-white rounded-l border border-gray-300 hover:text-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:hover:text-blue-500"
           href="javascript:void(0)" @click="prev()">
          <span aria-hidden="true">&laquo;</span>
        </a>
      </li>

      <li v-for="(page, key) in pageRange" :key="key">
        <a v-if="page === '...'"
           class="px-1 py-2 md:px-3 leading-tight text-gray-500 bg-white border border-gray-300 hover:text-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:text-blue-500"
           href="javascript:void(0)">
          {{ page }}
        </a>
        <a v-else
           :class="`px-2 py-2 md:px-3 leading-tight bg-white border border-gray-300 dark:bg-gray-800 dark:border-gray-700 ${page === currentPage ? 'text-blue-500 font-semibold' : 'text-gray-500 dark:text-gray-400' } hover:text-blue-500 dark:hover:text-blue-500`"
           href="javascript:void(0)" @click="updatePage(page)">
          {{ page }}
          <span v-if="page === currentPage" class="sr-only">(current)</span>
        </a>
      </li>

      <li>
        <a
          :class="{'cursor-not-allowed bg-gray-200 dark:bg-gray-900 dark:hover:bg-text-400': !isNext}"
          class="px-2 py-2 md:px-3 leading-tight text-gray-500 bg-white rounded-r border border-gray-300 hover:text-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:text-blue-500"
          href="javascript:void(0)" @click="next()">
          <span aria-hidden="true">&raquo;</span>
        </a>
      </li>

    </ul>
  </nav>
</template>

<script>
import { computed, onBeforeMount, onBeforeUnmount, reactive, toRefs } from 'vue'

export default {
  name: 'Pagination',
  props: ['meta'],
  emits: ['page'],
  setup (props, { emit }) {
    // State
    const state = reactive({
      isPrev: false,
      isNext: false,
      pagesLimit: 5,
      currentPage: props.meta.currentPage,
      delta: 3
    })
    // Computed
    const pageRange = computed(() => {
      const current = props.meta.currentPage
      const last = props.meta.totalPages
      const left = current - state.delta
      const right = current + state.delta + 1
      const range = []
      const pages = []
      let l
      for (let i = 1; i <= last; i++) {
        if (i === 1 || i === last || (i >= left && i < right)) {
          range.push(i)
        }
      }
      range.forEach(function (i) {
        if (l) {
          if (i - l === 2) {
            pages.push(l + 1)
          } else if (i - l !== 1) {
            pages.push('...')
          }
        }
        pages.push(i)
        l = i
      })
      return pages
    })

    // Methods
    const updatePage = (activePage) => {
      if (activePage !== state.currentPage) {
        state.currentPage = activePage
        updateLinks()
        emit('page', state.currentPage)
      }
    }

    const prev = () => {
      if (state.currentPage > 1) {
        state.currentPage--
      } else {
        state.currentPage = 1
      }
      updateLinks()
      emit('page', state.currentPage)
    }

    const next = () => {
      if (state.currentPage < props.meta.totalPages) {
        state.currentPage++
      } else {
        state.currentPage = props.meta.totalPages
      }
      updateLinks()
      emit('page', state.currentPage)
    }
    const updateLinks = () => {
      state.isPrev = state.currentPage > 1
      state.isNext = state.currentPage < props.meta.totalPages
    }

    const reCalculate = () => {
      state.delta = 3
      if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        state.delta = 1
      }
    }

    onBeforeMount(() => {
      updateLinks()
      window.addEventListener('resize', reCalculate)
    })

    onBeforeUnmount(() => {
      window.removeEventListener('resize', reCalculate)
    })

    return {
      ...toRefs(state),
      pageRange,
      prev,
      next,
      updatePage
    }
  }
}
</script>

<style scoped></style>

<template>
 <!-- <span class="text-base tracking-tighter text-yellow-500">
    <x-svg.bell class="h-5 -mr-1 align-text-top animate-swing origin-top"/>
    <sup>2</sup>
  </span> -->
  <div v-click-away="() => { dropdown = false }" class="relative">
    <button class="p-2 hover:bg-gray-200 rounded dark:text-white dark:hover:bg-gray-500"
            @click="dropdown = !dropdown" style="position: relate;">
      <icon :classes="`w-5 h-5 ${nList.length > 0 ? 'text-red-500 animate-pulse': ''}`" name="bell">
      </icon>
        <span class="badge badge-light" style="
        position: absolute;
        color: #fff;
        background-color: #f26c22;
        top: 3px;
        right: 3px;
        padding: 0.25em 0.4em;
        font-size: 75%;
        font-weight: 700;
        line-height: 1;
        text-align: center;
        white-space: nowrap;
        vertical-align: baseline;
        border-radius: 8px;
      ">{{nList.length}}</span>
    </button>
    <div v-if="dropdown" aria-orientation="vertical"
         class="absolute top-8 right-0 mt-2 w-64 rounded-md shadow-lg py-2 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 focus:outline-none"
         role="menu" tabindex="-1">
      <div class="relative">
        <div
          class="max-h-96 scrollbar scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200 dark:scrollbar-track-gray-900 dark:scrollbar-thumb-gray-600">
          <ul class="px-3">
            <li :class="`py-1 ${nList.length > 0 ? 'border-b border-gray-200 dark:border-gray-600' : ''}`">
              {{ `You have ${nList.length} ${nList.length === 1 ? 'notification' : 'notifications'}` }}
            </li>
            <li v-for="(notification, index) in nList" :key="index"
                class="py-1 border-b border-gray-200 dark:border-gray-600">
              <a href="javascript:void(0)" @click="markReadAndRedirect(notification, index)">
                {{ notification.message }}
                <span class="text-sm font-normal text-gray-500 dark:text-gray-300" v-if="notification.diffToHuman">
                  &nbsp;-&nbsp;{{ notification.diffToHuman }}</span>
              </a>
            </li>
            <li v-if="nList.length > 0" class="py-1 text-center hover:text-red-500">
              <a href="javascript:void(0)" @click="clearAllNotifications()">Clear All</a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Icon from '@/components/Icon'
import { computed, onBeforeMount, onBeforeUnmount, ref, watch } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { SET_NOTIFICATIONS } from '@/store/keys'
import * as moment from 'moment-timezone'

export default {
  name: 'NotificationsDropdown',
  components: {
    Icon
  },
  setup () {
    const dropdown = ref(false)
    const interval = ref(null)
    const nList = ref([])

    const store = useStore()
    const router = useRouter()

    // Computed
    const notifications = computed(() => store.state.notifications)
    // Watch
    watch(() => ({ ...notifications.value }),
      (newVal, oldVal) => {
        format()
      })

    // Methods
    const markReadAndRedirect = (notification, index) => {
      const nList = [...notifications.value]
      if (index !== -1) {
        nList.splice(index, 1)
        store.commit(SET_NOTIFICATIONS, nList)
        if (notification.id) {
          router.push({
            name: 'wallet',
            query: { id: notification.id }
          })
        }
      }
    }
    const clearAllNotifications = () => {
      store.commit(SET_NOTIFICATIONS, [])
    }
    const dateDiffToHuman = (date) => {
      return date && moment.tz(date, 'UTC').fromNow()
    }

    const format = () => {
      nList.value = notifications.value.map(n => {
        return {
          ...n,
          diffToHuman: n.date ? dateDiffToHuman(n.date) : ''
        }
      })
    }

    onBeforeMount(() => {
      interval.value = setInterval(() => {
        format()
      }, 1000)
    })

    onBeforeUnmount(() => {
      if (interval.value) {
        clearInterval(interval.value)
      }
    })

    return {
      dropdown,
      markReadAndRedirect,
      clearAllNotifications,
      dateDiffToHuman,
      nList
    }
  }
}
</script>

<style lang="scss" scoped></style>

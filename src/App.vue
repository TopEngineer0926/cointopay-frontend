<template>
  <div>
    <Navbar/>
    <div class="dark:bg-gray-600" style="margin-top:60px; min-height: calc(100vh - 319px)">
      <router-view/>
    </div>
    <Footer/>
  </div>
</template>

<style lang="scss"></style>
<script>
import Navbar from './components/partials/Navbar'
import Footer from './components/partials/Footer'
import {
  FETCH_ALT_COINS,
  FETCH_COUNTRIES,
  FETCH_LANGUAGES,
  FETCH_TRANSFER_WISE_CONFIG,
  SET_NOTIFICATIONS
} from './store/keys'
import { computed, inject, onBeforeMount, onBeforeUnmount, reactive } from 'vue'
import { useStore } from 'vuex'

export default {
  components: {
    Footer,
    Navbar
  },
  setup () {
    const toast = inject('toast')

    const store = useStore()

    const state = reactive({
      socket: null,
      isSocketClosed: false
    })

    const notifications = computed(() => store.state.notifications)
    const user = computed(() => store.state.user)

    const generateNotification = (parts) => {
      let message = ''
      let prefix = 'T'
      let id = null
      switch (parts[2]) {
        case 'PAID':
          prefix = 'T'
          id = prefix + parts[1].padStart(9, '0')
          message = `${id} paid successfully`
          break
        case 'EXPIRED':
          prefix = 'T'
          id = prefix + parts[1].padStart(9, '0')
          message = `${id} has expired`
          break
        case 'PAYOUT':
          prefix = 'P'
          id = prefix + parts[1].padStart(9, '0')
          message = `${id} payout successful`
      }
      return {
        message: message,
        id: id,
        date: new Date()
      }
    }

    const getType = (status) => {
      let type = 'info'
      if (status === 'paid' || status === 'paidout') {
        type = 'success'
      } else if (status === 'waiting') {
        type = 'warning'
      } else if (status === 'cancelled' || status === 'expired') {
        type = 'error'
      }
      return type
    }

    const showToast = (status, message) => {
      const type = getType(status.toLowerCase())
      switch (type) {
        case 'success':
          toast.success(message)
          break
        case 'error':
          toast.error(message)
          break
        case 'warning':
          toast.warning(message)
          break
        case 'info':
          toast.info(message)
          break
      }
    }

    const initSocket = () => {
      state.socket = new WebSocket('wss://wss.cointopay.com/balance')
      state.socket.onmessage = (event) => {
        if (event && event.data) {
          const parts = event.data.split(':')
          if (parts.length >= 4 && user.value) {
            if (parts[0].toString() === user.value.ID.toString()) {
              const notificationsList = notifications.value
              const notification = generateNotification(parts)
              notificationsList.splice(0, 0, notification)
              store.commit(SET_NOTIFICATIONS, notifications)
              showToast(parts[2], `Transaction ${parts[1]} ${parts[2]}`)
            }
          }
        }
      }
      state.socket.onclose = (event) => {
        if (!state.isSocketClosed) {
          initSocket()
        }
      }
    }

    onBeforeMount(() => {
      initSocket()
      const mode = computed(() => store.state.mode)
      if (mode.value === 'dark') {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
      // Fetch languages
      store.dispatch(FETCH_LANGUAGES)
      // Fetch alt coins
      store.dispatch(FETCH_ALT_COINS)
      // Fetch transfer wise configurations
      store.dispatch(FETCH_TRANSFER_WISE_CONFIG)
      // Fetch countries
      store.dispatch(FETCH_COUNTRIES)
    })

    onBeforeUnmount(() => {
      if (state.socket) {
        state.isSocketClosed = true
        state.socket.close()
      }
    })
  }
}
</script>

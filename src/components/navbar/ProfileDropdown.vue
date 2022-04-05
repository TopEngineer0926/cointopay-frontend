<template>
  <div class="relative" v-if="show" v-click-away="() => { dropdown = false }">
    <div>
      <button id="user-menu-button" aria-expanded="false" aria-haspopup="true"
              class="bg-gray-100 dark:bg-gray-400 flex rounded-full overflow-hidden focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-800 focus:ring-blue-700 dark:focus:ring-gray-400"
              type="button" @click="dropdown = !dropdown">
        <span class="sr-only">Open user menu</span>
        <span
          class="inline-block flex items-center text-sm justify-center h-8 w-8 rounded-full uppercase font-bold text-blue-500 dark:text-white">
                  {{ avatar }}</span>
      </button>
    </div>
    <div v-if="dropdown" aria-labelledby="user-menu-button" aria-orientation="vertical"
         class="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 focus:outline-none"
         role="menu" tabindex="-1">
      <a class="flex items-center block px-4 py-2 font-semibold text-base text-gray-700 cursor-pointer dark:text-gray-400">
        {{ user.Username }}
      </a>
      <a id="user-menu-item-2"
         class="flex items-center block px-4 py-2 text-sm text-gray-700 cursor-pointer hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-700"
         role="menuitem" tabindex="-1" @click="logout()">
        <icon name="power"></icon>
        <span class="ml-3">Logout</span>
      </a>
    </div>
  </div>
</template>

<script>
import Icon from '@/components/Icon'
import { useStore } from 'vuex'
import { computed, inject, ref } from 'vue'
import { useRouter } from 'vue-router'
import compositionUtils from '@/compositionUtils'

export default {
  name: 'ProfileDropdown',
  props: ['show'],
  components: {
    Icon
  },
  setup (props, { emit }) {
    // Providers
    const toast = inject('toast')

    const dropdown = ref(false)
    const store = useStore()
    const router = useRouter()

    const { terminateSession } = compositionUtils()

    // Computed
    const user = computed(() => store.state.user)
    const avatar = computed(() => {
      if (user.value) {
        const username = user.value.Username
        return username && username.toString().slice(0, 1).toUpperCase()
      }
      return ''
    })

    // Methods
    const logout = () => {
      dropdown.value = false
      emit('closeMenu')
      terminateSession().then(() => {
        router.push('/login')
        toast.success('Sign out successful')
      })
    }

    return {
      dropdown,
      avatar,
      user,
      logout
    }
  }
}
</script>

<style scoped></style>

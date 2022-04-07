<template>
  <nav class="bg-white w-full z-50 border-gray-200 px-4 py-2.5 shadow-lg dark:bg-gray-800 fixed top-0">
    <div class="max-w-7xl 3xl:max-w-8xl flex flex-wrap justify-between items-center mx-auto flex-col xl:flex-row">
      <div class="flex items-center justify-between w-full xl:w-auto">
        <router-link tag="a" :to="{name: 'home'}" class="flex">
          <img alt="Cointopay" class="mr-3 h-10" :src="logo"/>
        </router-link>
        <div class="flex items-center">
          <button aria-expanded="false"
                  class="inline-flex items-center p-2 ml-3 text-sm text-gray-500 rounded-lg xl:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
                  type="button"
                  @click="isMenu = !isMenu">
            <span class="sr-only">Open main menu</span>
            <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path clip-rule="evenodd"
                    d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                    fill-rule="evenodd"></path>
            </svg>
            <svg class="hidden w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path clip-rule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    fill-rule="evenodd"></path>
            </svg>
          </button>
        </div>
      </div>
      <div id="mobile-menu" :class="[!isMenu ? 'hidden' : '']"
           class="mt-3 xl:mt-0 w-full xl:w-auto block xl:flex items-center flex-1 flex-col xl:flex-row justify-between">
        <converter />
        <div class="w-full xl:w-auto block xl:flex items-center">
          <ul
            class="flex items-center flex-col mt-4 xl:flex-row space-y-2 xl:space-y-0 xl:space-x-3 xl:mt-0 xl:text-sm xl:font-medium">
            <li class="w-full" v-if="isLoggedIn">
              <router-link tag="a" :to="{name: 'wallet'}" class="nav-item border-0">
                <span class="block" @click="isMenu = false">{{ translate('menu.wallet') }}</span>
              </router-link>
            </li>
            <li class="w-full" v-if="isLoggedIn">
              <router-link tag="a" :to="{name: 'account'}" class="nav-item border-0">
                <span class="block" @click="isMenu = false">{{ translate('menu.account') }}</span>
              </router-link>
            </li>
            <li class="w-full nav-item border-0" v-if="isLoggedIn">
              <notifications-dropdown></notifications-dropdown>
            </li>
            <li class="w-full" v-if="shoppingCartItemsCount > 0">
              <router-link tag="a" :to="{name: 'cart'}" class="nav-item border-0">
                <button @click="isMenu = false"
                        class="relative p-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 rounded dark:text-white dark:hover:bg-gray-500">
                  <icon name="shopping-cart" classes="w-5 h-5"></icon>
                  <span class="absolute text-xs -top-0 right-0 bg-red-500 bg-opacity-75 text-white rounded-full flex items-center justify-center w-5 h-5">{{ shoppingCartItemsCount }}</span>
                </button>
              </router-link>
            </li>
            <template v-if="!isLoggedIn">
              <li class="w-full">
                <router-link class="nav-item border-0" tag="a" :to="{name: 'login'}">
                  <span @click="isMenu = false">{{ translate('login.title') }}</span>
                </router-link>
              </li>
              <li class="w-full">
                <router-link class="nav-item border-0 whitespace-nowrap" tag="a" :to="{name: 'signup'}">
                  <span @click="isMenu = false">{{ translate('signup.title') }}</span>
                </router-link>
              </li>
            </template>
            <li class="w-full nav-item border-0" v-if="isLoggedIn">
              <j-button class="bg-orange-500 hover:bg-orange-700 focus:ring-none" @click="logout()">
                {{ user.Username }} - {{ translate('menu.logout') }}
              </j-button>
            </li>
            <li class="w-full nav-item border-0">
              <button
                class="p-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 rounded dark:text-white dark:hover:bg-gray-500"
                @click="toggleMode()">
                <icon :name="`${theme === 'light' ? 'moon' : 'sun'}`" classes="w-5 h-5"></icon>
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </nav>
</template>

<script>
import Converter from '@/components/Converter'
import Icon from '@/components/Icon'
import JButton from '@/templates/Button'
import NotificationsDropdown from '@/components/navbar/NotificationsDropdown'
import { SET_MODE, UPDATE_CART } from '@/store/keys'
import { useStore } from 'vuex'
import { computed, inject, reactive, toRefs } from 'vue'
import compositionUtils from '@/compositionUtils'
import { useRouter } from 'vue-router'

export default {
  name: 'Navbar',
  components: {
    Icon,
    Converter,
    JButton,
    NotificationsDropdown
  },
  setup () {
    // Providers
    const translate = inject('translate')
    const toast = inject('toast')
    // Store
    const store = useStore()
    const router = useRouter()

    const { terminateSession } = compositionUtils()

    const state = reactive({
      isMenu: false
    })

    // Computed
    const isLoggedIn = computed(() => store.state.isLoggedIn)
    const user = computed(() => store.state.user)
    const theme = computed(() => store.state.mode)
    const logo = computed(() => {
      return theme.value === 'light' ? require('@/assets/logo-dark.svg') : require('@/assets/logo-light.svg')
    })
    const cart = computed(() => store.state.cart)
    const shoppingCartItemsCount = computed(() => {
      if (typeof cart.value.items === 'undefined') {
        // Update cart structure
        store.commit(UPDATE_CART, {
          items: [],
          merchantId: null
        })
        return 0
      }
      return cart.value.items.length
    })

    // Methods
    const toggleMode = () => {
      const mode = theme.value === 'light' ? 'dark' : 'light'
      store.commit(SET_MODE, mode)
      if (mode === 'dark') {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    }

    const logout = () => {
      state.isMenu = false
      terminateSession().then(() => {
        router.push('/login')
        toast.success('Sign out successful')
      })
    }

    return {
      translate,
      ...toRefs(state),
      isLoggedIn,
      user,
      theme,
      logo,
      toggleMode,
      logout,
      shoppingCartItemsCount
    }
  }
}
</script>

<style scoped></style>

<template>
  <div class="p-4">
    <div class="max-w-7xl 3xl:max-w-8xl mx-auto">
      <div class="flex flex-col md:flex-row space-x-0 md:space-x-4">
        <div class="w-full md:w-72 mb-4 md:mb-0 bg-white dark:bg-gray-800 rounded shadow p-4" style="min-width: 18rem;">
          <ul class="pl-0" style="list-style-type: none">
            <li v-for="(nav, i) in navs" :key="i" class="mb-1 border border-gray-200 dark:border-gray-700">
              <router-link :class="{'active': nav.isActive }" :to="{ name: nav.route }"
                           class="flex items-center hover:bg-gray-200 dark:hover:bg-gray-700 p-2 cursor-pointer dark:text-gray-300"
                           tag="a">
                <span>{{ translate(nav.name) }}</span>
              </router-link>
            </li>
          </ul>
        </div>
        <div class="flex-grow bg-white dark:bg-gray-800 rounded shadow p-4 overflow-hidden">
          <pos-checkout></pos-checkout>
          <slot name="content"/>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import PosCheckout from '@/components/account/pos/PosCheckout'
import { inject, onMounted, reactive, toRefs } from 'vue'
import { useRouter } from 'vue-router'
import { FETCH_POS_DATA } from '@/store/keys'
import { useStore } from 'vuex'

export default {
  name: 'POSLayout',
  components: {
    PosCheckout
  },
  setup () {
    // Providers
    const translate = inject('translate')
    const router = useRouter()
    const store = useStore()
    // State
    const state = reactive({
      navs: [
        {
          name: 'pos.menu.products',
          route: 'account-pos-products',
          isActive: true
        },
        {
          name: 'pos.menu.tickets',
          route: 'account-pos-tickets',
          isActive: false
        },
        {
          name: 'pos.menu.receipts',
          route: 'account-pos-recipients',
          isActive: false
        },
        {
          name: 'pos.menu.employees',
          route: 'account-pos-employees',
          isActive: false
        },
        {
          name: 'pos.menu.office',
          route: 'account-pos-office',
          isActive: false
        }
      ]
    })

    onMounted(() => {
      const productRoutes = ['account-pos-categories', 'account-pos-favourites', 'account-pos-invoice', 'account-pos-invoice-success']
      const ticketRoutes = ['account-pos-ticket']
      const currentRoute = router.currentRoute.value.name
      state.navs = state.navs.map(nav => {
        return {
          ...nav,
          isActive: nav.route === currentRoute ||
            (productRoutes.indexOf(currentRoute) !== -1 && nav.route === 'account-pos-products') ||
            (ticketRoutes.indexOf(currentRoute) !== -1 && nav.route === 'account-pos-tickets')
        }
      })
      store.dispatch(FETCH_POS_DATA, {}).catch(error => {
        console.log(error)
        router.push({ name: 'wallet' })
      })
    })

    return {
      translate,
      ...toRefs(state)
    }
  }
}
</script>

<style scoped lang="scss">
.active {
  @apply bg-gray-200 dark:bg-gray-700;
}
</style>

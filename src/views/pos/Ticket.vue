<template>
  <pos-layout>
    <template v-slot:content>
      <div class="card">
        <div class="body">
          <div class="flex items-center justify-end mb-3">
            <router-link tag="a" :to="{name: 'account-pos-tickets'}"
                         class="btn btn-primary mr-2">{{ translate('pos.tickets.back') }}
            </router-link>
            <router-link tag="a" :to="{name: 'account-pos-products'}" class="btn btn-primary"
                         v-if="ticket.status !== 'paid' && ticket.cashier === employee.USERNAME">
              {{ translate('pos.tickets.add_product') }}
            </router-link>
          </div>
          <div
            class="w-full scrollbar scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200 dark:scrollbar-track-gray-900 dark:scrollbar-thumb-gray-600">
            <table class="table-sm mb-2" v-if="ticket">
              <thead>
              <tr>
                <th style="min-width: 150px;">Product</th>
                <th style="min-width: 100px;">SKU</th>
                <th>Price</th>
                <th>Quantity</th>
                <th>Total Price</th>
                <th style="min-width: 100px;">Actions</th>
              </tr>
              </thead>
              <tbody>
              <tr :key="index" v-for="(product, index) in ticket.ticketProducts">
                <td @click="launchUpdateCartItem(product, index)">{{ product.productName }}</td>
                <td @click="launchUpdateCartItem(product, index)">{{ product.productSku }}</td>
                <td @click="launchUpdateCartItem(product, index)">{{ `${product.productPrice} ${currency}` }}</td>
                <td @click="launchUpdateCartItem(product, index)">{{ product.productQuantity }}</td>
                <td @click="launchUpdateCartItem(product, index)">
                  {{ `${toFixed(product.productPrice * product.productQuantity)} ${currency}` }}
                </td>
                <td>
                  <div v-if="employee && employee.USERNAME === ticket.cashier">
                    <button @click="launchUpdateCartItem(product, index)"
                            class="hover:text-blue-500 mr-2" v-if="ticket.status !== 'paid'">
                      <icon name="edit"></icon>
                    </button>
                    <button @click="removeItemFromCart(product, index)"
                            class="hover:text-red-500" v-if="ticket.status !== 'paid'">
                      <icon name="trash"></icon>
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="ticket.ticketProducts.length === 0">
                <td colspan="6">No products available!</td>
              </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </template>
  </pos-layout>
  <!-- Update Cart Item Modal -->
  <update-cart-item-modal></update-cart-item-modal>
</template>

<script>
import POSLayout from '@/components/layouts/POSLayout'
import UpdateCartItemModal from '@/components/account/pos/modals/tickets/UpdateCartItemModal'
import Icon from '@/components/Icon'
import { computed, inject, onBeforeMount, onBeforeUnmount, reactive, toRefs } from 'vue'
import compositionUtils from '@/compositionUtils'
import { useStore } from 'vuex'
import * as _ from 'lodash'
import { FETCH_POS_DATA, SAVE_PRODUCTS, SAVE_TICKETS, SET_POS } from '@/store/keys'
import { useRoute } from 'vue-router'

export default {
  name: 'Ticket',
  components: {
    'pos-layout': POSLayout,
    Icon,
    UpdateCartItemModal
  },
  setup () {
    // Providers
    const translate = inject('translate')
    const swal = inject('swal')
    const emitter = inject('emitter')
    const toast = inject('toast')
    // Store
    const store = useStore()
    const route = useRoute()

    const {
      toFixed,
      saveNotification
    } = compositionUtils()

    const state = reactive({
      ticket: null,
      employee: null,
      socket: null,
      isSocketClosed: false
    })

    // Computed
    const accountInfo = computed(() => store.state.accountInfo)
    const user = computed(() => store.state.user)
    const pos = computed(() => store.state.pos)
    const posCalls = computed(() => store.state.posCalls)
    const currency = computed(() => {
      return accountInfo.value ? accountInfo.value.PayoutCurrencyShortName : 'EUR'
    })

    // Methods
    const launchUpdateCartItem = (product, index) => {
      emitter.emit('updateCartItemModal', {
        product: product,
        itemIndex: index,
        currency: currency.value,
        ticket: state.ticket,
        confirm: () => {
          state.ticket = _.find(pos.value.tickets, { ticketId: state.ticket.ticketId })
        }
      })
    }
    // Remove product from cart
    const removeItemFromCart = (product, index) => {
      swal.fire({
        title: 'Ticket',
        text: 'Are you sure, want to remove this product?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        confirmButtonText: 'Yes',
        cancelButtonText: 'No',
        focusCancel: true,
        customClass: {
          container: 'swal2-tailwind'
        }
      }).then(({ value }) => {
        if (value && value === true) {
          const posData = _.cloneDeep(pos.value)
          const productIndex = _.findIndex(posData.products, { id: product.productId })
          if (productIndex !== -1) {
            posData.products[productIndex].stock =
              Number(posData.products[productIndex].stock) + Number(product.productQuantity)
            store.dispatch(SAVE_PRODUCTS, {
              call: posCalls.value.products,
              data: posData.products
            })
          }
          const favIndex = _.findIndex(posData.favourites, { id: product.productId })
          if (favIndex !== -1) {
            posData.favourites[favIndex].stock =
              Number(pos.value.favourites[favIndex].stock) + Number(product.productQuantity)
          }
          const activeTicket = _.cloneDeep(state.ticket)
          const ticketIndex = _.findIndex(posData.tickets, { ticketId: activeTicket.ticketId })
          if (ticketIndex !== -1) {
            activeTicket.ticketProducts.splice(index, 1)
            posData.tickets.splice(ticketIndex, 1, activeTicket)
            store.dispatch(SAVE_TICKETS, {
              call: posCalls.value.tickets,
              data: posData.tickets
            })
            store.commit(SET_POS, posData)
            toast.success('Product removed successfully!')
            saveNotification('Product removed successfully!')
          }
        }
      })
    }
    // Initialize socket
    const initSocket = () => {
      state.socket = new WebSocket('wss://wss.cointopay.com/transactions')
      state.socket.onmessage = (event) => {
        if (event && event.data) {
          const parts = event.data.split(':')
          if (parts[0].toLowerCase() === 'pos') {
            const merchantID = parts[1]
            if (user.value && merchantID.toString() === user.value.ID.toString()) {
              store.dispatch(FETCH_POS_DATA, {})
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
      state.employee = _.find(pos.value.users, { isLoggedIn: 'true' })
      if (Object.keys(route.params).length > 0 && route.params.ticketId) {
        state.ticket = _.find(pos.value.tickets, { ticketId: route.params.ticketId })
        initSocket()
      }
    })

    onBeforeUnmount(() => {
      state.isSocketClosed = true
      if (state.socket) {
        state.socket.close()
      }
    })

    return {
      translate,
      ...toRefs(state),
      toFixed,
      currency,
      launchUpdateCartItem,
      removeItemFromCart
    }
  }
}
</script>

<style lang="scss" scoped>
.table-sm {
  thead {
    tr {
      th:first-child {
        @apply pl-3;
      }
    }
  }

  tbody {
    tr {
      td:first-child {
        @apply pl-3;
      }
    }
  }
}
</style>

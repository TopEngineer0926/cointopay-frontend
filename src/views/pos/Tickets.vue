<template>
  <pos-layout>
    <template v-slot:content>
      <div class="card">
        <div class="body">
          <div class="flex items-center justify-end flex-col lg:flex-row mb-3">
            <div class="mb-4 lg:mb-0 mr-3">
              <select v-model="status" aria-label="" class="form-select w-72">
                <option value="">All Tickets</option>
                <option value="waiting">Active</option>
                <option value="paid">Processed</option>
              </select>
            </div>
            <div class="mb-3 lg:mb-0 mr-3">
              <div class="relative flex-1">
                <icon classes="absolute w-5 h-5 top-3 left-3 dark:text-gray-300" name="search"></icon>
                <input v-model="keyword" aria-label="Search..." class="form-input px-10 w-full" type="text"/>
                <span v-if="keyword !== ''" class="absolute top-3 right-3 dark:text-gray-400 cursor-pointer"
                      @click="keyword = ''">
                  <icon classes="w-5 h-5" name="close"></icon>
                </span>
              </div>
            </div>
            <div class="text-right">
              <j-button type="button" @click="launchSaveTicketModal()">{{ translate('pos.tickets.add') }}</j-button>
            </div>
          </div>
          <div
            class="w-full scrollbar scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200 dark:scrollbar-track-gray-900 dark:scrollbar-thumb-gray-600">
            <table class="table-sm mb-2">
              <thead>
              <tr>
                <th class="whitespace-nowrap">Ticket Number</th>
                <th class="whitespace-nowrap">Ticket Name</th>
                <th>Note</th>
                <th>Cashier</th>
                <th>Currency</th>
                <th class="whitespace-nowrap">Total Products</th>
                <th class="whitespace-nowrap">Total Amount</th>
                <th style="min-width:200px;width:200px;">Actions</th>
              </tr>
              </thead>
              <tbody>
              <tr v-for="(ticket, index) in filteredTickets" :key="index" :data-ticket="index"
                  @dblclick="addProductsToTicket(ticket)">
                <td>{{ `#${ticket.ticketId}` }}</td>
                <td>
                  <div class="flex items-center">
                    <span class="mr-2">{{ ticket.name }}</span>
                    <span
                      v-if="ticket.isActive === 'true' && employee && ticket.cashier.toLowerCase() === employee.USERNAME.toLowerCase()">
                      <icon classes="w-5 h-5 text-blue-500" name="shopping-cart"></icon>
                    </span>
                    <span
                      v-if="ticket.isActive === 'false' && ticket.status !== 'paid' && employee && ticket.cashier === employee.USERNAME.toLowerCase()"
                      class="cursor-pointer"
                      @click="updateSelectedTicket(ticket)">
                      <icon classes="w-5 h-5 text-gray-500" name="shopping-cart"></icon>
                    </span>
                  </div>
                </td>
                <td>{{ ticket.notes }}</td>
                <td>{{ ticket.cashier }}</td>
                <td>{{ ticket.currency }}</td>
                <td>{{ ticket.ticketProducts.length }}</td>
                <td>{{ totalAmount(ticket) + ' ' + currency }}
                </td>
                <td class="pr-3">
                  <router-link v-if="ticket.status === 'inprogress' && ticket.paymentRequest !== null"
                               v-tippy="'View Invoice'"
                               :to="{name: 'account-pos-invoice', params: { confirmCode: ticket.paymentRequest.Security }}"
                               class="hover:text-blue-500 mr-2 inline-block" tag="a">
                    <icon name="clock"></icon>
                  </router-link>
                  <router-link :to="{name: 'account-pos-ticket', params: { ticketId: ticket.ticketId }}"
                               v-tippy="'View Detail'"
                               class="hover:text-green-500 mr-2 inline-block" tag="a">
                    <icon name="eye"></icon>
                  </router-link>
                  <template v-if="employee && employee.USERNAME.toLowerCase() === ticket.cashier.toLowerCase()">
                    <button v-if="ticket.status !== 'paid'" class="hover:text-green-500 mr-2"
                            v-tippy="'Add Product(s)'" @click="continueShopping(ticket)">
                      <icon name="plus-circle"></icon>
                    </button>

                    <template v-if="employee && ticket.status !== 'paid'">
                      <button class="hover:text-green-500 mr-2" v-tippy="'Update Ticket'"
                              @click="launchSaveTicketModal(ticket)">
                        <icon name="edit"></icon>
                      </button>
                      <button class="hover:text-red-500" v-tippy="'Delete Ticket'"
                              @click="deleteTicket(ticket.ticketId)">
                        <icon name="trash"></icon>
                      </button>
                    </template>

                  </template>
                </td>
              </tr>
              <tr v-if="filteredTickets.length === 0">
                <td colspan="8">No ticket available</td>
              </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </template>
  </pos-layout>
  <!-- Save Ticket -->
  <save-ticket-modal></save-ticket-modal>
</template>

<script>
import POSLayout from '@/components/layouts/POSLayout'
import JButton from '@/templates/Button'
import Icon from '@/components/Icon'
import SaveTicketModal from '@/components/account/pos/modals/tickets/SaveTicketModal'
import { computed, inject, onBeforeMount, onBeforeUnmount, reactive, toRefs } from 'vue'
import { useStore } from 'vuex'
import * as _ from 'lodash'
import compositionUtils from '@/compositionUtils'
import { FETCH_POS_DATA, SAVE_PRODUCTS, SAVE_TICKETS } from '@/store/keys'
import { useRouter } from 'vue-router'

export default {
  name: 'Tickets',
  components: {
    SaveTicketModal,
    'pos-layout': POSLayout,
    JButton,
    Icon
  },
  setup () {
    const translate = inject('translate')
    const swal = inject('swal')
    const toast = inject('toast')
    const emitter = inject('emitter')

    const store = useStore()
    const router = useRouter()

    const { toFixed } = compositionUtils()

    // Status
    const state = reactive({
      status: '',
      keyword: '',
      employee: null,
      socket: null,
      isSocketClosed: false
    })

    // Computed
    const user = computed(() => store.state.user)
    const accountInfo = computed(() => store.state.accountInfo)
    const pos = computed(() => store.state.pos)
    const posCalls = computed(() => store.state.posCalls)
    const filteredTickets = computed(() => {
      let tickets = []
      if (state.employee) {
        tickets = pos.value.tickets.filter(ticket => ticket.isActive === 'true' && ticket.cashier.toLowerCase() === state.employee.USERNAME.toLowerCase())
      }
      if (tickets.length > 1) {
        let counter = 0
        pos.value.tickets.map(ticket => {
          if (ticket.isActive === 'true') {
            if (ticket.status === 'paid') {
              ticket.isActive = 'false'
            } else {
              counter++
            }
          }
          if (counter > 1) {
            ticket.isActive = 'false'
          }
          return ticket
        })
        if (counter > 1) {
          store.dispatch(SAVE_TICKETS, {
            call: posCalls.value.tickets,
            data: pos.value.tickets
          })
        }
      }
      if (state.keyword && state.status) {
        const keyword = state.keyword.trim().toLowerCase()
        tickets = pos.value.tickets.filter(ticket => {
          if (state.status.toString() === 'waiting') {
            return (typeof ticket.status === 'undefined' || ['waiting', 'inprogress'].indexOf(ticket.status.toLowerCase()) !== -1) &&
              (_.includes(ticket.name.toLowerCase(), keyword) ||
                _.includes(ticket.notes.toLowerCase(), keyword)
              ) && ticket.cashier.toLowerCase() === state.employee.USERNAME.toLowerCase()
          } else {
            return ticket.status && ticket.status.toString() === state.status.toString() && (_.includes(ticket.name.toLowerCase(), keyword) ||
              _.includes(ticket.notes.toLowerCase(), keyword)
            ) && ticket.cashier.toLowerCase() === state.employee.USERNAME.toLowerCase()
          }
        })
      } else if (state.keyword) {
        const keyword = state.keyword.trim().toLowerCase()
        tickets = pos.value.tickets.filter(ticket => {
          return (_.includes(ticket.name.toLowerCase(), keyword) ||
            _.includes(ticket.notes.toLowerCase(), keyword)
          )
        })
      } else if (state.status) {
        tickets = pos.value.tickets.filter(ticket => {
          if (state.status.toString() === 'waiting') {
            return (typeof ticket.status === 'undefined' ||
                ['waiting', 'inprogress'].indexOf(ticket.status.toLowerCase()) !== -1) &&
              ticket.cashier.toLowerCase() === state.employee.USERNAME.toLowerCase()
          } else {
            return ticket.status && ticket.status.toString() === state.status.toString() &&
              ticket.cashier.toLowerCase() === state.employee.USERNAME.toLowerCase()
          }
        })
      } else {
        tickets = pos.value.tickets
      }
      return _.orderBy(tickets, 'isActive', 'desc')
    })
    const currency = computed(() => {
      return accountInfo.value ? accountInfo.value.PayoutCurrencyShortName : 'EUR'
    })

    // Methods
    const totalAmount = (ticket) => {
      let totalAmount = 0
      ticket.ticketProducts.map(product => {
        totalAmount = Number(totalAmount) + Number(product.productQuantity) * Number(product.productPrice)
      })
      return toFixed(totalAmount)
    }
    const updateSelectedTicket = (ticket, isRedirect = false) => {
      const tickets = _.cloneDeep(pos.value.tickets)
      if (state.employee && ticket.cashier.toLowerCase() === state.employee.USERNAME.toLowerCase()) {
        tickets.map(t => {
          if (t.cashier.toLowerCase() === state.employee.USERNAME.toLowerCase()) {
            t.isActive = t.ticketId.toString() === ticket.ticketId.toString() && t.status !== 'paid' ? 'true' : 'false'
          }
        })
        store.dispatch(SAVE_TICKETS, {
          call: posCalls.value.tickets,
          data: tickets
        })
        toast.success('Ticket selected successfully')
        if (isRedirect) {
          router.push({ name: 'account-pos-products' })
        }
      }
    }
    const continueShopping = (ticket) => {
      // this.index = null
      updateSelectedTicket(ticket, true)
    }
    const addProductsToTicket = (ticket) => {
      if (ticket.status !== 'paid' && state.employee && state.employee.USERNAME.toLowerCase() === ticket.cashier.toLowerCase()) {
        continueShopping(ticket)
      }
    }
    const deleteTicket = (id) => {
      const index = _.findIndex(pos.value.tickets, { ticketId: id })
      if (index !== -1) {
        swal.fire({
          title: 'Ticket',
          text: 'Are you sure, want to delete this ticket?',
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
            const tickets = posData.tickets
            const ticket = tickets[index]
            const products = posData.products
            const isSelected = ticket.isActive
            if (ticket.ticketProducts.length > 0) {
              ticket.ticketProducts.map(product => {
                const productIndex = _.findIndex(products, { id: product.productId })
                if (productIndex !== -1) {
                  products[productIndex].stock =
                    Number(products[productIndex].stock) +
                    Number(product.productQuantity)
                }
                const favIndex = _.findIndex(posData.favourites, { id: product.productId })
                if (favIndex !== -1) {
                  posData.favourites[favIndex].stock =
                    Number(posData.favourites[favIndex].stock) + Number(product.productQuantity)
                }
              })
            }
            store.dispatch(SAVE_PRODUCTS, {
              call: posCalls.value.products,
              data: products
            })
            posData.products = products
            tickets.splice(index, 1)
            posData.tickets = tickets
            if (isSelected === 'true' && posData.tickets.length > 0) {
              const ticketIndex = _.findIndex(posData.tickets, (ticket) => {
                return (ticket.status.toLowerCase() === 'waiting' || ticket.status.toLowerCase() === 'inprogress') &&
                  ticket.cashier === state.employee.USERNAME.toLowerCase()
              })
              if (ticketIndex !== -1) {
                posData.tickets[ticketIndex].isActive = 'true'
              }
            }
            store.dispatch(SAVE_TICKETS, {
              call: posCalls.value.tickets,
              data: posData.tickets
            })
          }
        })
      }
    }

    const launchSaveTicketModal = (ticket = null) => {
      emitter.emit('saveTicketModal', {
        currency: currency.value,
        employee: state.employee,
        ticket: ticket
      })
    }

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
      initSocket()
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
      filteredTickets,
      currency,
      totalAmount,
      continueShopping,
      updateSelectedTicket,
      addProductsToTicket,
      deleteTicket,
      launchSaveTicketModal
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

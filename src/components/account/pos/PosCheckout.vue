<template>
  <div class="card" v-show="ticket && isShow">
    <div class="body">
      <div class="flex items-center justify-between mb-3">
        <p class="font-medium">{{ ticket.name }}</p>
        <p class="font-medium">
          {{ `${translate('pos.products.charge.total_price')}: ${totalAmount} ${ticket.inputCurrency}` }}
        </p>
      </div>
      <div class="flex items-center justify-between flex-col lg:flex-row">
        <div class="flex items-center flex-col lg:flex-row mb-3 md:mb-0">
          <div class="flex items-center mr-0 lg:mr-3 mb-3 lg:mb-0">
            <label class="mr-2">{{ translate('pos.products.charge.pay_with') }}</label>
            <select @change="updateTicketAltCoin(altCoinId)" class="form-select" v-model="altCoinId">
              <option value="">- - Select - -</option>
              <option :key="index" :value="altCoin.id" v-for="(altCoin, index) in userAltCoins">
                {{ altCoin.name }}
              </option>
            </select>
          </div>
          <div class="flex items-center">
            <j-button :disabled="isProcessing" @click="processTicket()" class="mr-2">
              <div v-if="isProcessing" class="mr-3">
                <icon :name="'spinner'" classes="w-4 h-4 text-white"></icon>
              </div>
              <span>{{ translate('pos.products.charge.btn_charge') }}</span>
            </j-button>
            <j-button :disabled="isProcessing" @click="launchDeliveryModal()">
              <div v-if="isProcessing" class="mr-3">
                <icon :name="'spinner'" classes="w-4 h-4 text-white"></icon>
              </div>
              <span>{{ translate('pos.products.charge.btn_delivery_charge') }}</span>
            </j-button>
          </div>
        </div>
        <div class="font-medium" v-if="employee">
          Logged in: {{ employee.USERNAME }}
        </div>
      </div>
    </div>
  </div>
  <!-- Delivery Modal -->
  <delivery-modal></delivery-modal>
</template>

<script>
import JButton from '@/templates/Button'
import Icon from '@/components/Icon'
import { computed, inject, onBeforeMount, reactive, toRefs } from 'vue'
import { useStore } from 'vuex'
import * as _ from 'lodash'
import compositionUtils from '@/compositionUtils'
import { SAVE_TICKETS } from '@/store/keys'
import { useRouter } from 'vue-router'
import DeliveryModal from './modals/DeliveryModal'

export default {
  name: 'PosCheckout',
  components: {
    JButton,
    Icon,
    DeliveryModal
  },
  setup () {
    const translate = inject('translate')
    const http = inject('http')
    const emitter = inject('emitter')
    const toast = inject('toast')
    // Store
    const store = useStore()
    const router = useRouter()
    const {
      toFixed,
      saveNotification
    } = compositionUtils()

    // State
    const state = reactive({
      employee: null,
      discountValue: 0,
      discountAmount: 0,
      shippingOption: null,
      userAltCoins: [],
      altCoinId: '',
      countries: [],
      isProcessing: false
    })

    // Computed
    const user = computed(() => store.state.user)
    const accountInfo = computed(() => store.state.accountInfo)
    const pos = computed(() => store.state.pos)
    const posCalls = computed(() => store.state.posCalls)
    const ticket = computed(() => {
      let ticket = null
      if (pos.value && pos.value.tickets.length > 0) {
        ticket = _.find(pos.value.tickets, { isActive: 'true' })
      }
      return ticket
    })
    const totalAmount = computed(() => {
      let total = 0
      if (ticket.value) {
        ticket.value.ticketProducts.map(product => {
          total = Number(total) + Number(product.productQuantity) * Number(product.productPrice)
        })
      }
      if (state.shippingOption) {
        total += Number(state.shippingOption.cost)
      }
      if (state.discountValue) {
        // eslint-disable-next-line vue/no-side-effects-in-computed-properties
        state.discountAmount = total * (Number(state.discountValue) / 100)
      }
      return toFixed(total - state.discountAmount)
    })
    const isShow = computed(() => {
      return ['account-pos-employees', 'account-pos-office', 'account-pos-invoice-success', 'account-pos-invoice']
        .indexOf(router.currentRoute.value.name) === -1
    })

    // Methods
    const apiUrl = process.env.VUE_APP_API_URL
    // Fetch user altCoins
    const fetchUserAltCoins = () => {
      http.get(`${apiUrl}/CloneMasterTransaction`, {
        params: {
          MerchantID: user.value.ID,
          output: 'json',
          JsonArray: ''
        }
      }).then(response => {
        if (response.status === 200) {
          state.userAltCoins = response.data.filter(altCoin => altCoin.id !== 0)
          if (ticket.value && state.userAltCoins.length > 0) {
            const altCoin = _.find(state.userAltCoins, { name: ticket.value.currency })
            state.altCoinId = altCoin ? altCoin.id : state.userAltCoins[0].id
          }
        }
      }).catch(error => {
        console.log(error)
      })
    }
    // Fetch Shipping options
    const fetchShippingOptions = () => {
      http.get(`${apiUrl}/MarketAPI?POSDATA`, {
        params: {
          Call: 'SHOWPOS',
          MerchantID: user.value.ID,
          APIKey: '_',
          KeyData: `${user.value.ID}_shippings`,
          output: 'json'
        }
      }).then(response => {
        if (response.status === 200) {
          const data = response.data
          if (data !== 'nothing found' && data.length > 0) {
            const countries = []
            data.map(item => {
              const index = _.findIndex(countries, { id: item.countryId })
              if (index !== -1) {
                const optionIndex = _.findIndex(countries[index].shippingOptions, { method: item.shippingMethod })
                if (optionIndex === -1) {
                  countries[index].shippingOptions.push({
                    method: item.shippingMethod,
                    cost: item.shippingCost
                  })
                }
              } else {
                countries.push({
                  id: item.countryId,
                  name: item.countryName,
                  shippingOptions: [
                    {
                      method: item.shippingMethod,
                      cost: item.shippingCost
                    }
                  ]
                })
              }
            })
            state.countries = countries
          } else {
            state.countries = store.state.countries
          }
        }
      }).catch(errors => {
        console.log(errors)
      })
    }
    // Update active ticket altCoin
    const updateTicketAltCoin = (altCoinId) => {
      if (altCoinId) {
        const altCoin = _.find(state.userAltCoins, { id: altCoinId })
        const tickets = _.cloneDeep(pos.value.tickets)
        const ticketIndex = _.findIndex(tickets, { ticketId: ticket.value.ticketId })
        tickets.splice(ticketIndex, 1, {
          ...ticket.value,
          currency: altCoin.name
        })
        store.dispatch(SAVE_TICKETS, {
          call: posCalls.value.tickets,
          data: tickets
        })
      }
    }
    // Process ticket
    const processTicket = () => {
      if (ticket.value && totalAmount.value > 0) {
        const altCoin = _.find(state.userAltCoins, { name: ticket.value.currency })
        if (altCoin) {
          state.isProcessing = true
          const payload = {
            MerchantID: user.value.ID,
            Checkout: true,
            Amount: totalAmount.value,
            CustomerReferenceNr: ticket.value.ticketId + '|' + ticket.value.name,
            inputCurrency: accountInfo.value ? accountInfo.value.PayoutCurrencyShortName : 'EUR',
            AltCoinID: altCoin.id,
            SecurityCode: user.value.SecurityCode,
            output: 'json'
          }
          http.get(`${apiUrl}/MerchantAPI`, {
            params: payload
          }).then(response => {
            state.isProcessing = false
            const activeTicket = _.cloneDeep(ticket.value)
            activeTicket.paymentRequest = response.data
            activeTicket.status = 'inprogress'
            // Update tickets
            const tickets = _.cloneDeep(pos.value.tickets)
            const ticketIndex = _.findIndex(tickets, { ticketId: activeTicket.ticketId })
            if (ticketIndex !== -1) {
              tickets.splice(ticketIndex, 1, activeTicket)
              store.dispatch(SAVE_TICKETS, {
                call: posCalls.value.tickets,
                data: tickets
              })
            }
            router.push({
              name: 'account-pos-invoice',
              params: { confirmCode: activeTicket.paymentRequest.Security }
            })
          }).catch(error => {
            state.isProcessing = false
            toast.error(error.response.data)
            saveNotification(error.response.data)
          })
        }
      }
    }
    // Launch delivery modal
    const launchDeliveryModal = () => {
      emitter.emit('deliveryModal', {
        ticket: ticket.value,
        countries: state.countries,
        userAltCoins: state.userAltCoins,
        confirm: ({ discountAmount }) => {
          state.discountAmount = discountAmount
        }
      })
    }

    onBeforeMount(() => {
      state.employee = _.find(pos.value.users, { isLoggedIn: 'true' })
      fetchUserAltCoins()
      fetchShippingOptions()
    })

    return {
      translate,
      ...toRefs(state),
      ticket,
      isShow,
      totalAmount,
      updateTicketAltCoin,
      processTicket,
      launchDeliveryModal
    }
  }
}
</script>

<style scoped></style>

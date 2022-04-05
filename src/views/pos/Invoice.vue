<template>
  <pos-layout>
    <template v-slot:content>
      <template v-if="ticket && invoice && !isInvoiceComplete && !isProcessing">
        <div class="mb-4 text-center">
          <p>{{ translate('pos.invoice.message') }}</p>
          <p>
            <span class="font-bold mr-2">{{ translate('pos.invoice.merchant') }}:</span>
            <span>{{ invoice.ShopTitle }}</span>
          </p>
          <p>
            <span class="font-bold mr-2">{{ translate('pos.invoice.invoice_number') }}</span>
            <span>{{ invoice.TransactionID }}</span>
          </p>
        </div>
        <tab-set>
          <tab :name="translate('invoice.address_only')">
            <div class="mb-4 flex items-center flex-col">
              <QRCodeVue3 :background-options="qrOptions.backgroundOptions"
                          :corners-dot-options="qrOptions.cornersDotOptions"
                          :corners-square-options="qrOptions.cornersSquareOptions"
                          :dots-options="qrOptions.dotsOptions"
                          :height="qrOptions.height"
                          :qr-options="qrOptions.qrOptions"
                          :value="invoice.coinAddress"
                          :width="qrOptions.width"
                          imgclass="mx-auto mb-4"></QRCodeVue3>
              <div class="flex flex-wrap justify-center items-stretch w-full relative">
                <input :value="decodeURIComponent(invoice.coinAddress)"
                       class="form-input flex-1 md:flex-none md:w-2/3 rounded-r-none"
                       readonly type="text"/>
                <div class="flex -mr-px">
                  <span
                    class="hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer flex items-center leading-normal rounded rounded-l-none border border-l-0 border-gray-500 px-3 whitespace-no-wrap text-sm"
                    @click="copyToClipboard(decodeURIComponent(invoice.coinAddress))">
                    <icon classes="w-5 h-5" name="clipboard"></icon>
                  </span>
                </div>
              </div>
            </div>
          </tab>

          <tab :name="translate('invoice.full_crypto_link')" :selected="true">
            <div class="mb-4 flex items-center flex-col">
              <QRCodeVue3 :background-options="qrOptions.backgroundOptions"
                          :corners-dot-options="qrOptions.cornersDotOptions"
                          :corners-square-options="qrOptions.cornersSquareOptions"
                          :dots-options="qrOptions.dotsOptions"
                          :height="qrOptions.height"
                          :qr-options="qrOptions.qrOptions"
                          :value="cryptoLink"
                          :width="qrOptions.width"
                          imgclass="mx-auto mb-4"></QRCodeVue3>
              <div class="flex flex-wrap justify-center items-stretch w-full relative">
                <input :value="decodeURIComponent(invoice.coinAddress)"
                       class="form-input flex-1 md:flex-none md:w-2/3 rounded-r-none"
                       readonly type="text"/>
                <div class="flex -mr-px">
                  <span
                    class="hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer flex items-center leading-normal rounded rounded-l-none border border-l-0 border-gray-500 px-3 whitespace-no-wrap text-sm"
                    @click="copyToClipboard(decodeURIComponent(invoice.coinAddress))">
                    <icon classes="w-5 h-5" name="clipboard"></icon>
                  </span>
                </div>
              </div>
            </div>
          </tab>
          <tab :name="translate('invoice.tzero')">
            <div class="mb-4 flex items-center justify-between flex-col">
              <QRCodeVue3 :background-options="qrOptions.backgroundOptions"
                          :corners-dot-options="qrOptions.cornersDotOptions"
                          :corners-square-options="qrOptions.cornersSquareOptions"
                          :dots-options="qrOptions.dotsOptions"
                          :height="qrOptions.height"
                          :qr-options="qrOptions.qrOptions"
                          :value="invoice.TZERO"
                          :width="qrOptions.width"
                          imgclass="mx-auto"></QRCodeVue3>
            </div>
          </tab>
        </tab-set>
        <p class="text-center">
          {{ translate('pos.invoice.amount') }}: {{ `${invoice.Amount} ${invoice.LongName}` }}
        </p>
        <p class="text-2xl font-bold text-blue-500 text-center capitalize">
          {{ timer }}
        </p>
        <div v-if="order.items.length > 0" class="mt-4">
          <div
            class="w-full scrollbar scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200 dark:scrollbar-track-gray-900 dark:scrollbar-thumb-gray-600">
            <table class="table-md">
              <thead>
              <tr>
                <th style="min-width: 250px;">Item</th>
                <th>SKU</th>
                <th>Price</th>
                <th>Quantity</th>
                <th>Subtotal</th>
              </tr>
              </thead>
              <tbody>
              <tr v-for="(item, index) of order.items" :key="index">
                <td>
                  <div class="">
                    <img :src="item.url" alt="" style="width: 100px"/>
                    <p class="mb-0 ml-1">{{ item.name }}</p>
                  </div>
                </td>
                <td>{{ item.sku }}</td>
                <td>{{ formatPrice(item.price, currency) }}</td>
                <td>{{ `x ${item.qty}` }}</td>
                <td>{{ formatPrice(item.price * item.qty, currency) }}</td>
              </tr>
              <tr v-if="order.shipping">
                <td class="text-right" colspan="3">
                  {{ translate('invoice.shipping_cost') }}
                </td>
                <td colspan="2">{{ order.shipping.method + ' ' + formatPrice(order.shipping.cost, currency) }}</td>
              </tr>
              <tr v-if="order.coupon">
                <td class="text-right" colspan="3">
                  {{ translate('invoice.discount') }}
                </td>
                <td class="text-blue-500" colspan="2">
                  {{ `-${formatPrice(order.coupon.discount, currency)}` }}
                </td>
              </tr>
              <tr>
                <td class="text-right" colspan="3">
                  <span class="font-bold">Total:</span></td>
                <td colspan="2"><span class="font-bold">{{ cartTotal }}</span></td>
              </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div class="mt-2 text-center">
          <a :href="ticket.paymentRequest.RedirectURL" class="btn btn-primary" target="_blank">Invoice Detail</a>
        </div>
      </template>
      <template v-if="isProcessing">
        <pulse-skeleton></pulse-skeleton>
        <pulse-skeleton></pulse-skeleton>
      </template>
    </template>
  </pos-layout>
</template>

<script>
import POSLayout from '@/components/layouts/POSLayout'
import { computed, inject, onBeforeMount, onBeforeUnmount, reactive, toRefs } from 'vue'
import { useStore } from 'vuex'
import * as _ from 'lodash'
import { SAVE_RECEIPT_ITEMS, SAVE_RECEIPTS, SAVE_TICKETS } from '@/store/keys'
import { useRoute, useRouter } from 'vue-router'
import * as moment from 'moment-timezone'
import compositionUtils from '@/compositionUtils'
import PulseSkeleton from '@/components/PulseSkeleton'
import TabSet from '@/components/common/TabSet'
import Tab from '@/components/common/Tab'
import QRCodeVue3 from 'qrcode-vue3'
import qrCodeOptions from '@/qrOptions'
import Icon from '@/components/Icon'

export default {
  name: 'Invoice',
  components: {
    PulseSkeleton,
    'pos-layout': POSLayout,
    TabSet,
    Tab,
    QRCodeVue3,
    Icon
  },
  setup () {
    const translate = inject('translate')
    const http = inject('http')

    const store = useStore()
    const route = useRoute()
    const router = useRouter()

    const {
      generateId,
      copyToClipboard,
      formatPrice
    } = compositionUtils()
    const { qrOptions } = qrCodeOptions()

    // State
    const state = reactive({
      invoice: null,
      ticket: null,
      order: {
        items: [],
        shipping: null,
        coupon: null
      },
      invoiceStatus: null,
      timer: null,
      interval: null,
      transactionInterval: null,
      socket: null,
      isCloseSocket: false,
      isProcessing: false
    })

    // Computed
    const pos = computed(() => store.state.pos)
    const posCalls = computed(() => store.state.posCalls)
    const cryptoLink = computed(() => {
      return `${state.invoice.CoinName.toLowerCase()}:${state.invoice.coinAddress}?amount=${state.invoice.Amount}`
    })
    const currency = computed(() => {
      return state.ticket.paymentRequest ? state.ticket.paymentRequest.inputCurrency : 'EUR'
    })
    const cartTotal = computed(() => {
      let total = 0
      if (state.order.items.length > 0) {
        state.order.items.map(item => {
          total += Number(item.qty) * Number(item.price)
        })
      }
      if (state.order.shipping) {
        total += Number(state.order.shipping.cost)
      }
      if (state.order.coupon) {
        total -= Number(state.order.coupon.discount)
      }
      return formatPrice(total, currency.value)
    })
    const isInvoiceComplete = computed(() => {
      if (state.invoiceStatus) {
        return ['paid', 'underpaid', 'complete'].indexOf(state.invoiceStatus) !== -1
      }
      return false
    })

    // Methods
    const apiBaseUrl = process.env.VUE_APP_API_URL
    const fetchTransaction = (confirmCode, isLoading = true) => {
      state.isProcessing = isLoading
      const payload = {
        Call: 'Transactiondetail',
        MerchantID: 0,
        APIKey: '_',
        ConfirmCode: confirmCode,
        output: 'json'
      }
      http.get(`${apiBaseUrl}/v2REAPI`, {
        params: payload
      }).then(response => {
        state.isProcessing = false
        if (response.status === 200) {
          if (response.data.result !== 'failed') {
            state.invoice = response.data.data
            if (state.invoice) {
              const tickets = _.cloneDeep(pos.value.tickets)
              const ticketIndex = _.findIndex(tickets, (ticket) => {
                return (ticket.paymentRequest && ticket.paymentRequest.Security === confirmCode)
              })
              if (ticketIndex !== -1) {
                state.ticket = tickets[ticketIndex]
                if (state.ticket) {
                  extractOrderData(state.ticket.paymentRequest)
                  const status = state.invoice.Status.toLowerCase()
                  if (status === 'paid' || status === 'underpaid') {
                    tickets[ticketIndex].status = 'paid'
                  } else if (status === 'waiting') {
                    tickets[ticketIndex].status = 'inprogress'
                  } else if (status === 'expired') {
                    tickets[ticketIndex].status = 'waiting'
                  }
                  if (state.ticket.status === 'waiting') {
                    tickets[ticketIndex].paymentRequest = null
                  } else if (state.ticket.status === 'paid') {
                    tickets[ticketIndex].isActive = false
                    // Check if receipt not already exists
                    const receipt = _.find(pos.value.receipts, {
                      TICKETNUMBER: state.ticket.id.toString()
                    })
                    if (!receipt) {
                      generateReceipts(state.ticket)
                    }
                  }
                }
                tickets[ticketIndex].paymentRequest = state.invoice
                store.dispatch(SAVE_TICKETS, {
                  call: posCalls.value.tickets,
                  data: tickets
                })
                const status = state.invoice.Status.toLowerCase()
                state.invoiceStatus = status
                if (status === 'paid' || status === 'underpaid' || status === 'expired') {
                  state.timer = state.invoice.Status
                  if (state.transactionInterval) {
                    clearInterval(state.transactionInterval)
                  }
                  if (state.interval) {
                    clearInterval(state.interval)
                    state.timer = status
                  }
                  // Redirect
                  if (state.ticket.status === 'paid') {
                    return router.push({
                      name: 'account-pos-invoice-success',
                      params: { ticketId: state.ticket.ticketId }
                    })
                  } else if (state.ticket.status === 'waiting') {
                    return router.push({ name: 'account-pos-tickets' })
                  }
                }
                if (status === 'waiting' || status === 'awaiting-fiat') {
                  startTimer()
                }
              }
            }
          }
        }
      }).catch(error => {
        state.isProcessing = false
        console.log(error)
      })
    }
    const startTimer = () => {
      if (!state.timer) {
        const date = moment.tz(state.invoice.CreatedOn, 'Atlantic/Azores')
          .add(state.invoice.ExpiryTime, 'minutes')

        state.interval = setInterval(() => {
          const now = moment.tz('Atlantic/Azores').valueOf()
          const diff = date.valueOf() - now
          // Time calculations for days, hours, minutes and seconds
          const days = Math.floor(diff / (1000 * 60 * 60 * 24))
          const hours = Math.floor(
            (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
          )
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
          const seconds = Math.floor((diff % (1000 * 60)) / 1000)
          state.timer = `${days}d ${hours}h ${minutes}m ${seconds}s`
          if (diff < 0) {
            clearInterval(state.interval)
            state.timer = 'Expired'
          }
        }, 1000)
      }
    }
    const extractOrderData = (transaction) => {
      const decoded = decodeURIComponent(transaction.CustomerReferenceNr)
      const elm = document.createElement('div')
      elm.innerHTML = decoded
      let items = elm.innerHTML.trim()
      state.order = {
        items: [],
        shipping: null,
        coupon: null
      }
      if (items) {
        items = items.split(':::').filter(Boolean)
        items.map(orderItem => {
          orderItem = orderItem.split('|').filter(Boolean)
          if (orderItem.length === 6) {
            state.order.items.push({
              id: orderItem[0],
              sku: orderItem[1],
              name: orderItem[2],
              url: orderItem[3],
              price: Number(orderItem[4]),
              qty: Number(orderItem[5])
            })
          } else if (orderItem.length === 5) {
            state.order.items.push({
              id: orderItem[0],
              name: orderItem[1],
              url: orderItem[2],
              price: Number(orderItem[3]),
              qty: Number(orderItem[4])
            })
          } else if (orderItem.length === 2) {
            state.order.shipping = {
              method: orderItem[0],
              cost: orderItem[1]
            }
          } else if (orderItem.length === 3) {
            state.order.coupon = {
              code: orderItem[0],
              value: orderItem[1],
              discount: orderItem[2]
            }
          }
        })
      }
    }
    const generateReceipts = (ticket) => {
      const posData = _.cloneDeep(pos.value)
      // Generate receipt and receipt items
      const receipts = posData.receipts
      const receipt = {
        ID: generateId(receipts),
        CASHIER: ticket.cashier,
        CURRENCY: ticket.inputCurrency,
        DATE: new Date().getTime().toString(),
        TRANSACTION_ID: ticket.paymentRequest.TransactionID.toString(),
        TICKETNUMBER: ticket.ticketId.toString(),
        TOTAL: `Total Price: ${ticket.paymentRequest.OriginalAmount}`
      }
      receipts.push(receipt)
      store.dispatch(SAVE_RECEIPTS, {
        call: posCalls.value.receipts,
        data: receipts
      })
      const receiptItems = posData.receiptItems
      ticket.ticketProducts.forEach(product => {
        const receiptItem = {
          ID: generateId(receiptItems),
          ITEM_NAME: product.productName,
          ITEM_PRICE: product.productPrice.toString(),
          ITEM_SKU: product.productSku,
          QUANTITY: product.productQuantity.toString(),
          CURRENCY: product.currency,
          RECIEPT_ID: receipt.ID,
          DATE: new Date().getTime()
        }
        receiptItems.push(receiptItem)
      })
      store.dispatch(SAVE_RECEIPT_ITEMS, {
        call: posCalls.value.receiptItems,
        data: receiptItems
      })
    }
    const formatStatus = (status) => {
      status = status.toLowerCase()
      if (status === 'complete') {
        return 'paid'
      } else if (status === 'failed') {
        return 'waiting'
      }
    }
    const initSocket = () => {
      state.socket = new WebSocket('wss://wss.cointopay.com/transactions')
      state.socket.onmessage = event => {
        if (event && event.data) {
          const parts = event.data.split(':')
          if (state.invoice) {
            const invoiceData = _.cloneDeep(state.invoice)
            const posData = _.cloneDeep(pos.value)
            const tickets = posData.tickets
            if (parts[0] === 'TZERO') {
              if (invoiceData && Number(invoiceData.TransactionID) === Number(parts[1])) {
                const activeTicket = _.cloneDeep(state.ticket)
                if (parts.length === 4) {
                  // not enough balance
                  activeTicket.status = 'waiting'
                  activeTicket.paymentRequest = null
                } else {
                  if (activeTicket && activeTicket.status.toLowerCase() === 'inprogress') {
                    activeTicket.status = formatStatus(parts[2])
                    if (activeTicket.status === 'waiting') {
                      activeTicket.paymentRequest = null
                    } else if (activeTicket.status === 'paid') {
                      activeTicket.isActive = false
                      generateReceipts(activeTicket)
                    }
                  }
                }
                const ticketIndex = _.findIndex(tickets, ticket => {
                  if (ticket.paymentRequest) {
                    return ticket.paymentRequest.Security === state.invoice.Security
                  }
                })
                if (ticketIndex !== -1) {
                  if (state.interval) {
                    clearInterval(state.interval)
                  }
                  state.invoiceStatus = invoiceData.Status
                  posData.tickets.splice(ticketIndex, 1, activeTicket)
                  store.dispatch(SAVE_TICKETS, {
                    call: posCalls.value.tickets,
                    data: posData.tickets
                  })
                  if (activeTicket.status === 'paid') {
                    return router.push({
                      name: 'account-pos-invoice-success',
                      params: { ticketId: activeTicket.ticketId }
                    })
                  } else if (activeTicket.status === 'waiting') {
                    return router.push({ name: 'account-pos-tickets' })
                  }
                }
              }
            }
          }
        }
      }
      state.socket.onclose = event => {
        if (!state.isCloseSocket) {
          initSocket()
        }
      }
    }

    onBeforeMount(() => {
      if (route.params.confirmCode) {
        fetchTransaction(route.params.confirmCode)
        initSocket()
      }
    })

    onBeforeUnmount(() => {
      if (state.interval) {
        clearInterval(state.interval)
      }
      if (state.transactionInterval) {
        clearInterval(state.transactionInterval)
      }
      state.isCloseSocket = true
      state.socket.close()
    })

    return {
      translate,
      ...toRefs(state),
      cryptoLink,
      copyToClipboard,
      qrOptions,
      currency,
      formatPrice,
      cartTotal,
      isInvoiceComplete
    }
  }
}
</script>

<style scoped></style>

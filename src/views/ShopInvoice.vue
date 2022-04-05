<template>
  <centered-layout>
    <template v-if="invoice && !isInvoiceComplete">
      <div class="text-center mb-3">
        <p>{{ translate('pos.invoice.message') }}</p>
        <p><span class="font-bold">{{ translate('pos.invoice.merchant') }}</span>&nbsp;{{ invoice.ShopTitle }}</p>
        <p>
          <span class="font-bold">{{ translate('pos.invoice.invoice_number') }}</span>&nbsp;
          {{ invoice.TransactionID }}
        </p>
      </div>
      <div class="w-full lg:w-3/5 mx-auto">
        <TabSet>
          <!-- Address Only -->
          <Tab :name="translate('invoice.address_only')">
            <div class="mb-4">
              <p class="text-3xl font-bold text-blue-500 text-center">{{ timer }}</p>
              <a :href="invoice.RedirectTargetURL" v-if="isPaid"
                 class="mt-3 text-blue-500 hover:underline inline-flex items-center">
                <span class="mr-2">Click to Redirect</span>
                <icon name="arrow-right" classes="w-5 h-5"></icon>
              </a>
            </div>
            <div v-if="!isPaid && !isExpired">
              <QRCodeVue3 imgclass="mx-auto"
                          :width="qrOptions.width"
                          :height="qrOptions.height"
                          :qr-options="qrOptions.qrOptions"
                          :background-options="qrOptions.backgroundOptions"
                          :dots-options="qrOptions.dotsOptions"
                          :corners-dot-options="qrOptions.cornersDotOptions"
                          :corners-square-options="qrOptions.cornersSquareOptions"
                          :value="invoice.coinAddress"></QRCodeVue3>
              <div class="mt-4">
                <div class="flex justify-center flex-wrap items-stretch w-full mb-4 relative">
                  <input type="text" v-model="invoice.coinAddress" readonly
                         class="form-input w-2/3 rounded-r-none"/>
                  <div class="flex -mr-px">
                    <span @click="copyToClipboard(invoice.coinAddress)"
                          class="hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer flex items-center leading-normal rounded rounded-l-none border border-l-0 border-gray-300 dark:border-gray-600 px-3 whitespace-no-wrap text-sm">
                      <icon name="clipboard" classes="w-5 h-5"></icon>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Tab>
          <!-- Full Crypto Link -->
          <Tab :name="translate('invoice.full_crypto_link')" :selected="true">
            <div class="mb-4">
              <p class="text-3xl font-bold text-blue-500 text-center">{{ timer }}</p>
              <a :href="invoice.RedirectTargetURL" v-if="isPaid"
                 class="mt-3 text-blue-500 hover:underline inline-flex items-center">
                <span class="mr-2">Click to Redirect</span>
                <icon name="arrow-right" classes="w-5 h-5"></icon>
              </a>
            </div>
            <div v-if="!isPaid && !isExpired">
              <QRCodeVue3 imgclass="mx-auto"
                          :width="qrOptions.width"
                          :height="qrOptions.height"
                          :qr-options="qrOptions.qrOptions"
                          :background-options="qrOptions.backgroundOptions"
                          :dots-options="qrOptions.dotsOptions"
                          :corners-dot-options="qrOptions.cornersDotOptions"
                          :corners-square-options="qrOptions.cornersSquareOptions"
                          :value="qrLink"></QRCodeVue3>
              <div class="mt-4">
                <div v-if="invoice.Tag" class="text-center mb-3">Memo/Tag: {{ invoice.Tag }}</div>
                <div class="flex justify-center flex-wrap items-stretch w-full mb-4 relative">
                  <input type="text" v-model="invoice.coinAddress" readonly
                         class="form-input w-2/3 rounded-r-none"/>
                  <div class="flex -mr-px">
                    <span @click="copyToClipboard(invoice.coinAddress)"
                          class="hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer flex items-center leading-normal rounded rounded-l-none border border-l-0 border-gray-300 dark:border-gray-600 px-3 whitespace-no-wrap text-sm">
                      <icon name="clipboard" classes="w-5 h-5"></icon>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Tab>
          <!-- TZERO -->
          <Tab :name="translate('invoice.tzero')">
            <div class="mb-4">
              <p class="text-3xl font-bold text-blue-500 text-center">{{ timer }}</p>
              <a :href="invoice.RedirectTargetURL" v-if="isPaid"
                 class="mt-3 text-blue-500 hover:underline inline-flex items-center">
                <span class="mr-2">Click to Redirect</span>
                <icon name="arrow-right" classes="w-5 h-5"></icon>
              </a>
            </div>
            <div v-if="!isPaid && !isExpired">
              <QRCodeVue3 imgclass="mx-auto"
                          :width="qrOptions.width"
                          :height="qrOptions.height"
                          :qr-options="qrOptions.qrOptions"
                          :background-options="qrOptions.backgroundOptions"
                          :dots-options="qrOptions.dotsOptions"
                          :corners-dot-options="qrOptions.cornersDotOptions"
                          :corners-square-options="qrOptions.cornersSquareOptions"
                          :value="invoice.TZERO"></QRCodeVue3>
            </div>
          </Tab>
        </TabSet>
        <p class="text-center">{{ `${translate('pos.invoice.amount')}: ${invoice.Amount} ${invoice.LongName}` }}</p>
        <div class="card mt-4" v-if="order.items.length > 0">
          <div class="body">
            <div
              class="scrollbar scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200 dark:scrollbar-track-gray-900 dark:scrollbar-thumb-gray-600">
              <table class="table-sm mb-2">
                <thead>
                <tr>
                  <th>Item</th>
                  <th v-if="Object.keys(order.items[0]).length === 6">SKU</th>
                  <th>Price</th>
                  <th>Quantity</th>
                  <th>Subtotal</th>
                </tr>
                </thead>
                <tbody>
                <tr :key="index" v-for="(item, index) of order.items">
                  <td>
                    <div class="flex items-center">
                      <img v-if="item.url" :src="item.url" alt=""
                           class="w-12 h-12 rounded-full overflow-hidden mr-2 cursor-pointer"
                           @click="fancyBox(item.url)"/>
                      <p>{{ item.name }}</p>
                    </div>
                  </td>
                  <td v-if="Object.keys(order.items[0]).length === 6">{{ item.sku }}</td>
                  <td>{{ formatPrice(item.price, currency) }}</td>
                  <td>{{ 'x ' + item.qty }}</td>
                  <td>{{ formatPrice(item.price * item.qty, currency) }}</td>
                </tr>
                <tr v-if="order.shipping">
                  <td :colspan="Object.keys(order.items[0]).length === 6 ? 4 : 3" class="text-right">
                    {{ translate('invoice.shipping_cost') }}:
                  </td>
                  <td colspan="1">{{ order.shipping.method + ' ' + formatPrice(order.shipping.cost, currency) }}</td>
                </tr>
                <tr v-if="order.coupon">
                  <td :colspan="Object.keys(order.items[0]).length === 6 ? 4 : 3" class="text-right">
                    <span class="text-red-500">{{ translate('invoice.discount') }}:</span>
                  </td>
                  <td colspan="1">
                    <span class="text-red-500">-{{ formatPrice(order.coupon.discount, currency) }}</span>
                  </td>
                </tr>
                <tr>
                  <td :colspan="Object.keys(order.items[0]).length === 6 ? 4 : 3" class="text-right">
                    <span class="font-bold">Total:</span></td>
                  <td colspan="1"><span class="font-bold">{{ cartTotal }}</span></td>
                </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div class="text-center">
          <router-link :to="{name: 'invoice', params: {confirmCode: invoice.Security}}" tag="a"
                       class="btn btn-primary">Invoice Page
          </router-link>
        </div>
      </div>
    </template>
  </centered-layout>
</template>

<script>
import CenteredLayout from '@/components/layouts/CenteredLayout'
import Icon from '@/components/Icon'
import { computed, inject, onBeforeMount, onBeforeUnmount, reactive, toRefs } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { SET_INVOICE } from '@/store/keys'
import TabSet from '@/components/common/TabSet'
import Tab from '@/components/common/Tab'
import QRCodeVue3 from 'qrcode-vue3'
import qrCodeOptions from '@/qrOptions'
import compositionUtils from '@/compositionUtils'
import * as _ from 'lodash'

const moment = require('moment-timezone/builds/moment-timezone-with-data-2012-2022.min')

export default {
  name: 'ShopInvoice',
  components: {
    CenteredLayout,
    TabSet,
    Tab,
    Icon,
    QRCodeVue3
  },
  setup () {
    const translate = inject('translate')
    const http = inject('http')

    const route = useRoute()
    const router = useRouter()
    const store = useStore()

    const { qrOptions } = qrCodeOptions()
    const {
      copyToClipboard,
      formatPrice,
      fancyBox
    } = compositionUtils()

    const state = reactive({
      confirmCode: null,
      invoice: null,
      order: {
        items: [],
        shipping: null,
        coupon: null
      },
      interval: null,
      transactionInterval: null,
      timer: null,
      loader: '',
      socket: null,
      isClosedSocket: false
    })

    // Computed
    const isInvoiceComplete = computed(() => {
      if (state.invoice) {
        return ['paid', 'underpaid', 'complete'].indexOf(state.invoice.Status.toLowerCase()) !== -1
      }
      return false
    })
    const isPaid = computed(() => {
      return (
        state.invoice &&
        (state.invoice.Status.toLowerCase() === 'paid' ||
          state.invoice.Status.toLowerCase() === 'underpaid')
      )
    })
    const isExpired = computed(() => {
      return (
        state.invoice && state.invoice.Status.toLowerCase() === 'expired'
      )
    })
    const qrLink = computed(() => {
      return (
        state.invoice.CoinName.toLowerCase() +
        ':' + state.invoice.coinAddress + '?amount=' + state.invoice.Amount
      )
    })
    const currency = computed(() => {
      return state.invoice ? state.invoice.inputCurrency : 'EUR'
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

    // Methods
    const apiBaseUrl = process.env.VUE_APP_API_URL
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
    const fetchTransaction = (confirmCode, loader = 'main') => {
      state.loader = loader
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
        state.loader = ''
        if (response.status === 200) {
          if (response.data.result !== 'failed') {
            state.invoice = response.data.data
            extractOrderData(state.invoice)
            store.commit(SET_INVOICE, state.invoice)
            const status = state.invoice.Status.toLowerCase()
            if (['paid', 'underpaid', 'expired'].indexOf(status) !== -1) {
              state.timer = state.invoice.Status
              if (state.transactionInterval) {
                clearInterval(state.transactionInterval)
              }
              if (state.interval) {
                clearInterval(state.interval)
                state.timer = status
              }
            }
            if (['waiting', 'awaiting-fiat'].indexOf(status) !== -1) {
              startTimer()
            }
          }
        }
      }).catch(error => {
        state.loader = ''
        console.log(error)
      })
    }
    const fetchInvoiceData = () => {
      if (Object.keys(route.params).length > 0) {
        const confirmCode = route.params.confirmCode
        fetchTransaction(confirmCode)
        if (state.transactionInterval) {
          clearInterval(state.transactionInterval)
        }
        state.transactionInterval = setInterval(() => {
          fetchTransaction(confirmCode, false)
        }, 60000)
      } else {
        router.push({ name: 'shop' })
      }
    }
    // Start timer
    const startTimer = () => {
      if (!state.timer) {
        const date = moment.tz(state.invoice.CreatedOn, 'Europe/Amsterdam')
          .add(Number(state.invoice.ExpiryTime), 'minutes')
        state.interval = setInterval(() => {
          const now = moment().tz('Europe/Amsterdam').valueOf()
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
            fetchTransaction(state.invoice.ConfirmCode, '')
          }
        }, 1000)
      }
    }

    const initSocket = () => {
      state.socket = new WebSocket('wss://wss.cointopay.com/transactions')
      state.socket.onmessage = event => {
        if (event) {
          if (event.data) {
            const parts = event.data.split(':')
            if (state.invoice) {
              const invoiceData = _.cloneDeep(state.invoice)
              if (parts[0] === 'TZERO') {
                if (invoiceData && Number(invoiceData.TransactionID) === Number(parts[1])) {
                  if (state.interval) {
                    clearInterval(state.interval)
                  }
                  invoiceData.Status = parts[2].toLowerCase()
                  store.commit(SET_INVOICE, invoiceData)
                }
              }
            }
          }
        }
      }
      state.socket.onclose = event => {
        if (!state.isClosedSocket) {
          initSocket()
        }
      }
    }

    onBeforeMount(() => {
      fetchInvoiceData()
      initSocket()
    })

    onBeforeUnmount(() => {
      if (state.transactionInterval) {
        clearInterval(state.transactionInterval)
      }
      if (state.interval) {
        clearInterval(state.interval)
      }
      if (state.socket !== null) {
        state.isClosedSocket = true
        state.socket.close()
      }
    })

    return {
      translate,
      ...toRefs(state),
      currency,
      isInvoiceComplete,
      copyToClipboard,
      qrOptions,
      isPaid,
      isExpired,
      qrLink,
      formatPrice,
      cartTotal,
      fancyBox
    }
  }
}
</script>

<style scoped></style>

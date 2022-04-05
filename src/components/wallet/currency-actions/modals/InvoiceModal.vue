<template>
  <modal :maxWidth="maxWidth" :show="show" @close="closeModal()">
    <template #title>
      <div class="flex items-center justify-between">
        {{ translate('invoice.title') }}
        <span class="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 cursor-pointer"
              @click="closeModal()">
          <icon name="close"></icon>
        </span>
      </div>
    </template>
    <template #content>
      <div v-if="invoiceData">
        <p class="text-center font-semibold text-red-500 mb-4">{{ translate('invoice.warning') }}</p>

        <div class="grid grid-cols-3 gap-4">
          <div class="col-span-1">
            <label>{{ translate('invoice.transaction_id') }}</label>
          </div>
          <div class="col-span-2">{{ invoiceData.TransactionID }}</div>
        </div>

        <div class="grid grid-cols-3 gap-4">
          <div class="col-span-1">
            <label>{{ translate('invoice.amount') }}</label>
          </div>
          <div class="col-span-2">
            <div class="flex items-center">
              <span>{{ invoiceData.Amount }} {{ invoiceData.CoinName }}</span>&emsp;
              <img :src="generateIconUrl(invoiceData.CoinName)" alt="" class="w-6 h-6"/>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-3 gap-4">
          <div class="col-span-1">
            <label>{{ translate('invoice.status') }}</label>
          </div>
          <div class="col-span-2">{{ invoiceData.Status }}</div>
        </div>

        <div class="grid grid-cols-3 gap-4 mb-4">
          <div class="col-span-1">
            <label>{{ translate('invoice.reference') }}</label>
          </div>
          <div class="col-span-2">{{ invoiceData.CustomerReferenceNr }}</div>
        </div>

        <TabSet>
          <!-- Address Only -->
          <Tab :name="translate('invoice.address_only')">
            <div class="mb-4 text-center">
              <p class="text-3xl font-bold text-blue-500 text-center">{{ timer }}</p>
              <a :href="invoiceData.RedirectTargetURL" v-if="isPaid"
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
                          :value="invoiceData.coinAddress"></QRCodeVue3>
              <div class="mt-4">
                <div class="flex justify-center flex-wrap items-stretch w-full mb-4 relative">
                  <input type="text" v-model="invoiceData.coinAddress" readonly
                         class="form-input w-2/3 rounded-r-none"/>
                  <div class="flex -mr-px">
                    <span @click="copyToClipboard(invoiceData.coinAddress)"
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
            <div class="mb-4 text-center">
              <p class="text-3xl font-bold text-blue-500 text-center">{{ timer }}</p>
              <a :href="invoiceData.RedirectTargetURL" v-if="isPaid"
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
                <div v-if="invoiceData.Tag" class="text-center mb-3">Memo/Tag: {{ invoiceData.Tag }}</div>
                <div class="flex justify-center flex-wrap items-stretch w-full mb-4 relative">
                  <input type="text" v-model="invoiceData.coinAddress" readonly
                         class="form-input w-2/3 rounded-r-none"/>
                  <div class="flex -mr-px">
                    <span @click="copyToClipboard(invoiceData.coinAddress)"
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
            <div class="mb-4 text-center">
              <p class="text-3xl font-bold text-blue-500 text-center">{{ timer }}</p>
              <a :href="invoiceData.RedirectTargetURL" v-if="isPaid"
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
                          :value="invoiceData.TZERO"></QRCodeVue3>
            </div>
          </Tab>
        </TabSet>

        <div class="text-center">
          <router-link :to="{name: 'invoice', params: {confirmCode: invoiceData.Security}}" tag="a"
                       class="btn btn-primary">Invoice Page
          </router-link>
        </div>

      </div>
    </template>
  </modal>
</template>

<script>
import Modal from '@/components/Modal'
import Icon from '@/components/Icon'
import TabSet from '@/components/common/TabSet'
import Tab from '@/components/common/Tab'
import QRCodeVue3 from 'qrcode-vue3'
import qrCodeOptions from '@/qrOptions'
import compositionUtils from '@/compositionUtils'
import { computed, inject, onBeforeMount, onBeforeUnmount, reactive, toRefs } from 'vue'
import { useStore } from 'vuex'

export default {
  name: 'InvoiceModal',
  components: {
    Modal,
    Icon,
    TabSet,
    Tab,
    QRCodeVue3
  },
  setup () {
    const { qrOptions } = qrCodeOptions()
    const {
      generateIconUrl,
      copyToClipboard
    } = compositionUtils()
    // Providers
    const translate = inject('translate')
    const http = inject('http')
    const emitter = inject('emitter')
    // Store
    const store = useStore()
    // State
    const state = reactive({
      show: false,
      maxWidth: '2xl',
      closeable: true,
      invoiceData: null,
      interval: null,
      timer: null,
      balanceSocket: null,
      isClosedBalanceSocket: false
    })
    // Computed
    const user = computed(() => store.state.user)
    const isPaid = computed(() => {
      return (
        state.invoiceData &&
        (state.invoiceData.Status.toLowerCase() === 'paid' ||
          state.invoiceData.Status.toLowerCase() === 'underpaid')
      )
    })
    const isExpired = computed(() => {
      return (
        state.invoiceData && state.invoiceData.Status.toLowerCase() === 'expired'
      )
    })
    const qrLink = computed(() => {
      return (
        state.invoiceData.CoinName.toLowerCase() +
        ':' + state.invoiceData.coinAddress + '?amount=' + state.invoiceData.Amount
      )
    })
    // Methods
    const closeModal = () => {
      state.show = false
      if (state.interval) {
        clearInterval(state.interval)
        state.timer = null
      }
    }
    const apiBaseUrl = process.env.VUE_APP_API_URL
    const fetchTransaction = (confirmCode) => {
      const payload = {
        Call: 'Transactiondetail',
        MerchantID: 1,
        APIKey: '_',
        ConfirmCode: confirmCode,
        output: 'json'
      }
      http.get(`${apiBaseUrl}/v2REAPI`, {
        params: payload
      }).then(response => {
        if (response.status === 200) {
          if (response.data.result !== 'failed') {
            state.invoiceData = response.data.data
            const status = state.invoiceData.Status.toLowerCase()
            if (['paid', 'underpaid', 'expired'].indexOf(status) !== -1) {
              if (state.interval) {
                clearInterval(state.interval)
                state.timer = status
              }
            }
            if (['waiting', 'awaiting-fiat'].indexOf(status) !== -1) {
              if (state.interval) {
                clearInterval(state.interval)
                state.timer = null
              }
              startTimer(state.invoiceData.ExpiryTime)
            }
          }
        }
      }).catch(error => {
        state.loader = ''
        console.log(error)
      })
    }

    // Start timer
    const startTimer = (time) => {
      const date = new Date()
      date.setMinutes(date.getMinutes() + time)
      state.interval = setInterval(() => {
        const now = new Date().getTime()
        const diff = date.getTime() - now

        // Time calculations for days, hours, minutes and seconds
        const days = Math.floor(diff / (1000 * 60 * 60 * 24))
        const hours = Math.floor(
          (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        )
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((diff % (1000 * 60)) / 1000)
        state.timer = `${days}d ${hours}h ${minutes}m ${seconds}s`
        if (diff < 0) {
          clearInterval(this.interval)
          state.timer = 'Expired'
        }
      }, 1000)
    }

    // Balance notifications socket
    const initBalanceSocket = () => {
      state.balanceSocket = new WebSocket('wss://wss.cointopay.com/balance')
      state.balanceSocket.onmessage = function (event) {
        if (event) {
          if (event.data) {
            const parts = event.data.split(':')
            if (parts.length >= 4 && state.invoiceData) {
              if (parts[0] === user.value.ID && parts[1] === state.invoiceData.TransactionID.toString() &&
                parts[2].toLowerCase() === 'paid') {
                console.log(parts)
                setTimeout(() => {
                  fetchTransaction(state.invoiceData.Security)
                }, 4000)
              }
            }
          }
        }
      }
      state.balanceSocket.onclose = function (event) {
        if (!state.isClosedBalanceSocket) {
          initBalanceSocket()
        }
      }
    }

    onBeforeMount(() => {
      emitter.on('invoiceModal', (args) => {
        state.invoiceData = args.invoiceData
        if (!args.isScheduledID) {
          if (state.interval) {
            clearInterval(state.interval)
          }
          startTimer(state.invoiceData.ExpiryTime)
        }
        initBalanceSocket()
        // Show modal
        state.show = true
      })
    })

    onBeforeUnmount(() => {
      if (state.interval) {
        clearInterval(state.interval)
        state.timer = null
      }
      if (state.balanceSocket !== null) {
        state.isClosedBalanceSocket = true
        state.balanceSocket.close()
      }
    })

    return {
      translate,
      qrOptions,
      ...toRefs(state),
      isPaid,
      isExpired,
      qrLink,
      closeModal,
      startTimer,
      generateIconUrl,
      copyToClipboard
    }
  }
}
</script>

<style scoped></style>

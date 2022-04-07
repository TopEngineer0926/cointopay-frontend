<template>
  <centered-layout>
    <div class="grid grid-cols-3 gap-0 md:gap-4">
      <div v-if="!loader && !invoice" class="col-span-3">
        <img alt="" src="https://s3-eu-west-1.amazonaws.com/cointopay/pics/wojak.png" class="mx-auto" style="max-width: 100%"/>
      </div>
      <div class="col-span-3 md:col-span-2">
        <template v-if="loader !== 'main' && invoice">
          <div
            class="text-sm md:text-base whitespace-nowrap mb-4 md:mb-0 scrollbar scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200 dark:scrollbar-track-gray-900 dark:scrollbar-thumb-gray-600">
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center">
                    <div v-if="isSimpleView">
                      <h2 class="font-semibold text-xl">{{ `${translate('invoice.invoice')} #${invoice.TransactionID}` }}</h2>
                    </div>
                    <div v-else>
                      <h2 class="font-semibold text-xl"> {{ invoice.CoinName.toUpperCase() }}</h2> <img :src="generateIconUrl(invoice.CoinName)" alt="Image of {{ `${invoice.LongName} ` }} currency" class="w-fit h-fit ml-fit"/>
                    </div>
              </div>
              <span class="cursor-pointer hover:text-blue-500" @click="isShowUrl = !isShowUrl">
                <icon name="qr-code"></icon>
              </span>
            </div>
            <div class="mb-4">
              <div class="grid grid-cols-5 gap-0.5 md:gap-4">
                <div class="col-span-5 md:col-span-2">{{ translate('invoice.merchant') }}</div>
                <div class="col-span-5 md:col-span-3 font-semibold">{{ invoice.ShopTitle }}</div>
              </div>
              <div class="grid grid-cols-5 gap-0.5 md:gap-4">
                <div class="col-span-5 md:col-span-2">{{ translate('invoice.amount') }}</div>
                <div class="col-span-5 md:col-span-3 font-semibold">
                  <div class="flex items-center">
                    <div v-if="isSimpleView">
                      {{ `${invoice.Amount} ${invoice.LongName}` }}
                    </div>
                    <div v-else>
                      {{ `${invoice.Amount} ${invoice.LongName} ` }}
                      <span class="inline-block mx-2">-</span>
                      {{ ` ${invoice.OriginalAmount} ${inputCurrency}` }}
                    </div>
                    <j-button
                      v-tippy="'Please pay the missing amount, once confirmed, click the recheck balance button. Thanks.'"
                      v-if="!isWaiting && invoice.Reopenable === 1 && invoice.NotEnough === 1"
                      :disabled="loader === 'reOpenInvoice'" class="ml-3" @click="reOpenInvoice()">
                      <div v-if="loader === 'reOpenInvoice'" class="mr-3">
                        <icon :name="'spinner'" classes="w-4 h-4 text-white"></icon>
                      </div>
                      <span>Recheck balance</span>
                    </j-button>
                  </div>
                </div>
              </div>
              <div v-if="invoice.Status.toLowerCase() === 'underpaid'"
                   class="text-red-500 grid grid-cols-5 gap-0.5 md:gap-4">
                <div class="col-span-5 md:col-span-2">Missing amount</div>
                <div class="col-span-5 md:col-span-3 font-semibold">
                  {{ `${toFixed(invoice.InitialAmount - invoice.Amount)} ${inputCurrency}` }}
                </div>
              </div>
              <template v-if="!isSimpleView" class="transform transition-transform">
                <div class="grid grid-cols-5 gap-0.5 md:gap-4">
                  <div class="col-span-5 md:col-span-2">{{ translate('invoice.fee') }}</div>
                  <div class="col-span-5 md:col-span-3 font-semibold">
                    <div class="flex items-center">
                      <span>Service % + Fixed {{ invoice.MinerFee }} {{ invoice.LongName }}</span>
                      <a class="ml-3" :href="termsLink" target="_blank">
                        <icon name="question-mark" classes="w-5 h-5 text-yellow-500 dark:text-yellow-400"></icon>
                      </a>
                    </div>
                  </div>
                </div>
                <div class="grid grid-cols-5 gap-0.5 md:gap-4">
                  <div class="col-span-5 md:col-span-2">Master Transaction ID</div>
                  <div class="col-span-5 md:col-span-3 font-semibold">{{ invoice.MasterTransactionID }}</div>
                </div>
                <div class="grid grid-cols-5 gap-0.5 md:gap-4">
                  <div class="col-span-5 md:col-span-2">{{ translate('invoice.transaction_id') }}</div>
                  <div class="col-span-5 md:col-span-3 font-semibold">{{ invoice.TransactionID }}</div>
                </div>
                <div class="grid grid-cols-5 gap-0.5 md:gap-4">
                  <div class="col-span-5 md:col-span-2">{{ translate('invoice.status') }}</div>
                  <div class="col-span-5 md:col-span-3 font-semibold">{{ invoice.Status }}</div>
                </div>
              </template>
              <div class="grid grid-cols-5 gap-0.5 md:gap-4">
                <div class="col-span-5 md:col-span-2">{{ translate('invoice.reference') }}</div>
                <div class="col-span-5 md:col-span-3 font-semibold">
                  <div class="break-all whitespace-normal" v-html="invoice.CustomerReferenceNr"></div>
                </div>
              </div>
              <template v-if="!isSimpleView">
                <div v-if="reOpenable" class="grid grid-cols-5 gap-0.5 md:gap-4">
                  <div class="col-span-5 md:col-span-2">{{ translate('invoice.address') }}</div>
                  <div class="col-span-5 md:col-span-3 font-semibold">{{ invoice.coinAddress }}</div>
                </div>
                <div class="grid grid-cols-5 gap-0.5 md:gap-4">
                  <div class="col-span-5 md:col-span-2">{{ translate('invoice.created_on') }}</div>
                  <div class="col-span-5 md:col-span-3 font-semibold">{{ formatDT(invoice.CreatedOn) }}</div>
                </div>
              </template>
              <div class="mt-4 flex items-center justify-center">
                <span @click="isSimpleView = !isSimpleView"
                      class="cursor-pointer mx-auto inline-block transform transition-transform"
                      :class="{'rotate-180': !isSimpleView}">
                  <icon name="chevron-double" classes="w-5 h-5"></icon>
                </span>
              </div>
            </div>
          </div>

          <TabSet>
            <!-- Crypto -->
            <Tab v-if="isPaymentMethodAvailable('crypto')" :name="translate('invoice.crypto')"
                 :selected="isFiat === null || isFiat === 0 || isOnlyPaymentMethod('crypto')">
              <div class="text-center">
                <div class="mb-4">
                  <div class="flex items-center justify-center">
                    <status-icon :invoice="invoice"></status-icon>
                    <p class="text-2xl font-bold text-blue-500 text-center capitalize">
                      {{ timer }}
                    </p>
                  </div>
                  <a :href="invoice.RedirectTargetURL" v-if="isPaid || isExpired"
                     class="mt-2 text-blue-500 hover:underline inline-flex items-center">
                    <span class="mr-2">Click to Redirect</span>
                    <icon name="arrow-right" classes="w-5 h-5"></icon>
                  </a>
                </div>
                <div v-if="!isPaid && !isExpired">
                  <QRCodeVue3 imgclass="mx-auto"
                    :width="qrOptions.width"
                    :height="qrOptions.height"
                      image="data:image/png;base64,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"
                    :qr-options="qrOptions.qrOptions"
                    :background-options="qrOptions.backgroundOptions"
                    :dots-options="qrOptions.dotsOptions"
                    :corners-dot-options="qrOptions.cornersDotOptions"
                    :corners-square-options="qrOptions.cornersSquareOptions"
                    :value="isCryptoLink ? invoice.CoinName.toLowerCase() + ':' + invoice.coinAddress + '?amount=' + invoice.Amount : invoice.coinAddress">
                  </QRCodeVue3>
                </div>
                <div v-if="invoice.Tag" class="flex items-center justify-center mt-3">
                  <span class="cursor-pointer text-red-500 mr-4 animate-pulse"
                        v-tippy="'Please use this Memo/Tag otherwise you might risk losing your funds.'">
                    <icon name="exclamation-circle"></icon>
                  </span>
                  <span>Memo/Tag: {{ invoice.Tag }}</span>
                </div>
                <div v-if="invoice.coinAddress !== 'none'" class="mt-4">
                  <div class="flex flex-wrap justify-center items-stretch w-full mb-4 relative">
                    <input type="text" v-model="invoice.coinAddress" readonly
                           class="form-input flex-1 md:flex-none md:w-2/3 rounded-r-none"/>
                    <div class="flex -mr-px">
                      <span @click="copyToClipboard(decodeURIComponent(invoice.coinAddress))"
                            class="hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer flex items-center leading-normal rounded rounded-l-none border border-l-0 border-gray-300 dark:border-gray-600 px-3 whitespace-no-wrap text-sm">
                        <icon name="clipboard" classes="w-5 h-5"></icon>
                      </span>
                    </div>
                  </div>
                </div>
                <div class="flex items-center justify-center" v-if="!isPaid && !isExpired">
                  <j-button class="mr-3" @click="isCryptoLink = !isCryptoLink">
                    {{ isCryptoLink ? translate('invoice.full_crypto_link') : translate('invoice.address_only') }}
                  </j-button>
                  <j-button v-tippy="'Refresh'" :disabled="!isRefreshable" @click="refreshTransaction()">
                    <icon name="refresh" classes="w-4 h-4"></icon>
                  </j-button>
                </div>
                <a v-if="isExpired" class="text-blue-500 hover:underline"
                   :href="renewTransaction()">Pay anyway? Click here</a>
                <!-- Refund Invoice -->
                <refund-invoice :invoice="invoice"></refund-invoice>
              </div>
            </Tab>
            <!-- Instant -->
            <Tab v-if="isPaymentMethodAvailable('instant')"
                 :name="translate('invoice.tzero')" :selected="isOnlyPaymentMethod('instant')">
              <div class="text-center">
                <div class="mb-4">
                  <div class="flex items-center justify-center">
                    <status-icon :invoice="invoice"></status-icon>
                    <p class="text-2xl font-bold text-blue-500 text-center capitalize">
                      {{ timer }}</p>
                  </div>
                  <a :href="invoice.RedirectTargetURL" v-if="isPaid || isExpired"
                     class="mt-2 text-blue-500 hover:underline inline-flex items-center">
                    <span class="mr-2">Click to Redirect</span>
                    <icon name="arrow-right" classes="w-5 h-5"></icon>
                  </a>
                </div>
                <div class="mb-3" v-if="!isPaid && !isExpired">
                  <QRCodeVue3 imgclass="mx-auto"
                    :width="qrOptions.width"
                    :height="qrOptions.height"
                    image="data:image/png;base64,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"

                    :qr-options="qrOptions.qrOptions"
                    :background-options="qrOptions.backgroundOptions"
                    :dots-options="qrOptions.dotsOptions"
                    :corners-dot-options="qrOptions.cornersDotOptions"
                    :corners-square-options="qrOptions.cornersSquareOptions"
                    :value="invoice.TZERO">
                  </QRCodeVue3>
                </div>
                <a v-if="isExpired" class="text-blue-500 hover:underline"
                   :href="renewTransaction()">Pay anyway? Click here</a>
                <span v-if="isLoggedIn && isWaiting" class="mx-auto inline-block cursor-pointer" @click="payViaTZERO()">
                  <img class="h-16" src='https://s3-eu-west-1.amazonaws.com/cointopay/img/cointopay_checkout.png'
                       alt=""/>
                </span>
              </div>
            </Tab>
            <!-- Fiat -->
            <Tab v-if="isPaymentMethodAvailable('fiat', isFiat)" :name="translate('invoice.fiat')"
                 :selected="isFiat === 1 || isOnlyPaymentMethod('fiat')">
              <div class="text-center">
                <div class="mb-4">
                  <div class="flex items-center justify-center">
                    <status-icon :invoice="invoice"></status-icon>
                    <p class="text-2xl font-bold text-blue-500 text-center capitalize">
                      {{ timer }}</p>
                  </div>
                  <a :href="invoice.RedirectTargetURL" v-if="isPaid || isExpired"
                     class="mt-2 text-blue-500 hover:underline inline-flex items-center">
                    <span class="mr-2">Click to Redirect</span>
                    <icon name="arrow-right" classes="w-5 h-5"></icon>
                  </a>
                </div>
                <div v-if="!isPaid && !isExpired && invoice.PaymentDetail">
                  <div class="content-center" v-html="invoice.PaymentDetail"></div>
                </div>
                <a v-if="isExpired" class="text-blue-500 hover:underline"
                   :href="renewTransaction()">Pay anyway? Click here</a>
              </div>
            </Tab>
          </TabSet>
          <!-- Forward Invoice -->
          <forward-invoice :invoice="invoice"></forward-invoice>
          <div class="grid grid-cols-2 gap-0 md:gap-4">
            <div class="col-span-2 md:col-span-1">
              <!-- Pay with different currency -->
              <div class="card"
                   v-if="isActive && invoice.inputCurrency && invoice.LTR === 0 && (isFiat === null || isFiat === 0)">
                <div class="text-center body">
                  <j-button @click="launchPayWithOtherCurrencyModal()">
                    {{ translate('invoice.pay_with_different_currency') }}
                  </j-button>
                </div>
              </div>
            </div>
            <div class="col-span-2 md:col-span-1">
              <div v-if="isWaiting" class="card">
                <div class="body text-center">
                  <a :href="generateCancelLink" class="btn btn-warning">Cancel</a>
                </div>
              </div>
            </div>
          </div>
        </template>
        <template v-if="loader === 'main'">
          <pulse-skeleton></pulse-skeleton>
          <pulse-skeleton></pulse-skeleton>
        </template>
      </div>

      <div class="col-span-3 md:col-span-1" v-show="isShowUrl">
        <template v-if="loader !== 'main'">
          <div class="card">
            <div class="title">
              <div class="flex items-center justify-between">
                <h5>{{ translate('invoice.invoice_url') }}</h5>
                <span @click="isShowUrl = false" class="cursor-pointer">
                  <icon name="close"></icon>
                </span>
              </div>
            </div>
            <hr class="border-gray-300 dark:border-gray-600"/>
            <div class="body">
              <div class="mb-4 flex items-center justify-between flex-col">
                <QRCodeVue3 imgclass="mb-3"
                  :width="qrOptions.width"
                  :height="qrOptions.height"
                  image="data:image/png;base64,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"
                  :qr-options="qrOptions.qrOptions"
                  :background-options="qrOptions.backgroundOptions"
                  :dots-options="qrOptions.dotsOptions"
                  :corners-dot-options="qrOptions.cornersDotOptions"
                  :corners-square-options="qrOptions.cornersSquareOptions"
                  :value="invoiceUrl">
                </QRCodeVue3>
                <div class="flex flex-wrap items-stretch w-full mb-4 relative">
                  <input type="text" v-model="invoiceUrl" readonly class="form-input flex-1 rounded-r-none"/>
                  <div class="flex -mr-px">
                    <span @click="copyToClipboard(invoiceUrl)"
                          class="hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer flex items-center leading-normal rounded rounded-l-none border border-l-0 border-gray-300 dark:border-gray-600 px-3 whitespace-no-wrap text-sm">
                      <icon name="clipboard" classes="w-5 h-5"></icon>
                    </span>
                  </div>
                </div>
                <p class="text-center text-red-500">{{ translate('invoice.warning') }}</p>
              </div>
            </div>
          </div>
        </template>
        <template v-if="loader === 'main'">
          <pulse-skeleton></pulse-skeleton>
          <pulse-skeleton></pulse-skeleton>
        </template>
      </div>
    </div>
  </centered-layout>
  <!-- Pay with different currency modal -->
  <pay-with-different-currency-modal></pay-with-different-currency-modal>
  <!-- Payment notification modal -->
  <payment-notification-modal></payment-notification-modal>
  <!-- Redirect Timer Modal -->
  <redirect-timer-modal></redirect-timer-modal>
</template>

<script>
import CenteredLayout from '@/components/layouts/CenteredLayout'
import QRCodeVue3 from 'qrcode-vue3'
import JButton from '@/templates/Button'
import TabSet from '@/components/common/TabSet'
import Tab from '@/components/common/Tab'
import PulseSkeleton from '@/components/PulseSkeleton'
import ForwardInvoice from '@/components/invoice/ForwardInvoice'
import RefundInvoice from '@/components/invoice/RefundInvoice'
import PayWithDifferentCurrencyModal from '@/components/invoice/modals/PayWithDifferentCurrencyModal'
import PaymentNotificationModal from '@/components/invoice/modals/PaymentNotificationModal'
import RedirectTimerModal from '@/components/invoice/modals/RedirectTimerModal'
import Icon from '@/components/Icon'
import StatusIcon from '@/components/invoice/StatusIcon'
import { computed, inject, onBeforeMount, onBeforeUnmount, reactive, toRefs } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { FETCH_TRANSLATIONS, SET_LOCALE } from '@/store/keys'
import compositionUtils from '@/compositionUtils'
import qrCodeOptions from '@/qrOptions'
import * as _ from 'lodash'

const moment = require('moment-timezone/builds/moment-timezone-with-data-2012-2022.min')

export default {
  name: 'Invoice',
  components: {
    CenteredLayout,
    QRCodeVue3,
    PulseSkeleton,
    JButton,
    TabSet,
    Tab,
    Icon,
    ForwardInvoice,
    RefundInvoice,
    PayWithDifferentCurrencyModal,
    PaymentNotificationModal,
    RedirectTimerModal,
    StatusIcon
  },
  setup () {
    // Providers
    const translate = inject('translate')
    const http = inject('http')
    const toast = inject('toast')
    const swal = inject('swal')
    const emitter = inject('emitter')

    const route = useRoute()
    const router = useRouter()
    const store = useStore()

    const {
      generateIconUrl,
      copyToClipboard,
      formatDT,
      saveNotification,
      toFixed
    } = compositionUtils()
    const { qrOptions } = qrCodeOptions()
    const apiBaseUrl = process.env.VUE_APP_API_URL

    // State
    const state = reactive({
      lang: 'en',
      isFiat: null,
      coins: [],
      termsLink: window.location.protocol + '//' + window.location.host + '/terms',
      loader: '',
      timer: null,
      interval: null,
      transactionInterval: null,
      showRedirectTimer: false,
      invoice: null,
      invoiceUrl: window.location.href,
      isSimpleView: true,
      isCryptoLink: true,
      isRefreshable: false,
      transactionSocket: null,
      isClosedTransactionsSocket: false,
      balanceSocket: null,
      isClosedBalanceSocket: false,
      isShowUrl: false
    })

    // Computed
    const inputCurrency = computed(() => {
      let inputCurrency = ''
      if (state.invoice) {
        inputCurrency = state.invoice.inputCurrency
        const coin = _.find(store.state.altCoins, { ShorName: inputCurrency })
        if (coin) {
          inputCurrency = coin.LongName
        }
      }
      return inputCurrency
    })
    const altCoin = computed(() => {
      return _.find(store.state.altCoins, {
        ID: state.invoice.AltCoinID
      })
    })
    const isWaiting = computed(() => {
      return state.invoice && state.invoice.Status.toLowerCase() === 'waiting'
    })
    const isPaid = computed(() => {
      return state.invoice && ['paid', 'underpaid'].indexOf(state.invoice.Status.toLowerCase()) !== -1
    })
    const isExpired = computed(() => {
      return state.invoice && state.invoice.Status.toLowerCase() === 'expired'
    })
    const isActive = computed(() => {
      return state.invoice && ['waiting', 'awaiting-fiat'].indexOf(state.invoice.Status.toLowerCase()) !== -1
    })
    const reOpenable = computed(() => {
      return state.invoice && state.invoice.Status.toLowerCase() === 'underpaid' &&
        state.invoice.Reopenable.toString() === '1'
    })
    const generateCancelLink = computed(() => {
      return `${apiBaseUrl}/MerchantAPI?Confirm=true&CustomerReferenceNr=${state.invoice.CustomerReferenceNr}&TransactionID=${state.invoice.TransactionID}&MerchantID=${state.invoice.MerchantID}&coinAddress=${state.invoice.coinAddress}&AltCoinID=${state.invoice.AltCoinID}`
    })
    const theme = computed(() => store.state.mode)
    const user = computed(() => store.state.user)
    const isLoggedIn = computed(() => store.state.isLoggedIn)

    // Methods
    const fetchTransaction = (confirmCode, loader = 'main') => {
      state.loader = loader
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
        state.loader = ''
        if (response.status === 200) {
          if (response.data.result !== 'failed') {
            state.invoice = response.data.data
            const status = state.invoice.Status.toLowerCase()
            state.isFiat = state.invoice.Buy === 1 || (state.isFiat === 1 ? 1 : 0)
            if (['paid', 'underpaid', 'expired'].indexOf(status) !== -1) {
              state.timer = state.invoice.Status
              if (state.transactionInterval) {
                clearInterval(state.transactionInterval)
              }
              if (state.interval) {
                clearInterval(state.interval)
                state.timer = status
              }
              if (status === 'paid' && state.showRedirectTimer) {
                emitter.emit('paymentNotificationModal', {
                  close: true
                })
                emitter.emit('redirectTimerModal', {
                  invoice: state.invoice
                })
              }
            }
            if (['waiting', 'awaiting-fiat'].indexOf(status) !== -1) {
              startTimer()
            }
            if (loader === 'main') {
              fetchEnabledCoins(state.invoice.MerchantID)
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
        router.push('/')
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
    // Fetch enabled coins
    const fetchEnabledCoins = (merchantID) => {
      const payload = {
        MerchantID: merchantID,
        output: 'json',
        JsonArray: ''
      }
      http.get(`${apiBaseUrl}/CloneMasterTransaction`, {
        params: payload
      }).then(response => {
        state.coins = response.data
      }).catch(error => {
        console.log(error)
      })
    }
    // Refresh Transaction
    const refreshTransaction = () => {
      if (!state.isRefreshable) {
        return
      }
      state.isRefreshable = false
      http.get(`${apiBaseUrl}/v2REAPI`, {
        params: {
          Call: 'txcheckcall',
          MerchantID: state.invoice.MerchantID,
          APIKey: '_',
          AltCoinID: state.invoice.AltCoinID,
          TransactionID: state.invoice.TransactionID,
          coinAddress: state.invoice.coinAddress,
          output: 'json'
        }
      }).then(response => {
        setTimeout(() => {
          state.isRefreshable = true
        }, 60000)
        if (response.data && response.data.message) {
          toast.success(response.data.message)
        }
      }).catch(error => {
        console.log(error)
      })
    }
    // Renew Transaction
    const renewTransaction = () => {
      let url = `https://cointopay.com/MerchantAPI?Checkout=true&MerchantID=${state.invoice.MerchantID}&Amount=${state.invoice.OriginalAmount}&AltCoinID=${state.invoice.AltCoinID}&CustomerReferenceNr=${state.invoice.CustomerReferenceNr}&SecurityCode=${state.invoice.SecurityCode}&inputCurrency=${state.invoice.inputCurrency}`
      if (state.invoice.ConfirmURL) {
        url += `&transactionconfirmurl=${state.invoice.ConfirmURL}`
      }
      if (state.invoice.FailURL) {
        url += `&transactionfailurl=${state.invoice.FailURL}`
      }
      return url
    }
    // Reopen Invoice -- Transaction
    const reOpenInvoice = () => {
      state.loader = 'reOpenInvoice'
      http.get(`${apiBaseUrl}/v2REAPI`, {
        params: {
          Call: 'ReopenNotEnough',
          MerchantID: state.invoice.MerchantID,
          APIKey: '_',
          ConfirmCode: state.invoice.Security,
          output: 'json'
        }
      }).then(response => {
        state.loader = ''
        if (response.data.status_code === 200) {
          toast.success('Transaction scheduled for re-validation')
          saveNotification('Transaction scheduled for re-validation')
          fetchTransaction(state.invoice.Security, '')
        } else {
          toast.error(response.data.message)
          saveNotification(response.data.message)
        }
      }).catch(error => {
        state.loader = ''
        console.log(error)
      })
    }
    // Check payment options
    const isOnlyPaymentMethod = (option) => {
      const methods = state.invoice.PaymentOptions.split(',').filter(Boolean)
      if (methods.length === 1 && state.isFiat !== 1) {
        return methods.indexOf(option) !== -1
      } else {
        return methods.indexOf('crypto') === -1 ? option === 'instant' : false
      }
    }
    // Check if payment method is available
    const isPaymentMethodAvailable = (method, isFiat) => {
      const methods = state.invoice.PaymentOptions.split(',').filter(Boolean)
      return methods.indexOf(method) !== -1 || isFiat === 1
    }
    // Launch pay with different currency modal
    const launchPayWithOtherCurrencyModal = () => {
      emitter.emit('payWithDifferentCurrencyModal', {
        coins: state.coins,
        invoice: state.invoice
      })
    }
    const payViaTZERO = () => {
      swal.fire({
        title: 'Pay Invoice',
        text: 'Do you want to pay this invoice?',
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
          http.get(`${apiBaseUrl}/TminusZeroPaymentProcessor`, {
            params: {
              MerchantID: state.invoice.MerchantID,
              AltCoinID: state.invoice.AltCoinID,
              TransactionID: state.invoice.TransactionID,
              CustomerReferenceNr: state.invoice.CustomerReferenceNr,
              coinAddress: state.invoice.coinAddress,
              apikey: user.value.APIKey,
              output: 'json'
            }
          }).then(response => {
            if (response.status === 200) {
              toast.success(response.data)
              saveNotification(response.data)
            }
          }).catch(error => {
            if (error.data) {
              toast.error(error.data)
            }
          })
        }
      })
    }
    // Balance notifications socket
    const initBalanceSocket = () => {
      state.balanceSocket = new WebSocket('wss://wss.cointopay.com/balance')
      state.balanceSocket.onmessage = function (event) {
        if (event && event.data) {
          const parts = event.data.split(':')
          if (parts.length >= 4 && state.invoice) {
            if (state.invoice.TransactionID.toString() === parts[1].toString()) {
              if (Object.keys(route.params).length > 0) {
                const confirmCode = route.params.confirmCode
                setTimeout(() => {
                  fetchTransaction(confirmCode, '')
                }, 2000)
                if (parts[2].toLowerCase() === 'paid') {
                  state.showRedirectTimer = true
                }
              }
            }
          } else if (parts.length === 3 && state.invoice) {
            if (state.invoice.TransactionID.toString() === parts[1].toString()) {
              setTimeout(() => {
                fetchTransaction(state.invoice.Security, '')
              }, 2000)
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
    // Transaction notifications socket
    const initTransactionSocket = () => {
      state.transactionSocket = new WebSocket('wss://wss.cointopay.com/transactions')
      state.transactionSocket.onmessage = function (event) {
        if (event && event.data) {
          const data = event.data
          const parts = data.split(':')
          if (parts.length >= 4 && state.invoice) {
            if (state.invoice.TransactionID.toString() === parts[1].toString()) {
              setTimeout(() => {
                fetchTransaction(state.invoice.Security, '')
              }, 2000)
              if (parts[0].toLowerCase() === 'blockchain' && window.localStorage.getItem(parts[1]) === null) {
                window.localStorage.setItem(parts[1], 'true')
                const isFullPayment = parts[3].toLowerCase() === 'confirming'
                const amount = !isFullPayment ? toFixed(Number.parseFloat(state.invoice.Amount) - Number.parseFloat(parts[2])) : 0
                emitter.emit('paymentNotificationModal', {
                  invoice: state.invoice,
                  isFullPayment,
                  amount
                })
              }
            }
          } else if (parts.length === 3 && state.invoice) {
            if (state.invoice.TransactionID.toString() === parts[1].toString()) {
              setTimeout(() => {
                fetchTransaction(state.invoice.Security, '')
              }, 2000)
            }
          }
        }
      }
      state.transactionSocket.onclose = function (event) {
        if (!state.isClosedTransactionsSocket) {
          initTransactionSocket()
        }
      }
    }

    onBeforeMount(() => {
      state.isRefreshable = true
      if (Object.keys(route.query).length > 0) {
        if (typeof route.query.lang !== 'undefined') {
          state.lang = route.query.lang
          // Change language
          store.commit(SET_LOCALE, state.lang.toUpperCase())
          store.dispatch(FETCH_TRANSLATIONS)
        }
        if (typeof route.query.fiat !== 'undefined') {
          state.isFiat = Number(route.query.fiat)
        }
        if (route.query.t === true) {
          this.isNotice = true
        }
      }
      // Fetch Invoice Data
      fetchInvoiceData()
      // Init Transaction Socket
      initTransactionSocket()
      // Init Balance Socket
      initBalanceSocket()
    })

    onBeforeUnmount(() => {
      if (state.transactionInterval) {
        clearInterval(state.transactionInterval)
      }
      if (state.interval) {
        clearInterval(state.interval)
      }
      // Destroy Sockets
      if (state.balanceSocket !== null) {
        state.isClosedBalanceSocket = true
        state.balanceSocket.close()
      }
      if (state.transactionSocket !== null) {
        state.isClosedTransactionsSocket = true
        state.transactionSocket.close()
      }
    })

    return {
      translate,
      ...toRefs(state),
      isLoggedIn,
      generateIconUrl,
      qrOptions,
      copyToClipboard,
      formatDT,
      toFixed,
      theme,
      inputCurrency,
      altCoin,
      isWaiting,
      isPaid,
      isExpired,
      isActive,
      reOpenable,
      generateCancelLink,
      refreshTransaction,
      renewTransaction,
      reOpenInvoice,
      isOnlyPaymentMethod,
      isPaymentMethodAvailable,
      launchPayWithOtherCurrencyModal,
      payViaTZERO
    }
  }
}
</script>

<style scoped lang="scss">
.content-center {
  :deep(a) {
    @apply block;
    img {
      @apply mx-auto;
    }
  }
}
</style>

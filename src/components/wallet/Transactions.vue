<template>
  <div class="card">
    <div class="flex items-center justify-between">
      <h5 class="title">{{ translate('dashboard.transactions') }}</h5>
      <span class="text-gray-700 dark:text-gray-400 mr-4"
            @click="isExpanded = !isExpanded">
        <icon v-if="!isExpanded" name="expand" classes="w-5 h-5"></icon>
        <icon v-if="isExpanded" name="collapse" classes="w-5 h-5"></icon>
      </span>
    </div>
    <hr v-if="isExpanded" class="border-gray-300 dark:border-gray-600"/>
    <div class="body relative" v-if="isExpanded">
      <template v-if="!isProcessing && !isRefreshing">
        <div class="grid grid-cols-5 gap-1 md:gap-4 mb-3">
          <div class="col-span-5 lg:col-span-3 mb-3 lg:mb-0">
            <div class="relative">
              <icon classes="absolute w-5 h-5 top-3 left-3 dark:text-gray-300" name="search"></icon>
              <input v-model="keyword" aria-label="Search" class="form-input px-10 w-full" type="text"/>
              <span v-show="keyword !== ''" class="absolute top-3 right-3" @click="keyword = ''">
                <icon classes="w-5 h-5 dark:text-gray-300" name="close"></icon>
              </span>
            </div>
          </div>
          <div class="col-span-5 lg:col-span-2">
            <statuses-dropdown @statuses="updateStatusFilter"></statuses-dropdown>
          </div>
        </div>
        <div
          class="scrollbar scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200 dark:scrollbar-track-gray-900 dark:scrollbar-thumb-gray-600">
          <table class="table-sm mb-2">
            <thead>
            <tr>
              <th>&nbsp;</th>
              <th>ID</th>
              <th>{{ translate('invoice.datetime') }}</th>
              <th>{{ translate('invoice.coin') }}</th>
              <th>{{ translate('invoice.amount') }}</th>
              <th>{{ translate('invoice.status') }}</th>
            </tr>
            </thead>
            <tbody>
            <template v-if="filteredTransactions.length > 0">
              <template v-for="(transaction, index) in paginatedTransactions" :key="transaction.ID">
                <tr @click="toggleIndex = (toggleIndex === index ? -1 : index)">
                  <td>
                    <span>
                      <icon :name="toggleIndex === index ? 'minus-circle' : 'plus-circle'"
                            classes="w-5 h-5 mx-auto"></icon>
                    </span>
                  </td>
                  <td>{{ transaction.ID }}</td>
                  <td>{{ transaction.CreatedOn }}</td>
                  <td>{{ transaction.Name }}</td>
                  <td>{{ toFixed(transaction.Amount) }}</td>
                  <td @click="toggleIndex = (toggleIndex === index ? -1 : index)">
                    <div class="flex items-center">
                      <span :class="`w-2 h-2 inline-block mr-2 rounded-full ${statusColor(transaction.Status)}`"></span>
                      <span class="inline-block" @click="keyword = transaction.Status">{{ transaction.Status }}</span>
                    </div>
                  </td>
                </tr>
                <tr v-if="toggleIndex === index">
                  <td colspan="6">
                    <table class="inner-table table-sm text-left">
                      <tbody>
                      <tr>
                        <td colspan="2">
                          <div class="flex items-center">
                            <router-link v-if="transaction.ConfirmCode !== ''"
                                         :to="{name: 'invoice', params: {confirmCode: transaction.ConfirmCode}}"
                                         class="flex items-center" tag="a">
                              <icon classes="w-5 h-5 mr-2" name="barcode"></icon>
                              &nbsp;{{ decodeURIComponent(transaction.CoinAddressUsed) }}
                            </router-link>
                            <span v-if="transaction.ConfirmCode === '' && transaction.Status !== 'vtoken-active'">
                              {{ transaction.CoinAddressUsed }}
                            </span>
                            <a v-if="transaction.Status === 'vtoken-active'"
                               v-tippy="{content: tokenQrCode(transaction.CoinAddressUsed)}"
                               style="word-break: break-all">
                              {{ transaction.CoinAddressUsed }}</a>
                            <a v-if="transaction.Status === 'vtoken-active'"
                               class="ml-2"
                               @click="reClaimVToken(transaction)">Reclaim
                              vToken</a>
                            <span v-if="transaction.ConfirmCode !== ''" class="ml-2 cursor-pointer"
                                  @click="copyToClipboard('https://cointopay.com/invoice/' + transaction.ConfirmCode)">
                              <icon classes="w-5 h-5" name="globe"></icon>
                            </span>
                            <span v-if="transaction.CoinAddressUsed !== ''" class="ml-2 cursor-pointer"
                                  @click="copyToClipboard(transaction.CoinAddressUsed)">
                              <icon classes="w-5 h-5" name="clipboard"></icon>
                            </span>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <th>Master Transaction ID</th>
                        <td>
                          <div class="flex items-center">
                            {{ transaction.MasterTransactionID }}
                            <span class="ml-2 cursor-pointer" @click="copyToClipboard(transaction.MasterTransactionID)">
                              <icon classes="w-5 h-5" name="clipboard"></icon>
                            </span>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <th>{{ translate('invoice.created') }}</th>
                        <td>{{ transaction.CreatedOn }}</td>
                      </tr>
                      <tr>
                        <th>{{ translate('invoice.status') }}</th>
                        <td>{{ transaction.Status }}</td>
                      </tr>
                      <tr>
                        <th>{{ translate('invoice.coin') }}</th>
                        <td>{{ transaction.Name }}</td>
                      </tr>
                      <tr>
                        <th>LongName</th>
                        <td>{{ transaction.LongName }}</td>
                      </tr>
                      <tr>
                        <th>{{ translate('invoice.amount') }}</th>
                        <td>
                          <div class="flex items-center">
                            {{ toFixed(transaction.Amount) }}
                            <span class="ml-2 pointer"
                                  @click="toConverter(toFixed(transaction.Amount), transaction.AltCoinID)">
                              <icon classes="w-5 h-5" name="clipboard-list"></icon>
                            </span>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <th>{{ translate('invoice.input_amount') }}</th>
                        <td>{{ toFixed(transaction.OriginalAmount) }}</td>
                      </tr>
                      <tr>
                        <th>{{ translate('invoice.input_currency') }}</th>
                        <td>{{ transaction.InputCurrency }}</td>
                      </tr>
                      <tr>
                        <th>{{ translate('invoice.confirmed') }}</th>
                        <td>{{ transaction.TransactionConfirmedOn }}</td>
                      </tr>
                      <tr>
                        <th>{{ translate('invoice.expiry_on') }}</th>
                        <td>{{ transaction.ExpiredOn }}</td>
                      </tr>
                      <tr>
                        <th>{{ translate('invoice.reference') }}</th>
                        <td>
                          <div class="flex items-center">
                            <span class="whitespace-normal break-all" v-html="transaction.CustomerReferenceNr"></span>
                            <span class="ml-2 cursor-pointer"
                                  @click="copyToClipboard(transaction.CustomerReferenceNr)">
                              <icon classes="w-5 h-5" name="clipboard"></icon>
                            </span>
                          </div>
                        </td>
                      </tr>
                      <tr v-if="transaction.BlockExplorer">
                        <th>{{ translate('invoice.block_explorer') }}</th>
                        <td>
                          <a v-if="isValidUrl(transaction.BlockExplorer) === true"
                             :href="transaction.BlockExplorer" target="_blank">
                            {{ translate('invoice.block_explorer') }}</a>
                          <span v-if="isValidUrl(transaction.BlockExplorer) === false">
                            {{ transaction.BlockExplorer }}</span>
                        </td>
                      </tr>
                      <tr v-if="isReOpenable(transaction)">
                        <th>{{ translate('invoice.re_open') }}</th>
                        <td>
                          <a class="text-blue-500 hover:underline"
                             href="javascript:void(0)" @click="reOpenTransaction(transaction)">
                            {{ translate('invoice.re_open') }}</a>
                        </td>
                      </tr>
                      <tr v-if="isMissingAmount(transaction.MissingAmount)">
                        <th>{{ translate('invoice.missing_amount') }}</th>
                        <td>
                          <a class="text-blue-500 hover:underline"
                             href="javascript:void(0)" @click="generateInvoice(transaction)">
                            {{ translate('invoice.generate_invoice') }}</a>
                        </td>
                      </tr>
                      <tr v-if="isRefundable(transaction)">
                        <th>{{ translate('invoice.refund') }}</th>
                        <td>
                          <div class="flex align-items-center">
                            <a
                              v-if="transaction.RefundAddress && (transaction.Status ==='paid' || transaction.Status === 'underpaid')"
                              class="mr-4 text-blue-500 hover:underline"
                              href="javascript:void(0)" @click="refund(transaction)">
                              {{ translate('invoice.refund') }}
                            </a>
                            <div v-if="isEditableRefundAddress" class="flex align-items-center">
                              <input v-model="refundForm.RefundAddress" aria-label=""
                                     class="form-input h-9" type="text"/>
                              <button :disabled="isRefundFormLoading" class="btn btn-sm h-9 btn-primary ml-2"
                                      @click="updateRefundAddress(transaction, index)">Save
                              </button>
                              <button :disabled="isRefundFormLoading" class="btn btn-sm h-9 btn-danger ml-2"
                                      @click="isEditableRefundAddress = false">Cancel
                              </button>
                            </div>
                            <a v-if="!isEditableRefundAddress && isRefundable(transaction)"
                               href="javascript:void(0)" @click="editRefundAddress(transaction)">
                              Add/Update Refund Address
                            </a>
                          </div>
                        </td>
                      </tr>
                      <tr v-if="isOrderStatusUpdateAvailable(transaction)">
                        <th>{{ translate('invoice.cart_status') }}</th>
                        <td>
                          <a class="text-blue-500 hover:underline"
                             href="javascript:void(0)" @click="launchUpdateCartStatusModal(transaction)">
                            {{ cartStatusesList(transaction.CartStatusID).value }}</a>
                        </td>
                      </tr>
                      <tr v-if="Number(transaction.AddressID) > 0">
                        <th>{{ translate('invoice.delivery_address') }}</th>
                        <td>
                          <a class="pointer" href="javascript:void(0)"
                             @click="launchOrderModal(transaction)">{{ translate('invoice.view_order') }}</a>
                          &nbsp;|&nbsp;
                          <a class="pointer" href="javascript:void(0)"
                             @click="launchDeliveryAddressModal(transaction)">
                            {{ translate('invoice.view_address') }}</a>
                        </td>
                      </tr>
                      </tbody>
                    </table>
                  </td>
                </tr>
              </template>
            </template>
            <template v-else>
              <tr>
                <td class="text-center" colspan="6">No transactions available</td>
              </tr>
            </template>
            </tbody>
          </table>
        </div>
        <template v-if="filteredTransactions.length > 0">
          <pagination :meta="meta" @page="updatePage"></pagination>
        </template>
      </template>
      <template v-else>
        <pulse-skeleton></pulse-skeleton>
        <pulse-skeleton></pulse-skeleton>
      </template>
    </div>
  </div>
  <!-- Update Cart Status Modal -->
  <update-cart-status-modal></update-cart-status-modal>
  <!-- Order Address Modal -->
  <order-address-modal></order-address-modal>
</template>

<script>
import PulseSkeleton from '@/components/PulseSkeleton'
import Icon from '@/components/Icon'
import Pagination from '@/components/common/Pagination'
import UpdateCartStatusModal from '@/components/wallet/modals/UpdateCartStatusModal'
import OrderAddressModal from '@/components/wallet/modals/OrderAddressModal'
import StatusesDropdown from '@/components/wallet/partials/StatusesDropdown'
import * as _ from 'lodash'
import moment from 'moment'
import { useStore } from 'vuex'
import { SET_CONVERTER } from '@/store/keys'
import { computed, inject, onBeforeMount, onBeforeUnmount, reactive, toRefs, watch } from 'vue'
import compositionUtils from '@/compositionUtils'

export default {
  name: 'Transactions',
  components: {
    PulseSkeleton,
    Icon,
    UpdateCartStatusModal,
    OrderAddressModal,
    StatusesDropdown,
    Pagination
  },
  props: ['altCoinID', 'transactionID', 'reFetchTransactions', 'isRefreshing'],
  emits: ['updateBalanceOverviewDetail'],
  setup (props, { emit }) {
    // Providers
    const translate = inject('translate')
    const http = inject('http')
    const emitter = inject('emitter')
    const toast = inject('toast')

    // Store
    const store = useStore()

    const {
      lowercase,
      saveNotification,
      copyToClipboard,
      toFixed,
      isValidUrl,
      cartStatusesList
    } = compositionUtils()

    // State
    const state = reactive({
      transactions: [],
      keyword: '',
      statuses: [],
      isProcessing: false,
      meta: {
        currentPage: 1,
        totalPages: 0,
        limit: 10,
        offset: 0
      },
      toggleIndex: -1,
      isLoadingClaim: false,
      isRefundFormLoading: false,
      isEditableRefundAddress: false,
      refundForm: {
        RefundAddress: ''
      },
      isExpanded: true,
      transactionInterval: null
    })

    // Computed
    const user = computed(() => store.state.user)
    const converter = computed(() => store.state.converter)
    const altCoins = computed(() => store.state.altCoins)
    const currencySymbol = computed(() => {
      let symbol = 'EUR'
      if (store.state.accountInfo) {
        symbol = store.state.accountInfo.PayoutCurrencyShortName
      }
      if (symbol) {
        const currency = _.find(store.state.inputCurrencies, { ShortName: symbol })
        if (currency) {
          symbol = currency.LongName
        }
      }
      return symbol
    })
    const filteredTransactions = computed(() => {
      const transactions = state.transactions.filter(transaction => {
        const index = _.findIndex(state.statuses, { value: transaction.Status })
        if (state.keyword) {
          const keyword = state.keyword.trim().toLowerCase()
          if (_.startsWith(keyword, 'pos')) {
            const keywords = keyword.split('|').filter(Boolean)
            if (keywords.length > 1) {
              return index !== -1 && Number(transaction.AddressID) > 0 &&
                _.includes(transaction.Status.toLowerCase(), keywords[1].trim())
            } else {
              return index !== -1 && Number(transaction.AddressID) > 0
            }
          } else {
            return (index !== -1 &&
              (_.includes(transaction.Name.toLowerCase(), keyword) ||
                _.includes(lowercase(transaction.ID), keyword) ||
                _.includes(lowercase(transaction.CustomerReferenceNr), keyword) ||
                _.includes(lowercase(transaction.Status), keyword) ||
                _.includes(lowercase(transaction.Amount), keyword) ||
                _.includes(lowercase(transaction.InputCurrency), keyword) ||
                _.includes(lowercase(transaction.LongName), keyword) ||
                _.includes(lowercase(transaction.OriginalAmount), keyword) ||
                _.includes(lowercase(transaction.CoinAddressUsed), keyword) ||
                _.includes(lowercase(transaction.ConfirmCode), keyword) ||
                _.includes(transaction.CreatedOn, keyword) ||
                _.includes(transaction.ExpiredOn, keyword) ||
                _.includes(transaction.TransactionConfirmedOn, keyword) ||
                _.includes(transaction.ID, keyword))
            )
          }
        }
        return index !== -1
      })
      // eslint-disable-next-line vue/no-side-effects-in-computed-properties
      state.meta.totalPages = Math.ceil(transactions.length / state.meta.limit)
      return transactions
    })
    const paginatedTransactions = computed(() => {
      if (filteredTransactions.value.length > 0) {
        return filteredTransactions.value.slice(
          state.meta.offset,
          state.meta.currentPage * state.meta.limit
        )
      }
      return filteredTransactions.value
    })

    // Watch
    watch(() => props.reFetchTransactions,
      (newVal, oldVal) => {
        if (newVal) {
          fetchTransactions()
        }
      })
    watch(() => props.altCoinID,
      (newValue, oldValue) => {
        if (newValue !== oldValue) {
          state.toggleIndex = -1
          fetchTransactions()
        }
      })
    watch(() => props.transactionID,
      (newValue, oldValue) => {
        if (newValue !== null && newValue !== oldValue) {
          fetchTransaction(newValue)
        }
      })

    // Methods
    const apiBaseUrl = process.env.VUE_APP_API_URL
    const statusColor = (status) => {
      status = status.toLowerCase()
      let color = 'bg-blue-500'
      switch (status) {
        case 'waiting':
        case 'underpaid':
        case 'ltr-open':
        case 'vtoken-active':
        case 'scheduled':
        case 'awaiting-fiat':
          color = 'bg-yellow-500'
          break
        case 'expired':
        case 'ltr-expired':
          color = 'bg-red-500'
          break
        case 'paid':
        case 'ltr-closed':
        case 'payout':
        case 'vtoken-claimed':
          color = 'bg-green-500'
          break
      }
      return color
    }
    const fetchTransaction = (transactionID) => {
      let cleared = false
      const payload = {
        Call: 'Transactiondetail',
        MerchantID: user.value.ID,
        APIKey: user.value.APIKey,
        TransactionID: transactionID,
        output: 'json'
      }
      http.get(`${apiBaseUrl}/v2REAPI`, {
        params: payload
      }).then(response => {
        if (response.data.status_code === 200) {
          let transaction = response.data.data
          transaction = formatTransaction(transaction)
          if (state.transactions.length > 0) {
            const index = _.findIndex(state.transactions, {
              ID: transaction.ID
            })
            if (index !== -1) {
              state.transactions.splice(index, 1, transaction)
            } else {
              state.transactions.splice(0, 0, transaction)
            }
          } else {
            state.transactions.push(transaction)
          }
          if (transaction.Status === 'paid' || transaction.Status === 'underpaid') {
            if (state.transactionInterval) {
              clearInterval(state.transactionInterval)
            }
            cleared = true
          }
          emit('updateBalanceOverviewDetail')
        }
      }).catch(error => {
        console.log(error)
      })
      if (!cleared && !state.transactionInterval) {
        state.transactionInterval = setInterval(() => {
          fetchTransaction(transactionID)
        }, 60000)
      }
    }
    const fetchTransactions = (id = null) => {
      state.isProcessing = true
      http.get(`${apiBaseUrl}/v2REAPI`, {
        params: {
          Call: 'Transactions',
          MerchantID: user.value.ID,
          APIKey: user.value.APIKey,
          AltCoinID: id || props.altCoinID,
          output: 'json'
        }
      }).then(response => {
        state.isProcessing = false
        if (response.status === 200) {
          state.transactions = typeof response.data.result === 'undefined' ? response.data.data : []
          if (state.transactions) {
            state.meta.totalPages = Math.ceil(state.transactions.length / state.meta.limit)
          }
        }
      }).catch(error => {
        state.isProcessing = false
        console.log(error)
      })
    }
    const updateStatusFilter = (statuses) => {
      if (statuses.length === 0) {
        state.statuses = []
      } else {
        Object.assign(state.statuses, {}, statuses)
      }
    }
    const updatePage = (page) => {
      state.meta = {
        ...state.meta,
        currentPage: page,
        offset: (page - 1) * state.meta.limit
      }
    }
    const isReOpenable = (transaction) => {
      return (
        Number(transaction.Reopenable) === 1 && transaction.Status !== 'waiting' && transaction.Status !== 'ltr-open'
      )
    }
    const reOpenTransaction = (transaction) => {
      http.get(`${apiBaseUrl}/v2REAPI`, {
        params: {
          Call: 'Reopen',
          MerchantID: user.value.ID,
          APIKey: user.value.APIKey,
          ConfirmCode: transaction.ConfirmCode,
          output: 'json'
        }
      }).then(response => {
        if (response.status === 200) {
          const index = state.transactions.indexOf(transaction)
          transaction.Status = 'waiting'
          state.transactions[index] = transaction
          const message = translate('invoice.transaction_scheduled_for_revalidation')
          toast.success(message)
          saveNotification(message)
        }
      }).catch(error => {
        console.log(error)
      })
    }
    const isMissingAmount = (amount) => {
      return amount && amount > 0.0
    }
    const isRefundable = (transaction) => {
      return ['paid', 'waiting'].indexOf(transaction.Status) !== -1 && transaction.ID.startsWith('T')
    }
    const isOrderStatusUpdateAvailable = (transaction) => {
      const status = transaction.Status.toLowerCase().toString()
      return (status === 'paid' || status === 'underpaid') && transaction.Buy === '0'
    }
    const toConverter = (amount, altCoinID) => {
      const form = { ...converter.value }
      form.source = amount
      form.sourceAltCoinId = altCoinID
      if (currencySymbol.value) {
        const coin = _.find(altCoins.value, { ShortName: currencySymbol.value })
        if (coin) {
          form.targetAltCoinId = coin.ID
        }
      }
      store.commit(SET_CONVERTER, form)
      copyToClipboard(amount)
    }
    const tokenQrCode = (address) => {
      return `<img src="https://chart.googleapis.com/chart?chs=240&cht=qr&chl=${address}" alt=""/>`
    }
    const reClaimVToken = (transaction) => {
      if (state.isLoadingClaim) {
        return
      }
      state.isLoadingClaim = true
      const payload = {
        Call: 'VTOKEN',
        MerchantID: user.value.ID,
        APIKey: user.value.APIKey,
        AltCoinID: transaction.AltCoinID,
        Token: transaction.CoinAddressUsed,
        Amount: 1,
        Direction: 0,
        output: 'json',
        V2: ''
      }
      state.errorMessageClaim = ''
      http.get(`${apiBaseUrl}/v2REAPI`, {
        params: payload
      }).then(response => {
        if (response.status === 200) {
          if (typeof response.data === 'string') {
            if (response.data.toLowerCase() === 'ok') {
              toast.success('vToken claimed successfully')
              saveNotification('vToken claimed successfully')
              // Call the balance API to update the amount
              emit('updateBalanceOverviewDetail')
              fetchTransactions(transaction.AltCoinID)
            } else {
              toast.error(response.data.replace(/^\w/, c => c.toUpperCase()))
              saveNotification(response.data.replace(/^\w/, c => c.toUpperCase()))
            }
          }
          state.isLoadingClaim = false
        }
      }).catch(error => {
        state.isLoadingClaim = false
        console.log(error.response)
      })
    }
    const formatTransaction = (transaction) => {
      const date = new Date(transaction.CreatedOn)
      date.setMinutes(date.getMinutes() + transaction.ExpiryTime)
      const expiry = moment(date).format('YYYY-MM-DD HH:mm:ss')
      return {
        Amount: transaction.Amount,
        CoinAddressUsed: transaction.coinAddress,
        ConfirmCode: transaction.Security,
        CreatedOn: transaction.CreatedOn,
        CustomerReferenceNr: transaction.CustomerReferenceNr,
        ExpiredOn: expiry,
        ID: generateTransactionID(transaction.TransactionID, transaction.Status),
        InputCurrency: transaction.inputCurrency,
        Name: transaction.CoinName,
        OriginalAmount: transaction.OriginalAmount,
        Status: transaction.Status,
        TransactionConfirmedOn: transaction.Status === 'waiting' ? 'NA' : transaction.TransactionConfirmedOn,
        LongName: transaction.LongName
      }
    }
    const prefixTransactionID = (id, prefix, size = 10) => {
      const prefixedId = id.toString().padStart(size - 1, '0')
      return prefix + prefixedId
    }
    const generateTransactionID = (id, status) => {
      let transactionID = ''
      const s = status.toLowerCase()
      if (s === 'payout') {
        transactionID = prefixTransactionID(id, 'P')
      } else if (
        s === 'paid' ||
        s === 'expired' ||
        s === 'waiting' ||
        s === 'awaiting-fiat' ||
        s === 'underpaid'
      ) {
        transactionID = prefixTransactionID(id, 'T')
      } else if (s === 'vtoken-claimed' || s === 'vtoken-active') {
        transactionID = prefixTransactionID(id, 'V')
      } else if (s === 'scheduled') {
        transactionID = prefixTransactionID(id, 'S')
      } else if (s === 'ltr-open') {
        transactionID = prefixTransactionID(id, 'L')
      }
      return transactionID
    }
    const generateInvoice = (transaction) => {
      http.get(`${apiBaseUrl}/MerchantAPI`, {
        params: {
          Checkout: true,
          MerchantID: user.value.ID,
          Amount: transaction.MissingAmount,
          CustomerReferenceNr: 'Remaining payment for TransactionID ' + transaction.ID,
          SecurityCode: user.value.SecurityCode,
          AltCoinID: transaction.AltCoinID,
          output: 'jsonV2'
        }
      }).then(response => {
        if (response.data.result === 'success') {
          const data = response.data.data
          const transaction = formatTransaction(data)
          if (state.transactions.length > 0) {
            state.transactions.splice(0, 0, transaction)
          } else {
            state.transactions.push(transaction)
          }
          toast.success('Invoice generated successfully')
          saveNotification('Invoice generated successfully')
          emit('updateBalanceOverviewDetail')
        }
      }).catch(error => {
        console.log(error)
      })
    }
    const refund = (transaction) => {
      const payload = {
        MerchantID: user.value.ID,
        APIKey: user.value.APIKey,
        AltCoinID: transaction.AltCoinID,
        Amount: transaction.Amount,
        coinAddress: transaction.RefundAddress,
        ChargingMethod: 'fixed-fee',
        PayoutMonth: new Date().getMonth() + 1,
        TransactionTotal: 1,
        output: 'json'
      }
      http.get(`${apiBaseUrl}/GetSendToAddress`, {
        params: payload
      }).then(response => {
        if (response.status === 200) {
          toast.success(response.data)
          saveNotification(response.data)
        }
      }).catch(error => {
        console.log(error.response)
      })
    }
    const editRefundAddress = (transaction) => {
      state.refundForm.RefundAddress = transaction.RefundAddress
      state.isEditableRefundAddress = true
    }
    const updateRefundAddress = (transaction, index) => {
      state.isRefundFormLoading = true
      const payload = {
        Call: 'Refund',
        MerchantID: user.value.ID,
        APIKey: user.value.APIKey,
        RefundAddress: state.refundForm.RefundAddress,
        ConfirmCode: transaction.ConfirmCode,
        output: 'json'
      }
      http.get(`${apiBaseUrl}/v2REAPI`, {
        params: payload
      }).then(response => {
        state.isRefundFormLoading = false
        if (response.data.result === 'success') {
          transaction.RefundAddress = state.refundForm.RefundAddress
          state.transactions.splice(index, 1, transaction)
          toast.success('Refund address saved successfully')
          saveNotification('Refund address saved successfully')
          state.isEditableRefundAddress = false
        }
      }).catch(error => {
        state.isRefundFormLoading = false
        console.log(error)
      })
    }
    const launchUpdateCartStatusModal = (transaction) => {
      emitter.emit('updateCartStatusModal', {
        transaction: transaction,
        confirm: (cartStatusId) => {
          const transactionIndex = _.findIndex(state.transactions, { ID: transaction.TransactionID })
          state.transactions[transactionIndex].CartStatusID = cartStatusId
        }
      })
    }
    const launchOrderModal = (transaction) => {
      if (Number(transaction.AddressID) > 0) {
        const decoded = decodeURIComponent(transaction.CustomerReferenceNr)
        const elm = document.createElement('div')
        elm.innerHTML = decoded
        let items = elm.innerHTML.trim()
        const order = {
          items: [],
          shipping: null,
          coupon: null
        }
        state.deliveryAddresses = []
        if (items) {
          items = items.split(':::').filter(Boolean)
          items.map(orderItem => {
            orderItem = orderItem.split('|').filter(Boolean)
            if (orderItem.length === 6) {
              order.items.push({
                id: orderItem[0],
                sku: orderItem[1],
                name: orderItem[2],
                url: orderItem[3],
                price: Number(orderItem[4]),
                qty: Number(orderItem[5])
              })
            } else if (orderItem.length === 5) {
              order.items.push({
                id: orderItem[0],
                name: orderItem[1],
                url: orderItem[2],
                price: Number(orderItem[3]),
                qty: Number(orderItem[4])
              })
            } else if (orderItem.length === 2) {
              order.shipping = {
                method: orderItem[0],
                cost: orderItem[1]
              }
            } else if (orderItem.length === 3) {
              order.coupon = {
                code: orderItem[0],
                value: orderItem[1],
                discount: orderItem[2]
              }
            }
          })
          emitter.emit('orderAddressModal', {
            order,
            deliveryAddresses: [],
            transaction: transaction
          })
        }
      }
    }
    const launchDeliveryAddressModal = (transaction) => {
      if (Number(transaction.AddressID) > 0) {
        http.get(`${apiBaseUrl}/v2REAPI`, {
          params: {
            Call: 'hasAddress',
            MerchantID: user.value.ID,
            APIKey: user.value.APIKey,
            TransactionID: transaction.ID.toString().substr(3, transaction.ID.length),
            output: 'json'
          }
        }).then(response => {
          if (response.status === 200) {
            emitter.emit('orderAddressModal', {
              deliveryAddresses: response.data.data,
              order: {
                items: [],
                shipping: null,
                coupon: null
              },
              transaction: transaction
            })
          } else {
            toast.warning('No address available!')
            saveNotification('No address available!')
          }
        }).catch(error => {
          console.log(error.response)
        })
      }
    }

    onBeforeMount(() => {
      fetchTransactions()
      emitter.on('filterTransactions', (args) => {
        state.keyword = args.status
      })
    })

    onBeforeUnmount(() => {
      if (state.transactionInterval) {
        clearInterval(state.transactionInterval)
      }
    })

    return {
      translate,
      ...toRefs(state),
      filteredTransactions,
      paginatedTransactions,
      toFixed,
      copyToClipboard,
      isValidUrl,
      cartStatusesList,
      toConverter,
      updateStatusFilter,
      updatePage,
      isReOpenable,
      reOpenTransaction,
      isMissingAmount,
      isRefundable,
      isOrderStatusUpdateAvailable,
      tokenQrCode,
      reClaimVToken,
      generateInvoice,
      refund,
      editRefundAddress,
      updateRefundAddress,
      launchUpdateCartStatusModal,
      launchOrderModal,
      launchDeliveryAddressModal,
      statusColor
    }
  }
}
</script>

<style scoped lang="scss">
.inner-table {
  @apply w-full;
  tr {
    td:first-child,
    th:first-child {
      @apply pl-2;
    }

    &:last-child {
      @apply border-b-0;
    }
  }
}

// Link
a {
  @apply text-blue-500 hover:underline;
}

</style>

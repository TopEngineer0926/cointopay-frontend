<template>
  <wallet-layout>
    <!-- Notifications section -->
    <template v-slot:notice>
      <div v-if="isShowWarning"
           class="w-full rounded shadow text-sm text-tight px-4 py-3 bg-yellow-500 mb-4 text-yellow-900 font-semibold">
        <p class="mb-0">{{ warningMessage[0] }}.
          <router-link class="btn text-gray-100 bg-orange-500 hover:bg-orange-700 btn-sm" tag="a" to="/account/kyc">Click here</router-link>
          {{ warningMessage[1] }}
        </p>
      </div>
      <div v-if="!isOverview && selectedCoin && !selectedCoin.BuyEnabled"
           class="w-full rounded shadow px-4 py-3 bg-yellow-500 mb-4 text-yellow-900 font-semibold" role="alert">
        We are currently not buying this currency due to low liquidity, invest at your own risk!
      </div>
      <div v-if="isNotice && user"
           class="w-full rounded shadow px-4 py-3 bg-red-400 mb-4 text-red-900 font-semibold" role="alert">
        <p><span class="font-bold">Username:</span> {{ user.Username }} <span class="font-bold">Password:</span> {{ user.Password }}</p>
        <p><span class="font-bold">Note:</span> Please note down this information, it will not be shown next time.</p>
      </div>
    </template>
    <!-- Sidebar -->
    <template v-slot:sidebar>
      <sidebar :balanceList="balanceList"></sidebar>
    </template>
    <!-- Main content area -->
    <template v-slot:content>
      <!-- Stats -->
      <stats :balanceOverview="balanceOverview" :isOverview="isOverview" :selectedBalance="selectedBalance"
             :isProcessing="isProcessing" :isRefreshing="isRefreshing"></stats>
      <!-- Currency Actions -->
      <template v-if="!isOverview && selectedBalance && !isRefreshing">
        <currency-actions :balanceList="balanceList" :selectedBalance="selectedBalance"
                          @updateBalanceOverviewDetail="fetchBalanceOverviewDetail"
                          @fetchTransaction="fetchTransaction"
                          @fetchTransactions="fetchTransactions"></currency-actions>
      </template>
      <!-- Webshop Overview -->
      <webshop-overview :altCoinID="altCoinID" :isOverview="isOverview" :isRefreshing="isRefreshing"></webshop-overview>
      <div class="grid grid-cols-5 gap-0 xl:gap-4">
        <div class="col-span-5 xl:col-span-2">
          <!-- Transactions Chart -->
          <chart-transactions v-if="isOverview"></chart-transactions>
          <!-- Market Chart -->
          <chart-market v-if="!isOverview && selectedBalance"
                        :selectedBalance="selectedBalance" :isRefreshing="isRefreshing"></chart-market>
          <!-- Download Links -->
          <download-links :selectedBalance="selectedBalance"></download-links>
        </div>
        <div class="col-span-5 xl:col-span-3">
          <transactions :altCoinID="altCoinID" :transactionID="transactionID"
                        @updateBalanceOverviewDetail="fetchBalanceOverviewDetail"
                        :reFetchTransactions="reFetchTransactions" :isRefreshing="isRefreshing"></transactions>
        </div>
      </div>
      <!-- Gecko -->
      <template v-if="!isOverview">
        <gecko :geckoCoinsList="geckoCoinsList" :selectedBalance="selectedBalance" :isRefreshing="isRefreshing"></gecko>
      </template>
    </template>
  </wallet-layout>
</template>

<script>
import WalletLayout from '@/components/layouts/WalletLayout'
import Sidebar from '@/components/wallet/Sidebar'
import Stats from '@/components/wallet/Stats'
import CurrencyActions from '@/components/wallet/CurrencyActions'
import WebshopOverview from '@/components/wallet/WebshopOverview'
import ChartMarket from '@/components/wallet/ChartMarket'
import ChartTransactions from '@/components/wallet/ChartTransactions'
import Transactions from '@/components/wallet/Transactions'
import DownloadLinks from '@/components/wallet/DownloadLinks'
import Gecko from '@/components/wallet/Gecko'
import { FETCH_INPUT_CURRENCIES, SET_BALANCES, SET_REFRESH_DATA } from '@/store/keys'
import { useStore } from 'vuex'
import { computed, inject, onBeforeMount, onBeforeUnmount, reactive, toRefs, watch } from 'vue'
import { onBeforeRouteUpdate, useRoute } from 'vue-router'
import * as _ from 'lodash'

export default {
  name: 'Wallet',
  components: {
    WalletLayout,
    Sidebar,
    Stats,
    CurrencyActions,
    WebshopOverview,
    ChartTransactions,
    ChartMarket,
    Transactions,
    DownloadLinks,
    Gecko
  },
  setup () {
    // Providers
    const http = inject('http')
    const translate = inject('translate')
    // Store
    const store = useStore()
    // Route
    const route = useRoute()
    // State
    const state = reactive({
      isOverview: true,
      selectedBalance: null,
      balanceOverview: null,
      balanceList: [],
      altCoinID: null,
      transactionID: null,
      reFetchTransactions: 0,
      geckoCoinsList: [],
      socket: null,
      isCloseSocket: false,
      isNotice: false,
      isShowWarning: false,
      isProcessing: false,
      isRefreshing: false
    })

    // Computed
    const user = computed(() => store.state.user)
    const accountInfo = computed(() => store.state.accountInfo)
    const isLoggedIn = computed(() => store.state.isLoggedIn)
    const refreshData = computed(() => store.state.refreshData)
    const selectedCoin = computed(() => _.find(store.state.altCoins, { ID: state.selectedBalance && state.selectedBalance.id }))
    const warningMessage = computed(() => translate('dashboard.warning_message').split(' [HERE].'))
    // Watch
    watch(() => ({ ...accountInfo.value }),
      (newVal, oldVal) => {
        if (newVal) {
          state.isShowWarning = newVal.FinalVerification === '0'
        }
      })
    watch(() => ({ ...route }),
      (newVal, oldVal) => {
        if (Object.keys(newVal.query).length > 0) {
          if (newVal.query.t && newVal.query.t.toString() === 'true') {
            state.isNotice = true
          }
        } else {
          state.isNotice = false
        }
      })

    onBeforeRouteUpdate((to, from) => {
      if (isLoggedIn.value) {
        state.isRefreshing = true
        fetchBalanceOverviewDetail()
        if (!to.params.ln) {
          state.isOverview = true
          state.altCoinID = null
          state.selectedBalance = null
        }
      }
    })

    // Methods
    const apiBaseUrl = process.env.VUE_APP_API_URL
    const fetchBalanceOverviewDetail = (isLoader = false) => {
      state.isProcessing = isLoader
      const inputCurrency = accountInfo.value ? accountInfo.value.PayoutCurrencyShortName : 'EUR'
      http.get(`${apiBaseUrl}/v2REAPI`, {
        params: {
          Call: 'BalanceOverviewWEB',
          MerchantID: user.value.ID,
          APIKey: user.value.APIKey,
          inputCurrency: inputCurrency,
          output: 'json'
        }
      }).then(response => {
        if (response.status === 200) {
          state.isProcessing = false
          state.isRefreshing = false
          store.commit(SET_BALANCES, response.data)
          state.balanceOverview = _.find(response.data, { id: 0 })
          state.balanceList = response.data.filter(
            balance => balance.id !== 0
          )
          if (state.balanceOverview.fiatvalue > 0) {
            state.balanceList = _.orderBy(
              state.balanceList,
              [
                balance => {
                  return Number(balance.fiatvalue)
                }
              ],
              ['desc']
            )
          } else {
            state.balanceList = _.orderBy(
              state.balanceList,
              ['name'],
              ['asc']
            )
          }
          if (route.params.ln) {
            const longName = route.params.ln.toLowerCase()
            state.selectedBalance = _.find(state.balanceList, (b) => {
              return b.longname.toLowerCase() === longName.toString()
            })
            if (state.selectedBalance) {
              state.altCoinID = state.selectedBalance.id
            }
            if (state.selectedBalance) {
              state.isOverview = false
              // Refresh Market Chart
              const refresh = {
                ...refreshData.value,
                marketChat: (new Date()).getTime()
              }
              store.commit(SET_REFRESH_DATA, refresh)
            }
          } else if (!state.isOverview && state.selectedBalance) {
            state.selectedBalance = _.find(state.balanceList, {
              id: state.selectedBalance.id
            })
            if (state.selectedBalance) {
              state.altCoinID = state.selectedBalance.id
            }
          }
        }
      }).catch(error => {
        state.isProcessing = false
        state.isRefreshing = false
        console.log(error.response)
      })
    }
    const fetchTransaction = (id) => {
      state.transactionID = id
    }
    const fetchTransactions = () => {
      state.reFetchTransactions++
    }
    // Fetch gecko coins list
    const fetchGeckoCoinsList = () => {
      const baseUrl = window.location.protocol + '//' + window.location.host
      const geckoCoinsFile = baseUrl + '/gecko.json'
      http.get(`${geckoCoinsFile}`).then(response => {
        state.geckoCoinsList = response.data
      }).catch(error => {
        console.log(error)
      })
    }

    const initSocket = () => {
      state.socket = new WebSocket('wss://wss.cointopay.com/balance')
      state.socket.onmessage = (event) => {
        if (event) {
          if (event.data) {
            const parts = event.data.split(':')
            if (parts.length >= 4 && Object.keys(user.value).length > 0) {
              if (parts[0].toString() === user.value.ID.toString()) {
                // self.notification = {
                //   id: parts[1],
                //   status: parts[2]
                // }
                if (!state.isOverview) {
                  if (state.selectedBalance.id.toString() === parts[3].toString()) {
                    fetchTransaction(parts[1])
                  }
                } else {
                  fetchTransaction(parts[1])
                }
                // Refresh Webshop Overview
                const refresh = {
                  ...refreshData.value,
                  webShopOverview: (new Date()).getTime()
                }
                store.commit(SET_REFRESH_DATA, refresh)
              }
            }
          }
        }
      }
      state.socket.onclose = (event) => {
        if (!state.isCloseSocket) {
          initSocket()
        }
      }
    }

    onBeforeMount(() => {
      if (accountInfo.value) {
        state.isShowWarning = accountInfo.value.FinalVerification === '0'
      }
      store.dispatch(FETCH_INPUT_CURRENCIES).catch(error => {
        console.log(error)
      })
      if (Object.keys(route.query).length > 0) {
        if (route.query.t && route.query.t.toString() === 'true') {
          state.isNotice = true
        }
      }
      // Fetch gecko coins list
      fetchGeckoCoinsList()
      // Get balance overview detail
      fetchBalanceOverviewDetail(true)
      // Init Socket
      initSocket()
    })

    onBeforeUnmount(() => {
      if (state.socket) {
        state.isCloseSocket = true
        state.socket.close()
      }
    })

    return {
      ...toRefs(state),
      user,
      selectedCoin,
      fetchTransaction,
      fetchBalanceOverviewDetail,
      fetchTransactions,
      warningMessage
    }
  }
}
</script>

<style scoped></style>

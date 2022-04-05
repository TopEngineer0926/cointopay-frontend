<template>
  <div>
    <div class="grid grid-cols-2 gap-0 xl:gap-4">
      <!-- Wallet Balance -->
      <div class="col-span-2 xl:col-span-1">
        <div class="card h-auto lg:h-32">
          <template v-if="!isRefreshing">
            <h5 class="title">{{ walletTitle }}</h5>
            <hr class="border-gray-300 dark:border-gray-600"/>
            <div class="body">
              <div class="flex items-start lg:items-center flex-col lg:flex-row justify-between">
                <div class="flex items-center font-bold text-xl text-blue-500 mb-3 lg:mb-0">
                  <span v-if="isOverview">{{ currencySymbol }}</span>
                  <img v-if="selectedBalance" :src="generateIconUrl(selectedBalance.name)" alt="" class="w-8 h-8"/>
                  <template v-if="!isProcessing">
                    <router-link :to="{name: 'webshop-overview'}" class="ml-3" tag="a">{{ totalBalance }}</router-link>
                  </template>
                  <icon v-else classes="w-5 h-5 ml-3 animate-spin" name="spinner"></icon>
                </div>
                <div v-if="selectedBalance" class="flex items-center font-bold text-lg">
                  <span>{{ currencySymbol }}</span>
                  <span class="ml-3">{{ Number(this.selectedBalance.fiatvalue).toFixed(8) }}</span>
                </div>
              </div>
            </div>
          </template>
          <template v-else>
            <div class="animate-pulse">
              <div class="title">
                <div class="h-3 my-2 w-32 bg-gray-200 dark:bg-gray-500 rounded"></div>
              </div>
              <hr class="border-gray-300 dark:border-gray-600"/>
              <div class="body">
                <div class="h-2 w-32 mb-3 bg-gray-200 dark:bg-gray-500 rounded"></div>
                <div class="h-2 w-48 bg-gray-200 dark:bg-gray-500 rounded"></div>
              </div>
            </div>
          </template>
        </div>
      </div>
      <!-- Key Metrics -->
      <div class="col-span-2 xl:col-span-1">
        <div class="card h-auto lg:h-32">
          <template v-if="!isRefreshing">
            <h5 class="title flex items-center justify-between">
              <span>{{ metricsTitle }}&nbsp;{{ translate('dashboard.metrics') }}</span>
              <span class="text-sm">24H</span>
            </h5>
            <hr class="border-gray-300 dark:border-gray-600"/>
            <div class="body">
              <div class="flex items-start lg:items-center flex-col lg:flex-row justify-between">
                <div class="flex items-center text-yellow-500 mb-3 lg:mb-0">
                  <span class="text-xl font-bold">{{ waitingTotal }}</span>&nbsp;
                  <div class="text-xs font-semibold ml-2" @click="filterTransactions('waiting')">
                    <div>{{ translate('dashboard.waiting') }}</div>
                    <div>{{ translate('dashboard.transactions') }}</div>
                  </div>
                </div>
                <div class="flex items-center text-green-500 mb-3 lg:mb-0">
                  <span class="text-xl font-bold">{{ confirmedTotal }}</span>&nbsp;
                  <div class="text-xs font-semibold ml-2" @click="filterTransactions('paid')">
                    <div>{{ translate('dashboard.paid') }}</div>
                    <div>{{ translate('dashboard.transactions') }}</div>
                  </div>
                </div>
                <div class="flex items-center text-red-500">
                  <span class="text-xl font-bold">{{ expiredTotal }}</span>&nbsp;
                  <div class="text-xs font-semibold ml-2" @click="filterTransactions('expired')">
                    <div>{{ translate('dashboard.expired') }}</div>
                    <div>{{ translate('dashboard.transactions') }}</div>
                  </div>
                </div>
              </div>
            </div>
          </template>
          <template v-else>
            <div class="animate-pulse">
              <div class="title flex items-center justify-between">
                <div class="h-3 my-2 w-32 bg-gray-200 dark:bg-gray-500 rounded"></div>
                <div class="h-3 my-2 w-16 bg-gray-200 dark:bg-gray-500 rounded"></div>
              </div>
              <hr class="border-gray-300 dark:border-gray-600"/>
              <div class="body">
                <div class="flex items-center justify-between">
                  <div>
                    <div class="h-2 w-16 mb-3 bg-gray-200 dark:bg-gray-500 rounded"></div>
                    <div class="h-2 w-16 bg-gray-200 dark:bg-gray-500 rounded"></div>
                  </div>
                  <div>
                    <div class="h-2 w-16 mb-3 bg-gray-200 dark:bg-gray-500 rounded"></div>
                    <div class="h-2 w-16 bg-gray-200 dark:bg-gray-500 rounded"></div>
                  </div>
                  <div>
                    <div class="h-2 w-16 mb-3 bg-gray-200 dark:bg-gray-500 rounded"></div>
                    <div class="h-2 w-16 bg-gray-200 dark:bg-gray-500 rounded"></div>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useStore } from 'vuex'
import * as _ from 'lodash'
import { computed, inject } from 'vue'
import compositionUtils from '@/compositionUtils'
import Icon from '@/components/Icon'

export default {
  name: 'Stats',
  props: ['isOverview', 'selectedBalance', 'balanceOverview', 'isProcessing', 'isRefreshing'],
  components: {
    Icon
  },
  setup (props) {
    // Providers
    const translate = inject('translate')
    const emitter = inject('emitter')
    // Store
    const store = useStore()

    const { generateIconUrl } = compositionUtils()

    // Computed
    const accountInfo = computed(() => store.state.accountInfo)
    const inputCurrencies = computed(() => store.state.inputCurrencies)
    const walletTitle = computed(() => props.isOverview ? translate('dashboard.total') : (props.selectedBalance.name + ' ' + props.selectedBalance.longname))
    const metricsTitle = computed(() => props.isOverview ? '' : props.selectedBalance.longname)
    const currencySymbol = computed(() => {
      let symbol = 'EUR'
      if (accountInfo.value) {
        symbol = accountInfo.value.PayoutCurrencyShortName
      }
      if (symbol) {
        const currency = _.find(inputCurrencies.value, { ShortName: symbol })
        if (currency) {
          symbol = currency.LongName
        }
      }
      return symbol
    })
    const totalBalance = computed(() => {
      if (props.isOverview && !props.balanceOverview) {
        return 0
      }
      return props.isOverview
        ? (props.balanceOverview ? Number(props.balanceOverview.fiatvalue).toFixed(8) : 0)
        : Number(props.selectedBalance.balance).toFixed(8)
    })
    const waitingTotal = computed(() => {
      return props.isOverview
        ? (props.balanceOverview ? props.balanceOverview.waiting_total : 0)
        : props.selectedBalance.waiting_total
    })
    const confirmedTotal = computed(() => {
      return props.isOverview
        ? (props.balanceOverview ? props.balanceOverview.confirmed_total : 0)
        : props.selectedBalance.confirmed_total
    })
    const expiredTotal = computed(() => {
      return props.isOverview
        ? (props.balanceOverview ? props.balanceOverview.expired_total : 0)
        : props.selectedBalance.expired_total
    })

    // Methods
    const filterTransactions = (status) => {
      emitter.emit('filterTransactions', {
        status: status
      })
    }

    return {
      translate,
      walletTitle,
      metricsTitle,
      currencySymbol,
      totalBalance,
      waitingTotal,
      confirmedTotal,
      expiredTotal,
      generateIconUrl,
      filterTransactions
    }
  }
}
</script>

<style scoped></style>

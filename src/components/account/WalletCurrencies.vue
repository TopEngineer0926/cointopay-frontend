<template>
  <!-- Manage Input Currency -->
  <div class="card">
    <div class="title flex items-center justify-between">
      <h5>{{ translate('account.wallet.default_title') }}</h5>
      <span v-tippy="{content: translate('account.wallet.default_help')}" class="cursor-pointer">
        <icon classes="w-6 h-6 text-yellow-500" name="question-mark"></icon>
      </span>
    </div>
    <hr class="border-gray-300 dark:border-gray-600"/>
    <div class="body">
      <div class="flex flex-col md:flex-row items-start md:items-center justify-between">
        <p v-if="selectedInputCurrency" class="mb-3 md:mb-0 font-semibold">
          {{ `${selectedInputCurrency.Name} ${selectedInputCurrency.LongName}` }}</p>
        <j-button size="w-full md:w-auto" @click="launchInputCurrencyModal()">
          {{ translate('account.wallet.button') }}
        </j-button>
      </div>
    </div>
  </div>
  <!-- Active Currencies -->
  <div class="card">
    <div class="title flex items-center justify-between">
      <h5>{{ translate('account.wallet.active_title') }}</h5>
      <span v-tippy="{content: translate('account.wallet.active_help')}" class="cursor-pointer">
        <icon classes="w-6 h-6 text-yellow-500" name="question-mark"></icon>
      </span>
    </div>
    <hr class="border-gray-300 dark:border-gray-600"/>
    <div class="body">
      <div class="flex flex-wrap justify-start gap-x-1 gap-y-1 md:gap-x-4 md:gap-y-2">
        <div v-for="(coin, i) in selectedCoinsList"
             :key="i" class="flex items-center w-40">
          <img :src="generateIconUrl(coin.Name)" alt="" class="w-6 h-6 mr-3"/>
          {{ coin.Name }}
        </div>
      </div>
      <div class="mt-4 text-right">
        <j-button size="w-full md:w-auto" @click="launchActiveCurrenciesModal()">
          {{ translate('account.wallet.button') }}
        </j-button>
      </div>
    </div>
  </div>
  <!-- Preferred Currencies -->
  <div class="card">
    <div class="title flex items-center justify-between">
      <h5>{{ translate('account.wallet.preferred_title') }}</h5>
      <span v-tippy="{content: translate('account.wallet.preferred_help')}" class="cursor-pointer">
        <icon classes="w-6 h-6 text-yellow-500" name="question-mark"></icon>
      </span>
    </div>
    <hr class="border-gray-300 dark:border-gray-600"/>
    <div class="body">
      <div class="flex flex-col md:flex-row items-start md:items-center justify-between">
        <p v-if="preferredCurrency" class="mb-3 md:mb-0 font-semibold">
          {{ `${preferredCurrency.Name} ${preferredCurrency.LongName}` }}</p>
        <j-button size="w-full md:w-auto" @click="launchPreferredCurrencyModal()">
          {{ translate('account.wallet.button') }}
        </j-button>
      </div>
      <div v-if="preferredCurrency" class="flex items-center mt-3 md:mt-0">
        <p>{{ translate('account.wallet.auto_swap') }}</p>
        <label class="ml-3 flex items-center cursor-pointer relative" for="swapPreferredAltCoinId">
          <input id="swapPreferredAltCoinId" v-model="isSwapPreferredAltCoinID" class="sr-only" type="checkbox">
          <span
            class="toggle-bg bg-gray-300 dark:bg-gray-700 border-2 border-gray-300 focus:outline-none dark:border-gray-700 h-5 w-9 rounded-full"></span>
        </label>
      </div>
    </div>
  </div>
  <!-- Currency excluded from automated payouts -->
  <div class="card">
    <div class="title flex items-center justify-between">
      <h5>{{ translate('account.wallet.excluded_currencies_title') }}</h5>
      <span v-tippy="{content: translate('account.wallet.excluded_currencies_help')}" class="cursor-pointer">
        <icon classes="w-6 h-6 text-yellow-500" name="question-mark"></icon>
      </span>
    </div>
    <hr class="border-gray-300 dark:border-gray-600"/>
    <div class="body">
      <div class="flex flex-col md:flex-row items-start md:items-center justify-between">
        <select v-model="excludedCoin" class="form-select w-full md:w-2/5 mb-3 md:mb-0">
          <option value="0">None</option>
          <option v-for="(currency, index) in selectedCoinsList" :key="index" :value="currency.ID">
            {{ `${currency.Name} ${currency.LongName}` }}
          </option>
        </select>
        <j-button :disabled="isProcessing" size="w-full md:w-auto" @click="updateExcludedCurrency()">
          <div v-if="isProcessing" class="mr-3">
            <icon :name="'spinner'" classes="w-4 h-4 text-white"></icon>
          </div>
          <span>{{ translate('account.button_update') }}</span>
        </j-button>
      </div>
    </div>
  </div>
  <!-- Flexibility Percentage -->
  <div class="card">
    <div class="title flex items-center justify-between">
      <h5>{{ translate('account.wallet.flexibility_percentage') }}</h5>
      <span v-tippy="{content: translate('account.wallet.help')}" class="cursor-pointer">
        <icon classes="w-6 h-6 text-yellow-500" name="question-mark"></icon>
      </span>
    </div>
    <hr class="border-gray-300 dark:border-gray-600"/>
    <div class="body">
      <div class="flex flex-col md:flex-row items-start md:items-center justify-between">
        <div class="flex items-center w-full md:w-2/5 mb-3 md:mb-0">
          <input v-model="flexibilityPercentage" class="w-full h-1 rounded bg-blue-100 dark:bg-gray-700 appearance-none"
                 max="100" min="60"
                 type="range"/>
          <span class="mx-8 w-8 text-center">{{ flexibilityPercentage }}</span>
        </div>
        <j-button :disabled="isProcessing" size="w-full md:w-auto" @click="updateFlexibilityPercentage()">
          <div v-if="isProcessing" class="mr-3">
            <icon :name="'spinner'" classes="w-4 h-4 text-white"></icon>
          </div>
          <span>{{ translate('account.button_update') }}</span>
        </j-button>
      </div>
    </div>
  </div>

  <!-- Input Currencies Modal -->
  <input-currency-modal></input-currency-modal>
  <!-- Active Currencies Modal -->
  <active-currencies-modal></active-currencies-modal>
  <!-- Preferred Currency Modal -->
  <preferred-currency-modal></preferred-currency-modal>
</template>

<script>
import Icon from '@/components/Icon'
import JButton from '@/templates/Button'
import InputCurrencyModal from '@/components/account/modals/wallet-currencies/InputCurrencyModal'
import ActiveCurrenciesModal from '@/components/account/modals/wallet-currencies/ActiveCurrenciesModal'
import PreferredCurrencyModal from '@/components/account/modals/wallet-currencies/PreferredCurrencyModal'
import { computed, inject, onBeforeMount, onMounted, reactive, toRefs, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useStore } from 'vuex'
import { UPDATE_ACCOUNT_INFO } from '@/store/keys'
import compositionUtils from '@/compositionUtils'
import * as _ from 'lodash'

export default {
  name: 'WalletCurrencies',
  components: {
    Icon,
    JButton,
    InputCurrencyModal,
    ActiveCurrenciesModal,
    PreferredCurrencyModal
  },
  setup () {
    // Providers
    const translate = inject('translate')
    const emitter = inject('emitter')
    const toast = inject('toast')

    // Store
    const store = useStore()

    const route = useRoute()

    const { generateIconUrl } = compositionUtils()

    // State
    const state = reactive({
      selectedCoins: [],
      isSwapPreferredAltCoinID: false,
      excludedCoin: 0,
      flexibilityPercentage: 60,
      isProcessing: false
    })

    // Computed
    const accountInfo = computed(() => store.state.accountInfo)
    const inputCurrencies = computed(() => store.state.inputCurrencies)
    const altCoins = computed(() => store.state.altCoins)
    const selectedInputCurrency = computed(() => {
      if (inputCurrencies.value.length > 0 && accountInfo.value) {
        return _.find(inputCurrencies.value, {
          ShortName: accountInfo.value.PayoutCurrencyShortName
        })
      }
      return null
    })
    const selectedCoinsList = computed(() => {
      if (accountInfo.value) {
        const selectedCoins = accountInfo.value.SelectedAltCoins.split(',')
        // eslint-disable-next-line vue/no-side-effects-in-computed-properties
        state.selectedCoins = []
        altCoins.value.forEach(coin => {
          if (selectedCoins.indexOf(coin.ID.toString()) !== -1) {
            if (_.findIndex(state.selectedCoins, { ID: coin.ID }) === -1) {
              state.selectedCoins.push(coin)
            }
          }
        })
      }
      return _.orderBy(state.selectedCoins, [coin => coin.Name.toLowerCase()], 'asc')
    })
    const preferredCurrency = computed(() => {
      if (altCoins.value.length > 0 && accountInfo.value && accountInfo.value.PreferredCoinID) {
        return _.find(altCoins.value, {
          ID: Number(accountInfo.value.PreferredCoinID)
        })
      }
      return null
    })

    // Watch
    watch(() => state.isSwapPreferredAltCoinID,
      (newVal, oldVal) => {
        if (accountInfo.value && newVal !== (accountInfo.value.SWAPPreferredCoinID === '1')) {
          state.isProcessing = true
          const payload = {
            ...accountInfo.value,
            SWAPPreferredCoinID: newVal
          }
          store.dispatch(UPDATE_ACCOUNT_INFO, payload).then(response => {
            state.isProcessing = false
            if (response.status === 200) {
              // Show success toast
              toast.success('Auto swap settings updated successfully')
            }
          }).catch(error => {
            state.isProcessing = false
            toast.error(error.data.message)
          })
        }
      })

    // Methods
    // Launch input currency modals
    const launchInputCurrencyModal = () => {
      emitter.emit('inputCurrencyModal', {
        inputCurrencies: inputCurrencies.value,
        defaultCurrency: selectedInputCurrency.value
      })
    }
    // Launch active currencies modals
    const launchActiveCurrenciesModal = () => {
      emitter.emit('activeCurrenciesModal', {
        selectedAltCoins: _.cloneDeep(state.selectedCoins)
      })
    }
    // Launch preferred currency modals
    const launchPreferredCurrencyModal = () => {
      emitter.emit('preferredCurrencyModal', {
        preferredCurrency: preferredCurrency.value,
        selectedCoinsList: selectedCoinsList.value
      })
    }
    // Update excluded currency
    const updateExcludedCurrency = () => {
      if (accountInfo.value) {
        state.isProcessing = true
        const payload = {
          ...accountInfo.value,
          AltCoinFiatPayOutExcludes: state.excludedCoin
        }
        store.dispatch(UPDATE_ACCOUNT_INFO, payload).then(response => {
          state.isProcessing = false
          if (response.status === 200) {
            toast.success('Excluded coin updated successfully')
          }
        }).catch(error => {
          state.isProcessing = false
          toast.error(error.data.message)
        })
      }
    }
    // Update flexibility percentage
    const updateFlexibilityPercentage = () => {
      if (accountInfo.value) {
        state.isProcessing = true
        const payload = {
          ...accountInfo.value,
          FlexibilityPercentage: state.flexibilityPercentage
        }
        store.dispatch(UPDATE_ACCOUNT_INFO, payload).then(response => {
          state.isProcessing = false
          if (response.status === 200) {
            // Show success toast
            toast.success('Flexibility percentage updated successfully')
          }
        }).catch(error => {
          state.isProcessing = false
          toast.error(error.data.message)
        })
      }
    }

    onBeforeMount(() => {
      if (accountInfo.value) {
        state.isSwapPreferredAltCoinID = accountInfo.value.SWAPPreferredCoinID === '1'
        state.excludedCoin = parseInt(accountInfo.value.AltCoinFiatPayOutExcludes)
        state.flexibilityPercentage = accountInfo.value.FlexibilityPercentage
      }
    })

    onMounted(() => {
      if (Object.keys(route.query).length > 0) {
        if (route.query.popup && route.query.popup.toString() === 'true') {
          console.log(route.query.popup)
          launchActiveCurrenciesModal()
        }
      }
    })

    return {
      translate,
      ...toRefs(state),
      selectedInputCurrency,
      preferredCurrency,
      generateIconUrl,
      selectedCoinsList,
      launchInputCurrencyModal,
      launchActiveCurrenciesModal,
      launchPreferredCurrencyModal,
      updateExcludedCurrency,
      updateFlexibilityPercentage
    }
  }
}
</script>

<style scoped>
.toggle-bg:after {
  content: '';
  @apply absolute top-0.5 left-0.5 bg-white border border-gray-300 rounded-full h-4 w-4 transition shadow-sm;
}

input:checked + .toggle-bg:after {
  transform: translateX(100%);
  @apply border-gray-300;
}

input:checked + .toggle-bg {
  @apply bg-blue-700 border-blue-700 dark:bg-blue-500 dark:border-blue-500;
}
</style>

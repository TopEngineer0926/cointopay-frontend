<template>
  <modal :maxWidth="maxWidth" :show="show" @close="closeModal()">
    <template #title>
      <div class="flex items-center justify-between">
        <div class="flex items-center">
          <span class="mr-3">{{ translate('buy.title') }}</span>
          <img v-if="selectedBalance" :src="generateIconUrl(selectedBalance.name)" alt="" class="w-6 h-6"/>
        </div>
        <span class="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 cursor-pointer"
              @click="closeModal()">
          <icon name="close"></icon>
        </span>
      </div>
    </template>
    <template #content>
      <form v-if="form" @submit.prevent="submit">
        <div class="mb-2">
          <div class="flex items-center justify-between mb-1">
            <label>{{ translate('buy.input_currency') }}</label>
            <div class="text-red-500 text-sm">{{ showError(errorBag, 'inputCurrency') }}</div>
          </div>
          <select class="form-select w-full" v-model="form.inputCurrency">
            <option :key="index"
                    :value="inputCurrency.ShortName" v-for="(inputCurrency, index) in inputCurrencies">
              {{ inputCurrency.Name + ' ' + inputCurrency.LongName }}
            </option>
          </select>
        </div>
        <div class="mb-2" v-if="fiatValue > 0">
          {{ fiatValue + ' ' + selectedBalance.longname }} (rough estimate excl. fees)
        </div>

        <div class="mb-2">
          <div class="flex items-center justify-between mb-1">
            <label>{{ translate('buy.amount') }}</label>
            <div class="text-red-500 text-sm">{{ showError(errorBag, 'Amount') }}</div>
          </div>
          <input class="form-input w-full" type="text" v-model="form.Amount">
        </div>

        <div class="mt-4 text-right">
          <j-button :disabled="isProcessing">
            <div v-if="isProcessing" class="mr-3">
              <icon :name="'spinner'" classes="w-4 h-4 text-white"></icon>
            </div>
            <span>{{ translate('buy.button') }}</span>
          </j-button>
        </div>
      </form>
    </template>
  </modal>
</template>

<script>
import Modal from '@/components/Modal'
import Icon from '@/components/Icon'
import JButton from '@/templates/Button'
import { computed, inject, onBeforeMount, reactive, toRefs, watch } from 'vue'
import compositionUtils from '@/compositionUtils'
import validator from '@/validator'
import { useStore } from 'vuex'

export default {
  name: 'BuyModal',
  components: {
    Modal,
    Icon,
    JButton
  },
  setup () {
    // Providers
    const translate = inject('translate')
    const http = inject('http')
    const emitter = inject('emitter')
    // Store
    const store = useStore()

    const {
      generateIconUrl,
      toFixed
    } = compositionUtils()
    const {
      showError,
      validate
    } = validator()

    const state = reactive({
      show: false,
      maxWidth: '2xl',
      closeable: true,
      selectedBalance: null,
      form: null,
      fiatData: null,
      fiatValue: 0,
      errorBag: {},
      rules: {
        inputCurrency: ['required'],
        Amount: ['required', 'decimal:8']
      },
      isProcessing: false
    })
    // Computed
    const inputCurrencies = computed(() => store.state.inputCurrencies)
    const user = computed(() => store.state.user)

    // Watch
    watch(() => ({ ...state.form }),
      (newVal, oldValue) => {
        if (newVal.inputCurrency !== '' && newVal.inputCurrency !== oldValue.inputCurrency) {
          fiatLookup()
        }
        if (newVal.Amount !== '' && newVal.Amount !== oldValue.Amount) {
          if (state.fiatData) {
            state.fiatValue = toFixed((1 / state.fiatData.OutputValue) * newVal.Amount)
          }
        }
        if (Object.keys(state.errorBag).length > 0) {
          state.errorBag = validate(state.form, state.rules)
        }
      })

    // Methods
    const apiBaseUrl = process.env.VUE_APP_API_URL
    const closeModal = () => {
      state.show = false
    }
    const fiatLookup = () => {
      http.get(`${apiBaseUrl}/v2REAPI`, {
        params: {
          Call: 'Fiatlookup',
          MerchantID: user.value.ID,
          APIKey: user.value.APIKey,
          AltCoinID: state.selectedBalance.id,
          Amount: 1,
          FiatLookup: 0,
          FiatMoney: state.form.inputCurrency,
          output: 'json'
        }
      }).then(response => {
        if (response.data.length > 0) {
          state.fiatData = response.data[0]
          if (state.form.Amount > 0) {
            state.fiatValue = toFixed((1 / state.fiatData.OutputValue) * state.form.Amount)
          }
        }
      }).catch(error => {
        console.log(error)
      })
    }
    const submit = () => {
      state.errorBag = validate(state.form, state.rules)
      if (Object.keys(state.errorBag).length === 0) {
        state.isProcessing = true
        let payload = state.form
        payload = Object.assign(payload, {
          Call: 'CreateTransaction',
          MerchantID: user.value.ID,
          APIKey: user.value.APIKey,
          AltCoinID: state.selectedBalance.id,
          V2: '',
          output: 'json'
        })
        http.get(`${apiBaseUrl}/v2REAPI`, {
          params: payload
        }).then(response => {
          state.isProcessing = false
          if (response.status === 200) {
            closeModal()
            emitter.emit('buyReceiptModal', {
              responseData: response.data.message
            })
          }
        }).catch(error => {
          state.isProcessing = false
          console.log(error.response)
        })
      }
    }

    onBeforeMount(() => {
      emitter.on('buyModal', (args) => {
        state.selectedBalance = args.selectedBalance
        state.form = {
          inputCurrency: '',
          Amount: '',
          output: 'json'
        }
        // Reset
        state.errorBag = {}
        state.fiatValue = 0
        state.fiatData = null
        // Show modal
        state.show = true
      })
    })

    return {
      translate,
      generateIconUrl,
      ...toRefs(state),
      inputCurrencies,
      closeModal,
      fiatLookup,
      submit,
      showError
    }
  }
}
</script>

<style scoped></style>

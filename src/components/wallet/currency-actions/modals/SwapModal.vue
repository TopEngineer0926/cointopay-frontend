<template>
  <modal :maxWidth="maxWidth" :show="show" @close="closeModal()">
    <template #title>
      <div class="flex items-center justify-between">
        {{ translate('swap.title') }}
        <span class="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 cursor-pointer"
              @click="closeModal()">
          <icon name="close"></icon>
        </span>
      </div>
    </template>
    <template #content>
      <form @submit.prevent="submit()">
        <div class="mb-2">
          <div class="flex items-center justify-between mb-2">
            <label>{{ translate('swap.swap_to') }}</label>
            <div class="text-red-700 dark:text-red-400 text-sm mr-4">{{ showError(errorBag, 'TargetAltCoinID') }}</div>
          </div>
          <select class="form-select w-full" v-model="form.TargetAltCoinID">
            <option v-for="(altCoin, index) in altCoins"
                    :key="index" :value="altCoin.ID">{{ `${altCoin.Name} ${altCoin.LongName}` }}
            </option>
          </select>
        </div>

        <div class="mb-2">
          <div class="flex items-center justify-between mb-2">
            <label>{{ translate('swap.amount') }}</label>
            <div class="text-red-700 dark:text-red-400 text-sm mr-4">{{ showError(errorBag, 'Amount') }}</div>
          </div>
          <input type="text" v-model="form.Amount" class="form-input w-full">
        </div>

        <div class="mt-4 text-right">
          <j-button :disabled="isProcessing" type="submit">
            <div v-if="isProcessing" class="mr-3">
              <icon :name="'spinner'" classes="w-4 h-4 text-white"></icon>
            </div>
            <span>{{ translate('swap.button') }}</span>
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
import validator from '@/validator'
import compositionUtils from '@/compositionUtils'
import { useStore } from 'vuex'
import * as _ from 'lodash'

export default {
  name: 'SwapModal',
  components: {
    Modal,
    Icon,
    JButton
  },
  setup () {
    // Providers
    const translate = inject('translate')
    const emitter = inject('emitter')
    const http = inject('http')
    const toast = inject('toast')
    // Store
    const store = useStore()

    const {
      validate,
      showError
    } = validator()
    const { saveNotification } = compositionUtils()

    // State
    const state = reactive({
      show: false,
      maxWidth: '2xl',
      closeable: true,
      altCoinID: null,
      form: {
        TargetAltCoinID: '',
        Amount: '',
        output: 'json'
      },
      errorBag: {},
      rules: {
        TargetAltCoinID: ['required'],
        Amount: ['required', 'decimal:8', 'minValue:0.00000001']
      },
      messages: {
        TargetAltCoinID: {
          required: 'Please select Alt Coin'
        },
        Amount: {
          required: 'Amount is required',
          decimal: 'Please enter valid amount'
        }
      },
      isProcessing: false,
      confirmHook: () => {
      }
    })

    // Computed
    const user = computed(() => store.state.user)
    const altCoins = computed(() => {
      const altCoins = store.state.altCoins
      return _.orderBy(altCoins, [coin => coin.Name.toLowerCase()], 'asc')
    })

    // Watch
    watch(() => ({ ...state.form }),
      (newVal, oldVal) => {
        if (Object.keys(state.errorBag).length > 0) {
          state.errorBag = validate(newVal, state.rules, state.messages)
        }
      })

    // Methods
    const apiBaseUrl = process.env.VUE_APP_API_URL
    const closeModal = () => {
      state.show = false
    }
    const submit = () => {
      state.errorBag = validate(state.form, state.rules, state.messages)
      if (Object.keys(state.errorBag).length === 0) {
        state.isProcessing = true
        let payload = {
          Call: 'COIN-ON',
          MerchantID: user.value.ID,
          APIKey: user.value.APIKey,
          AltCoinID: state.form.TargetAltCoinID,
          output: 'json'
        }
        // Enable coin
        http.get(`${apiBaseUrl}/v2REAPI`, {
          params: payload
        }).then(response => {
          if (response.status === 200 && response.data.toLowerCase() === 'ok') {
            payload = state.form
            payload = Object.assign(payload, {
              Call: 'SWAP',
              MerchantID: user.value.ID,
              APIKey: user.value.APIKey,
              AltCoinID: state.altCoinID,
              V2: ''
            })
            http.get(`${apiBaseUrl}/v2REAPI`, {
              params: payload
            }).then(response => {
              state.isProcessing = false
              if (response.status === 200 && response.data.result === 'success') {
                state.confirmHook()
                toast.success(response.data.message)
                closeModal()
              } else {
                toast.error(response.data.message)
              }
              saveNotification(response.data.message)
            }).catch(error => {
              state.isProcessing = false
              console.log(error.response)
            })
          }
        }).catch(error => {
          state.isProcessing = false
          console.log(error)
        })
      }
    }

    onBeforeMount(() => {
      emitter.on('swapModal', (args) => {
        state.altCoinID = args.altCoinID
        state.confirmHook = args.confirm
        // Reset
        state.form = {
          TargetAltCoinID: '',
          Amount: args.amount,
          output: 'json'
        }
        state.errorBag = {}
        // Show modal
        state.show = true
      })
    })

    return {
      translate,
      ...toRefs(state),
      altCoins,
      closeModal,
      showError,
      submit
    }
  }
}
</script>

<style scoped></style>

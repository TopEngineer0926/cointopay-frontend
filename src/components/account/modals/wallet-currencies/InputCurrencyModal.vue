<template>
  <modal :maxWidth="maxWidth" :show="show" @close="closeModal()">
    <template #title>
      <div class="flex items-center justify-between">
        <span class="capitalize">{{ translate('account.wallet.choose') }}</span>
        <span class="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 cursor-pointer"
              @click="closeModal()">
          <icon name="close"></icon>
        </span>
      </div>
    </template>
    <template #content>
      <form @submit.prevent="submit()">
        <div class="mb-2">
          <div class="flex items-center justify-between mb-1">
            <label>{{ translate('account.wallet.default_title') }}</label>
            <div class="text-blue-500 text-sm">{{ showError(errorBag, 'inputCurrency') }}</div>
          </div>
          <select class="form-select w-full" v-model="form.inputCurrency">
            <option :key="index" :value="currency.ShortName" v-for="(currency, index) in inputCurrencies">
              {{ `${currency.Name} ${currency.LongName}` }}
            </option>
          </select>
        </div>
        <div class="mt-4 text-right">
          <j-button :disabled="isProcessing">
            <div v-if="isProcessing" class="mr-3">
              <icon :name="'spinner'" classes="w-4 h-4 text-white"></icon>
            </div>
            <span>{{ translate('account.button_update') }}</span>
          </j-button>
        </div>
      </form>
    </template>
  </modal>
</template>

<script>
import Modal from '@/components/Modal'
import JButton from '@/templates/Button'
import Icon from '@/components/Icon'
import { computed, inject, onBeforeMount, reactive, toRefs } from 'vue'
import validator from '@/validator'
import { useStore } from 'vuex'
import { SAVE_TICKETS, UPDATE_ACCOUNT_INFO } from '@/store/keys'
import compositionUtils from '@/compositionUtils'
import * as _ from 'lodash'

export default {
  name: 'InputCurrencyModal',
  components: {
    Modal,
    JButton,
    Icon
  },
  setup () {
    // Providers
    const translate = inject('translate')
    const emitter = inject('emitter')
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
      inputCurrencies: [],
      defaultCurrency: null,
      form: {
        inputCurrency: ''
      },
      errorBag: {},
      rules: {
        inputCurrency: ['required']
      },
      isProcessing: false
    })

    // Computed
    const accountInfo = computed(() => store.state.accountInfo)
    const altCoins = computed(() => store.state.altCoins)
    const pos = computed(() => store.state.pos)
    const posCalls = computed(() => store.state.posCalls)

    // Methods
    const closeModal = () => {
      state.show = false
    }

    const updatePOSTickets = (inputCurrency) => {
      let tickets = pos.value.tickets
      if (tickets.length > 0) {
        const currency = _.find(altCoins.value, { ShortName: inputCurrency })
        if (currency) {
          inputCurrency = currency.LongName
        }
        tickets = tickets.map(ticket => {
          if (ticket.status.toLowerCase() !== 'paid') {
            const products = ticket.ticketProducts.map(product => {
              return {
                ...product,
                currency: inputCurrency
              }
            })
            const isUpdated = ticket.inputCurrency !== inputCurrency
            return {
              ...ticket,
              ticketProducts: products,
              inputCurrency: inputCurrency,
              paymentRequest: isUpdated ? null : ticket.paymentRequest,
              status: isUpdated ? 'waiting' : ticket.status
            }
          }
          return ticket
        })
        store.dispatch(SAVE_TICKETS, {
          call: posCalls.value.tickets,
          data: tickets
        })
      }
    }

    const submit = () => {
      state.errorBag = validate(state.form, state.rules)
      if (Object.keys(state.errorBag).length === 0) {
        if (accountInfo.value) {
          state.isProcessing = true
          const payload = {
            ...accountInfo.value,
            PayoutCurrencyShortName: state.form.inputCurrency
          }
          store.dispatch(UPDATE_ACCOUNT_INFO, payload).then(response => {
            state.isProcessing = false
            if (response.status === 200) {
              // Show success toast
              toast.success('Default input currency updated successfully')
              saveNotification('Default input currency updated successfully')
              // Update tickets
              updatePOSTickets(state.form.inputCurrency)
              closeModal()
            }
          }).catch(error => {
            state.isProcessing = false
            toast.error(error.data.message)
            saveNotification(error.data.message)
          })
        }
      }
    }

    onBeforeMount(() => {
      emitter.on('inputCurrencyModal', (args) => {
        state.inputCurrencies = args.inputCurrencies
        state.form.inputCurrency = args.defaultCurrency.ShortName
        state.show = true
      })
    })

    return {
      translate,
      ...toRefs(state),
      closeModal,
      showError,
      submit
    }
  }
}
</script>

<style scoped></style>

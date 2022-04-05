<template>
  <modal :maxWidth="maxWidth" :show="show" @close="closeModal()">
    <template #title>
      <div class="flex items-center justify-between">
        <div class="flex items-center">
          <span class="mr-3">{{ translate('payout.title') + ' - ' + selectedCoin.LongName }}</span>
        </div>
        <span class="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 cursor-pointer"
              @click="closeModal()">
          <icon name="close"></icon>
        </span>
      </div>
    </template>
    <template #content>
      <form v-if="form" @submit.prevent="submit()">
        <div class="mb-2">
          <div class="flex items-center justify-between mb-1">
            <label>{{ translate('payout.amount') }}</label>
            <div class="flex">
              <div class="text-red-500 text-sm mr-3">{{ showError(errorBag, 'Amount') }}</div>
              <span v-if="selectedBalance.balance > 0.00000001" class="cursor-pointer text-sm"
                    @click="payoutAllBalance()">Payout all balance</span>
            </div>
          </div>

          <div v-if="fiatValue" class="flex items-center mb-3">
            <input v-model="fiatAmount" class="form-input w-full mr-3" type="text" @keyup="updateAmount()"/>
            {{ fiatCurrency }}
          </div>

          <div class="flex items-center">
            <input v-model="form.amount" class="form-input w-full mr-3" type="text" @keyup="updateFiatAmount()">
            {{ selectedCoin.LongName }}
          </div>
        </div>

        <div class="mb-2">
          <label class="block mb-2 font-semibold">Payout Information</label>
          <div v-if="!selectedAddress">
            Payout Schema: {{ accountInfo.PayoutSchema }}
            <div v-if="schemaType === 'paypal' || schemaType === 'payeer'">
              <p>Email: {{ accountInfo.PayoutTo }}</p>
            </div>
            <div v-if="schemaType === 'bank'">
              <p>Account Holder Name: {{ accountInfo.PayoutName }}</p>
              <p>IBAN/Account Number: {{ accountInfo.PayoutIBAN }}</p>
              <p>BIC/Swift Code: {{ accountInfo.PayoutBIC }}</p>
            </div>
          </div>
          <div v-if="selectedAddress !== null" class="flex items-start">
            <div class="flex-1 mr-3">
              <p v-for="(item, key) in selectedAddress" :key="key">{{ format(key) + ': ' + item }}</p>
            </div>
            <div>
              <j-button buttonStyle="danger" type="button" @click="removeSelectedAddress()">
                {{ translate('payout.remove') }}
              </j-button>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4 mt-4">
          <div class="col-span-1">
            <j-button :disabled="isProcessing" type="button" @click="launchTransferWiseModal">
              {{ translate('payout.address_book') }}
            </j-button>
          </div>
          <div class="col-span-1">
            <div class="flex items-center justify-end">
              <span class="mr-2 cursor-pointer" v-tippy="{content: translate('account.payout.bank_verification_message')}">
                <icon name="exclamation-circle" classes="w-6 h-6 text-yellow-500"></icon>
              </span>
              <j-button :disabled="isProcessing || !isPayoutPossible">{{ translate('payout.button') }}</j-button>
            </div>
          </div>
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
import { FETCH_ADDRESS_BOOK } from '@/store/keys'
import { useStore } from 'vuex'
import * as _ from 'lodash'

export default {
  name: 'BankPayoutModal',
  components: {
    Modal,
    Icon,
    JButton
  },
  setup () {
    // Providers
    const translate = inject('translate')
    const http = inject('http')
    const toast = inject('toast')
    const emitter = inject('emitter')
    // Store
    const store = useStore()

    const {
      showError,
      validate
    } = validator()

    const {
      saveNotification,
      toFixed
    } = compositionUtils()

    const state = reactive({
      show: false,
      maxWidth: '2xl',
      closeable: true,
      selectedBalance: null,
      form: null,
      errorBag: {},
      rules: null,
      selectedAddress: null,
      selectedCoin: null,
      fiatValue: 0,
      fiatAmount: null,
      confirmHook: () => {
      },
      isProcessing: false
    })

    // Computed
    const user = computed(() => store.state.user)
    const inputCurrencies = computed(() => store.state.inputCurrencies)
    const addressesList = computed(() => store.state.addressBook)
    const schemaType = computed(() => {
      if (store.state.accountInfo) {
        const payoutSchema = store.state.accountInfo.PayoutSchema
        if (payoutSchema === 'Keep with Cointopay') {
          return ''
        }
        const banks = ['Pay out EUR Bank', 'Pay out USD Bank', 'Pay out GBP Bank']
        let type = ''
        if (banks.indexOf(payoutSchema) !== -1) {
          type = 'bank'
        } else if (payoutSchema === 'Payout Payeer') {
          type = 'payeer'
        } else if (payoutSchema === 'Payout Paypal') {
          type = 'paypal'
        } else if (payoutSchema === 'Pay out to bank address book default') {
          type = 'address-book-bank'
        } else if (payoutSchema === 'Pay out to crypto address book default') {
          type = 'address-book-crypto'
        }
        return type
      }
      return null
    })
    const fiatCurrency = computed(() => {
      let currencySymbol = state.selectedBalance.fiat
      if (inputCurrencies.value) {
        const currency = _.find(inputCurrencies.value, { ShortName: currencySymbol })
        if (currency) {
          currencySymbol = currency.LongName
        }
      }
      return currencySymbol
    })
    const isPayoutPossible = computed(() => {
      const schema = schemaType.value
      let isAvailable = false
      switch (schema) {
        case 'address-book-bank':
          isAvailable = state.selectedAddress !== null && Object.keys(state.selectedAddress).length > 0
          break
        case 'bank':
          isAvailable = store.state.accountInfo.PayoutIBAN !== ''
          break
        case 'paypal':
        case 'payeer':
          isAvailable = store.state.accountInfo.PayoutTo !== '' && (/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(store.state.accountInfo.PayoutTo))
          break
      }
      if (state.selectedAddress !== null && isAvailable === false) {
        return true
      }
      return isAvailable
    })

    // Watch
    watch(() => ({ ...addressesList.value }),
      (newValue, oldValue) => {
        if (schemaType.value === 'address-book-bank') {
          getDefaultAddress()
        } else {
          state.selectedAddress = null
        }
      })

    // Methods
    const apiBaseUrl = process.env.VUE_APP_API_URL
    const closeModal = () => {
      state.show = false
    }
    const fiatLookup = (amount) => {
      if (amount) {
        const defaultPreferredCurrency = state.selectedBalance.fiat ? state.selectedBalance.fiat : 'EUR'
        http.get(`${apiBaseUrl}/v2REAPI`, {
          params: {
            Call: 'Fiatlookup',
            MerchantID: user.value.ID,
            APIKey: user.value.APIKey,
            AltCoinID: state.selectedBalance.id,
            Amount: amount,
            FiatLookup: 1,
            FiatMoney: defaultPreferredCurrency,
            output: 'json'
          }
        }).then(response => {
          if (response.data && response.data.length > 0) {
            state.fiatValue = response.data[0].OutputValue
          }
        }).catch(error => {
          console.log(error)
        })
      }
    }
    const getDefaultAddress = () => {
      Object.keys(addressesList.value.transferwise).forEach(currency => {
        const selectedAddr = _.find(addressesList.value.transferwise[currency], { default: true })
        if (selectedAddr) {
          let obj = {
            targetCurrency: selectedAddr.currency,
            accountHolderName: selectedAddr.accountHolderName,
            legalType: selectedAddr.legalType ? selectedAddr.legalType : selectedAddr.details.legalType,
            targetLegalType: selectedAddr.targetLegalType
          }
          if (selectedAddr.details.accountType) {
            obj = Object.assign(obj, {
              accountType: selectedAddr.details.accountType
            })
          }
          let currenciesConfig = JSON.stringify(store.state.config)
          currenciesConfig = JSON.parse(currenciesConfig)
          const config = _.find(currenciesConfig, { currency: currency })
          const required = config.required.split(',')
          required.forEach(param => {
            const value = (selectedAddr.details[param])
              ? selectedAddr.details[param] : selectedAddr.details.address[param]
            obj = Object.assign(obj, { [param]: value })
          })
          state.selectedAddress = obj
        }
      })
    }

    const payoutAllBalance = () => {
      state.form.amount = toFixed(state.selectedBalance.balance)
      updateFiatAmount()
    }

    const updateAmount = () => {
      if (state.fiatAmount && state.fiatAmount > 0) {
        state.form.amount = toFixed(state.fiatValue * state.fiatAmount)
      } else {
        state.form.amount = ''
      }
    }

    const updateFiatAmount = () => {
      if (state.form) {
        if (state.form.amount > 0 && state.form.amount !== '') {
          state.fiatAmount = toFixed((1 / state.fiatValue) * state.form.amount)
        } else {
          state.fiatAmount = null
        }
      }
    }

    const format = (key) => {
      const labels = {
        targetCurrency: 'Target currency',
        accountHolderName: 'Account holder name',
        legalType: 'Legal type from',
        targetLegalType: 'Legal type to',
        taxId: 'Tax ID',
        accountNumber: 'Account number',
        bsbCode: 'Bsb code',
        ifscCode: 'IFSC code',
        country: 'Country',
        city: 'City',
        postalCode: 'Postal code',
        firstLine: 'Address',
        abartn: 'Routing number',
        bankCode: 'Bank code',
        branchCode: 'Branch code',
        phoneNumber: 'Phone number',
        institutionNumber: 'Institution no.',
        transitNumber: 'Transit no.',
        rut: 'Rut number',
        cardNumber: 'Card number',
        prefix: 'Prefix',
        sortCode: 'Sort code',
        clabe: 'Clabe',
        cpf: 'Tax registration number (CPF)',
        swiftCode: 'Swift code',
        idDocumentType: 'ID document type',
        idDocumentNumber: 'ID document type'
      }
      return (labels[key]) ? labels[key] : key
    }

    const removeSelectedAddress = () => {
      state.selectedAddress = null
      if (schemaType.value === 'address-book-bank') {
        getDefaultAddress()
      }
    }

    const submit = () => {
      state.errorBag = validate(state.form, state.rules)
      if (Object.keys(state.errorBag).length === 0) {
        state.isProcessing = true
        let payload = {
          Call: 'FiatPayout',
          MerchantID: user.value.ID,
          APIKey: user.value.APIKey,
          AltCoinID: state.selectedBalance.id,
          Amount: state.form.amount,
          output: 'json'
        }
        if (state.selectedAddress != null) {
          payload = Object.assign(payload, state.selectedAddress)
        } else if (schemaType.value === 'bank') {
          payload = Object.assign(payload, {
            accountHolderName: store.state.accountInfo.PayoutName,
            accountNumber: store.state.accountInfo.PayoutIBAN,
            bankCode: store.state.accountInfo.PayoutBIC
          })
        }
        http.get(`${apiBaseUrl}/v2REAPI`, {
          params: payload
        }).then(response => {
          if (response.status === 200) {
            state.isProcessing = false
            if (typeof response.data === 'string') {
              let msg = ''
              if (response.data.toLowerCase() === 'ok') {
                state.selectedAddress = null
                msg = response.data.replace(/^\w/, c => c.toUpperCase())
                toast.success(msg)
                state.confirmHook(state.selectedBalance.id)
                closeModal()
              } else {
                msg = response.data.replace(/^\w/, c => c.toUpperCase())
                toast.error(msg)
              }
              saveNotification(msg)
            }
          }
        }).catch(error => {
          state.isProcessing = false
          console.log(error.response)
        })
      }
    }

    const launchTransferWiseModal = () => {
      emitter.emit('transferwiseModal', {
        addresses: addressesList.value,
        confirm: (address) => {
          if (address) {
            state.selectedAddress = address
          }
        }
      })
    }

    onBeforeMount(() => {
      emitter.on('bankPayoutModal', (args) => {
        state.selectedBalance = args.selectedBalance
        state.selectedCoin = args.selectedCoin
        state.confirmHook = args.confirm
        state.form = {
          amount: ''
        }
        state.rules = {
          amount: ['required', 'decimal:8', 'minValue:0.00000001', 'maxValue:' + state.selectedBalance.balance]
        }
        store.dispatch(FETCH_ADDRESS_BOOK)
        fiatLookup(1)
        // Reset
        state.errorBag = {}
        state.fiatValue = 0
        state.fiatAmount = null
        // Show modal
        state.show = true
      })
    })

    return {
      translate,
      ...toRefs(state),
      fiatCurrency,
      isPayoutPossible,
      accountInfo: store.state.accountInfo,
      schemaType,
      closeModal,
      showError,
      payoutAllBalance,
      updateAmount,
      updateFiatAmount,
      format,
      removeSelectedAddress,
      submit,
      launchTransferWiseModal
    }
  }
}
</script>

<style scoped></style>

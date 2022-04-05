<template>
  <div class="card">
    <div class="flex items-center justify-between title">
      <h5>{{ translate('account.payout.payout') }}</h5>
      <span class="cursor-pointer" v-tippy="{content: translate('account.payout.payout_message') }">
      <icon name="question-mark" classes="w-6 h-6 text-yellow-500"></icon>
      </span>
    </div>
    <hr class="border-gray-300 dark:border-gray-600"/>
    <div class="body">
      <form @submit.prevent="submit()">
        <div class="mb-2 grid grid-cols-3 gap-1 md:gap-4">
          <label class="col-span-3 md:col-span-1">
            {{ translate('account.payout.payout') }}
            <span class="ml-1 text-red-500">*</span>
          </label>
          <div class="col-span-3 md:col-span-2">
            <div class="flex items-center justify-between">
              <select class="form-select w-full" v-model="form.payoutSchema">
                <option :key="index" :value="index"
                        v-for="(option, index) in payoutOptions">{{ option }}
                </option>
              </select>
              <span class="ml-2 cursor-pointer"
                    v-tippy="{content: translate('account.payout.bank_verification_message')}">
                <icon name="exclamation-circle" classes="w-6 h-6 text-yellow-500"></icon>
              </span>
            </div>
            <div class="text-blue-500 text-sm">{{ showError(errorBag, 'locale') }}</div>
          </div>
        </div>

        <div class="mb-2 grid grid-cols-3 gap-1 md:gap-4" v-if="form.payoutSchema === 'Payout Paypal'">
          <label class="col-span-3 md:col-span-1">{{ translate('account.payout.option') }}</label>
          <div class="col-span-3 md:col-span-2">
            <input class="form-input w-full" type="email" v-model="form.payoutTo">
          </div>
        </div>

        <div class="mb-2 grid grid-cols-3 gap-1 md:gap-4" v-if="form.payoutSchema === 'Payout Payeer'">
          <label class="col-span-3 md:col-span-1">Payout account</label>
          <div class="col-span-3 md:col-span-2">
            <input class="form-input w-full" type="text" v-model="form.payoutTo">
          </div>
        </div>

        <div v-if="isFiatCurrency">
          <div class="mb-2 grid grid-cols-1 md:grid-cols-3 gap-1 md:gap-4">
            <div class="col-span-3 md:col-span-1"></div>
            <div class="col-span-3 md:col-span-2">
              <h2 class="text-center font-semibold text-lg mb-2">{{ translate('account.payout.bank') }}</h2>
            </div>
          </div>

          <div class="mb-2 grid grid-cols-3 gap-1 md:gap-4">
            <label class="col-span-3 md:col-span-1">
              {{ translate('account.payout.bank_name') }}
              <span class="ml-1 text-red-500">*</span>
            </label>
            <div class="col-span-3 md:col-span-2">
              <input class="form-input w-full" type="text" v-model="form.payoutName"/>
              <div class="text-blue-500 text-sm">{{ showError(errorBag, 'locale') }}</div>
            </div>
          </div>

          <div class="mb-2 grid grid-cols-3 gap-1 md:gap-4">
            <label class="col-span-3 md:col-span-1">
              {{ translate('account.payout.iban') }}
              <span class="ml-1 text-red-500">*</span>
            </label>
            <div class="col-span-3 md:col-span-2">
              <input class="form-input w-full" type="text" v-model="form.payoutIBAN"/>
              <div class="text-blue-500 text-sm">{{ showError(errorBag, 'locale') }}</div>
            </div>
          </div>

          <div class="mb-2 grid grid-cols-3 gap-1 md:gap-4">
            <label class="col-span-3 md:col-span-1">
              {{ translate('account.payout.bank_bic') }}
              <span class="ml-1 text-red-500">*</span>
            </label>
            <div class="col-span-3 md:col-span-2">
              <input class="form-input w-full" type="text" v-model="form.payoutBIC"/>
              <div class="text-blue-500 text-sm">{{ showError(errorBag, 'locale') }}</div>
            </div>
          </div>
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
    </div>
  </div>
  <!-- Bank Address Book -->
  <div class="card" v-if="form.payoutSchema === 'Pay out to bank address book default'">
    <div class="title">
      <h5>{{ translate('account.payout.address_book') }}</h5>
    </div>
    <hr class="border-gray-300 dark:border-gray-600"/>
    <div class="body text-center">
      <j-button buttonStyle="warning" type="button" @click="launchTransferWiseModal">
        {{ translate('account.payout.address_book') }}
      </j-button>
    </div>
  </div>
  <!-- Crypto Address Book -->
  <div class="card" v-if="form.payoutSchema === 'Pay out to crypto address book default'">
    <div class="title">
      <h5>{{ translate('account.payout.crypto_address_book') }}</h5>
    </div>
    <hr class="border-gray-300 dark:border-gray-600"/>
    <div class="body text-center">
      <j-button buttonStyle="warning" type="button" @click="launchCryptoAddressBookModal">
        {{ translate('account.payout.crypto_address_book') }}
      </j-button>
    </div>
  </div>
  <!-- Crypto Address Book Modal -->
  <crypto-address-book-modal></crypto-address-book-modal>
  <!-- Bank Address Book Modal -->
  <transfer-wise-modal></transfer-wise-modal>
</template>

<script>
import JButton from '@/templates/Button'
import Icon from '@/components/Icon'
import TransferWiseModal from '@/components/wallet/currency-actions/modals/TransferWiseModal'
import CryptoAddressBookModal from '@/components/account/modals/CryptoAddressBookModal'
import { computed, inject, onBeforeMount, reactive, toRefs } from 'vue'
import validator from '@/validator'
import { useStore } from 'vuex'
import { FETCH_ADDRESS_BOOK, UPDATE_ACCOUNT_INFO } from '@/store/keys'
import compositionUtils from '@/compositionUtils'
import * as _ from 'lodash'

export default {
  name: 'PayoutSettings',
  components: {
    JButton,
    Icon,
    TransferWiseModal,
    CryptoAddressBookModal
  },
  setup () {
    // Providers
    const translate = inject('translate')
    const http = inject('http')
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
      payoutOptions: {
        'Keep with Cointopay': 'Keep with Cointopay',
        'Pay out EUR Bank': 'Pay out EUR Bank',
        'Pay out USD Bank': 'Pay out USD Bank',
        'Pay out GBP Bank': 'Pay out GBP Bank',
        'Wallet Cointopay': 'Wallet Cointopay',
        'Payout Paypal': 'Payout Paypal',
        'Payout Payeer': 'Payout Payeer',
        'Pay out to bank address book default': 'Pay out to bank address book default',
        'Pay out to crypto address book default': 'Pay out to crypto address book default'
      },
      form: {
        payoutSchema: '',
        payoutTo: '',
        payoutName: '',
        payoutIBAN: '',
        payoutBIC: ''
      },
      errorBag: {},
      rules: {
        payoutSchema: ['required'],
        payoutName: [
          'required',
          'regex:/^[A-Za-z .,0-9]{3,}$/'
        ],
        payoutIBAN: [
          'required',
          'regex:/^[A-Za-z .,0-9]+$/'
        ],
        payoutBIC: ['required']
      },
      messages: {
        payoutSchema: {
          required: 'Please select payout schema'
        },
        payoutName: {
          required: 'Name on bank account is required',
          regex: 'Please provide a valid account name'
        },
        payoutIBAN: {
          required: 'IBAN is required',
          email: 'Please provide a valid IBAN'
        },
        payoutBIC: {
          required: 'BIC/Swift code is required'
        }
      },
      isProcessing: false
    })
    // Computed
    const user = computed(() => store.state.user)
    const accountInfo = computed(() => store.state.accountInfo)
    const isFiatCurrency = computed(() => {
      return ['Pay out EUR Bank', 'Pay out USD Bank', 'Pay out GBP Bank'].indexOf(state.form.payoutSchema) !== -1
    })
    const addressesList = computed(() => store.state.addressBook)

    // Methods
    const apiBaseUrl = process.env.VUE_APP_API_URL
    const saveAddressToAddressBook = (data) => {
      let addressPayload
      let currency
      switch (data.payoutSchema) {
        case 'Pay out EUR Bank':
          currency = 'EUR'
          addressPayload = {
            accountHolderName: data.payoutName,
            currency: 'EUR',
            default: true,
            details: {
              IBAN: data.payoutIBAN,
              legalType: 'BUSINESS'
            },
            targetLegalType: 'PRIVATE',
            type: 'iban'
          }
          break
        case 'Pay out USD Bank':
          currency = 'USD'
          addressPayload = {
            accountHolderName: data.payoutName,
            currency: 'USD',
            default: true,
            details: {
              accountNumber: data.payoutIBAN,
              legalType: 'BUSINESS',
              abartn: data.payoutBIC,
              accountType: 'CHECKING',
              address: {
                city: accountInfo.value.PayoutCity,
                country: accountInfo.value.PayoutCountry,
                firstLine: accountInfo.value.PayoutAddress,
                postCode: accountInfo.value.PayoutPostalCode,
                state: accountInfo.value.PayoutState
              }
            },
            targetLegalType: 'PRIVATE',
            type: 'aba'
          }
          break
        case 'Pay out GBP Bank':
          currency = 'GBP'
          addressPayload = {
            accountHolderName: data.payoutName,
            currency: 'GBP',
            default: true,
            details: {
              accountNumber: data.payoutIBAN,
              legalType: 'BUSINESS',
              sortCode: data.payoutBIC
            },
            targetLegalType: 'PRIVATE',
            type: 'sort_code'
          }
          break
      }
      const addresses = _.cloneDeep(addressesList.value)
      const action = Object.keys(addresses.crypto).length > 0 || Object.keys(addresses.transferwise).length > 0
        ? 'UPDATE' : 'INSERT'
      if (typeof addresses.transferwise[currency] === 'undefined') {
        addresses.transferwise[currency] = []
      }
      let keyFound = false
      let isAddressFound = false
      _.forEach(addresses.transferwise, (addrs, key) => {
        _.forEach(addrs, (addr, i) => {
          if (key === 'GBP' || key === 'USD') {
            keyFound = true
            if (addr.details.accountNumber === addressPayload.details.accountNumber) {
              addrs[i] = addressPayload
              isAddressFound = true
            } else {
              addr.default = false
            }
          } else if (key === 'EUR') {
            keyFound = true
            if (addr.details.IBAN === addressPayload.details.IBAN) {
              addrs[i] = addressPayload
              isAddressFound = true
            } else {
              addr.default = false
            }
          } else {
            addr.default = false
          }
        })
      })
      // check if exists
      if (!keyFound) {
        addresses.transferwise[currency].push(addressPayload)
      } else {
        if (!isAddressFound) {
          addresses.transferwise[currency].push(addressPayload)
        }
      }
      const fd = new FormData()
      fd.append('Call', action)
      fd.append('KeyData', 'AddressBook_' + user.value.ID)
      fd.append('ValueData', JSON.stringify(addresses))
      fd.append('MerchantID', user.value.ID)
      fd.append('APIKey', user.value.APIKey)
      fd.append('output', 'json')
      http.post(`${apiBaseUrl}/MarketAPI?POSDATA`, fd, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }).then(response => {
        store.dispatch(FETCH_ADDRESS_BOOK)
      }).catch(error => {
        console.log(error.response)
      })
    }
    const submit = () => {
      state.errorBag = validate(state.form, state.rules, state.messages)
      if (Object.keys(state.errorBag).length === 0) {
        if (accountInfo.value) {
          state.isProcessing = true
          const payload = {
            ...accountInfo.value,
            PayoutSchema: state.form.payoutSchema,
            PayoutTo: state.form.payoutTo,
            PayoutName: state.form.payoutName,
            PayoutIBAN: state.form.payoutIBAN,
            PayoutBIC: state.form.payoutBIC
          }
          store.dispatch(UPDATE_ACCOUNT_INFO, payload).then(response => {
            if (response.status === 200) {
              state.isProcessing = false
              if (isFiatCurrency.value) {
                saveAddressToAddressBook(state.form)
              }
              // Show success toast
              toast.success('Payout settings updated successfully')
              saveNotification('Payout settings updated successfully')
            }
          }).catch(error => {
            state.isProcessing = false
            toast.error(error.data.message)
            saveNotification(error.data.message)
          })
        }
      }
    }
    const launchTransferWiseModal = () => {
      emitter.emit('transferwiseModal', {
        addresses: addressesList.value,
        setDefault: true,
        confirm: (address) => {
        }
      })
    }
    const launchCryptoAddressBookModal = () => {
      emitter.emit('cryptoAddressBookAccountModal', {
        addresses: addressesList.value
      })
    }

    onBeforeMount(() => {
      state.form = {
        payoutSchema: accountInfo.value.PayoutSchema,
        payoutTo: accountInfo.value.PayoutTo,
        payoutName: accountInfo.value.PayoutName,
        payoutIBAN: accountInfo.value.PayoutIBAN,
        payoutBIC: accountInfo.value.PayoutBIC
      }
      store.dispatch(FETCH_ADDRESS_BOOK)
    })

    return {
      translate,
      ...toRefs(state),
      showError,
      isFiatCurrency,
      submit,
      launchTransferWiseModal,
      launchCryptoAddressBookModal
    }
  }
}
</script>

<style scoped></style>

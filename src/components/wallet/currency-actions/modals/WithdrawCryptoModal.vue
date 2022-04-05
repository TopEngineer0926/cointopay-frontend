<template>
  <modal :maxWidth="maxWidth" :show="show" @close="closeModal()">
    <template #title>
      <div class="flex items-center justify-between">
        {{ translate('send.title') }}
        <span class="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 cursor-pointer"
              @click="closeModal()">
          <icon name="close"></icon>
        </span>
      </div>
    </template>
    <template #content>
      <div class="flex flex-basis items-center justify-between mb-2">
        <j-button @click="isScanner = true; isUpload = false">{{ translate('send.scan') }}</j-button>
        <j-button @click="isScanner = false; isUpload = true">{{ translate('send.upload') }}</j-button>
      </div>
      <div v-if="isScanner || isUpload" class="mb-4 flex items-start">
        <div class="flex-1 text-center border rounded bg-gray-50 dark:bg-gray-700 dark:border-gray-700 p-4">
          <div v-if="isScanner" class="w-72 h-48 mx-auto">
            <qrcode-stream @decode="onDecode" @init="onInit">
              <div v-if="loading" class="h-48 bg-gray-200 dark:bg-gray-900 flex items-center justify-center">
                <icon name="spinner" classes="w-12 h-12 text-gray-800 dark:text-gray-400"></icon>
              </div>
            </qrcode-stream>
          </div>
          <div v-if="isUpload">
            <qrcode-capture @decode="onDecode"/>
          </div>
        </div>
        <div class="text-right ml-3">
          <j-button buttonStyle="default" @click="isScanner = false; isUpload = false">
            <icon classes="w-5 h-5" name="close"></icon>
          </j-button>
        </div>
      </div>
      <form @submit.prevent="submit">
        <div class="mb-2">
          <div class="flex items-center justify-between mb-1">
            <label>{{ translate('send.amount') }}</label>
            <div class="flex items-center">
              <div class="text-red-500 text-sm mr-4">{{ showError(errorBag, 'amount') }}</div>
              <span class="cursor-pointer text-sm font-bold capitalize"
                    @click="selectAllBalance">Withdraw all crypto</span>
            </div>
          </div>
          <input v-model="form.amount" aria-label="" class="form-input w-full" type="text" @keyup="updateFiat()"/>
        </div>
        <div v-if="fiatData" class="mb-2 flex items-center">
          <input v-model="fiatValue" aria-label="" class="form-input mr-2" type="text"
                 @keyup="updateAmount()"/>
          <span class="mr-2">{{ defaultPreferredCurrency }}</span>
          <select v-model="form.Fee" aria-label="" class="form-select">
            <option value="2">Pay less can take more time</option>
            <option value="0">Use standard fees</option>
            <option value="1">Pay more for faster transfer</option>
          </select>
        </div>
        <div class="mb-2">
          <div class="flex items-center justify-between mb-1">
            <label>{{ translate('send.coin_address') }}</label>
            <div class="text-red-500 text-sm">{{ showError(errorBag, 'address') }}</div>
          </div>
          <input v-model="form.address" aria-label="" class="form-input w-full" type="text"/>
        </div>
        <div class="mb-2">
          <div class="flex items-center justify-between mb-1">
            <label>{{ translate('receive.reference') }}</label>
          </div>
          <input v-model="form.CustomerReferenceNr" aria-label="" class="form-input w-full" type="text"/>
        </div>
        <div class="mt-4">
          <div class="flex items-center justify-between">
            <j-button type="button" @click="launchCryptoAddressBookModal">
              {{ translate('send.address_book') }}
            </j-button>
            <j-button :disabled="isProcessing">
              <div v-if="isProcessing" class="mr-3">
                <icon :name="'spinner'" classes="w-4 h-4 text-white"></icon>
              </div>
              <span>{{ translate('send.button') }}</span>
            </j-button>
          </div>
        </div>
      </form>
    </template>
  </modal>
</template>

<script>
import { QrcodeCapture, QrcodeStream } from 'vue3-qrcode-reader'
import Modal from '@/components/Modal'
import Icon from '@/components/Icon'
import JButton from '@/templates/Button'
import { useStore } from 'vuex'
import * as _ from 'lodash'
import { computed, inject, onBeforeMount, reactive, toRefs, watch } from 'vue'
import validator from '@/validator'
import compositionUtils from '@/compositionUtils'

export default {
  name: 'WithdrawCryptoModal',
  components: {
    Modal,
    Icon,
    JButton,
    QrcodeStream,
    QrcodeCapture
  },
  emits: ['switchCurrency'],
  setup (props, { emit }) {
    // Providers
    const translate = inject('translate')
    const emitter = inject('emitter')
    const http = inject('http')
    const toast = inject('toast')

    // Store
    const store = useStore()

    const {
      showError,
      validate
    } = validator()

    const {
      saveNotification,
      toFixed,
      isValidUrl
    } = compositionUtils()

    // State
    const state = reactive({
      show: false,
      maxWidth: '2xl',
      closeable: true,
      isProcessing: false,
      selectedBalance: null,
      selectedCoin: null,
      balanceList: [],
      defaultPreferredCurrency: 'EUR',
      form: {
        amount: '',
        Fee: 0,
        address: '',
        CustomerReferenceNr: '',
        tag: ''
      },
      rules: null,
      errorBag: {},
      fiatData: null,
      fiatValue: 0,
      isScanner: false,
      isUpload: false,
      decodedContent: '',
      loading: false
    })

    // Computed
    const user = computed(() => store.state.user)
    const accountInfo = computed(() => store.state.accountInfo)

    // Watch
    watch(() => ({ ...state.form }),
      (newVal, oldVal) => {
        if (Object.keys(state.errorBag).length > 0) {
          state.errorBag = validate(newVal, state.rules)
        }
      })

    // Methods
    const apiBaseUrl = process.env.VUE_APP_API_URL
    const closeModal = () => {
      state.show = false
    }
    const selectAllBalance = () => {
      state.form.amount = toFixed(state.selectedBalance.balance)
      updateFiat()
    }
    const updateFiat = () => {
      state.fiatValue = state.form.amount > 0 && state.fiatData ? toFixed(state.fiatData.OutputValue * state.form.amount) : 0
    }
    const updateAmount = () => {
      if (state.fiatData) {
        state.form.amount = toFixed(state.fiatValue / state.fiatData.OutputValue)
      }
    }
    const fiatLookup = () => {
      state.defaultPreferredCurrency = accountInfo.value ? accountInfo.value.PayoutCurrencyShortName : 'EUR'
      http.get(`${apiBaseUrl}/v2REAPI`, {
        params: {
          Call: 'Fiatlookup',
          MerchantID: user.value.ID,
          APIKey: user.value.APIKey,
          AltCoinID: state.selectedBalance.id,
          Amount: 1,
          FiatLookup: 0,
          FiatMoney: state.defaultPreferredCurrency,
          output: 'json'
        }
      }).then(response => {
        if (response.data && response.data.length > 0) {
          state.fiatData = response.data[0]
        }
      }).catch(error => {
        console.log(error)
      })
    }
    const onInit = async (promise) => {
      state.loading = true
      try {
        await promise
      } catch (error) {
        let errorMsg = ''
        if (error.name === 'NotAllowedError') {
          errorMsg = 'ERROR: you need to grant camera access permission'
        } else if (error.name === 'NotFoundError') {
          errorMsg = 'ERROR: no camera on this device'
        } else if (error.name === 'NotSupportedError') {
          errorMsg = 'ERROR: secure context required (HTTPS, localhost)'
        } else if (error.name === 'NotReadableError') {
          errorMsg = 'ERROR: is the camera already in use?'
        } else if (error.name === 'OverconstrainedError') {
          errorMsg = 'ERROR: installed cameras are not suitable'
        } else if (error.name === 'StreamApiNotSupportedError') {
          errorMsg = 'ERROR: Stream API is not supported in this browser'
        }
        toast.error(errorMsg)
        saveNotification(errorMsg)
      } finally {
        state.loading = false
      }
    }
    const onDecode = (content) => {
      if (content) {
        state.decodedContent = ''
        let decoded = content.split(/[?:=]+/)
        if (decoded.length === 4 && decoded[2].toLowerCase() === 'amount') {
          if (state.selectedCoin.Name.toLowerCase() === decoded[0]) {
            state.form = {
              ...state.form,
              address: decoded[1],
              amount: decoded[3]
            }
          } else {
            const currency = _.find(state.balanceList, (b) => {
              return b.name.toLowerCase() === decoded[0]
            })
            if (currency) {
              emit('switchCurrency', currency)
              setTimeout(() => {
                state.form = {
                  ...state.form,
                  address: decoded[1],
                  amount: decoded[3]
                }
              }, 1000)
            } else {
              toast.warning('Currency not found please enable this currency from settings')
              saveNotification('Currency not found please enable this currency from settings')
            }
          }
        } else {
          if (content.indexOf('----') !== -1) {
            decoded = content.split('----').filter(Boolean)
            if (decoded.length === 7 && decoded[0].toLowerCase() === 'tzero') {
              if (this.selectedCoin.Name.toLowerCase() === decoded[3].toLowerCase()) {
                closeModal()
                extractTZRODataFromQrCode(content, decoded)
              } else {
                const currency = _.find(state.balanceList, (b) => {
                  return b.name.toLowerCase() === decoded[3]
                })
                if (currency) {
                  closeModal()
                  emit('switchCurrency', currency)
                  setTimeout(() => {
                    extractTZRODataFromQrCode(content, decoded)
                  }, 1000)
                } else {
                  toast.warning('Currency not found please enable this currency from settings')
                  saveNotification('Currency not found please enable this currency from settings')
                }
              }
            }
          } else {
            // Check if url
            if (isValidUrl(content)) {
              window.open(content, '_blank').focus()
            } else {
              state.decodedContent = content
            }
          }
        }
        state.isUpload = false
        state.isScanner = false
      }
    }
    const extractTZRODataFromQrCode = (content, decoded) => {
      const pin = decoded[5].replace('PIN', '')
      const instantPayment = {
        MerchantID: user.value.ID,
        APIKey: user.value.APIKey,
        AltCoinID: decoded[6],
        SendAmount: decoded[2],
        Amount: decoded[2],
        coinAddress: 'test123',
        TZERO: content,
        TZEROID: decoded[1],
        pin: pin,
        ChargingMethod: 'fixed-fee',
        PayoutMonth: new Date().getMonth() + 1,
        TransactionTotal: 1,
        Schedule: 1,
        output: 'json'
      }
      const desc = translate('send.modals.pin.desc')
        .replace('[PIN]', pin)
        .replace('[AMOUNT]', decoded[2] + ' ' + decoded[3])
      setTimeout(() => {
        emitter.emit('pinValidationModal', {
          pin: pin,
          desc: desc,
          instantPayment: instantPayment
        })
      })
    }
    const submit = () => {
      state.errorBag = validate(state.form, state.rules)
      if (Object.keys(state.errorBag).length === 0) {
        state.isProcessing = true
        let payload = {
          MerchantID: user.value.ID,
          APIKey: user.value.APIKey,
          AltCoinID: state.selectedBalance.id,
          Amount: state.form.amount.toString().replace(',', '.'),
          coinAddress: state.form.address,
          ChargingMethod: 'fixed-fee',
          PayoutMonth: new Date().getMonth() + 1,
          TransactionTotal: 1,
          CustomerReferenceNr: state.form.CustomerReferenceNr,
          Fee: state.form.Fee,
          output: 'json'
        }
        if (state.balance.tag === '1') {
          payload = Object.assign(payload, {
            tag: state.form.tag
          })
        }
        http.get(`${apiBaseUrl}/GetSendToAddress`, {
          params: payload
        }).then(response => {
          state.isProcessing = false
          if (response.status === 200) {
            closeModal()
            toast.success(response.data)
          } else {
            toast.error(response.data)
          }
          saveNotification(response.data)
        }).catch(error => {
          state.isProcessing = false
          toast.error(error.response.data)
          saveNotification(error.response.data)
        })
      }
    }
    const launchCryptoAddressBookModal = () => {
      emitter.emit('cryptoAddressBookModal', {
        selectedBalance: state.selectedBalance,
        confirm: (address) => {
          state.form = {
            ...state.form,
            address: address.address,
            CustomerReferenceNr: address.description,
            tag: address.tag ? address.tag : ''
          }
        }
      })
    }

    onBeforeMount(() => {
      emitter.on('withdrawCryptoModal', (args) => {
        state.selectedBalance = args.selectedBalance
        state.selectedCoin = args.selectedCoin
        state.balanceList = args.balanceList
        state.isScanner = false
        state.isUpload = false
        fiatLookup()
        const minValue = state.selectedCoin ? toFixed(state.selectedCoin.MinimumPayout) : '0.00000001'
        const maxValue = state.selectedBalance ? state.selectedBalance.balance : ''
        state.rules = {
          amount: ['required', 'regex:/^[0-9]{1,8}([,.][0-9]{1,8})?$/', 'minValue:' + minValue, 'maxValue:' + maxValue],
          address: ['required', 'regex:/^[0-9a-zA-Z-]+$/']
        }
        // Reset
        state.form = {
          amount: '',
          Fee: 0,
          address: '',
          CustomerReferenceNr: '',
          tag: ''
        }
        setTimeout(() => {
          state.errorBag = {}
        }, 50)
        // Show modal
        state.show = true
      })
    })

    return {
      translate,
      ...toRefs(state),
      showError,
      closeModal,
      selectAllBalance,
      updateAmount,
      updateFiat,
      onInit,
      onDecode,
      launchCryptoAddressBookModal,
      submit
    }
  }
}
</script>

<style scoped></style>

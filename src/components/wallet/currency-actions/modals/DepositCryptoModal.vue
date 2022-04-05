<template>
  <modal :maxWidth="maxWidth" :show="show" @close="closeModal()">
    <template #title>
      <div class="flex items-center justify-between">
        {{ translate('receive.title') }}
        <span class="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 cursor-pointer"
              @click="closeModal()">
          <icon name="close"></icon>
        </span>
      </div>
    </template>
    <template #content>
      <form @submit.prevent="submit()">

        <div class="grid grid-cols-2 gap-4">
          <div class="col-span-2 md:col-span-1">
            <div class="mb-2">
              <div class="flex items-center justify-between mb-1">
                <label>{{ translate('receive.input_currency') }}</label>
                <div class="text-red-500 text-sm">{{ showError(errorBag, 'inputCurrency') }}</div>
              </div>
              <v-select v-model="form.inputCurrency" :options="inputCurrenciesList" track-by="ShortName" label="Name"
                        :custom-label="customLabel"></v-select>
            </div>
          </div>

          <div class="col-span-2 md:col-span-1">
            <div class="mb-2">
              <div class="flex items-center justify-between mb-1">
                <label class="w-full flex items-center justify-between">
                  {{ translate('receive.amount') }}
                  <span class="text-sm"
                        v-if="showError(errorBag, 'Amount') === ''">Network fee: {{ selectedCoin.MinerFee }}</span>
                </label>
                <div class="text-red-500 text-sm whitespace-nowrap">
                  {{ showError(errorBag, 'Amount') }}
                </div>
              </div>
              <input ref="amountInput" class="form-input w-full" type="text" v-model="form.Amount"/>
            </div>
          </div>
        </div>
        <div v-if="fiatValue" class="mb-2">{{ `${fiatValue} ${selectedCoin.LongName}` }}</div>

        <div class="mb-2">
          <div class="flex items-center justify-between mb-1">
            <label>{{ translate('receive.reference') }}</label>
            <div class="text-red-500 text-sm">{{ showError(errorBag, 'CustomerReferenceNr') }}</div>
          </div>
          <input class="form-input w-full" type="text" v-model="form.CustomerReferenceNr"/>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div class="col-span-2 md:col-span-1 mb-2">
            <div class="flex items-center justify-between mb-1">
              <label class="flex items-center">
                <input type="checkbox" class="form-checkbox mr-2" :disabled="form.isScheduledID"
                       v-model="form.isEmailReceiver"/>
                {{ translate('receive.email') }}
              </label>
              <div class="text-red-500 text-sm">{{ showError(errorBag, 'EmailReceiver') }}</div>
            </div>
            <input :disabled="!form.isEmailReceiver" aria-label="Email"
                   class="form-input w-full" type="email" v-model="form.EmailReceiver"/>
          </div>

          <div class="col-span-2 md:col-span-1 mb-2">
            <div class="flex items-center justify-between mb-1">
              <label class="flex items-center">
                <input type="checkbox" class="form-checkbox mr-2" v-model="form.isScheduledID"/>
                {{ translate('receive.schedule') }}
              </label>
              <div class="text-red-500 text-sm">{{ showError(errorBag, 'ScheduleID') }}</div>
            </div>
            <select :disabled="!form.isScheduledID"
                    aria-label="Schedule" class="form-select w-full" v-model="form.ScheduleID">
              <option :key="index" :value="scheduleOption.key"
                      v-for="(scheduleOption, index) in scheduleOptions">{{ scheduleOption.label }}
              </option>
            </select>
          </div>
        </div>

        <div class="text-right mt-4">
          <j-button :disabled="isProcessing">
            <div v-if="isProcessing" class="mr-3">
              <icon :name="'spinner'" classes="w-4 h-4 text-white"></icon>
            </div>
            <span>{{ translate('receive.button') }}</span>
          </j-button>
        </div>

      </form>
    </template>
  </modal>
</template>

<script>
import VueMultiselect from 'vue-multiselect'
import Modal from '@/components/Modal'
import Icon from '@/components/Icon'
import JButton from '@/templates/Button'
import { useStore } from 'vuex'
import * as _ from 'lodash'
import { computed, inject, onBeforeMount, reactive, toRefs, watch, ref } from 'vue'
import validator from '@/validator'
import compositionUtils from '@/compositionUtils'

export default {
  name: 'DepositCryptoModal',
  components: {
    Modal,
    Icon,
    JButton,
    'v-select': VueMultiselect
  },
  setup () {
    const translate = inject('translate')
    const http = inject('http')
    const emitter = inject('emitter')
    const toast = inject('toast')

    const amountInput = ref(null)

    // Store
    const store = useStore()
    const {
      validate,
      showError
    } = validator()
    const { saveNotification, toFixed } = compositionUtils()
    // State
    const state = reactive({
      show: false,
      maxWidth: '2xl',
      closeable: true,
      isProcessing: false,
      selectedBalance: null,
      selectedCoin: null,
      scheduleOptions: [
        {
          key: 0,
          label: 'Select Schedule'
        },
        {
          key: 2,
          label: 'Daily'
        },
        {
          key: 3,
          label: 'Weekly'
        },
        {
          key: 4,
          label: 'Monthly'
        },
        {
          key: 5,
          label: 'Yearly'
        }
      ],
      form: {
        MerchantID: '',
        APIKey: '',
        CustomerReferenceNr: 'deposit',
        isScheduledID: false,
        ScheduleID: '',
        AltCoinID: '',
        inputCurrency: null,
        Amount: '',
        isEmailReceiver: false,
        EmailReceiver: '',
        output: 'json'
      },
      errorBag: {},
      rules: {
        inputCurrency: ['required'],
        Amount: ['required', 'numeric', 'minValue:0.00000001'],
        CustomerReferenceNr: ['required'],
        EmailReceiver: ['email', 'required_if:isEmailReceiver,true', 'required_if:isScheduledID,true'],
        ScheduleID: ['required_if:isScheduledID,true']
      },
      fiatData: null,
      fiatValue: 0,
      inputCurrenciesList: [],
      confirmHook: () => {
      }
    })
    // Computed
    const user = computed(() => store.state.user)
    const inputCurrencies = computed(() => store.state.inputCurrencies)
    const accountInfo = computed(() => store.state.accountInfo)

    // Watch
    watch(() => ({ ...state.form.inputCurrency }),
      (value) => {
        fiatLookup(1)
      })

    watch(() => state.form.Amount,
      (newVal, oldVal) => {
        if (newVal) {
          if (!state.fiatData || state.fiatData.FiatCurrency !== state.form.inputCurrency.ShortName) {
            fiatLookup(1)
          } else {
            state.fiatValue = toFixed(state.fiatData.OutputValue * Number(newVal))
          }
        }
      })
    watch(() => state.form.isScheduledID,
      (value) => {
        if (value) {
          state.form.isEmailReceiver = true
        }
      })
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
    const customLabel = ({
      Name,
      LongName
    }) => {
      return `${Name} ${LongName}`
    }
    const fiatLookup = (amount) => {
      if (amount) {
        state.defaultPreferredCurrency = state.form.inputCurrency ? state.form.inputCurrency.ShortName : 'EUR'
        http.get(`${apiBaseUrl}/v2REAPI`, {
          params: {
            Call: 'Fiatlookup',
            MerchantID: user.value.ID,
            APIKey: user.value.APIKey,
            AltCoinID: state.selectedBalance.id,
            Amount: amount,
            FiatLookup: 1,
            FiatMoney: state.defaultPreferredCurrency,
            output: 'json'
          }
        }).then(response => {
          if (response.data.length > 0) {
            state.fiatData = response.data[0]
            if (state.form.Amount) {
              state.fiatValue = toFixed(state.fiatData.OutputValue * Number(state.form.Amount))
            }
          }
        }).catch(error => {
          console.log(error)
        })
      }
    }
    const submit = () => {
      state.errorBag = validate(state.form, state.rules)
      if (Object.keys(state.errorBag).length === 0) {
        state.isProcessing = true
        let payload = {
          Checkout: true,
          MerchantID: user.value.ID,
          SecurityCode: user.value.SecurityCode,
          CustomerReferenceNr: state.form.CustomerReferenceNr,
          AltCoinID: state.selectedBalance.id,
          inputCurrency: state.form.inputCurrency.ShortName,
          Amount: state.form.Amount,
          output: 'json'
        }
        if (state.form.isEmailReceiver && !state.form.isScheduledID) {
          payload = Object.assign(payload, {
            invoiceAddress: state.form.EmailReceiver
          })
          payload.output = 'jsonpmail'
        }
        if (state.form.isScheduledID) {
          payload = Object.assign(payload, {
            Call: 'InvoiceScheduler',
            ScheduleID: state.form.ScheduleID,
            APIKey: user.value.APIKey,
            EmailReceiver: state.form.EmailReceiver
          })
        }
        const endPoint = state.form.isScheduledID ? '/v2REAPI' : '/MerchantAPI'
        http.get(`${apiBaseUrl}${endPoint}`, {
          params: payload
        }).then(response => {
          state.isProcessing = false
          let invoiceData = response.data
          if (state.form.EmailReceiver && !state.form.isScheduledID) {
            // eslint-disable-next-line no-new-func
            const f = new Function('callback', response.data)
            f(function (data) {
              invoiceData = data
            })
          }
          state.confirmHook(invoiceData)
          closeModal()
          if (!state.form.isScheduledID) {
            // Launch invoice modal
            emitter.emit('invoiceModal', {
              invoiceData: invoiceData,
              isScheduledID: state.form.isScheduledID
            })
          } else {
            toast.success(response.data.message)
            saveNotification(response.data.message)
          }
        }).catch(error => {
          state.isProcessing = false
          toast.error(error.response ? error.response.data : error.data)
          saveNotification(error.response ? error.response.data : error.data)
        })
      }
    }

    onBeforeMount(() => {
      emitter.on('depositCryptoModal', (args) => {
        state.selectedBalance = args.selectedBalance
        state.selectedCoin = args.selectedCoin
        // Attach callback
        state.confirmHook = args.confirm
        // Init form
        let selectedInputCurrency = null
        if (accountInfo.value) {
          selectedInputCurrency = _.find(inputCurrencies.value, { ShortName: accountInfo.value.PayoutCurrencyShortName })
        }
        state.inputCurrenciesList = _.cloneDeep(inputCurrencies.value)
        const index = _.findIndex(state.inputCurrenciesList, {
          ID: state.selectedCoin.ID
        })
        if (index !== -1) {
          const currency = state.inputCurrenciesList[index]
          state.inputCurrenciesList.splice(index, 1)
          state.inputCurrenciesList.splice(0, 0, currency)
        } else {
          state.inputCurrenciesList.splice(0, 0, state.selectedCoin)
        }
        state.errorBag = {}
        state.form = {
          MerchantID: '',
          APIKey: '',
          CustomerReferenceNr: 'deposit',
          isScheduledID: false,
          ScheduleID: '',
          AltCoinID: '',
          inputCurrency: selectedInputCurrency ?? null,
          Amount: '',
          isEmailReceiver: false,
          EmailReceiver: '',
          output: 'json'
        }
        state.fiatData = null
        state.fiatValue = 0
        // Show modal
        state.show = true
        setTimeout(() => {
          if (amountInput.value) {
            amountInput.value.focus()
          }
        }, 200)
      })
    })

    return {
      translate,
      ...toRefs(state),
      amountInput,
      showError,
      closeModal,
      customLabel,
      submit
    }
  }
}
</script>

<style scoped></style>

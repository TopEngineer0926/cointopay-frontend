<template>
  <modal :maxWidth="maxWidth" :show="show" @close="closeModal()">
    <template #title>
      <div class="flex items-center justify-between">
        <span>Notification</span>
        <span class="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 cursor-pointer"
              @click="closeModal()">
          <icon name="close"></icon>
        </span>
      </div>
    </template>
    <template #content>
      <div v-if="invoice">
        <div class="text-center">
          <img v-if="isFullPayment" class="w-36 mx-auto" src="@/assets/images/success.png" alt=""/>
          <img v-else class="w-36 mx-auto" src="@/assets/images/warning.svg" alt=""/>
        </div>
        <p class="mb-2">Thank you for making the transfer with your preferred wallet.</p>
        <p v-if="isFullPayment">The {{ invoice.LongName }} blockchain can take some time to confirm your
          payment. Please enter your email address to receive status update alerts for
          #{{ invoice.TransactionID }}.</p>
        <p v-if="!isFullPayment">We received your payment, however it is not enough to fulfill the transaction,
          please make the additional payment of {{ amount }} {{ invoice.LongName }}.</p>
        <p>Please enter your email address to receive status update alerts.</p>
        <!-- Email -->
        <form @submit.prevent="submit()">
          <div class="flex items-center flex-col md:flex-row mt-4">
            <div class="w-full md:flex-1 mr-0 md:mr-3">
              <div class="text-right mb-1" v-if="hasErrors">
                <div class="text-red-500 text-sm">{{ showError(errorBag, 'email') }}</div>
              </div>
              <input v-model="form.email" class="form-input w-full" placeholder="Email address" type="text"/>
            </div>
            <div class="mt-3 md:mt-0">
              <label class="mb-1 block" v-if="hasErrors">&nbsp;</label>
              <j-button :disabled="isProcessing">
                <div v-if="isProcessing" class="mr-3">
                  <icon :name="'spinner'" classes="w-4 h-4 text-white"></icon>
                </div>
                <span>Receive Alerts</span>
              </j-button>
            </div>
          </div>
        </form>
      </div>
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

export default {
  name: 'PaymentNotificationModal',
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

    const { saveNotification } = compositionUtils()
    const { validate, showError } = validator()

    const apiBaseUrl = process.env.VUE_APP_API_URL
    // State
    const state = reactive({
      show: false,
      maxWidth: '2xl',
      closeable: true,
      invoice: null,
      isFullPayment: true,
      amount: 0,
      form: {
        email: ''
      },
      errorBag: {},
      rules: {
        email: ['required', 'email']
      },
      isProcessing: false
    })

    // Computed
    const hasErrors = computed(() => Object.keys(state.errorBag).length > 0)

    // Watch
    watch(() => ({ ...state.form }),
      () => {
        if (Object.keys(state.errorBag).length > 0) {
          state.errorBag = validate(state.form, state.rules)
        }
      })

    // Methods
    const closeModal = () => {
      state.show = false
    }

    const submit = () => {
      state.errorBag = validate(state.form, state.rules)
      if (Object.keys(state.errorBag).length === 0) {
        state.isProcessing = true
        http.get(`${apiBaseUrl}/InvoiceForwarder`, {
          params: {
            invoiceAddress: state.form.email,
            target: false,
            shop: state.invoice.ShopTitle,
            TransactionID: state.invoice.TransactionID,
            coinAddress: state.invoice.coinAddress,
            qrcode: state.invoice.CoinName.toLowerCase() + ':' + state.invoice.coinAddress,
            amount: state.invoice.Amount,
            output: 'json'
          }
        }).then(response => {
          state.isProcessing = false
          if (response.data.toLowerCase() === 'mail sent') {
            state.form.email = ''
            state.errorBag = {}
            toast.success('Subscribed to alerts successfully')
            saveNotification('Subscribed to alerts successfully')
            closeModal()
          }
        }).catch(error => {
          state.isProcessing = false
          console.log(error)
        })
      }
    }

    onBeforeMount(() => {
      emitter.on('paymentNotificationModal', (args) => {
        if (args.close && args.close === true) {
          state.show = false
        } else {
          state.invoice = args.invoice
          state.isFullPayment = args.isFullPayment
          state.amount = args.amount
          // Reset
          state.form = {
            email: ''
          }
          state.errorBag = {}
          // Show modal
          state.show = true
        }
      })
    })

    return {
      translate,
      ...toRefs(state),
      hasErrors,
      showError,
      closeModal,
      submit
    }
  }
}
</script>

<style scoped></style>

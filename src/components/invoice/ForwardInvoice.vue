<template>
  <div class="card">
    <div class="body">
      <form @submit.prevent="submit()">
        <div class="flex items-center flex-col md:flex-row">
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
              <span>{{ translate('invoice.forward_invoice') }}</span>
            </j-button>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import JButton from '@/templates/Button'
import Icon from '@/components/Icon'
import { computed, inject, reactive, toRefs, watch } from 'vue'
import validator from '@/validator'
import compositionUtils from '@/compositionUtils'

export default {
  name: 'ForwardInvoice',
  props: ['invoice'],
  components: {
    JButton,
    Icon
  },
  setup (props) {
    // Providers
    const translate = inject('translate')
    const http = inject('http')
    const toast = inject('toast')

    const {
      showError,
      validate
    } = validator()
    const { saveNotification } = compositionUtils()

    const state = reactive({
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
    const apiBaseUrl = process.env.VUE_APP_API_URL
    const submit = () => {
      state.errorBag = validate(state.form, state.rules)
      if (Object.keys(state.errorBag).length === 0) {
        state.isProcessing = true
        http.get(`${apiBaseUrl}/InvoiceForwarder`, {
          params: {
            invoiceAddress: state.form.email,
            target: false,
            shop: props.invoice.ShopTitle,
            TransactionID: props.invoice.TransactionID,
            coinAddress: props.invoice.coinAddress,
            qrcode: props.invoice.CoinName.toLowerCase() + ':' + props.invoice.coinAddress,
            amount: props.invoice.Amount,
            output: 'json'
          }
        }).then(response => {
          state.isProcessing = false
          if (response.data.toLowerCase() === 'mail sent') {
            state.form.email = ''
            state.errorBag = {}
            toast.success('Invoice sent successfully')
            saveNotification('Invoice sent successfully')
          }
        }).catch(error => {
          state.isProcessing = false
          console.log(error)
        })
      }
    }

    return {
      translate,
      ...toRefs(state),
      showError,
      hasErrors,
      submit
    }
  }
}
</script>

<style scoped></style>

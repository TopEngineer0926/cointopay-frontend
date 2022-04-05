<template>
  <pos-layout>
    <template v-slot:content>
      <div class="text-center" v-if="ticket && ticket.paymentRequest">
        <icon name="check-circle" classes="w-24 h-24 text-green-500 mx-auto"></icon>
        <p class="font-bold text-green-500 mb-4">
          Invoice #{{ ticket.paymentRequest.TransactionID }} has been paid successfully!
        </p>
        <div class="w-full md:w-3/5 mx-auto mb-3">
          <form @submit.prevent="submit()">
            <div class="flex items-center mb-1">
              <div style="flex-grow: 1">
                <input :placeholder="translate('pos.receipts.email')"
                       aria-label="Email" class="form-input w-full" type="email" v-model="form.email"/>
              </div>
              <button :disabled="isProcessing" class="btn btn-success ml-3">
                <span v-if="isProcessing" class="mr-3">
                  <icon :name="'spinner'" classes="w-4 h-4 text-white"></icon>
                </span>
                <span>{{ translate('pos.receipts.btn_send_receipt') }}</span>
              </button>
            </div>
          </form>
          <div class="text-blue-500 text-sm text-left">{{ showError(errorBag, 'email') }}</div>
        </div>
        <routerLink class="btn btn-primary" tag="a" :to="{name: 'account-pos-products'}">
          Create New Order
        </routerLink>
      </div>
    </template>
  </pos-layout>
</template>

<script>
import POSLayout from '@/components/layouts/POSLayout'
import Icon from '@/components/Icon'
import { computed, inject, onBeforeMount, reactive, toRefs, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'
import validator from '@/validator'
import * as _ from 'lodash'
import moment from 'moment'

export default {
  name: 'Success',
  components: {
    'pos-layout': POSLayout,
    Icon
  },
  setup () {
    // Providers
    const translate = inject('translate')
    const http = inject('http')
    const toast = inject('toast')

    const store = useStore()
    const route = useRoute()
    const router = useRouter()

    const {
      showError,
      validate
    } = validator()

    // State
    const state = reactive({
      ticket: null,
      form: {
        email: ''
      },
      errorBag: {},
      rules: {
        email: ['required', 'email']
      },
      messages: {
        email: {
          required: 'Email address is required',
          email: 'Please provide a valid email address'
        }
      },
      isProcessing: false
    })

    // Computed
    const user = computed(() => store.state.user)
    const pos = computed(() => store.state.pos)
    const receipt = computed(() => {
      const receipt = _.find(
        pos.value.receipts, receipt => receipt.TICKETNUMBER === state.ticket.ticketId.toString()
      )
      if (receipt) {
        receipt.items = pos.value.receiptItems.filter(item => item.RECIEPT_ID === receipt.ID)
      }
      return receipt
    })

    // Watch
    watch(() => ({ ...state.form }),
      (newVal, oldVal) => {
        if (Object.keys(state.errorBag).length > 0) {
          state.errorBag = validate(newVal, state.rules, state.messages)
        }
      }
    )

    // Method
    const apiBaseUrl = process.env.VUE_APP_API_URL
    const submit = () => {
      state.errorBag = validate(state.form, state.rules, state.messages)
      if (Object.keys(state.errorBag).length === 0 && receipt.value) {
        state.isProcessing = true
        const ticketReceipt = {
          'Receipt ID': receipt.value.ID,
          Time: moment(new Date(Number(receipt.value.DATE))).format('DD/MM/YYYY H:mm A'),
          'Total Amount': receipt.value.TOTAL + ' ' + receipt.value.CURRENCY,
          Cashier: receipt.value.CASHIER,
          Items: receipt.value.items
        }
        const payload = {
          Call: 'POSRECEIPT',
          MerchantID: Number(user.value.ID),
          APIKey: user.value.APIKey,
          email: state.form.email,
          ticketData: JSON.stringify(ticketReceipt),
          output: 'json'
        }
        const encodeForm = data => {
          return Object.keys(data).map(key => encodeURIComponent(key) + '=' + encodeURIComponent(data[key])).join('&')
        }
        http.post(`${apiBaseUrl}/v2REAPI`, encodeForm(payload), {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }).then(response => {
          state.isProcessing = false
          if (response.data) {
            state.form.email = ''
            toast.success('Receipt sent successfully')
          }
          router.push({ name: 'account-pos-products' })
        }).catch(error => {
          state.isProcessing = false
          console.log(error)
        })
      }
    }

    onBeforeMount(() => {
      if (Object.keys(route.params).length > 0 && route.params.ticketId) {
        state.ticket = _.find(pos.value.tickets, { ticketId: route.params.ticketId })
      }
    })

    return {
      translate,
      ...toRefs(state),
      showError,
      submit
    }
  }
}
</script>

<style scoped></style>

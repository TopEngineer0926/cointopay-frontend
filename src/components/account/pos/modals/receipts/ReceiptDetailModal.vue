<template>
  <modal :maxWidth="maxWidth" :show="show" @close="closeModal()">
    <template #title>
      <div class="flex items-center justify-between">
        <span>{{ translate('pos.receipts.title') }}</span>
        <span class="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 cursor-pointer"
              @click="closeModal()">
          <icon name="close"></icon>
        </span>
      </div>
    </template>
    <template #content>
      <div v-if="receipt">
        <table class="table-sm">
          <tbody>
          <tr>
            <th>Date</th>
            <td colspan="4">{{ formatDT(receipt.DATE) }}</td>
          </tr>
          <tr>
            <th>Receipt ID</th>
            <td colspan="4">{{ receipt.ID }}</td>
          </tr>
          <tr>
            <th>Transaction ID</th>
            <td colspan="4">{{ receipt.TRANSACTION_ID }}</td>
          </tr>
          <tr>
            <th>Ticket Number</th>
            <td colspan="4">{{ receipt.TICKETNUMBER }}</td>
          </tr>
          <tr>
            <th>Cashier</th>
            <td colspan="4">{{ receipt.CASHIER }}</td>
          </tr>
          <tr>
            <th>Total Amount</th>
            <td colspan="4">
              {{ receipt.TOTAL.replace('Total Price: ', '').replace(receipt.CURRENCY, '') + ' ' + receipt.CURRENCY }}
            </td>
          </tr>
          <tr class="whitespace-nowrap">
            <th>Product Name</th>
            <th>Sku</th>
            <th>Price</th>
            <th>Quantity</th>
            <th>Sub Total</th>
          </tr>
          <tr :key="index" v-for="(item, index) of receipt.items">
            <td>{{ item.ITEM_NAME }}</td>
            <td>{{ item.ITEM_SKU }}</td>
            <td class="whitespace-nowrap">
              {{ `${item.ITEM_PRICE} ${item.CURRENCY ? item.CURRENCY : receipt.CURRENCY}` }}
            </td>
            <td>{{ item.QUANTITY }}</td>
            <td>{{ `${item.QUANTITY * item.ITEM_PRICE} ${item.CURRENCY ? item.CURRENCY : receipt.CURRENCY}` }}</td>
          </tr>
          </tbody>
        </table>
        <form @submit.prevent="submit()">
          <div class="mb-2 flex items-center justify-between">
            <div class="flex-1">
              <input :placeholder="translate('pos.receipts.email')" aria-label="Email" class="form-input w-full"
                     type="email" v-model="form.email"/>
              <div class="text-red-700 dark:text-red-400 text-sm">{{ showError(errorBag, 'email') }}</div>
            </div>
            <j-button :disabled="isProcessing" class="ml-3">
              <div v-if="isProcessing" class="mr-3">
                <icon :name="'spinner'" classes="w-4 h-4 text-white"></icon>
              </div>
              <span>{{ translate('pos.receipts.btn_send_receipt') }}</span>
            </j-button>
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
import { useStore } from 'vuex'
import validator from '@/validator'
import * as moment from 'moment'

export default {
  name: 'ReceiptDetailModal',
  components: {
    Modal,
    Icon,
    JButton
  },
  setup () {
    // Providers
    const translate = inject('translate')
    const emitter = inject('emitter')
    const toast = inject('toast')
    const http = inject('http')

    // Store
    const store = useStore()

    const {
      showError,
      validate
    } = validator()

    const state = reactive({
      show: false,
      maxWidth: '2xl',
      closeable: true,
      receipt: null,
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

    // Watch
    watch(() => ({ ...state.form }),
      (newVal, oldVal) => {
        if (Object.keys(state.errorBag).length > 0) {
          state.errorBag = validate(state.form, state.rules, state.messages)
        }
      })

    // Methods
    const apiBaseUrl = process.env.VUE_APP_API_URL
    const closeModal = () => {
      state.show = false
    }
    const formatDT = (date) => {
      return moment(new Date(Number(date))).format('DD/MM/YYYY H:mm A')
    }
    const submit = () => {
      state.errorBag = validate(state.form, state.rules, state.messages)
      if (Object.keys(state.errorBag).length === 0) {
        state.isProcessing = true
        const receipt = {
          'Receipt ID': state.receipt.ID,
          Time: formatDT(state.receipt.DATE),
          'Total Amount': `${state.receipt.TOTAL} ${state.receipt.CURRENCY}`,
          Cashier: state.receipt.CASHIER,
          Items: state.receipt.items
        }
        const payload = {
          Call: 'POSRECEIPT',
          MerchantID: Number(user.value.ID),
          APIKey: user.value.APIKey,
          email: state.form.email,
          ticketData: JSON.stringify(receipt),
          output: 'json'
        }
        const encodeForm = (data) => {
          return Object.keys(data).map(key => encodeURIComponent(key) + '=' + encodeURIComponent(data[key])).join('&')
        }
        http.post(`${apiBaseUrl}/v2REAPI`, encodeForm(payload), {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }).then(response => {
          state.isProcessing = false
          if (response.data) {
            toast.success('Receipt sent successfully')
          }
        }).catch(error => {
          state.isProcessing = false
          console.log(error)
        })
      }
    }

    onBeforeMount(() => {
      emitter.on('receiptDetailModal', (args) => {
        state.receipt = args.receipt
        state.form = {
          email: ''
        }
        // Show modal
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

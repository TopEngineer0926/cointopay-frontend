<template>
  <modal :maxWidth="maxWidth" :show="show" @close="closeModal()">
    <template #title>
      <div class="flex items-center justify-between">
        <span>{{ translate('pos.title') }}</span>
        <span class="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 cursor-pointer"
              @click="closeModal()">
          <icon name="close"></icon>
        </span>
      </div>
    </template>
    <template #content>
      <div v-if="item">
        <form @submit.prevent="submit()">
          <p>{{ item.itemName }}</p>
          <div class="mb-2">
            <label class="block mb-1">{{ translate('pos.tickets.lbl_quantity') }}</label>
            <div class="flex items-center">
              <j-button @click="sub()" type="button" class="rounded-r-none">
                <icon name="minus"></icon>
              </j-button>
              <input @keyup="validateQty()"
                     class="form-input w-24 text-center rounded-none" type="text" v-model="form.qty"/>
              <j-button @click="add()" type="button" class="rounded-l-none">
                <icon name="plus"></icon>
              </j-button>
            </div>
            <div class="text-red-700 dark:text-red-400 text-sm">{{ showError(errorBag, 'qty') }}</div>
          </div>

          <p>{{ translate('pos.tickets.stock_left') }} {{ stockLeft }}</p>
          <p>{{ translate('pos.tickets.product_price') }} {{ `${item.productPrice} ${currency}` }}</p>
          <p>{{ translate('pos.tickets.total_price') }} {{ `${totalPrice} ${currency}` }}</p>

          <div class="mt-4 text-right">
            <j-button :disabled="isProcessing">
              <div v-if="isProcessing" class="mr-3">
                <icon :name="'spinner'" classes="w-4 h-4 text-white"></icon>
              </div>
              <span>{{ translate('pos.tickets.btn_save') }}</span>
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
import validator from '@/validator'
import * as _ from 'lodash'
import { useStore } from 'vuex'
import { SAVE_PRODUCTS, SAVE_TICKETS, SET_POS } from '@/store/keys'

export default {
  name: 'UpdateCartItemModal',
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
    // Store
    const store = useStore()

    const {
      showError,
      validate
    } = validator()

    // State
    const state = reactive({
      show: false,
      maxWidth: '2xl',
      closeable: true,
      item: null,
      ticket: null,
      itemIndex: -1,
      currency: 'EUR',
      form: {
        qty: 0
      },
      errorBag: {},
      rules: {
        qty: ['required', 'minValue:1']
      },
      messages: {
        qty: {
          required: 'Please enter valid quantity',
          minValue: 'Quantity should be greater than 0'
        }
      },
      isProcessing: false,
      confirmHook: () => {
      }
    })

    // Computed
    const pos = computed(() => store.state.pos)
    const posCalls = computed(() => store.state.posCalls)
    const stockLeft = computed(() => {
      if (!state.item) {
        return 0
      }
      const product = _.find(pos.value.products, { id: state.item.productId })
      return product ? Number(product.stock) + Number(state.item.productQuantity) - Number(state.form.qty) : 0
    })
    const totalPrice = computed(() => {
      return state.item ? (state.item.productPrice * state.form.qty).toFixed(8) : 0
    })

    // Watch
    watch(() => ({ ...state.form }),
      (newVal, oldVal) => {
        if (Object.keys(state.errorBag).length > 0) {
          state.errorBag = validate(state.form, state.rules, state.messages)
        }
      })

    // Methods
    const closeModal = () => {
      state.show = false
    }
    const add = () => {
      if (Number(state.form.qty) < Number(stockLeft.value)) {
        state.form.qty = Number(state.form.qty) + 1
      }
    }
    const sub = () => {
      if (Number(state.form.qty) > 1) {
        state.form.qty = Number(state.form.qty) - 1
      }
    }
    const validateQty = () => {
      if (Number(state.form.qty) < 1) {
        state.form.qty = 1
      } else if (Number(state.form.qty) > Number(stockLeft.value)) {
        state.form.qty = Number(stockLeft.value)
      }
    }
    const submit = () => {
      state.errorBag = validate(state.form, state.rules, state.messages)
      if (Object.keys(state.errorBag).length === 0) {
        state.isProcessing = true
        const posData = _.cloneDeep(pos.value)
        const ticketIndex = _.findIndex(posData.tickets, { ticketId: state.ticket.ticketId.toString() })
        if (ticketIndex !== -1) {
          posData.tickets[ticketIndex].ticketProducts[state.itemIndex].productQuantity = state.form.qty
          posData.tickets[ticketIndex].paymentRequest = null
          store.dispatch(SAVE_TICKETS, {
            call: posCalls.value.tickets,
            data: posData.tickets
          })
          const productIndex = _.findIndex(posData.products, { id: state.item.productId })
          if (productIndex !== -1) {
            posData.products[productIndex].stock = stockLeft.value.toString()
            store.dispatch(SAVE_PRODUCTS, {
              call: posCalls.value.products,
              data: posData.products
            })
          }
          const favIndex = _.findIndex(posData.favourites, { id: state.item.productId })
          if (favIndex !== -1) {
            posData.favourites[favIndex].stock = stockLeft.value.toString()
          }
          store.commit(SET_POS, posData)
          toast.success('Quantity updated successfully')
          state.confirmHook()
          closeModal()
        }
      }
    }

    onBeforeMount(() => {
      emitter.on('updateCartItemModal', (args) => {
        state.currency = args.currency
        state.item = args.product
        state.ticket = args.ticket
        state.itemIndex = args.itemIndex
        state.confirmHook = args.confirm
        state.form = {
          qty: Number(state.item.productQuantity)
        }
        // Show modal
        state.show = true
      })
    })

    return {
      translate,
      ...toRefs(state),
      stockLeft,
      totalPrice,
      closeModal,
      showError,
      add,
      sub,
      validateQty,
      submit
    }
  }
}
</script>

<style scoped></style>

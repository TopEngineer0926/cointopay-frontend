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
      <form @submit.prevent="submit()">
        <p class="mb-4">{{ product.itemName }}</p>
        <div class="mb-2">
          <div class="flex items-center justify-between mb-1">
            <label>{{ translate('pos.tickets.lbl_quantity') }}</label>
            <div class="text-red-700 dark:text-red-400 text-sm">{{ showError(errorBag, 'qty') }}</div>
          </div>
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
        </div>

        <p>{{ translate('pos.tickets.stock_left') }} {{ stockLeft }}</p>
        <p>{{ translate('pos.tickets.product_price') }} {{ product.price + ' ' + currency }}</p>
        <p>{{ translate('pos.tickets.total_price') }} {{ totalPrice + ' ' + currency }}</p>
        <div class="mt-4 text-right">
          <j-button :disabled="isProcessing">
            <div v-if="isProcessing" class="mr-3">
              <icon :name="'spinner'" classes="w-4 h-4 text-white"></icon>
            </div>
            <span>{{ translate('pos.tickets.btn_add') }}</span>
          </j-button>
        </div>
      </form>
    </template>
  </modal>
</template>

<script>
import Modal from '@/components/Modal'
import Icon from '@/components/Icon'
import JButton from '@/templates/Button'
import { computed, inject, onBeforeMount, reactive, toRefs } from 'vue'
import validator from '@/validator'
import compositionUtils from '@/compositionUtils'
import { useStore } from 'vuex'
import * as _ from 'lodash'
import { SAVE_PRODUCTS, SAVE_TICKETS, SET_POS } from '@/store/keys'
import { useRouter } from 'vue-router'

export default {
  name: 'AddToCartModal',
  components: {
    Modal,
    Icon,
    JButton
  },
  setup () {
    // Providers
    const translate = inject('translate')
    const emitter = inject('emitter')

    // Store
    const store = useStore()
    const router = useRouter()

    const {
      showError,
      validate
    } = validator()
    const { toFixed } = compositionUtils()

    // State
    const state = reactive({
      show: false,
      maxWidth: '2xl',
      closeable: true,
      product: null,
      currency: null,
      employee: null,
      form: {
        qty: 1
      },
      errorBag: {},
      rules: {
        qty: ['required']
      },
      isProcessing: false
    })

    // Computed
    const pos = computed(() => store.state.pos)
    const posCalls = computed(() => store.state.posCalls)
    const totalPrice = computed(() => {
      return state.product ? toFixed(state.product.price * state.form.qty) : 0
    })
    const stockLeft = computed(() => {
      const ticketProduct = getTicketProduct(state.product)
      const ticketProductQuantity = ticketProduct ? Number(ticketProduct.productQuantity) : 0
      return state.product ? Number(state.product.stock) + ticketProductQuantity - Number(state.form.qty) : 0
    })
    const allAtlCoins = computed(() => store.state.allAltCoins)
    const currencyLongName = computed(() => {
      const altCoin = _.find(allAtlCoins.value, { ShortName: state.currency })
      return altCoin ? altCoin.Name : ''
    })

    // Methods
    const closeModal = () => {
      state.show = false
    }
    const add = () => {
      if (Number(state.form.qty) < Number(state.product.stock)) {
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
      } else if (Number(state.form.qty) > Number(state.product.stock)) {
        state.form.qty = Number(state.product.stock)
      }
    }
    const generateTicketId = (items) => {
      if (items.length > 0) {
        const item = _.maxBy(items, item => {
          return Number(item.ticketId)
        })
        return (Number(item.ticketId) + 1).toString()
      }
      return '1'
    }
    const getTicketProduct = (selectedProduct) => {
      let ticketProduct = null
      const tickets = _.cloneDeep(pos.value.tickets)
      if (tickets.length > 0) {
        const ticket = _.find(tickets, { isActive: true })
        if (ticket) {
          ticketProduct = _.find(ticket.ticketProducts, { productId: selectedProduct.id })
        }
      }
      return ticketProduct
    }
    const submit = () => {
      state.errorBag = validate(state.form, state.rules)
      if (Object.keys(state.errorBag).length === 0) {
        const posData = _.cloneDeep(pos.value)
        const tickets = posData.tickets
        let ticketIndex = -1
        // Add item to tickets
        let ticket = null
        if (tickets.length > 0 && state.employee) {
          ticketIndex = _.findIndex(tickets, {
            isActive: 'true',
            cashier: state.employee.USERNAME.toLowerCase()
          })
          if (ticketIndex !== -1) {
            ticket = tickets[ticketIndex]
            ticket.paymentRequest = null
          }
        }
        if (ticketIndex === -1) {
          // Create a new ticket
          const id = generateTicketId(tickets)
          ticket = {
            ticketId: id,
            status: 'waiting',
            name: 'INV-C-' + id.toString().padStart(5, '0'),
            notes: 'INV-C-' + id.toString().padStart(5, '0'),
            cashier: state.employee.USERNAME.toLowerCase(),
            currency: currencyLongName.value,
            inputCurrency: state.currency,
            isActive: 'true',
            ticketProducts: [],
            paymentRequest: null
          }
        }

        const productIndex = _.findIndex(ticket.ticketProducts, {
          productId: state.product.id
        })
        if (productIndex !== -1) {
          const product = ticket.ticketProducts[productIndex]
          product.productQuantity = Number(state.form.qty)
          ticket.ticketProducts.splice(productIndex, 1, product)
        } else {
          ticket.ticketProducts.push({
            productId: state.product.id,
            imageUrl: state.product.imageUri,
            productName: state.product.itemName,
            productSku: state.product.sku,
            productPrice: Number.parseFloat(state.product.price),
            productQuantity: Number(state.form.qty),
            currency: state.currency
          })
        }
        ticket.status = 'waiting'
        if (ticketIndex !== -1) {
          tickets.splice(ticketIndex, 1, ticket)
        } else {
          tickets.push(ticket)
        }
        // Update products and favourites
        posData.products.filter(product => {
          if (product.sku === state.product.sku) {
            product.stock = stockLeft.value.toString()
          }
        })
        store.dispatch(SAVE_PRODUCTS, {
          call: posCalls.value.products,
          data: posData.products
        })
        posData.favourites.filter(product => {
          if (product.sku === state.product.sku) {
            product.stock = (Number(product.stock) - state.form.qty).toString()
          }
        })
        posData.tickets = tickets
        store.dispatch(SAVE_TICKETS, {
          call: posCalls.value.tickets,
          data: tickets
        })
        store.commit(SET_POS, posData)
        closeModal()
        router.push({ name: 'account-pos-tickets' })
      }
    }

    onBeforeMount(() => {
      emitter.on('addToCartModal', (args) => {
        state.product = args.product
        state.currency = args.currency
        state.employee = args.employee
        state.form = {
          qty: 1
        }
        // Reset form
        state.show = true
      })
    })

    return {
      translate,
      ...toRefs(state),
      showError,
      closeModal,
      add,
      sub,
      validateQty,
      totalPrice,
      stockLeft,
      submit
    }
  }
}
</script>

<style scoped></style>

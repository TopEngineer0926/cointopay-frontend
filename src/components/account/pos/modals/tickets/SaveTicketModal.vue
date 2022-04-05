<template>
  <modal :maxWidth="maxWidth" :show="show" @close="closeModal()">
    <template #title>
      <div class="flex items-center justify-between">
        <span>{{ translate('pos.products.title') }}</span>
        <span class="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 cursor-pointer"
              @click="closeModal()">
          <icon name="close"></icon>
        </span>
      </div>
    </template>
    <template #content>
      <form @submit.prevent="submit()">
        <div class="mb-2">
          <div class="flex items-center justify-between mb-1">
            <label>{{ translate('pos.tickets.name') }}</label>
            <div class="text-red-700 dark:text-red-400 text-sm">{{ showError(errorBag, 'name') }}</div>
          </div>
          <input v-model="form.name" class="form-input w-full" type="text"/>
        </div>
        <div class="mb-2">
          <div class="flex items-center justify-between mb-1">
            <label>{{ translate('pos.tickets.note') }}</label>
            <div class="text-red-700 dark:text-red-400 text-sm">{{ showError(errorBag, 'notes') }}</div>
          </div>
          <input v-model="form.notes" class="form-input w-full" type="text"/>
        </div>

        <div class="mt-4 text-right">
          <j-button :disabled="isProcessing">
            <div v-if="isProcessing" class="mr-3">
              <icon :name="'spinner'" classes="w-4 h-4 text-white"></icon>
            </div>
            <span>{{ translate('pos.products.btn_save') }}</span>
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
import { computed, inject, onBeforeMount, reactive, toRefs, watch } from 'vue'
import { useStore } from 'vuex'
import validator from '@/validator'
import * as _ from 'lodash'
import { SAVE_TICKETS } from '@/store/keys'

export default {
  name: 'SaveTicketModal',
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
      ticket: null,
      currency: 'EUR',
      employee: null,
      form: {
        name: '',
        notes: ''
      },
      errorBag: {},
      rules: {
        name: ['required']
      },
      messages: {
        name: {
          required: 'Ticket name is required'
        }
      },
      isProcessing: false,
      isBarcodeScanner: false
    })

    // Computed
    const pos = computed(() => store.state.pos)
    const posCalls = computed(() => store.state.posCalls)
    const allAtlCoins = computed(() => store.state.allAltCoins)
    const currencyLongName = computed(() => {
      const altCoin = _.find(allAtlCoins.value, { ShortName: state.currency })
      return altCoin ? altCoin.Name : ''
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
    const generateId = () => {
      const tickets = _.cloneDeep(pos.value.tickets)
      if (tickets.length > 0) {
        const ticket = _.maxBy(tickets, ticket => {
          return Number(ticket.id)
        })
        return (Number(ticket.id) + 1).toString()
      }
      return '1'
    }
    // Create or Update Product
    const submit = () => {
      state.errorBag = validate(state.form, state.rules, state.messages)
      if (Object.keys(state.errorBag).length === 0) {
        state.isProcessing = true
        const formData = state.form
        const tickets = _.cloneDeep(pos.value.tickets)
        let isValid = true
        if (state.ticket) {
          let index = _.findIndex(tickets, ticket => {
            return (ticket.name === formData.name && state.ticket.ticketId !== ticket.ticketId)
          })
          if (index === -1) {
            index = _.findIndex(tickets, { ticketId: state.ticket.ticketId })
            tickets.splice(index, 1, {
              ...state.ticket,
              name: formData.name,
              notes: formData.notes
            })
          } else {
            isValid = false
            state.isProcessing = false
            toast.error('Ticket name already exists!')
          }
        } else {
          if (_.findIndex(tickets, { name: formData.name }) === -1) {
            tickets.push({
              ticketId: generateId(),
              status: 'waiting',
              notes: formData.notes,
              name: formData.name,
              isActive: 'true',
              cashier: state.employee.USERNAME.toLowerCase(),
              currency: currencyLongName.value,
              inputCurrency: state.currency,
              ticketProducts: [],
              paymentRequest: null
            })
          } else {
            isValid = false
            state.isProcessing = false
            toast.error('Product with this sku already exists!')
          }
        }
        if (isValid) {
          store.dispatch(SAVE_TICKETS, {
            call: posCalls.value.tickets,
            data: tickets
          }).then(() => {
            state.isProcessing = false
            const message = state.ticket ? 'Ticket updated successfully' : 'Ticket added successfully'
            toast.success(message)
            closeModal()
          }).catch(error => {
            console.log(error)
            state.isProcessing = false
            toast.error('Internal Server Error')
          })
        }
      }
    }

    onBeforeMount(() => {
      emitter.on('saveTicketModal', (args) => {
        state.currency = args.currency
        state.employee = args.employee
        state.ticket = args.ticket || null
        state.form = {
          name: state.ticket ? state.ticket.name : '',
          notes: state.ticket ? state.ticket.notes : ''
        }
        state.show = true
      })
    })

    return {
      translate,
      ...toRefs(state),
      showError,
      closeModal,
      submit
    }
  }
}
</script>

<style scoped>

</style>

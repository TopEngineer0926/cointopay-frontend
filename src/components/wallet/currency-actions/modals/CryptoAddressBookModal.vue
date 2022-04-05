<template>
  <modal :maxWidth="maxWidth" :show="show" @close="closeModal()">
    <template #title>
      <div class="flex items-center justify-between">
        {{ translate('address_book.title') }}
        <span class="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 cursor-pointer"
              @click="closeModal()">
          <icon name="close"></icon>
        </span>
      </div>
    </template>
    <template #content>
      <form @submit.prevent="submit">
        <div class="mb-2">
          <div class="flex items-center justify-between mb-2">
            <label>{{ translate('address_book.address') }}</label>
            <div class="text-red-500 text-sm mr-4">{{ showError(errorBag, 'address') }}</div>
          </div>
          <input v-model="form.address" aria-label="" class="form-input w-full" type="text"/>
        </div>

        <div v-if="tag === '1'" class="mb-2">
          <div class="flex items-center justify-between mb-2">
            <label>{{ translate('address_book.tag') }}</label>
            <div class="text-red-500 text-sm mr-4">{{ showError(errorBag, 'tag') }}</div>
          </div>
          <input v-model="form.tag" aria-label="" class="form-input w-full" type="text"/>
        </div>

        <div class="mb-2">
          <div class="flex items-center justify-between mb-2">
            <label>{{ translate('address_book.description') }}</label>
            <div class="text-red-500 text-sm mr-4">{{ showError(errorBag, 'description') }}</div>
          </div>
          <textarea v-model="form.description" aria-label="" class="form-input w-full"></textarea>
        </div>

        <div class="mb-2 text-right">
          <j-button :disabled="isProcessing">
            <div v-if="isProcessing" class="mr-3">
              <icon :name="'spinner'" classes="w-4 h-4 text-white"></icon>
            </div>
            <span>{{ translate('address_book.save') }}</span>
          </j-button>
        </div>
      </form>

      <div v-if="isCryptoAddress" class="mt-4">
        <div
          class="w-full scrollbar scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200 dark:scrollbar-track-gray-900 dark:scrollbar-thumb-gray-600">
        <table class="table-sm mb-2">
            <thead>
            <tr>
              <th>{{ translate('address_book.address') }}</th>
              <th>{{ translate('address_book.description') }}</th>
              <th class="text-right">{{ translate('address_book.actions') }}</th>
            </tr>
            </thead>
            <tbody>
            <template v-if="addresses.crypto[selectedBalance.id].length > 0">
              <tr v-for="(address, index) in addresses.crypto[selectedBalance.id]" :key="index">
                <td>{{ address.address }}</td>
                <td>{{ address.description }}</td>
                <td class="text-right space-x-1">
                  <j-button type="button"
                            @click="selectAddress(index)">{{ translate('address_book.select') }}
                  </j-button>
                  <j-button type="button"
                            @click="edit(index)">{{ translate('address_book.edit') }}
                  </j-button>
                  <j-button buttonStyle="danger" type="button"
                            @click="deleteAddress(index)">{{ translate('address_book.delete') }}
                  </j-button>
                </td>
              </tr>
            </template>
            <template v-else>
              <tr>
                <td colspan="3">{{ translate('address_book.empty') }}</td>
              </tr>
            </template>
            </tbody>
          </table>
        </div>
      </div>
    </template>
  </modal>
</template>

<script>
import Modal from '@/components/Modal'
import Icon from '@/components/Icon'
import JButton from '@/templates/Button'
import { useStore } from 'vuex'
import * as _ from 'lodash'
import { computed, inject, onBeforeMount, reactive, toRefs } from 'vue'
import compositionUtils from '@/compositionUtils'
import validator from '@/validator'

export default {
  name: 'CryptoAddressBookModal',
  components: {
    Modal,
    Icon,
    JButton
  },
  setup () {
    // Providers
    const translate = inject('translate')
    const http = inject('http')
    const toast = inject('toast')
    const emitter = inject('emitter')
    // Store
    const store = useStore()

    const { saveNotification } = compositionUtils()
    const {
      showError,
      validate
    } = validator()
    // State
    const state = reactive({
      show: false,
      maxWidth: '2xl',
      closeable: true,
      addresses: {
        crypto: {},
        transferwise: {}
      },
      form: {
        address: '',
        tag: '',
        description: '',
        altCoinID: '',
        default: false
      },
      errorBag: {},
      rules: {
        address: ['required'],
        description: ['required'],
        altCoinID: ['required']
      },
      selectedBalance: null,
      tag: null,
      isProcessing: false,
      editIndex: null,
      confirmHook: () => {
      }
    })

    // Computed
    const user = computed(() => store.state.user)
    const isCryptoAddress = computed(() => {
      return (
        Object.keys(state.addresses.crypto).length > 0 &&
        typeof state.addresses.crypto[state.selectedBalance.id] !== 'undefined'
      )
    })

    // Methods
    const apiBaseUrl = process.env.VUE_APP_API_URL
    const closeModal = () => {
      state.show = false
    }

    const fetchAddressBook = () => {
      state.isProcessing = true
      const payload = {
        POSDATA: '',
        Call: 'SHOW',
        KeyData: 'AddressBook_' + user.value.ID,
        MerchantID: user.value.ID,
        APIKey: user.value.APIKey,
        output: 'json'
      }
      http.get(`${apiBaseUrl}/MarketAPI`, {
        params: payload
      }).then(response => {
        state.isProcessing = false
        if (response.data !== 'nothing found') {
          state.addresses = response.data
        }
      }).catch(error => {
        state.isProcessing = false
        console.log(error.response)
      })
    }
    const submit = () => {
      state.errorBag = validate(state.form, state.rules)
      if (Object.keys(state.errorBag).length === 0) {
        state.isProcessing = true
        const addresses = { ...state.addresses }
        const action = Object.keys(addresses.crypto).length > 0 || Object.keys(addresses.transferwise).length > 0
          ? 'UPDATE' : 'INSERT'
        const data = state.form
        if (typeof addresses.crypto[state.selectedBalance.id] === 'undefined') {
          addresses.crypto[state.selectedBalance.id] = []
        }
        const index = _.findIndex(addresses.crypto[state.selectedBalance.id], {
          address: state.form.address
        })
        if (index !== -1) {
          addresses.crypto[state.selectedBalance.id][index] = data
        } else if (state.editIndex !== null) {
          addresses.crypto[state.selectedBalance.id][state.editIndex] = data
          state.editIndex = null
        } else {
          addresses.crypto[state.selectedBalance.id].push(data)
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
          state.isProcessing = false
          clearForm()
          fetchAddressBook()
        }).catch(error => {
          state.isProcessing = false
          console.log(error.response)
        })
      }
    }
    const selectAddress = (index) => {
      const address = state.addresses.crypto[state.selectedBalance.id][index]
      state.confirmHook(address)
      closeModal()
    }
    const edit = (index) => {
      const address = state.addresses.crypto[state.selectedBalance.id][index]
      if (address) {
        state.form = {
          ...state.form,
          address: address.address,
          tag: address.tag ? address.tag : '',
          altCoinID: address.altCoinID,
          description: address.description
        }
      }
      state.editIndex = index
    }
    const deleteAddress = (index) => {
      state.isProcessing = true
      const addresses = { ...state.addresses }
      addresses.crypto[state.selectedBalance.id].splice(index, 1)
      const fd = new FormData()
      fd.append('Call', 'UPDATE')
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
        state.isProcessing = false
        fetchAddressBook()
        toast.success('Address deleted successfully')
        saveNotification('Address deleted successfully')
      }).catch(error => {
        state.isProcessing = false
        console.log(error.response)
      })
    }
    const clearForm = () => {
      state.form = {
        ...state.form,
        address: '',
        tag: '',
        description: ''
      }
    }

    onBeforeMount(() => {
      emitter.on('cryptoAddressBookModal', (args) => {
        state.selectedBalance = args.selectedBalance
        state.confirmHook = args.confirm
        state.errorBag = {}
        state.form.altCoinID = state.selectedBalance ? state.selectedBalance.id : null
        fetchAddressBook()
        // Show modal
        state.show = true
      })
    })

    return {
      translate,
      ...toRefs(state),
      user,
      isCryptoAddress,
      closeModal,
      showError,
      submit,
      selectAddress,
      edit,
      deleteAddress
    }
  }
}
</script>

<style scoped></style>

<template>
  <modal :maxWidth="maxWidth" :show="show" @close="closeModal()">
    <template #title>
      <div class="flex items-center justify-between">
        <span class="capitalize">{{ translate('account.payout.crypto_address_book') }}</span>
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
            <label>{{ translate('address_book.currency') }}</label>
            <div class="text-red-700 dark:text-red-400 text-sm mr-4">{{ showError(errorBag, 'altCoinID') }}</div>
          </div>
          <select v-model="form.altCoinID" class="form-select w-full">
            <option v-for="(altCoin, index) in selectedCoinsList" :key="index" :value="altCoin.ID">
              {{ `${altCoin.Name} ${altCoin.LongName}` }}
            </option>
          </select>
        </div>
        <div class="mb-2">
          <div class="flex items-center justify-between mb-2">
            <label>{{ translate('address_book.address') }}</label>
            <div class="text-red-700 dark:text-red-400 text-sm mr-4">{{ showError(errorBag, 'address') }}</div>
          </div>
          <input v-model="form.address" aria-label="" class="form-input w-full" type="text"/>
        </div>

        <div v-if="tag === '1'" class="mb-2">
          <div class="flex items-center justify-between mb-2">
            <label>{{ translate('address_book.tag') }}</label>
            <div class="text-red-700 dark:text-red-400 text-sm mr-4">{{ showError(errorBag, 'tag') }}</div>
          </div>
          <input v-model="form.tag" aria-label="" class="form-input w-full" type="text"/>
        </div>

        <div class="mb-2">
          <div class="flex items-center justify-between mb-2">
            <label>{{ translate('address_book.description') }}</label>
            <div class="text-red-700 dark:text-red-400 text-sm mr-4">{{ showError(errorBag, 'description') }}</div>
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

      <div class="mt-4">
        <div
          class="w-full scrollbar scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200 dark:scrollbar-track-gray-900 dark:scrollbar-thumb-gray-600">
          <table class="table-sm mb-2">
            <thead>
            <tr>
              <th>AltCoin</th>
              <th>{{ translate('address_book.address') }}</th>
              <th>{{ translate('address_book.description') }}</th>
              <th>{{ translate('address_book.tag') }}</th>
            </tr>
            </thead>
            <tbody>
            <template v-for="(cryptoAddresses, key) in addresses.crypto" :key="key">
              <template v-for="(address, index) in cryptoAddresses" :key="index">
                <tr class="border-0">
                  <td class="text-base">{{ altCoinName(address.altCoinID) }}</td>
                  <td class="text-base">{{ address.address }}</td>
                  <td class="text-base">{{ address.description }}</td>
                  <td class="text-base">{{ address.tag }}</td>
                </tr>
                <tr>
                  <td class="space-x-2" colspan="4">
                    <j-button :buttonStyle="address.default ? 'danger' : 'primary'"
                              @click="toggleDefault(index, key)">
                      <span v-if="!address.default">{{ translate('address_book.select_default') }}</span>
                      <span v-if="address.default">{{ translate('address_book.remove_default') }}</span>
                    </j-button>
                    <j-button type="button"
                              @click="edit(index, key)">{{ translate('address_book.edit') }}
                    </j-button>
                    <j-button buttonStyle="danger" type="button"
                              @click="deleteAddress(index, key)">{{ translate('address_book.delete') }}
                    </j-button>
                  </td>
                </tr>
              </template>
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
      tag: null,
      isProcessing: false,
      editIndex: null
    })

    // Computed
    const user = computed(() => store.state.user)
    const accountInfo = computed(() => store.state.accountInfo)
    const altCoins = computed(() => store.state.altCoins)
    const selectedCoinsList = computed(() => {
      const altCoinsList = []
      if (accountInfo.value) {
        const selectedCoins = accountInfo.value.SelectedAltCoins.split(',')
        altCoins.value.forEach(coin => {
          if (selectedCoins.indexOf(coin.ID.toString()) !== -1) {
            altCoinsList.push(coin)
          }
        })
      }
      return altCoinsList
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
        KeyData: `AddressBook_${user.value.ID}`,
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
        if (typeof addresses.crypto[state.form.altCoinID] === 'undefined') {
          addresses.crypto[state.form.altCoinID] = []
        }
        const index = _.findIndex(addresses.crypto[state.form.altCoinID], {
          address: state.form.address
        })
        if (index !== -1) {
          addresses.crypto[state.form.altCoinID][index] = data
        } else if (state.editIndex !== null) {
          addresses.crypto[state.form.altCoinID][state.editIndex] = data
          state.editIndex = null
        } else {
          addresses.crypto[state.form.altCoinID].push(data)
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
    const altCoinName = (altCoinID) => {
      const altCoin = _.find(selectedCoinsList.value, { ID: altCoinID })
      return altCoin ? altCoin.Name : ''
    }
    const toggleDefault = (index, key) => {
      Object.keys(state.addresses.crypto).forEach(i => {
        state.addresses.crypto[i].forEach((address, j) => {
          if (i === key && j === index) {
            if (typeof state.addresses.crypto[i][j].default === 'undefined') {
              state.addresses.crypto[i][j].default = false
            }
            state.addresses.crypto[i][j].default = !state.addresses.crypto[i][j].default
          } else {
            state.addresses.crypto[i][j].default = false
          }
        })
      })
      const fd = new FormData()
      fd.append('Call', 'UPDATE')
      fd.append('KeyData', `AddressBook_${user.value.ID}`)
      fd.append('ValueData', JSON.stringify(state.addresses))
      fd.append('MerchantID', user.value.ID)
      fd.append('APIKey', user.value.APIKey)
      fd.append('output', 'json')
      http.post(`${apiBaseUrl}/MarketAPI?POSDATA`, fd, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }).then(response => {
        toast.success('Updated successfully')
        saveNotification('Address Updated successfully')
      }).catch(error => {
        console.log(error.response)
      })
    }
    const edit = (index, key) => {
      const address = state.addresses.crypto[key][index]
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
    const deleteAddress = (index, key) => {
      state.isProcessing = true
      const addresses = { ...state.addresses }
      addresses.crypto[key].splice(index, 1)
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
      emitter.on('cryptoAddressBookAccountModal', (args) => {
        state.addresses = args.addresses
        state.errorBag = {}
        // Show modal
        state.show = true
      })
    })

    return {
      translate,
      ...toRefs(state),
      user,
      selectedCoinsList,
      closeModal,
      showError,
      submit,
      altCoinName,
      toggleDefault,
      edit,
      deleteAddress
    }
  }
}
</script>

<style scoped></style>

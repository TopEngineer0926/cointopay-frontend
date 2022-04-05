<template>
  <modal :maxWidth="maxWidth" :show="show" @close="closeModal()">
    <template #title>
      <div class="flex items-center justify-between">
        <span class="capitalize">{{ translate('account.wallet.choose') }}</span>
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
            <label>{{ translate('account.wallet.preferred_title') }}</label>
            <div class="text-blue-500 text-sm">{{ showError(errorBag, 'preferredCurrency') }}</div>
          </div>
          <select v-model="form.preferredCurrency" class="form-select w-full">
            <option v-for="(altCoin, index) in selectedCoinsList" :key="index" :value="altCoin.ID">
              {{ `${altCoin.Name} ${altCoin.LongName}` }}
            </option>
          </select>
        </div>
        <div class="mt-4 text-right">
          <j-button :disabled="isProcessing">
            <div v-if="isProcessing" class="mr-3">
              <icon :name="'spinner'" classes="w-4 h-4 text-white"></icon>
            </div>
            <span>{{ translate('account.button_update') }}</span>
          </j-button>
        </div>
      </form>
    </template>
  </modal>
</template>

<script>
import Modal from '@/components/Modal'
import JButton from '@/templates/Button'
import Icon from '@/components/Icon'
import { computed, inject, onBeforeMount, reactive, toRefs } from 'vue'
import { useStore } from 'vuex'
import validator from '@/validator'
import compositionUtils from '@/compositionUtils'
import { UPDATE_ACCOUNT_INFO } from '@/store/keys'

export default {
  name: 'PreferredCurrencyModal',
  components: {
    Modal,
    JButton,
    Icon
  },
  setup () {
    // Providers
    const translate = inject('translate')
    const emitter = inject('emitter')
    const toast = inject('toast')

    // Store
    const store = useStore()

    const {
      validate,
      showError
    } = validator()
    const { saveNotification } = compositionUtils()

    // State
    const state = reactive({
      show: false,
      maxWidth: '2xl',
      closeable: true,
      selectedCoinsList: [],
      form: {
        preferredCurrency: ''
      },
      errorBag: {},
      rules: {
        preferredCurrency: ['required']
      },
      isProcessing: false
    })

    // Computed
    const accountInfo = computed(() => store.state.accountInfo)

    // Methods
    const closeModal = () => {
      state.show = false
    }

    const submit = () => {
      state.errorBag = validate(state.form, state.rules)
      if (Object.keys(state.errorBag).length === 0) {
        if (accountInfo.value) {
          state.isProcessing = true
          const payload = {
            ...accountInfo.value,
            PreferredCoinID: state.form.preferredCurrency
          }
          store.dispatch(UPDATE_ACCOUNT_INFO, payload).then(response => {
            state.isProcessing = false
            if (response.status === 200) {
              // Show success toast
              toast.success('Preferred currency updated successfully')
              saveNotification('Preferred currency updated successfully')
              closeModal()
            }
          }).catch(error => {
            state.isProcessing = false
            toast.error(error.data.message)
            saveNotification(error.data.message)
          })
        }
      }
    }

    onBeforeMount(() => {
      emitter.on('preferredCurrencyModal', (args) => {
        state.form.preferredCurrency = args.preferredCurrency.ID
        state.selectedCoinsList = args.selectedCoinsList
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

<style scoped>

</style>

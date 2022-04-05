<template>
  <modal :maxWidth="maxWidth" :show="show" @close="closeModal()">
    <template #title>
      <div class="flex items-center justify-between">
        {{ translate('dashboard.update_cart_status') }}
        <span class="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 cursor-pointer"
              @click="closeModal()">
          <icon name="close"></icon>
        </span>
      </div>
    </template>
    <template #content>
      <form @submit.prevent="submit()">
        <div class="mb-4">
          <div class="flex items-center justify-between">
            <label for="CartStatusID">{{ translate('dashboard.update_cart_status') }}
              <span class="required">*</span>
            </label>
            <div class="text-red-500 text-sm">{{ showError(errorBag, 'CartStatusID') }}</div>
          </div>
          <select id="CartStatusID" v-model="form.CartStatusID" class="form-select w-full">
            <option v-for="(status, index) of cartStatusesList()" :key="index" :value="status.id">
              {{ status.value }}
            </option>
          </select>
        </div>
        <div class="text-right">
          <j-button :disabled="isProcessing">
            <div v-if="isProcessing" class="mr-3">
              <icon :name="'spinner'" classes="w-4 h-4 text-white"></icon>
            </div>
            <span>{{ translate('dashboard.btn_update_cart_status') }}</span>
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
import { useStore } from 'vuex'
import validator from '@/validator'
import compositionUtils from '@/compositionUtils'

export default {
  name: 'UpdateCartStatusModal',
  components: {
    Modal,
    Icon,
    JButton
  },
  setup () {
    // Providers
    const http = inject('http')
    const toast = inject('toast')
    const translate = inject('translate')
    const emitter = inject('emitter')
    // Store
    const store = useStore()

    const {
      showError,
      validate
    } = validator()
    const {
      saveNotification,
      cartStatusesList
    } = compositionUtils()
    // State
    const state = reactive({
      show: false,
      maxWidth: '2xl',
      closeable: true,
      form: {
        TransactionID: null,
        CartStatusID: null
      },
      errorBag: {},
      rules: {
        TransactionID: ['required'],
        CartStatusID: ['required']
      },
      isProcessing: false,
      confirmHook: () => {
      }
    })

    // Computed
    const user = computed(() => store.state.user)

    // Methods
    const closeModal = () => {
      state.show = false
    }

    const confirm = (cartStatusId) => {
      state.confirmHook(cartStatusId)
      closeModal()
    }

    const submit = () => {
      state.errorBag = validate(state.form, state.rules)
      if (Object.keys(state.errorBag).length === 0) {
        state.isProcessing = true
        const apiUrl = process.env.VUE_APP_API_URL
        const payload = {
          Call: 'UpdateCartStatus',
          MerchantID: user.value.ID,
          APIKey: user.value.APIKey,
          TransactionID: state.form.TransactionID.replace(/[a-z]/gi, ''),
          CartStatusID: state.form.CartStatusID,
          output: 'json'
        }
        http.get(`${apiUrl}/v2REAPI`, {
          params: payload
        }).then(response => {
          state.isProcessing = false
          if (response.status === 200) {
            toast.success('success', response.data.message)
            saveNotification(response.data.message)
            confirm(state.form.CartStatusID)
          }
        }).catch(error => {
          console.log(error)
          state.isProcessing = false
        })
      }
    }

    onBeforeMount(() => {
      emitter.on('updateCartStatusModal', (args) => {
        state.form = {
          TransactionID: args.transaction.TransactionID,
          CartStatusID: args.transaction.CartStatusID
        }
        state.show = true
      })
    })

    return {
      translate,
      ...toRefs(state),
      closeModal,
      showError,
      cartStatusesList,
      submit
    }
  }
}
</script>

<style scoped></style>
